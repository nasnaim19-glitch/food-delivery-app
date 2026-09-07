import express from "express";

import {
  getRecommendations,
} from "../controllers/recommendationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  getRecommendations
);

export default router;