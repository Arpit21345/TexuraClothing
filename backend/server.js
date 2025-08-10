import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import textileRouter from "./routes/textileRoute.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";
import cartRouter from "./routes/cartRoute.js";
import invoiceRouter from "./routes/invoiceRoute.js";
import adminRouter from "./routes/adminRoute.js";
import promoRouter from "./routes/promoRoute.js";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env (local .env when present; on Render uses process.env)
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 4000;

// Connect DB
connectDB();

// JSON body parser
app.use(express.json());

// Build CORS allowlist from envs (supports wildcards like https://texura-shop-*.vercel.app)
const normalizeOrigin = (s) => (s || "").trim().replace(/\/$/, "");
const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
const envList = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(normalizeOrigin);
const derived = [
    normalizeOrigin(process.env.FRONTEND_URL),
    normalizeOrigin(process.env.ADMIN_FRONTEND_URL),
];
const allowlist = unique([...envList, ...derived]);

// Helper: wildcard match (only * wildcard supported)
const toWildcardRegex = (pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const withWildcards = escaped.replace(/\\\*/g, ".*");
    return new RegExp(`^${withWildcards}$`);
};

const isOriginAllowed = (origin) => {
    if (!origin) return true; // non-browser requests / server-to-server
    if (allowlist.length === 0) return true; // safe fallback when not configured
    const o = normalizeOrigin(origin);
    for (const entry of allowlist) {
        if (!entry) continue;
        if (entry.includes("*")) {
            const re = toWildcardRegex(entry);
            if (re.test(o)) return true;
        } else if (normalizeOrigin(entry) === o) {
            return true;
        }
    }
    return false;
};

// Apply CORS BEFORE routes
app.use(
    cors({
        origin(origin, cb) {
            if (isOriginAllowed(origin)) return cb(null, true);
            return cb(new Error("Not allowed by CORS: " + origin));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "token"],
    exposedHeaders: ["Content-Disposition"],
        credentials: true,
    })
);

// Static files (local uploads)
app.use("/images", express.static("uploads"));

// API routes
app.use("/api/textile", textileRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/invoice", invoiceRouter);
app.use("/api/admin", adminRouter);
app.use("/api/promo", promoRouter);

// Root -> redirect to frontend; Health check ..
app.get("/", (req, res) => {
    const target = process.env.FRONTEND_URL || "https://texura-shop.vercel.app";
    res.redirect(302, target);
});
app.get("/healthz", (req, res) => res.status(200).send("ok"));

// Start server
app.listen(port, () => {
    console.log(`Server started on this http://localhost:${port}`);
});