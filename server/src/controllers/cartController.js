import prisma from "../config/prisma.js";
import logger from "../config/logger.js";

const buildCartResponse = (cart) => {
  const items = cart?.items || [];

  const total = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  return {
    id: cart?.id || null,
    userId: cart?.userId || null,
    items,
    total,
  };
};

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await prisma.cart.findUnique({
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

    return res.status(200).json(buildCartResponse(cart));
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// POST /api/cart
export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = Number(req.body.productId);
    const quantity =
      req.body.quantity === undefined
        ? 1
        : Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },

      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        message: "Product is currently unavailable",
      });
    }

    const cart = await prisma.cart.upsert({
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
                category: true,
              },
            },
          },
        },
      },
    });

    if (cart.items.length > 0) {
      const currentRestaurantId =
        cart.items[0].product.category.restaurantId;

      const newRestaurantId =
        product.category.restaurantId;

      if (currentRestaurantId !== newRestaurantId) {
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

    const updatedCart = await prisma.cart.findUnique({
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
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        message: "Invalid cart item ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
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

    const cart = await prisma.cart.findUnique({
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
      message: "Cart item quantity updated",
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
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        message: "Invalid cart item ID",
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
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

    const cart = await prisma.cart.findUnique({
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
      message: "Product removed from cart",
      cart: buildCartResponse(cart),
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};