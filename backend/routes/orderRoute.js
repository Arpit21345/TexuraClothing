import express from "express";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from "../middleware/controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";

const orderRouter = express.Router();

// User routes (require user authentication)
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

// Admin routes (require admin authentication)
orderRouter.get("/listorders", adminAuthMiddleware, listOrders);
orderRouter.post("/updatestatus", adminAuthMiddleware, updateStatus);

export default orderRouter;