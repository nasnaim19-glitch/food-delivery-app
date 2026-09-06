import express from "express";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../controllers/favoriteController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getFavorites
);

router.post(
  "/:restaurantId",
  authMiddleware,
  addFavorite
);

router.delete(
  "/:restaurantId",
  authMiddleware,
  removeFavorite
);

export default router;