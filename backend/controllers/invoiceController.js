import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import textileModel from "../models/textileModel.js";
import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import cloudinary from "../utils/cloudinary.js";
import { launchBrowser } from "../utils/puppeteerLaunch.js";

// Internal: fetch invoice data for HTML generation
const fetchInvoiceData = async (orderId) => {
        const orderData = await orderModel.findById(orderId);
        if (!orderData) throw new Error("Order not found");

        const userData = await userModel.findById(orderData.userId);
        if (!userData) throw new Error("User not found");

        const itemsData = [];
        for (const item of orderData.items) {
                const textileData = await textileModel.findById(item._id);
                if (textileData) {
                        itemsData.push({
                                name: textileData.name,
                                description: textileData.description,
                                price: textileData.price,
                                quantity: item.quantity,
                                total: (textileData.price || 0) * (item.quantity || 0)
                        });
                }
        }

        return {
                order: orderData,
                user: userData,
                items: itemsData,
                generatedDate: new Date().toLocaleDateString()
        };
};

// Internal: tiny HTML template for invoices (kept simple intentionally)
const buildInvoiceHtml = ({ order, user, items, generatedDate }) => {
        const currency = order?.currency || "₹";
        const subtotal = items.reduce((s, it) => s + (it.total || 0), 0);
        const shipping = order?.deliveryCharge ?? 0;
        const discount = order?.discount ?? 0;
        const grandTotal = Math.max(0, subtotal + shipping - discount);
        const addr = order?.address || {};
        const addressStr = [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ');
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${order?._id || ''}</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 24px; color: #111; }
        h1 { margin: 0 0 8px; font-size: 20px; }
        .muted { color: #666; font-size: 12px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .box { border: 1px solid #eee; padding: 12px; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #eee; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #fafafa; }
        .right { text-align: right; }
    </style>
    </head>
    <body>
        <div class="row">
            <div>
                <h1>Texura Clothing</h1>
                <div class="muted">Invoice</div>
            </div>
            <div class="right">
                <div class="muted">Date</div>
                <div>${generatedDate}</div>
                <div class="muted">Order ID</div>
                <div>${order?._id || ''}</div>
            </div>
        </div>

        <div class="row">
            <div class="box" style="flex:1; margin-right: 8px">
                <div class="muted">Billed To</div>
                <div>${user?.name || user?.fullName || ''}</div>
                <div class="muted">Email: ${user?.email || ''}</div>
                <div class="muted">${addressStr}</div>
            </div>
            <div class="box" style="flex:1; margin-left: 8px">
                <div class="muted">Summary</div>
                <div>Subtotal: ${currency} ${subtotal.toFixed(2)}</div>
                <div>Shipping: ${currency} ${Number(shipping).toFixed(2)}</div>
                <div>Discount: -${currency} ${Number(discount).toFixed(2)}</div>
                <div><strong>Total: ${currency} ${grandTotal.toFixed(2)}</strong></div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Description</th>
                    <th class="right">Qty</th>
                    <th class="right">Price</th>
                    <th class="right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((it, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${it.name || ''}</td>
                        <td>${it.description || ''}</td>
                        <td class="right">${it.quantity || 0}</td>
                        <td class="right">${currency} ${(it.price || 0).toFixed(2)}</td>
                        <td class="right">${currency} ${(it.total || 0).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="muted" style="margin-top: 12px">Thank you for your purchase.</div>
    </body>
</html>`;
};

// Generate PDF Invoice from HTML content
const generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
    const { htmlContent } = req.body; // HTML can come from frontend; if missing we'll build it server-side
        
        console.log("Starting PDF generation for order:", orderId);
        console.log("HTML content length:", htmlContent.length);
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
    // Build HTML if not provided
    const htmlToUse = htmlContent || (() => { throw new Error("__BUILD_SERVER_SIDE__"); })();
    // Debug: Save HTML to uploads folder for inspection
    const debugPath = path.join(uploadsDir, `invoice-${orderId}-debug.html`);
    fs.writeFileSync(debugPath, htmlToUse);
    console.log("Debug HTML saved to:", debugPath);
        
        // Create PDF using Puppeteer (standard, minimal launch)
    const browser = await launchBrowser();

    const page = await browser.newPage();
        // Set viewport and page settings
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 1
        });
        // Set content and wait for it to load
    await page.setContent(htmlToUse, {
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
        
        // If client requests storage, upload to Cloudinary and return URL
        if (req.query.store === 'true') {
            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'texura/invoices',
                            resource_type: 'raw',
                            public_id: `invoice-${orderId}`,
                            overwrite: true
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(pdfBuffer);
                });
                return res.json({ success: true, url: uploadResult.secure_url });
            } catch (e) {
                console.error('Cloudinary upload failed, falling back to direct download:', e);
            }
        }

        // Default: stream PDF to client for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
        res.end(pdfBuffer);
    } catch (error) {
        // If error is our sentinel to build server-side, do it once here and retry
        if (error && error.message === "__BUILD_SERVER_SIDE__") {
            try {
                const { orderId } = req.params;
                const data = await fetchInvoiceData(orderId);
                const html = buildInvoiceHtml(data);

                // Ensure uploads dir exists (again safe)
                const uploadsDir = path.join(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const debugPath = path.join(uploadsDir, `invoice-${orderId}-debug.html`);
                fs.writeFileSync(debugPath, html);

                // Launch browser with existing flags and possible fallbacks
                const browser = await launchBrowser();

                const page = await browser.newPage();
                await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
                await page.setContent(html, { waitUntil: ['networkidle0', 'domcontentloaded'], timeout: 30000 });
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
                });
                await browser.close();

                if (req.query.store === 'true') {
                    try {
                        const uploadResult = await new Promise((resolve, reject) => {
                            const uploadStream = cloudinary.uploader.upload_stream(
                                { folder: 'texura/invoices', resource_type: 'raw', public_id: `invoice-${orderId}`, overwrite: true },
                                (error, result) => { if (error) reject(error); else resolve(result); }
                            );
                            uploadStream.end(pdfBuffer);
                        });
                        return res.json({ success: true, url: uploadResult.secure_url });
                    } catch (e) {
                        console.error('Cloudinary upload failed, falling back to direct download:', e);
                    }
                }
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
                return res.end(pdfBuffer);
            } catch (e) {
                console.error('Server-side invoice build failed:', e);
                return res.status(500).json({ success: false, message: 'Error generating invoice (server-side build): ' + e.message });
            }
        }
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
// GET variant: build HTML server-side and stream PDF
const generateInvoiceGet = async (req, res) => {
    // Delegate to POST logic without htmlContent; the handler will build server-side
    req.body = req.body || {};
    delete req.body.htmlContent;
    return generateInvoice(req, res);
};

export { generateInvoiceGet };

// Diagnostics: expose puppeteer executable and environment info (auth-protected)
const puppeteerDiag = async (req, res) => {
    if (String(process.env.ENABLE_PPTR_DIAG || 'false').toLowerCase() !== 'true') {
        return res.status(404).json({ success: false, message: 'Not found' });
    }
    try {
        const reportedExec = (() => {
            try { return typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : undefined; } catch (_) { return undefined; }
        })();
        const envExec = process.env.PUPPETEER_EXECUTABLE_PATH;
        const cacheDir = process.env.PUPPETEER_CACHE_DIR;
        const fsExists = (p) => {
            try { return p ? fs.existsSync(p) : false; } catch { return false; }
        };
        const details = {
            platform: process.platform,
            arch: process.arch,
            node: process.version,
            reportedExec,
            reportedExecExists: fsExists(reportedExec),
            envExec,
            envExecExists: fsExists(envExec),
            cacheDir,
            cacheDirExists: fsExists(cacheDir),
        };
        // Optionally list chrome folders inside cache for quick inspection
        try {
            if (cacheDir && fsExists(cacheDir)) {
                const entries = fs.readdirSync(cacheDir, { withFileTypes: true }).map(e => ({ name: e.name, dir: e.isDirectory() }));
                details.cacheEntries = entries;
            }
        } catch { /* ignore listing errors */ }
        return res.json({ success: true, data: details });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
};

export { puppeteerDiag };
