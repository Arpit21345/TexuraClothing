import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import textileRouter from "./routes/textileRoute.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";
import cartRouter from "./routes/cartRoute.js";
import invoiceRouter from "./routes/invoiceRoute.js";
import adminRouter from "./routes/adminRoute.js";
import promoRouter from "./routes/promoRoute.js";

// Load environment variables
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// API endpoints
app.use("/api/textile", textileRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/invoice", invoiceRouter);
app.use("/api/admin", adminRouter);
app.use("/api/promo", promoRouter);

app.get("/", (req, res) => {
    res.send("API is working");
});
// this is just to test wether server is running it open a page 
// with api working written


// Start server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});