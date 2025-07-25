import jwt from "jsonwebtoken";

const adminAuthMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    
    if (!token) {
        return res.json({ success: false, message: "Not Authorized. Admin login required." });
    }
    
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token has admin role
        if (token_decode.role !== 'admin') {
            return res.json({ success: false, message: "Access denied. Admin role required." });
        }
        
        // For ENV-based admin, just set the adminId
        req.adminId = token_decode.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Invalid admin token" });
    }
};

export default adminAuthMiddleware;
