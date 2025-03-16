import express from "express";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from "../middleware/controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/listorders", authMiddleware, listOrders);
orderRouter.post("/updatestatus", authMiddleware, updateStatus);

export default orderRouter;