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
    email: "favorites-test@example.com",
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h",
  }
);

let temporaryUserId = null;
let temporaryUserToken = null;
let testRestaurantId = null;

after(async () => {
  try {
    if (temporaryUserId) {
      await prisma.favorite.deleteMany({
        where: {
          userId: temporaryUserId,
        },
      });

      await prisma.cartItem.deleteMany({
        where: {
          cart: {
            userId: temporaryUserId,
          },
        },
      });

      await prisma.cart.deleteMany({
        where: {
          userId: temporaryUserId,
        },
      });

      await prisma.order.deleteMany({
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
  } finally {
    await prisma.$disconnect();
  }
});

test(
  "GET /api/favorites should reject request without token",
  async () => {
    const response = await request(app)
      .get("/api/favorites")
      .expect(401);

    assert.equal(
      response.body.message,
      "Access denied. No token provided"
    );
  }
);

test(
  "POST /api/favorites/:restaurantId should reject request without token",
  async () => {
    const response = await request(app)
      .post("/api/favorites/1")
      .expect(401);

    assert.equal(
      response.body.message,
      "Access denied. No token provided"
    );
  }
);

test(
  "DELETE /api/favorites/:restaurantId should reject request without token",
  async () => {
    const response = await request(app)
      .delete("/api/favorites/1")
      .expect(401);

    assert.equal(
      response.body.message,
      "Access denied. No token provided"
    );
  }
);

test(
  "GET /api/favorites should reject invalid token",
  async () => {
    const response = await request(app)
      .get("/api/favorites")
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
  "POST /api/favorites/:restaurantId should reject invalid restaurant ID",
  async () => {
    const response = await request(app)
      .post("/api/favorites/abc")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .expect(400);

    assert.equal(
      response.body.message,
      "Invalid restaurant ID"
    );
  }
);

test(
  "Favorites flow should add, return and remove a restaurant",
  async () => {
    const uniqueEmail =
      `favorites-test-${Date.now()}@example.com`;

    const password = "123456";

    const registerResponse =
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Favorites Test User",
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

    temporaryUserToken =
      loginResponse.body.token;

    const restaurant =
      await prisma.restaurant.findFirst({
        orderBy: {
          id: "asc",
        },
      });

    assert.ok(restaurant);

    testRestaurantId =
      restaurant.id;

    const initialFavorites =
      await request(app)
        .get("/api/favorites")
        .set(
          "Authorization",
          `Bearer ${temporaryUserToken}`
        )
        .expect(200);

    assert.ok(
      Array.isArray(
        initialFavorites.body
      )
    );

    assert.equal(
      initialFavorites.body.length,
      0
    );

    const addResponse =
      await request(app)
        .post(
          `/api/favorites/${testRestaurantId}`
        )
        .set(
          "Authorization",
          `Bearer ${temporaryUserToken}`
        )
        .expect(201);

    assert.equal(
      addResponse.body.message,
      "Restaurant added to favorites"
    );

    assert.equal(
      addResponse.body.favorite.userId,
      temporaryUserId
    );

    assert.equal(
      addResponse.body.favorite.restaurantId,
      testRestaurantId
    );

    assert.equal(
      addResponse.body.favorite.restaurant.id,
      testRestaurantId
    );

    const favoritesAfterAdd =
      await request(app)
        .get("/api/favorites")
        .set(
          "Authorization",
          `Bearer ${temporaryUserToken}`
        )
        .expect(200);

    assert.equal(
      favoritesAfterAdd.body.length,
      1
    );

    assert.equal(
      favoritesAfterAdd.body[0].restaurantId,
      testRestaurantId
    );

    assert.equal(
      favoritesAfterAdd.body[0].restaurant.id,
      testRestaurantId
    );

    const duplicateResponse =
      await request(app)
        .post(
          `/api/favorites/${testRestaurantId}`
        )
        .set(
          "Authorization",
          `Bearer ${temporaryUserToken}`
        )
        .expect(400);

    assert.equal(
      duplicateResponse.body.message,
      "Restaurant is already in favorites"
    );

    const removeResponse =
      await request(app)
        .delete(
          `/api/favorites/${testRestaurantId}`
        )
        .set(
          "Authorization",
          `Bearer ${temporaryUserToken}`
        )
        .expect(200);

    assert.equal(
      removeResponse.body.message,
      "Restaurant removed from favorites"
    );

    const favoritesAfterDelete =
      await request(app)
        .get("/api/favorites")
        .set(
          "Authorization",
          `Bearer ${temporaryUserToken}`
        )
        .expect(200);

    assert.equal(
      favoritesAfterDelete.body.length,
      0
    );
  }
);

test(
  "DELETE /api/favorites/:restaurantId should return not found when favorite does not exist",
  async () => {
    assert.ok(
      temporaryUserToken
    );

    assert.ok(
      testRestaurantId
    );

    const response =
      await request(app)
        .delete(
          `/api/favorites/${testRestaurantId}`
        )
        .set(
          "Authorization",
          `Bearer ${temporaryUserToken}`
        )
        .expect(404);

    assert.equal(
      response.body.message,
      "Favorite not found"
    );
  }
);