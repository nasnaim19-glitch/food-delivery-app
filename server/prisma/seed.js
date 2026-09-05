import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Delete existing demo data in the correct order
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurant.deleteMany();

  console.log("Old demo data removed");

  const sunnyBites = await prisma.restaurant.create({
    data: {
      name: "Sunny Bites",
      description: "Fresh colorful meals, salads, sandwiches and bowls.",
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      city: "Tel Aviv",
      address: "12 Dizengoff St, Tel Aviv",
      rating: 4.7,
      isOpen: true,
      categories: {
        create: [
          {
            name: "Bowls",
            products: {
              create: [
                {
                  name: "Chicken Sunshine Bowl",
                  description:
                    "Grilled chicken, rice, fresh vegetables and tahini.",
                  price: 54,
                  imageUrl:
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                  isAvailable: true,
                },
                {
                  name: "Salmon Power Bowl",
                  description:
                    "Salmon, avocado, rice, cucumber and sesame.",
                  price: 68,
                  imageUrl:
                    "https://images.unsplash.com/photo-1547592180-85f173990554",
                  isAvailable: true,
                },
              ],
            },
          },
          {
            name: "Sandwiches",
            products: {
              create: [
                {
                  name: "Avocado Sandwich",
                  description:
                    "Avocado, tomato, lettuce and herb spread.",
                  price: 38,
                  imageUrl:
                    "https://images.unsplash.com/photo-1553909489-cd47e0907980",
                  isAvailable: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const bellaPizza = await prisma.restaurant.create({
    data: {
      name: "Bella Pizza",
      description: "Italian-style pizzas, pastas and fresh salads.",
      imageUrl:
        "https://images.unsplash.com/photo-1579751626657-72bc17010498",
      city: "Haifa",
      address: "25 Hanassi Blvd, Haifa",
      rating: 4.6,
      isOpen: true,
      categories: {
        create: [
          {
            name: "Pizza",
            products: {
              create: [
                {
                  name: "Margherita Pizza",
                  description:
                    "Tomato sauce, mozzarella and fresh basil.",
                  price: 52,
                  imageUrl:
                    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
                  isAvailable: true,
                },
                {
                  name: "Mushroom Pizza",
                  description:
                    "Mozzarella, mushrooms, garlic and herbs.",
                  price: 58,
                  imageUrl:
                    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
                  isAvailable: true,
                },
              ],
            },
          },
          {
            name: "Pasta",
            products: {
              create: [
                {
                  name: "Creamy Mushroom Pasta",
                  description:
                    "Pasta with mushrooms, cream and parmesan.",
                  price: 56,
                  imageUrl:
                    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
                  isAvailable: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const greenGarden = await prisma.restaurant.create({
    data: {
      name: "Green Garden",
      description: "Healthy vegetarian dishes, bowls and fresh juices.",
      imageUrl:
        "https://images.unsplash.com/photo-1547592180-85f173990554",
      city: "Jerusalem",
      address: "8 Jaffa St, Jerusalem",
      rating: 4.8,
      isOpen: true,
      categories: {
        create: [
          {
            name: "Healthy Bowls",
            products: {
              create: [
                {
                  name: "Green Garden Bowl",
                  description:
                    "Quinoa, avocado, chickpeas, vegetables and herbs.",
                  price: 49,
                  imageUrl:
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
                  isAvailable: true,
                },
                {
                  name: "Mediterranean Bowl",
                  description:
                    "Falafel, hummus, vegetables, quinoa and tahini.",
                  price: 47,
                  imageUrl:
                    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
                  isAvailable: true,
                },
              ],
            },
          },
          {
            name: "Drinks",
            products: {
              create: [
                {
                  name: "Fresh Green Juice",
                  description:
                    "Apple, cucumber, celery, lemon and mint.",
                  price: 24,
                  imageUrl:
                    "https://images.unsplash.com/photo-1622597467836-f3285f2131b8",
                  isAvailable: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const burgerBloom = await prisma.restaurant.create({
    data: {
      name: "Burger Bloom",
      description: "Juicy burgers, crispy fries and homemade sauces.",
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
      city: "Nahariya",
      address: "15 Ga'aton Blvd, Nahariya",
      rating: 4.5,
      isOpen: true,
      categories: {
        create: [
          {
            name: "Burgers",
            products: {
              create: [
                {
                  name: "Bloom Classic Burger",
                  description:
                    "Beef burger, lettuce, tomato, onion and house sauce.",
                  price: 59,
                  imageUrl:
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
                  isAvailable: true,
                },
                {
                  name: "Crispy Chicken Burger",
                  description:
                    "Crispy chicken, lettuce, pickles and spicy mayo.",
                  price: 57,
                  imageUrl:
                    "https://images.unsplash.com/photo-1606755962773-d324e0a13086",
                  isAvailable: true,
                },
              ],
            },
          },
          {
            name: "Sides",
            products: {
              create: [
                {
                  name: "Crispy Fries",
                  description:
                    "Golden crispy fries with homemade seasoning.",
                  price: 22,
                  imageUrl:
                    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
                  isAvailable: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Restaurants, categories and products created");

  console.log({
    restaurantIds: [
      sunnyBites.id,
      bellaPizza.id,
      greenGarden.id,
      burgerBloom.id,
    ],
  });

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