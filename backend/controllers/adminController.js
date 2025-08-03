import jwt from "jsonwebtoken";

// Function to create JWT token for admin
const createAdminToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🟢 LOGIN ADMIN (using environment variables)
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check against environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return res.status(500).json({ success: false, message: "Admin credentials not configured" });
        }

        // Validate credentials (username can be email or just check email)
        if (username !== adminEmail || password !== adminPassword) {
            return res.status(401).json({ success: false, message: "Invalid admin credentials" });
        }

        // Create token with admin role
        const token = createAdminToken("admin-env-user");
        
        res.status(200).json({ 
            success: true, 
            token,
            admin: {
                id: "admin-env-user",
                username: "admin",
                email: adminEmail,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 VERIFY ADMIN TOKEN (using environment variables)
const verifyAdmin = async (req, res) => {
    try {
        const { token } = req.headers;
        
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
        }

        // Since we're using ENV variables, just validate the token structure
        res.status(200).json({ 
            success: true, 
            admin: {
                id: "admin-env-user",
                username: "admin",
                email: process.env.ADMIN_EMAIL,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Admin Verification Error:", error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};

export { loginAdmin, verifyAdmin };
