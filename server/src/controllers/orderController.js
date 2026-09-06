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

  const currentMinutes =
    getCurrentMinutesInIsrael();

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

// POST /api/orders
export const createOrder = async (
  req,
  res
) => {
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

    if (hasMultipleRestaurants) {
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

    const totalPrice = Number(
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

    return res.status(201).json({
      message:
        "Order created successfully",
      order,
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
    const userId = req.user.userId;

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

    return res
      .status(200)
      .json(orders);
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
    const userId = req.user.userId;

    const orderId = Number(
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

    return res
      .status(200)
      .json(order);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};