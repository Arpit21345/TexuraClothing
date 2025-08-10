import express from "express";
import { generateInvoice, getInvoiceData, generateInvoiceGet } from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/auth.js";

const invoiceRouter = express.Router();

// Allow larger HTML payload for invoice generation
invoiceRouter.use(express.json({ limit: '2mb' }));

// Get invoice data (for frontend to generate HTML)
invoiceRouter.get("/data/:orderId", authMiddleware, getInvoiceData);

// Generate and download invoice PDF (receives HTML from frontend)
invoiceRouter.post("/generate/:orderId", authMiddleware, generateInvoice);

// GET variant: server-side HTML build for direct download
invoiceRouter.get("/generate/:orderId", authMiddleware, generateInvoiceGet);

export default invoiceRouter;
