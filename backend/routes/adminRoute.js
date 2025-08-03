import express from 'express';
import { loginAdmin, verifyAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

// Admin authentication routes
adminRouter.post("/login", loginAdmin);
adminRouter.get("/verify", verifyAdmin);

export default adminRouter;
