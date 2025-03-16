import userModel from "../../models/userModel.js";

// Add Item to Cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};
        const itemId = req.body.itemId;

        cartData[itemId] = (cartData[itemId] || 0) + 1;

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });

        res.json({ success: true, message: "Item added to cart" });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.json({ success: false, message: "Error adding to cart" });
    }
};

// Remove Item from Cart
const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};
        const itemId = req.body.itemId;

        if (cartData[itemId] && cartData[itemId] > 0) {
            cartData[itemId] -= 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });

        res.json({ success: true, message: "Item removed from cart" });

    } catch (error) {
        console.error("Error removing from cart:", error);
        res.json({ success: false, message: "Error removing from cart" });
    }
};

// Fetch User Cart Data
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        res.json({ success: true, cartData });

    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.json({ success: false, message: "Error fetching cart data" });
    }
};

export { addToCart, removeFromCart, getCart };