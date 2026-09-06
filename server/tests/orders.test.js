import "dotenv/config";

import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../src/app.js";

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

test("GET /api/orders should reject request without token", async () => {
  const response = await request(app)
    .get("/api/orders")
    .expect(401);

  assert.equal(
    response.body.message,
    "Access denied. No token provided"
  );
});

test("POST /api/orders should reject request without token", async () => {
  const response = await request(app)
    .post("/api/orders")
    .expect(401);

  assert.equal(
    response.body.message,
    "Access denied. No token provided"
  );
});

test("GET /api/orders should reject invalid token", async () => {
  const response = await request(app)
    .get("/api/orders")
    .set("Authorization", "Bearer invalid-token")
    .expect(401);

  assert.equal(
    response.body.message,
    "Invalid or expired token"
  );
});

test("GET /api/orders/:id should reject invalid order ID", async () => {
  const response = await request(app)
    .get("/api/orders/abc")
    .set("Authorization", `Bearer ${token}`)
    .expect(400);

  assert.equal(
    response.body.message,
    "Invalid order ID"
  );
});

test("GET /api/orders/:id should return not found for unknown order", async () => {
  const response = await request(app)
    .get("/api/orders/999999")
    .set("Authorization", `Bearer ${token}`)
    .expect(404);

  assert.equal(
    response.body.message,
    "Order not found"
  );
});

test("POST /api/orders should reject empty cart", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .expect(400);

  assert.equal(
    response.body.message,
    "Cart is empty"
  );
});

test("GET /api/orders should return an array for authenticated user", async () => {
  const response = await request(app)
    .get("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body));
});