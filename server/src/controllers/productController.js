import prisma from "../config/prisma.js";
import logger from "../config/logger.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      categoryId,
      restaurantId,
      minPrice,
      maxPrice,
      isAvailable,
    } = req.query;

    const products = await prisma.product.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),

        ...(categoryId && {
          categoryId: Number(categoryId),
        }),

        ...(restaurantId && {
          category: {
            restaurantId: Number(restaurantId),
          },
        }),

        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice && {
                  gte: Number(minPrice),
                }),
                ...(maxPrice && {
                  lte: Number(maxPrice),
                }),
              },
            }
          : {}),

        ...(isAvailable !== undefined && {
          isAvailable: isAvailable === "true",
        }),
      },

      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(products);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
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

    return res.status(200).json(product);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};