import orderModel from "../../models/orderModel.js";
import userModel from "../../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5173";

    try {
        // Create a new order in the database
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });
        await newOrder.save();

        // Clear the user's cart data
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Create line items for the Stripe session
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

        // Add delivery charges to the line items
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

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        // Log the success URL for debugging
        // console.log("Success URL:", `${frontend_url}/verify?success=true&orderId=${newOrder._id}`);

        // Send the session URL as a response
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Backend (for reference)
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
console.log("Received in verifyOrder - Order ID:", orderId, "Success:", success);


    if (!orderId) {
        return res.json({ success: false, message: "Order ID is missing" });
    }

    try {
        console.log("Verifying payment for orderId:", orderId);  // Log the orderId to verify it's being passed correctly

        if (success === "true") {
            const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
            if (!updatedOrder) {
                return res.json({ success: false, message: "Order not found" });
            }
            res.json({ success: true, message: "Payment successful", orderId: updatedOrder._id });
        } else {
            await orderModel.findByIdAndDelete(orderId);  // Delete the order if payment fails
            res.json({ success: false, message: "Payment failed" });
        }
    } catch (error) {
        console.error("Error in verifyOrder:", error);  // Log the error for debugging
        res.json({ success: false, message: "Error verifying payment", error: error.message });
    }
};

// users orders for frontend
const userOrders = async(req,res)=>{
    try{
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders}) 
    }catch(error){
      console.log(error)  ;
      res.json({success:false,message:"Error"})
    }
}

// Listing orders for admin panel

const listOrders = async (req,res)=>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}
//  api for updating order status
const updateStatus = async (req,res) =>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
            res.json({success:true,message:"Status Updated"});
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

export { placeOrder, verifyOrder ,userOrders , listOrders , updateStatus};



