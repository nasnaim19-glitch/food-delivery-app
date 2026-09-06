import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateRestaurantHappyHour(
  restaurantName,
  startMinutes,
  endMinutes
) {
  const result = await prisma.restaurant.updateMany({
    where: {
      name: restaurantName,
    },
    data: {
      happyHourStartMinutes: startMinutes,
      happyHourEndMinutes: endMinutes,
      happyHourDiscount: 50,
      happyHourEnabled: true,
    },
  });

  if (result.count === 0) {
    throw new Error(
      `Restaurant not found: ${restaurantName}`
    );
  }

  console.log(
    `Happy Hour updated for ${restaurantName}`
  );
}

async function main() {
  console.log("Starting Happy Hour seed...");

  // 08:00 - 12:00
  await updateRestaurantHappyHour(
    "Sunny Bites",
    480,
    720
  );

  // 12:00 - 16:00
  await updateRestaurantHappyHour(
    "Bella Pizza",
    720,
    960
  );

  // 16:00 - 20:00
  await updateRestaurantHappyHour(
    "Green Garden",
    960,
    1200
  );

  // 20:00 - 00:00
  // 1440 represents the end of the day.
  await updateRestaurantHappyHour(
    "Burger Bloom",
    1200,
    1440
  );

  const restaurants =
    await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        happyHourStartMinutes: true,
        happyHourEndMinutes: true,
        happyHourDiscount: true,
        happyHourEnabled: true,
      },
      orderBy: {
        id: "asc",
      },
    });

  console.log("Happy Hour schedule:");

  for (const restaurant of restaurants) {
    console.log({
      id: restaurant.id,
      name: restaurant.name,
      happyHourStartMinutes:
        restaurant.happyHourStartMinutes,
      happyHourEndMinutes:
        restaurant.happyHourEndMinutes,
      happyHourDiscount:
        restaurant.happyHourDiscount,
      happyHourEnabled:
        restaurant.happyHourEnabled,
    });
  }

  console.log("Happy Hour seed completed");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });