import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createOrder,
  getOrders,
  getOrderById,
  reorderOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(authMiddleware);

// Create a new order
router.post("/", createOrder);

// Get all orders for the logged-in user
router.get("/", getOrders);

// Reorder a previous order
router.post("/:id/reorder", reorderOrder);

// Get a specific order
router.get("/:id", getOrderById);

export default router;