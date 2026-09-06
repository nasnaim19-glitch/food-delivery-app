import prisma from "../config/prisma.js";
import logger from "../config/logger.js";

// GET /api/favorites
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },

      include: {
        restaurant: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(favorites);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// POST /api/favorites/:restaurantId
export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const restaurantId = Number(req.params.restaurantId);

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const existingFavorite =
      await prisma.favorite.findUnique({
        where: {
          userId_restaurantId: {
            userId,
            restaurantId,
          },
        },
      });

    if (existingFavorite) {
      return res.status(400).json({
        message: "Restaurant is already in favorites",
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        restaurantId,
      },

      include: {
        restaurant: true,
      },
    });

    return res.status(201).json({
      message: "Restaurant added to favorites",
      favorite,
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE /api/favorites/:restaurantId
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const restaurantId = Number(req.params.restaurantId);

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite not found",
      });
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return res.status(200).json({
      message: "Restaurant removed from favorites",
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};