import express from "express";
import { generateInvoice, getInvoiceData } from "../middleware/controllers/invoiceController.js";
import authMiddleware from "../middleware/auth.js";

const invoiceRouter = express.Router();

// Get invoice data (for frontend to generate HTML)
invoiceRouter.get("/data/:orderId", authMiddleware, getInvoiceData);

// Generate and download invoice PDF (receives HTML from frontend)
invoiceRouter.post("/generate/:orderId", authMiddleware, generateInvoice);

export default invoiceRouter;
