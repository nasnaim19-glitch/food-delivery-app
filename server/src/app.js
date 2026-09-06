import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Food Delivery API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

export default app;