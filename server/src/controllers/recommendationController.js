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
    parts.find(
      (part) => part.type === "hour"
    )?.value
  );

  const minute = Number(
    parts.find(
      (part) => part.type === "minute"
    )?.value
  );

  return hour * 60 + minute;
};

const isHappyHourActive = (restaurant) => {
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

  const start =
    restaurant.happyHourStartMinutes;

  const end =
    restaurant.happyHourEndMinutes;

  if (start < end) {
    return (
      currentMinutes >= start &&
      currentMinutes < end
    );
  }

  if (start > end) {
    return (
      currentMinutes >= start ||
      currentMinutes < end
    );
  }

  return false;
};

const getCurrentPrice = (
  product,
  restaurant
) => {
  const originalPrice =
    Number(product.price);

  const happyHourActive =
    isHappyHourActive(restaurant);

  const discountPercent =
    happyHourActive
      ? restaurant.happyHourDiscount
      : 0;

  const effectivePrice =
    discountPercent > 0
      ? Number(
          (
            originalPrice *
            (1 -
              discountPercent / 100)
          ).toFixed(2)
        )
      : originalPrice;

  return {
    originalPrice,
    effectivePrice,
    discountPercent,
    isHappyHourPrice:
      happyHourActive,
  };
};

const incrementMap = (
  map,
  key,
  amount = 1
) => {
  map.set(
    key,
    (map.get(key) || 0) +
      amount
  );
};

const getTopMapEntry = (
  map
) => {
  if (map.size === 0) {
    return null;
  }

  return [...map.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];
};

// GET /api/recommendations
export const getRecommendations = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const [
      orders,
      favorites,
      restaurants,
    ] = await Promise.all([
      prisma.order.findMany({
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

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.favorite.findMany({
        where: {
          userId,
        },
      }),

      prisma.restaurant.findMany({
        where: {
          isOpen: true,
        },

        include: {
          categories: {
            include: {
              products: {
                where: {
                  isAvailable: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const restaurantOrderCounts =
      new Map();

    const categoryCounts =
      new Map();

    const productCounts =
      new Map();

    const favoriteRestaurantIds =
      new Set(
        favorites.map(
          (favorite) =>
            favorite.restaurantId
        )
      );

    for (const order of orders) {
      incrementMap(
        restaurantOrderCounts,
        order.restaurantId
      );

      for (const item of order.items) {
        incrementMap(
          productCounts,
          item.productId,
          item.quantity
        );

        const categoryName =
          item.product?.category?.name;

        if (categoryName) {
          incrementMap(
            categoryCounts,
            categoryName,
            item.quantity
          );
        }
      }
    }

    const topCategoryEntry =
      getTopMapEntry(
        categoryCounts
      );

    const topCategory =
      topCategoryEntry
        ? topCategoryEntry[0]
        : null;

    const restaurantRecommendations =
      restaurants
        .map((restaurant) => {
          const orderCount =
            restaurantOrderCounts.get(
              restaurant.id
            ) || 0;

          const isFavorite =
            favoriteRestaurantIds.has(
              restaurant.id
            );

          let categoryAffinity = 0;

          let strongestMatchingCategory =
            null;

          let strongestCategoryScore = 0;

          for (
            const category of
            restaurant.categories
          ) {
            const count =
              categoryCounts.get(
                category.name
              ) || 0;

            categoryAffinity +=
              count;

            if (
              count >
              strongestCategoryScore
            ) {
              strongestCategoryScore =
                count;

              strongestMatchingCategory =
                category.name;
            }
          }

          const score =
            orderCount * 4 +
            (isFavorite ? 6 : 0) +
            categoryAffinity * 2 +
            Number(
              restaurant.rating
            );

          let reason =
            "Popular on FreshBite";

          if (isFavorite) {
            reason =
              "Because you saved this restaurant to your favorites";
          } else if (
            orderCount > 0
          ) {
            reason =
              orderCount === 1
                ? "Because you ordered from this restaurant before"
                : `Because you ordered from this restaurant ${orderCount} times`;
          } else if (
            strongestMatchingCategory
          ) {
            reason =
              `Because you often order ${strongestMatchingCategory}`;
          }

          return {
            id:
              restaurant.id,

            name:
              restaurant.name,

            description:
              restaurant.description,

            imageUrl:
              restaurant.imageUrl,

            city:
              restaurant.city,

            address:
              restaurant.address,

            rating:
              restaurant.rating,

            isOpen:
              restaurant.isOpen,

            isFavorite,

            previousOrders:
              orderCount,

            recommendationScore:
              Number(
                score.toFixed(2)
              ),

            reason,

            isHappyHourActive:
              isHappyHourActive(
                restaurant
              ),

            happyHour: {
              discountPercent:
                restaurant.happyHourDiscount,

              startMinutes:
                restaurant.happyHourStartMinutes,

              endMinutes:
                restaurant.happyHourEndMinutes,
            },
          };
        })
        .sort(
          (a, b) =>
            b.recommendationScore -
            a.recommendationScore
        )
        .slice(0, 3);

    const productRecommendations =
      [];

    for (
      const restaurant of
      restaurants
    ) {
      const isFavoriteRestaurant =
        favoriteRestaurantIds.has(
          restaurant.id
        );

      for (
        const category of
        restaurant.categories
      ) {
        const categoryAffinity =
          categoryCounts.get(
            category.name
          ) || 0;

        for (
          const product of
          category.products
        ) {
          const previousQuantity =
            productCounts.get(
              product.id
            ) || 0;

          const score =
            previousQuantity * 5 +
            categoryAffinity * 3 +
            (isFavoriteRestaurant
              ? 2
              : 0) +
            Number(
              restaurant.rating
            );

          let reason =
            "Popular choice";

          if (
            previousQuantity > 0
          ) {
            reason =
              previousQuantity === 1
                ? "Because you ordered this before"
                : `Because you ordered this ${previousQuantity} times`;
          } else if (
            categoryAffinity > 0
          ) {
            reason =
              `Because you like ${category.name}`;
          } else if (
            isFavoriteRestaurant
          ) {
            reason =
              "From one of your favorite restaurants";
          }

          const pricing =
            getCurrentPrice(
              product,
              restaurant
            );

          productRecommendations.push(
            {
              id:
                product.id,

              name:
                product.name,

              description:
                product.description,

              imageUrl:
                product.imageUrl,

              category:
                category.name,

              restaurant: {
                id:
                  restaurant.id,

                name:
                  restaurant.name,

                city:
                  restaurant.city,

                rating:
                  restaurant.rating,
              },

              previousQuantity,

              recommendationScore:
                Number(
                  score.toFixed(2)
                ),

              reason,

              ...pricing,
            }
          );
        }
      }
    }

    productRecommendations.sort(
      (a, b) =>
        b.recommendationScore -
        a.recommendationScore
    );

    const topProducts =
      productRecommendations.slice(
        0,
        6
      );

    const hasPersonalHistory =
      orders.length > 0 ||
      favorites.length > 0;

    return res.status(200).json({
      personalized:
        hasPersonalHistory,

      profile: {
        ordersCount:
          orders.length,

        favoritesCount:
          favorites.length,

        topCategory,

        favoriteRestaurantIds:
          [...favoriteRestaurantIds],
      },

      restaurantRecommendations,

      productRecommendations:
        topProducts,
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};