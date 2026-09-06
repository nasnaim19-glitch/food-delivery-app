import prisma from "../config/prisma.js";
import logger from "../config/logger.js";

// POST /api/orders
export const createOrder = async (req, res) => {
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
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const restaurantId =
      cart.items[0].product.category.restaurantId;

    const hasMultipleRestaurants = cart.items.some(
      (item) =>
        item.product.category.restaurantId !== restaurantId
    );

    if (hasMultipleRestaurants) {
      return res.status(400).json({
        message:
          "Cart contains products from multiple restaurants",
      });
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          restaurantId,
          totalPrice,
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
            })),
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
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
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

    return res.status(200).json(orders);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findFirst({
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
        message: "Order not found",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};