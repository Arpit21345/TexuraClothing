import express from "express";
import { validatePromoCode, getAllPromoCodes } from "../controllers/promoController.js";
import authMiddleware from "../middleware/auth.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";

const promoRouter = express.Router();

// Validate promo code (requires user authentication)
promoRouter.post("/validate", authMiddleware, validatePromoCode);

// Get all promo codes (admin only - for testing/management)
promoRouter.get("/all", adminAuthMiddleware, getAllPromoCodes);

export default promoRouter;
