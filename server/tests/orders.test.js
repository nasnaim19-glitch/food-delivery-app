import "dotenv/config";

import test, { after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

const token = jwt.sign(
  {
    userId: 999999,
    email: "orders-test@example.com",
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h",
  }
);

let temporaryUserId = null;
let originalBurgerBloomSettings = null;

after(async () => {
  try {
    if (temporaryUserId) {
      await prisma.order.deleteMany({
        where: {
          userId: temporaryUserId,
        },
      });

      await prisma.cart.deleteMany({
        where: {
          userId: temporaryUserId,
        },
      });

      await prisma.user.deleteMany({
        where: {
          id: temporaryUserId,
        },
      });
    }

    if (originalBurgerBloomSettings) {
      await prisma.restaurant.update({
        where: {
          id: originalBurgerBloomSettings.id,
        },
        data: {
          happyHourStartMinutes:
            originalBurgerBloomSettings.happyHourStartMinutes,

          happyHourEndMinutes:
            originalBurgerBloomSettings.happyHourEndMinutes,

          happyHourDiscount:
            originalBurgerBloomSettings.happyHourDiscount,

          happyHourEnabled:
            originalBurgerBloomSettings.happyHourEnabled,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

test(
  "GET /api/orders should reject request without token",
  async () => {
    const response = await request(app)
      .get("/api/orders")
      .expect(401);

    assert.equal(
      response.body.message,
      "Access denied. No token provided"
    );
  }
);

test(
  "POST /api/orders should reject request without token",
  async () => {
    const response = await request(app)
      .post("/api/orders")
      .expect(401);

    assert.equal(
      response.body.message,
      "Access denied. No token provided"
    );
  }
);

test(
  "GET /api/orders should reject invalid token",
  async () => {
    const response = await request(app)
      .get("/api/orders")
      .set(
        "Authorization",
        "Bearer invalid-token"
      )
      .expect(401);

    assert.equal(
      response.body.message,
      "Invalid or expired token"
    );
  }
);

test(
  "GET /api/orders/:id should reject invalid order ID",
  async () => {
    const response = await request(app)
      .get("/api/orders/abc")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .expect(400);

    assert.equal(
      response.body.message,
      "Invalid order ID"
    );
  }
);

test(
  "GET /api/orders/:id should return not found for unknown order",
  async () => {
    const response = await request(app)
      .get("/api/orders/999999")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .expect(404);

    assert.equal(
      response.body.message,
      "Order not found"
    );
  }
);

test(
  "POST /api/orders should reject empty cart",
  async () => {
    const response = await request(app)
      .post("/api/orders")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .expect(400);

    assert.equal(
      response.body.message,
      "Cart is empty"
    );
  }
);

test(
  "GET /api/orders should return an array for authenticated user",
  async () => {
    const response = await request(app)
      .get("/api/orders")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .expect(200);

    assert.ok(
      Array.isArray(response.body)
    );
  }
);

test(
  "Burger Bloom menu should return 50% Happy Hour prices when Happy Hour is active",
  async () => {
    const restaurant =
      await prisma.restaurant.findFirst({
        where: {
          name: "Burger Bloom",
        },
      });

    assert.ok(restaurant);

    originalBurgerBloomSettings = {
      id: restaurant.id,

      happyHourStartMinutes:
        restaurant.happyHourStartMinutes,

      happyHourEndMinutes:
        restaurant.happyHourEndMinutes,

      happyHourDiscount:
        restaurant.happyHourDiscount,

      happyHourEnabled:
        restaurant.happyHourEnabled,
    };

    // Make Happy Hour active for the entire day
    // so the test does not depend on the current clock.
    await prisma.restaurant.update({
      where: {
        id: restaurant.id,
      },
      data: {
        happyHourStartMinutes: 0,
        happyHourEndMinutes: 1440,
        happyHourDiscount: 50,
        happyHourEnabled: true,
      },
    });

    const response = await request(app)
      .get(
        `/api/restaurants/${restaurant.id}`
      )
      .expect(200);

    assert.equal(
      response.body.isHappyHourActive,
      true
    );

    assert.equal(
      response.body.happyHour.discountPercent,
      50
    );

    const products =
      response.body.categories.flatMap(
        (category) => category.products
      );

    assert.ok(products.length > 0);

    const product = products[0];

    assert.equal(
      product.isHappyHourPrice,
      true
    );

    assert.equal(
      product.discountPercent,
      50
    );

    assert.equal(
      product.originalPrice,
      product.price
    );

    assert.equal(
      product.effectivePrice,
      Number(
        (
          product.originalPrice * 0.5
        ).toFixed(2)
      )
    );
  }
);

test(
  "POST /api/orders should save Happy Hour original price, discounted price and 50% discount",
  async () => {
    const uniqueEmail =
      `happy-hour-test-${Date.now()}@example.com`;

    const password = "123456";

    const registerResponse =
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Happy Hour Test User",
          email: uniqueEmail,
          password,
        })
        .expect(201);

    temporaryUserId =
      registerResponse.body.user.id;

    const loginResponse =
      await request(app)
        .post("/api/auth/login")
        .send({
          email: uniqueEmail,
          password,
        })
        .expect(200);

    const userToken =
      loginResponse.body.token;

    const restaurant =
      await prisma.restaurant.findFirst({
        where: {
          name: "Burger Bloom",
        },
        include: {
          categories: {
            include: {
              products: true,
            },
          },
        },
      });

    assert.ok(restaurant);

    const product =
      restaurant.categories
        .flatMap(
          (category) =>
            category.products
        )
        .find(
          (item) =>
            item.isAvailable
        );

    assert.ok(product);

    const originalPrice =
      Number(product.price);

    const expectedDiscountedPrice =
      Number(
        (
          originalPrice * 0.5
        ).toFixed(2)
      );

    await request(app)
      .post("/api/cart")
      .set(
        "Authorization",
        `Bearer ${userToken}`
      )
      .send({
        productId: product.id,
        quantity: 1,
      })
      .expect(201);

    const cartResponse =
      await request(app)
        .get("/api/cart")
        .set(
          "Authorization",
          `Bearer ${userToken}`
        )
        .expect(200);

    assert.equal(
      cartResponse.body.total,
      expectedDiscountedPrice
    );

    assert.equal(
      cartResponse.body.items[0]
        .product.originalPrice,
      originalPrice
    );

    assert.equal(
      cartResponse.body.items[0]
        .product.effectivePrice,
      expectedDiscountedPrice
    );

    assert.equal(
      cartResponse.body.items[0]
        .product.discountPercent,
      50
    );

    const orderResponse =
      await request(app)
        .post("/api/orders")
        .set(
          "Authorization",
          `Bearer ${userToken}`
        )
        .expect(201);

    const order =
      orderResponse.body.order;

    assert.equal(
      order.totalPrice,
      expectedDiscountedPrice
    );

    assert.equal(
      order.items.length,
      1
    );

    const orderItem =
      order.items[0];

    assert.equal(
      orderItem.originalUnitPrice,
      originalPrice
    );

    assert.equal(
      orderItem.unitPrice,
      expectedDiscountedPrice
    );

    assert.equal(
      orderItem.discountPercent,
      50
    );

    assert.equal(
      orderItem.quantity,
      1
    );

    const cartAfterOrder =
      await request(app)
        .get("/api/cart")
        .set(
          "Authorization",
          `Bearer ${userToken}`
        )
        .expect(200);

    assert.equal(
      cartAfterOrder.body.items.length,
      0
    );

    assert.equal(
      cartAfterOrder.body.total,
      0
    );
  }
);