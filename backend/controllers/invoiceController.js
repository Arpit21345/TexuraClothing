import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import textileModel from "../models/textileModel.js";
import puppeteer from "puppeteer";
import os from 'os';
import fs from 'fs';
import path from 'path';

// Generate PDF Invoice from HTML content
const generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { htmlContent } = req.body; // HTML will come from frontend
        
        if (!htmlContent) {
            return res.status(400).json({ success: false, message: "HTML content is required" });
        }
        
        console.log("Starting PDF generation for order:", orderId);
        console.log("HTML content length:", htmlContent.length);
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Debug: Save HTML to uploads folder for inspection
        const debugPath = path.join(uploadsDir, `invoice-${orderId}-debug.html`);
        fs.writeFileSync(debugPath, htmlContent);
        console.log("Debug HTML saved to:", debugPath);
        
        // Create PDF using Puppeteer (try headless: true, fallback to legacy if needed)
        let browser;
        // Ensure cache dir is set for puppeteer
        const PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), '.puppeteer-cache');
        process.env.PUPPETEER_CACHE_DIR = PUPPETEER_CACHE_DIR;
        // Compute executable path from cache (linux x64 path)
        // Puppeteer stores chrome under: <cache>/chrome/<version>/chrome-linux/chrome
        const chromeRoot = path.join(PUPPETEER_CACHE_DIR, 'chrome');
        let executablePath;
        try {
            const versions = fs.readdirSync(chromeRoot).filter((d) => d && !d.startsWith('.'));
            if (versions.length > 0) {
                // pick latest
                const latest = versions.sort().pop();
                const platform = os.platform();
                if (platform === 'win32') {
                    executablePath = path.join(chromeRoot, latest, 'chrome-win', 'chrome.exe');
                } else if (platform === 'darwin') {
                    executablePath = path.join(chromeRoot, latest, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
                } else {
                    executablePath = path.join(chromeRoot, latest, 'chrome-linux', 'chrome');
                }
            }
        } catch (e) {
            console.warn('Unable to resolve cached Chrome path:', e.message);
        }

        try {
            browser = await puppeteer.launch({
                headless: true,
                executablePath,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ],
                timeout: 60000
            });
        } catch (err) {
            console.error('Puppeteer launch failed (explicit path). Falling back without explicit path:', err);
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ],
                timeout: 60000
            });
        }

        const page = await browser.newPage();
        // Set viewport and page settings
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });
        // Set content and wait for it to load
        await page.setContent(htmlContent, {
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 30000
        });
        // Generate PDF with proper settings
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });
        await browser.close();
        console.log("PDF generated successfully, buffer size:", pdfBuffer.length);
        // Verify PDF buffer is valid
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("Generated PDF buffer is empty");
        }
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
        // Send PDF buffer directly
        res.end(pdfBuffer);
    } catch (error) {
        console.error("Error generating invoice:", error);
        if (error.stack) console.error(error.stack);
        // Return debug HTML path for inspection
        const debugPath = path.join(process.cwd(), 'uploads', `invoice-${req.params.orderId}-debug.html`);
        res.status(500).json({
            success: false,
            message: "Error generating invoice: " + error.message,
            debugHtml: debugPath,
            stack: error.stack
        });
    }
};

// Get Invoice Data (separate endpoint for getting data)
const getInvoiceData = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Get order details
        const orderData = await orderModel.findById(orderId);
        if (!orderData) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        
        // Get user details
        const userData = await userModel.findById(orderData.userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Get item details
        const itemsData = [];
        for (const item of orderData.items) {
            const textileData = await textileModel.findById(item._id);
            if (textileData) {
                itemsData.push({
                    name: textileData.name,
                    description: textileData.description,
                    price: textileData.price,
                    quantity: item.quantity
                });
            }
        }
        
        // Return structured data for frontend to create HTML
        res.json({
            success: true,
            data: {
                order: orderData,
                user: userData,
                items: itemsData,
                generatedDate: new Date().toLocaleDateString()
            }
        });
        
    } catch (error) {
        console.error("Error fetching invoice data:", error);
        res.status(500).json({ success: false, message: "Error fetching invoice data" });
    }
};

export { generateInvoice, getInvoiceData };
