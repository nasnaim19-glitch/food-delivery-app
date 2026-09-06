import "dotenv/config";

import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../src/app.js";

const token = jwt.sign(
  {
    userId: 999999,
    email: "cart-test@example.com",
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h",
  }
);

test("GET /api/cart should reject request without token", async () => {
  const response = await request(app)
    .get("/api/cart")
    .expect(401);

  assert.equal(
    response.body.message,
    "Access denied. No token provided"
  );
});

test("GET /api/cart should reject invalid token", async () => {
  const response = await request(app)
    .get("/api/cart")
    .set("Authorization", "Bearer invalid-token")
    .expect(401);

  assert.equal(
    response.body.message,
    "Invalid or expired token"
  );
});

test("POST /api/cart should reject invalid product ID", async () => {
  const response = await request(app)
    .post("/api/cart")
    .set("Authorization", `Bearer ${token}`)
    .send({
      productId: "abc",
      quantity: 1,
    })
    .expect(400);

  assert.equal(
    response.body.message,
    "Invalid product ID"
  );
});

test("POST /api/cart should reject quantity zero", async () => {
  const response = await request(app)
    .post("/api/cart")
    .set("Authorization", `Bearer ${token}`)
    .send({
      productId: 4,
      quantity: 0,
    })
    .expect(400);

  assert.equal(
    response.body.message,
    "Quantity must be a positive integer"
  );
});

test("PATCH /api/cart/:itemId should reject invalid item ID", async () => {
  const response = await request(app)
    .patch("/api/cart/abc")
    .set("Authorization", `Bearer ${token}`)
    .send({
      quantity: 2,
    })
    .expect(400);

  assert.equal(
    response.body.message,
    "Invalid cart item ID"
  );
});

test("PATCH /api/cart/:itemId should reject invalid quantity", async () => {
  const response = await request(app)
    .patch("/api/cart/1")
    .set("Authorization", `Bearer ${token}`)
    .send({
      quantity: 0,
    })
    .expect(400);

  assert.equal(
    response.body.message,
    "Quantity must be a positive integer"
  );
});

test("DELETE /api/cart/:itemId should reject invalid item ID", async () => {
  const response = await request(app)
    .delete("/api/cart/abc")
    .set("Authorization", `Bearer ${token}`)
    .expect(400);

  assert.equal(
    response.body.message,
    "Invalid cart item ID"
  );
});