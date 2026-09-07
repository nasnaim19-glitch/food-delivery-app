import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";

const uniqueEmail =
  `recommendations-test-${Date.now()}@example.com`;

const password = "Test1234!";

let token = "";

test(
  "GET /api/recommendations should reject request without token",
  async () => {
    const response = await request(app)
      .get("/api/recommendations");

    assert.equal(response.status, 401);
  }
);

test(
  "GET /api/recommendations should reject invalid token",
  async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set(
        "Authorization",
        "Bearer invalid-token"
      );

    assert.equal(response.status, 401);
  }
);

test(
  "Register and login recommendation test user",
  async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Recommendation Test",
        email: uniqueEmail,
        password,
      });

    assert.equal(
      registerResponse.status,
      201
    );

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: uniqueEmail,
        password,
      });

    assert.equal(
      loginResponse.status,
      200
    );

    assert.ok(
      loginResponse.body.token
    );

    token =
      loginResponse.body.token;
  }
);

test(
  "GET /api/recommendations should return recommendation structure",
  async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    assert.equal(response.status, 200);

    assert.equal(
      typeof response.body.personalized,
      "boolean"
    );

    assert.ok(response.body.profile);

    assert.equal(
      typeof response.body.profile.ordersCount,
      "number"
    );

    assert.equal(
      typeof response.body.profile.favoritesCount,
      "number"
    );

    assert.ok(
      Array.isArray(
        response.body.profile
          .favoriteRestaurantIds
      )
    );

    assert.ok(
      Array.isArray(
        response.body
          .restaurantRecommendations
      )
    );

    assert.ok(
      Array.isArray(
        response.body
          .productRecommendations
      )
    );
  }
);

test(
  "New user should receive non-personalized recommendations",
  async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    assert.equal(response.status, 200);

    assert.equal(
      response.body.personalized,
      false
    );

    assert.equal(
      response.body.profile.ordersCount,
      0
    );

    assert.equal(
      response.body.profile.favoritesCount,
      0
    );

    assert.equal(
      response.body.profile.topCategory,
      null
    );
  }
);

test(
  "Recommendations should contain at most 3 restaurants and 6 products",
  async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    assert.equal(response.status, 200);

    assert.ok(
      response.body
        .restaurantRecommendations
        .length <= 3
    );

    assert.ok(
      response.body
        .productRecommendations
        .length <= 6
    );
  }
);

test(
  "Restaurant recommendations should contain recommendation data",
  async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    assert.equal(response.status, 200);

    const restaurants =
      response.body
        .restaurantRecommendations;

    if (restaurants.length > 0) {
      const restaurant =
        restaurants[0];

      assert.equal(
        typeof restaurant.id,
        "number"
      );

      assert.equal(
        typeof restaurant.name,
        "string"
      );

      assert.equal(
        typeof restaurant.recommendationScore,
        "number"
      );

      assert.equal(
        typeof restaurant.reason,
        "string"
      );

      assert.equal(
        typeof restaurant.previousOrders,
        "number"
      );

      assert.equal(
        typeof restaurant.isFavorite,
        "boolean"
      );

      assert.equal(
        typeof restaurant.isHappyHourActive,
        "boolean"
      );

      assert.ok(
        restaurant.happyHour
      );
    }
  }
);

test(
  "Product recommendations should contain pricing and recommendation data",
  async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    assert.equal(response.status, 200);

    const products =
      response.body
        .productRecommendations;

    if (products.length > 0) {
      const product =
        products[0];

      assert.equal(
        typeof product.id,
        "number"
      );

      assert.equal(
        typeof product.name,
        "string"
      );

      assert.equal(
        typeof product.category,
        "string"
      );

      assert.equal(
        typeof product.recommendationScore,
        "number"
      );

      assert.equal(
        typeof product.reason,
        "string"
      );

      assert.equal(
        typeof product.originalPrice,
        "number"
      );

      assert.equal(
        typeof product.effectivePrice,
        "number"
      );

      assert.equal(
        typeof product.discountPercent,
        "number"
      );

      assert.equal(
        typeof product.isHappyHourPrice,
        "boolean"
      );

      assert.ok(
        product.restaurant
      );
    }
  }
);

test(
  "Recommendation results should be sorted by score from highest to lowest",
  async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    assert.equal(response.status, 200);

    const restaurants =
      response.body
        .restaurantRecommendations;

    for (
      let i = 1;
      i < restaurants.length;
      i += 1
    ) {
      assert.ok(
        restaurants[i - 1]
          .recommendationScore >=
          restaurants[i]
            .recommendationScore
      );
    }

    const products =
      response.body
        .productRecommendations;

    for (
      let i = 1;
      i < products.length;
      i += 1
    ) {
      assert.ok(
        products[i - 1]
          .recommendationScore >=
          products[i]
            .recommendationScore
      );
    }
  }
);