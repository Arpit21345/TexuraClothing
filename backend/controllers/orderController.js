import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import textileModel from "../models/textileModel.js";
import Stripe from "stripe";

// Don't initialize Stripe here - do it in the function where env vars are available

const placeOrder = async (req, res) => {
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        console.log("Place order request body:", req.body);
        console.log("User ID from auth middleware:", req.body.userId);
        
        // Initialize Stripe here where environment variables are available
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("STRIPE_SECRET_KEY is not set in environment variables!");
            return res.json({ success: false, message: "Payment system is not configured. Please contact administrator." });
        }
        
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        // Validate required fields
        if (!req.body.userId) {
            return res.json({ success: false, message: "User ID is missing" });
        }
        
        if (!req.body.items || req.body.items.length === 0) {
            return res.json({ success: false, message: "No items in order" });
        }
        
        if (!req.body.address) {
            return res.json({ success: false, message: "Address is required" });
        }
        
        if (!req.body.amount || req.body.amount <= 0) {
            return res.json({ success: false, message: "Invalid order amount" });
        }

        // Verify stock availability before creating order/session
        const requested = req.body.items || [];
        const idList = requested
            .map((it) => it._id || it.id)
            .filter(Boolean);

        if (idList.length === 0) {
            return res.json({ success: false, message: "No valid items provided" });
        }

        const products = await textileModel.find({ _id: { $in: idList } });
        const productMap = new Map(products.map((p) => [String(p._id), p]));

        const insufficient = [];
        for (const it of requested) {
            const pid = String(it._id || it.id);
            const qty = Number(it.quantity) || 0;
            const prod = productMap.get(pid);
            if (!prod) {
                insufficient.push({ id: pid, reason: "Not found" });
                continue;
            }
            if (qty <= 0) {
                insufficient.push({ id: pid, reason: "Invalid quantity" });
                continue;
            }
            if (prod.stock < qty) {
                insufficient.push({ id: pid, name: prod.name, available: prod.stock, requested: qty });
            }
        }

        if (insufficient.length > 0) {
            console.warn("Insufficient stock for:", insufficient);
            return res.json({ success: false, message: "Some items are out of stock or exceed available quantity", details: insufficient });
        }

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            promoCode: req.body.promoCode || null
        });

        await newOrder.save();
        console.log("Order saved:", newOrder._id);
        
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        console.log("Cart cleared for user:", req.body.userId);

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100 * 80,
            },
            quantity: item.quantity,
        }));

        // Only add delivery fee if there are items
        if (req.body.amount > 0) {
            line_items.push({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Delivery Charges",
                    },
                    unit_amount: 2 * 100 * 80,
                },
                quantity: 1,
            });
        }

        console.log("Creating Stripe session with line items:", line_items);

    const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        console.log("Stripe session created:", session.id);
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error("Error in placeOrder:", error);
        res.json({ success: false, message: error.message || "Order placement failed" });
    }
};

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;

    if (!orderId) {
        return res.json({ success: false, message: "Order ID is missing" });
    }

    try {
        if (success === "true") {
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.json({ success: false, message: "Order not found" });
            }

            // Avoid double-decrement if already marked paid
            if (!order.payment) {
                order.payment = true;
                await order.save();
                // Decrement stock for each item
                for (const item of order.items) {
                    const pid = item._id || item.id;
                    const qty = Number(item.quantity) || 0;
                    if (!pid || qty <= 0) continue;
                    try {
                        const resUpd = await textileModel.findOneAndUpdate(
                            { _id: pid, stock: { $gte: qty } },
                            { $inc: { stock: -qty } },
                            { new: true }
                        );
                        if (!resUpd) {
                            console.error(`Stock decrement failed for product ${pid} (qty ${qty}).`);
                        }
                    } catch (e) {
                        console.error("Error decrementing stock:", e);
                    }
                }
            }
            res.json({ success: true, message: "Payment successful", orderId: order._id });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment failed" });
        }
    } catch (error) {
        console.error("Error in verifyOrder:", error);
        res.json({ success: false, message: "Error verifying payment", error: error.message });
    }
};

const userOrders = async (req, res) => {
    try {
        console.log(`Fetching orders for user: ${req.body.userId}`);
        const orders = await orderModel.find({ userId: req.body.userId });
        console.log(`Found ${orders.length} orders for user: ${req.body.userId}`);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.json({ success: false, message: "Error" });
    }
};

const listOrders = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;
        const orders = await orderModel.find(filter);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };