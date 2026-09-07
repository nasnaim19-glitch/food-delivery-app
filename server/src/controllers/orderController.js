import prisma from "../config/prisma.js";
import logger from "../config/logger.js";

const TIME_ZONE = "Asia/Jerusalem";

const TRACKING_TIMES = {
  PREPARING: 1,
  READY: 3,
  DELIVERED: 5,
};

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
    isRestaurantHappyHourActive(
      restaurant
    );

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
    isHappyHour,
  };
};

const getTrackingStatus = (createdAt) => {
  const createdTime =
    new Date(createdAt).getTime();

  const now =
    Date.now();

  const elapsedMilliseconds =
    now - createdTime;

  const elapsedMinutes =
    elapsedMilliseconds / 60000;

  if (
    elapsedMinutes >=
    TRACKING_TIMES.DELIVERED
  ) {
    return "DELIVERED";
  }

  if (
    elapsedMinutes >=
    TRACKING_TIMES.READY
  ) {
    return "READY";
  }

  if (
    elapsedMinutes >=
    TRACKING_TIMES.PREPARING
  ) {
    return "PREPARING";
  }

  return "PENDING";
};

const getTrackingInfo = (order) => {
  const createdTime =
    new Date(order.createdAt).getTime();

  const now =
    Date.now();

  const elapsedMilliseconds =
    Math.max(
      0,
      now - createdTime
    );

  const elapsedMinutes =
    elapsedMilliseconds / 60000;

  const totalTrackingMinutes =
    TRACKING_TIMES.DELIVERED;

  const remainingMinutes =
    Math.max(
      0,
      Math.ceil(
        totalTrackingMinutes -
          elapsedMinutes
      )
    );

  const progressPercent =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (elapsedMinutes /
            totalTrackingMinutes) *
            100
        )
      )
    );

  const status =
    getTrackingStatus(
      order.createdAt
    );

  const estimatedDeliveryAt =
    new Date(
      createdTime +
        totalTrackingMinutes *
          60000
    );

  const steps = [
    {
      key: "PENDING",
      label: "Order received",
      description:
        "The restaurant received your order.",
    },
    {
      key: "PREPARING",
      label: "Preparing",
      description:
        "Your food is being prepared.",
    },
    {
      key: "READY",
      label: "Ready",
      description:
        "Your order is ready.",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      description:
        "Your order has been completed.",
    },
  ];

  const statusOrder = [
    "PENDING",
    "PREPARING",
    "READY",
    "DELIVERED",
  ];

  const currentStepIndex =
    statusOrder.indexOf(status);

  const stepsWithState =
    steps.map(
      (step, index) => ({
        ...step,

        completed:
          index <
          currentStepIndex,

        active:
          index ===
          currentStepIndex,

        pending:
          index >
          currentStepIndex,
      })
    );

  return {
    status,

    progressPercent,

    elapsedMinutes:
      Number(
        elapsedMinutes.toFixed(1)
      ),

    remainingMinutes,

    estimatedDeliveryAt:
      estimatedDeliveryAt.toISOString(),

    isCompleted:
      status === "DELIVERED",

    currentStep:
      currentStepIndex + 1,

    totalSteps:
      steps.length,

    steps:
      stepsWithState,
  };
};

const syncOrderStatus = async (order) => {
  const tracking =
    getTrackingInfo(order);

  if (
    order.status !==
    tracking.status
  ) {
    const updatedOrder =
      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          status:
            tracking.status,
        },

        include: {
          restaurant: true,
          items: true,
        },
      });

    return {
      ...updatedOrder,
      tracking:
        getTrackingInfo(
          updatedOrder
        ),
    };
  }

  return {
    ...order,
    tracking,
  };
};

// POST /api/orders
export const createOrder = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

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
          },
        },
      });

    if (
      !cart ||
      cart.items.length === 0
    ) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const restaurantId =
      cart.items[0].product.category
        .restaurantId;

    const hasMultipleRestaurants =
      cart.items.some(
        (item) =>
          item.product.category
            .restaurantId !==
          restaurantId
      );

    if (
      hasMultipleRestaurants
    ) {
      return res.status(400).json({
        message:
          "Cart contains products from multiple restaurants",
      });
    }

    const orderItems =
      cart.items.map((item) => {
        const pricing =
          getProductPricing(
            item.product
          );

        return {
          productId:
            item.product.id,

          productName:
            item.product.name,

          unitPrice:
            pricing.effectivePrice,

          originalUnitPrice:
            pricing.originalPrice,

          discountPercent:
            pricing.discountPercent,

          quantity:
            item.quantity,
        };
      });

    const totalPrice =
      Number(
        orderItems
          .reduce(
            (sum, item) =>
              sum +
              item.unitPrice *
                item.quantity,
            0
          )
          .toFixed(2)
      );

    const order =
      await prisma.$transaction(
        async (tx) => {
          const createdOrder =
            await tx.order.create({
              data: {
                userId,
                restaurantId,
                totalPrice,

                items: {
                  create:
                    orderItems,
                },
              },

              include: {
                restaurant: true,
                items: true,
              },
            });

          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
            },
          });

          return createdOrder;
        }
      );

    const orderWithTracking = {
      ...order,
      tracking:
        getTrackingInfo(
          order
        ),
    };

    return res.status(201).json({
      message:
        "Order created successfully",

      order:
        orderWithTracking,
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};

// GET /api/orders
export const getOrders = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const orders =
      await prisma.order.findMany({
        where: {
          userId,
        },

        include: {
          restaurant: true,
          items: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const ordersWithTracking =
      await Promise.all(
        orders.map(
          (order) =>
            syncOrderStatus(
              order
            )
        )
      );

    return res
      .status(200)
      .json(
        ordersWithTracking
      );
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};

// GET /api/orders/:id
export const getOrderById = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const orderId =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid order ID",
      });
    }

    const order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },

        include: {
          restaurant: true,
          items: true,
        },
      });

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }

    const orderWithTracking =
      await syncOrderStatus(
        order
      );

    return res
      .status(200)
      .json(
        orderWithTracking
      );
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};

// POST /api/orders/:id/reorder
export const reorderOrder = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const orderId =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid order ID",
      });
    }

    const previousOrder =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },

        include: {
          restaurant: true,

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

    if (!previousOrder) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }

    if (
      previousOrder.items.length === 0
    ) {
      return res.status(400).json({
        message:
          "This order has no items to reorder",
      });
    }

    const unavailableItems =
      previousOrder.items.filter(
        (item) =>
          !item.product ||
          !item.product.isAvailable
      );

    if (
      unavailableItems.length > 0
    ) {
      return res.status(400).json({
        message:
          "Some products from this order are no longer available",

        unavailableItems:
          unavailableItems.map(
            (item) => ({
              productId:
                item.productId,

              productName:
                item.productName,
            })
          ),
      });
    }

    const restaurantId =
      previousOrder.restaurantId;

    const wrongRestaurantItem =
      previousOrder.items.find(
        (item) =>
          item.product.category
            .restaurantId !==
          restaurantId
      );

    if (wrongRestaurantItem) {
      return res.status(400).json({
        message:
          "Order contains products from multiple restaurants",
      });
    }

    let cart =
      await prisma.cart.findUnique({
        where: {
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

    if (!cart) {
      cart =
        await prisma.cart.create({
          data: {
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
    }

    if (
      cart.items.length > 0
    ) {
      const currentCartRestaurantId =
        cart.items[0].product.category
          .restaurantId;

      if (
        currentCartRestaurantId !==
        restaurantId
      ) {
        return res.status(400).json({
          message:
            "Your cart contains items from another restaurant. Please clear your cart before reordering.",
        });
      }
    }

    await prisma.$transaction(
      async (tx) => {
        for (
          const item of
          previousOrder.items
        ) {
          await tx.cartItem.upsert({
            where: {
              cartId_productId: {
                cartId:
                  cart.id,

                productId:
                  item.productId,
              },
            },

            update: {
              quantity: {
                increment:
                  item.quantity,
              },
            },

            create: {
              cartId:
                cart.id,

              productId:
                item.productId,

              quantity:
                item.quantity,
            },
          });
        }
      }
    );

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

    const reorderedItems =
      updatedCart.items.map(
        (item) => {
          const pricing =
            getProductPricing(
              item.product
            );

          return {
            ...item,

            product: {
              ...item.product,

              originalPrice:
                pricing.originalPrice,

              effectivePrice:
                pricing.effectivePrice,

              discountPercent:
                pricing.discountPercent,

              isHappyHourPrice:
                pricing.isHappyHour,
            },

            lineTotal:
              Number(
                (
                  pricing.effectivePrice *
                  item.quantity
                ).toFixed(2)
              ),
          };
        }
      );

    const total =
      Number(
        reorderedItems
          .reduce(
            (sum, item) =>
              sum +
              item.lineTotal,
            0
          )
          .toFixed(2)
      );

    return res.status(200).json({
      message:
        "Order added to cart successfully",

      sourceOrderId:
        previousOrder.id,

      restaurant:
        previousOrder.restaurant,

      cart: {
        id:
          updatedCart.id,

        userId:
          updatedCart.userId,

        items:
          reorderedItems,

        total,
      },
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};