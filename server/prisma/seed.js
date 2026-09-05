import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  await prisma.restaurant.createMany({
    data: [
      {
        name: "Sunny Bites",
        description: "Fresh colorful meals, salads, sandwiches and bowls.",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        city: "Tel Aviv",
        address: "12 Dizengoff St, Tel Aviv",
        rating: 4.7,
        isOpen: true,
      },
      {
        name: "Bella Pizza",
        description: "Italian-style pizzas, pastas and fresh salads.",
        imageUrl: "https://images.unsplash.com/photo-1579751626657-72bc17010498",
        city: "Haifa",
        address: "25 Hanassi Blvd, Haifa",
        rating: 4.6,
        isOpen: true,
      },
      {
        name: "Green Garden",
        description: "Healthy vegetarian dishes, bowls and fresh juices.",
        imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554",
        city: "Jerusalem",
        address: "8 Jaffa St, Jerusalem",
        rating: 4.8,
        isOpen: true,
      },
      {
        name: "Burger Bloom",
        description: "Juicy burgers, crispy fries and homemade sauces.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        city: "Nahariya",
        address: "15 Ga'aton Blvd, Nahariya",
        rating: 4.5,
        isOpen: true,
      },
    ],
  });

  console.log("Restaurants created");
  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });