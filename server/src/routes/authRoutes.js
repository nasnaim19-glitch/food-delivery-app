import express from "express";
import { register, login } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

export default router;