import express from "express";
import { addToCart, removeFromCart, getCart } from "../middleware/controllers/cartController.js";
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.get("/get", authMiddleware, getCart); // Changed to GET

export default cartRouter;