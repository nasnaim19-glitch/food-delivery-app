import prisma from "../config/prisma.js";
import logger from "../config/logger.js";

// GET /api/restaurants
export const getRestaurants = async (req, res) => {
  try {
    const { search, city, isOpen } = req.query;

    const restaurants = await prisma.restaurant.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),

        ...(city && {
          city: {
            contains: city,
            mode: "insensitive",
          },
        }),

        ...(isOpen !== undefined && {
          isOpen: isOpen === "true",
        }),
      },

      include: {
        categories: true,
      },

      orderBy: {
        rating: "desc",
      },
    });

    return res.status(200).json(restaurants);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  try {
    const restaurantId = Number(req.params.id);

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },

      include: {
        categories: {
          include: {
            products: {
              where: {
                isAvailable: true,
              },

              orderBy: {
                name: "asc",
              },
            },
          },

          orderBy: {
            name: "asc",
          },
        },
      },
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    return res.status(200).json(restaurant);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};