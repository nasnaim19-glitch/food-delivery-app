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

const formatMinutesToTime = (minutes) => {
  if (minutes === null || minutes === undefined) {
    return null;
  }

  // 1440 represents midnight at the end of the day.
  if (minutes === 1440) {
    return "00:00";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    mins
  ).padStart(2, "0")}`;
};

const isHappyHourActive = (
  startMinutes,
  endMinutes,
  enabled
) => {
  if (
    !enabled ||
    startMinutes === null ||
    endMinutes === null
  ) {
    return false;
  }

  const currentMinutes = getCurrentMinutesInIsrael();

  // Normal range, for example 08:00-12:00.
  if (startMinutes < endMinutes) {
    return (
      currentMinutes >= startMinutes &&
      currentMinutes < endMinutes
    );
  }

  // Overnight range support, for example 22:00-02:00.
  if (startMinutes > endMinutes) {
    return (
      currentMinutes >= startMinutes ||
      currentMinutes < endMinutes
    );
  }

  return false;
};

const getHappyHourInfo = (restaurant) => {
  const active = isHappyHourActive(
    restaurant.happyHourStartMinutes,
    restaurant.happyHourEndMinutes,
    restaurant.happyHourEnabled
  );

  return {
    isHappyHourActive: active,

    happyHour: {
      enabled: restaurant.happyHourEnabled,
      startMinutes: restaurant.happyHourStartMinutes,
      endMinutes: restaurant.happyHourEndMinutes,

      startTime: formatMinutesToTime(
        restaurant.happyHourStartMinutes
      ),

      endTime: formatMinutesToTime(
        restaurant.happyHourEndMinutes
      ),

      discountPercent:
        restaurant.happyHourDiscount,

      isActive: active,
    },
  };
};

const addHappyHourPriceToProduct = (
  product,
  restaurant
) => {
  const active = isHappyHourActive(
    restaurant.happyHourStartMinutes,
    restaurant.happyHourEndMinutes,
    restaurant.happyHourEnabled
  );

  const originalPrice = Number(product.price);

  const discountPercent = active
    ? restaurant.happyHourDiscount
    : 0;

  const discountedPrice = active
    ? Number(
        (
          originalPrice *
          (1 - discountPercent / 100)
        ).toFixed(2)
      )
    : originalPrice;

  return {
    ...product,

    originalPrice,
    discountedPrice,

    effectivePrice: discountedPrice,

    discountPercent,

    isHappyHourPrice: active,
  };
};

// GET /api/restaurants
export const getRestaurants = async (req, res) => {
  try {
    const { search, city, isOpen } = req.query;

    const restaurants =
      await prisma.restaurant.findMany({
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

    const restaurantsWithHappyHour =
      restaurants.map((restaurant) => ({
        ...restaurant,
        ...getHappyHourInfo(restaurant),
      }));

    return res
      .status(200)
      .json(restaurantsWithHappyHour);
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

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    const restaurant =
      await prisma.restaurant.findUnique({
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

    const categoriesWithHappyHourPrices =
      restaurant.categories.map((category) => ({
        ...category,

        products: category.products.map(
          (product) =>
            addHappyHourPriceToProduct(
              product,
              restaurant
            )
        ),
      }));

    const response = {
      ...restaurant,

      ...getHappyHourInfo(restaurant),

      categories: categoriesWithHappyHourPrices,
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};