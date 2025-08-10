import express from "express";
import { generateInvoice, getInvoiceData } from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/auth.js";

const invoiceRouter = express.Router();

// Allow larger HTML payload for invoice generation
invoiceRouter.use(express.json({ limit: '2mb' }));

// Get invoice data (for frontend to generate HTML)
invoiceRouter.get("/data/:orderId", authMiddleware, getInvoiceData);

// Generate and download invoice PDF (receives HTML from frontend)
invoiceRouter.post("/generate/:orderId", authMiddleware, generateInvoice);

export default invoiceRouter;
