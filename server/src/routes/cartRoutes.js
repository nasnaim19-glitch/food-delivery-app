import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addItemToCart);
router.patch("/:itemId", updateCartItemQuantity);
router.delete("/:itemId", removeCartItem);

export default router;