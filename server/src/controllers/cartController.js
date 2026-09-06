import prisma from "../config/prisma.js";
import logger from "../config/logger.js";

const TIME_ZONE = "Asia/Jerusalem";

const getCurrentMinutesInIsrael = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value
  );

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value
  );

  return hour * 60 + minute;
};

const isRestaurantHappyHourActive = (restaurant) => {
  if (
    !restaurant ||
    !restaurant.happyHourEnabled ||
    restaurant.happyHourStartMinutes === null ||
    restaurant.happyHourEndMinutes === null
  ) {
    return false;
  }

  const currentMinutes = getCurrentMinutesInIsrael();

  const startMinutes =
    restaurant.happyHourStartMinutes;

  const endMinutes =
    restaurant.happyHourEndMinutes;

  if (startMinutes < endMinutes) {
    return (
      currentMinutes >= startMinutes &&
      currentMinutes < endMinutes
    );
  }

  if (startMinutes > endMinutes) {
    return (
      currentMinutes >= startMinutes ||
      currentMinutes < endMinutes
    );
  }

  return false;
};

const getProductPricing = (product) => {
  const restaurant =
    product.category?.restaurant;

  const originalPrice =
    Number(product.price);

  const isHappyHour =
    isRestaurantHappyHourActive(restaurant);

  const discountPercent =
    isHappyHour
      ? restaurant.happyHourDiscount
      : 0;

  const effectivePrice =
    isHappyHour
      ? Number(
          (
            originalPrice *
            (1 - discountPercent / 100)
          ).toFixed(2)
        )
      : originalPrice;

  return {
    originalPrice,
    effectivePrice,
    discountPercent,
    isHappyHourPrice: isHappyHour,
  };
};

const buildCartResponse = (cart) => {
  const items = cart?.items || [];

  const mappedItems = items.map((item) => {
    const pricing =
      getProductPricing(item.product);

    return {
      ...item,

      product: {
        ...item.product,

        originalPrice:
          pricing.originalPrice,

        discountedPrice:
          pricing.effectivePrice,

        effectivePrice:
          pricing.effectivePrice,

        discountPercent:
          pricing.discountPercent,

        isHappyHourPrice:
          pricing.isHappyHourPrice,
      },

      lineTotal: Number(
        (
          pricing.effectivePrice *
          item.quantity
        ).toFixed(2)
      ),
    };
  });

  const total = Number(
    mappedItems
      .reduce(
        (sum, item) =>
          sum + item.lineTotal,
        0
      )
      .toFixed(2)
  );

  return {
    id: cart?.id || null,
    userId: cart?.userId || null,
    items: mappedItems,
    total,
  };
};

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart =
      await prisma.cart.findUnique({
        where: {
          userId,
        },

        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    include: {
                      restaurant: true,
                    },
                  },
                },
              },
            },

            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!cart) {
      return res.status(200).json({
        id: null,
        userId,
        items: [],
        total: 0,
      });
    }

    return res
      .status(200)
      .json(buildCartResponse(cart));
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// POST /api/cart
export const addItemToCart = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const productId = Number(
      req.body.productId
    );

    const quantity =
      req.body.quantity === undefined
        ? 1
        : Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message:
          "Quantity must be a positive integer",
      });
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        include: {
          category: {
            include: {
              restaurant: true,
            },
          },
        },
      });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        message:
          "Product is currently unavailable",
      });
    }

    const cart =
      await prisma.cart.upsert({
        where: {
          userId,
        },

        update: {},

        create: {
          userId,
        },

        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    include: {
                      restaurant: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (cart.items.length > 0) {
      const currentRestaurantId =
        cart.items[0].product.category
          .restaurantId;

      const newRestaurantId =
        product.category.restaurantId;

      if (
        currentRestaurantId !==
        newRestaurantId
      ) {
        return res.status(400).json({
          message:
            "Your cart already contains items from another restaurant",
        });
      }
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },

      update: {
        quantity: {
          increment: quantity,
        },
      },

      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    const updatedCart =
      await prisma.cart.findUnique({
        where: {
          id: cart.id,
        },

        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    include: {
                      restaurant: true,
                    },
                  },
                },
              },
            },

            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    return res.status(201).json({
      message: "Product added to cart",
      cart: buildCartResponse(updatedCart),
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// PATCH /api/cart/:itemId
export const updateCartItemQuantity =
  async (req, res) => {
    try {
      const userId = req.user.userId;

      const itemId = Number(
        req.params.itemId
      );

      const quantity = Number(
        req.body.quantity
      );

      if (
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {
        return res.status(400).json({
          message: "Invalid cart item ID",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive integer",
        });
      }

      const cartItem =
        await prisma.cartItem.findFirst({
          where: {
            id: itemId,

            cart: {
              userId,
            },
          },
        });

      if (!cartItem) {
        return res.status(404).json({
          message: "Cart item not found",
        });
      }

      await prisma.cartItem.update({
        where: {
          id: itemId,
        },

        data: {
          quantity,
        },
      });

      const cart =
        await prisma.cart.findUnique({
          where: {
            userId,
          },

          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: {
                      include: {
                        restaurant: true,
                      },
                    },
                  },
                },
              },

              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

      return res.status(200).json({
        message:
          "Cart item quantity updated",

        cart: buildCartResponse(cart),
      });
    } catch (error) {
      logger.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };

// DELETE /api/cart/:itemId
export const removeCartItem = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const itemId = Number(
      req.params.itemId
    );

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid cart item ID",
      });
    }

    const cartItem =
      await prisma.cartItem.findFirst({
        where: {
          id: itemId,

          cart: {
            userId,
          },
        },
      });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    const cart =
      await prisma.cart.findUnique({
        where: {
          userId,
        },

        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    include: {
                      restaurant: true,
                    },
                  },
                },
              },
            },

            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    return res.status(200).json({
      message:
        "Product removed from cart",

      cart: buildCartResponse(cart),
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};