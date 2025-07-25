// Function to parse promo codes from environment variable
const getPromoCodes = () => {
    const promoCodesString = process.env.PROMO_CODES;
    if (!promoCodesString) return {};
    
    const promoCodes = {};
    const codes = promoCodesString.split(',');
    
    codes.forEach(code => {
        const [codeString, discount] = code.split(':');
        if (codeString && discount) {
            promoCodes[codeString.trim().toUpperCase()] = parseInt(discount);
        }
    });
    
    return promoCodes;
};

// Validate promo code
const validatePromoCode = async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.json({ success: false, message: "Promo code is required" });
        }
        
        const promoCodes = getPromoCodes();
        const upperCode = code.toUpperCase().trim();
        
        if (promoCodes[upperCode]) {
            const discount = promoCodes[upperCode];
            return res.json({ 
                success: true, 
                message: `Promo code applied! ${discount}% discount`,
                discount: discount,
                code: upperCode
            });
        } else {
            return res.json({ 
                success: false, 
                message: "Invalid promo code" 
            });
        }
    } catch (error) {
        console.error("Promo code validation error:", error);
        res.json({ success: false, message: "Error validating promo code" });
    }
};

// Get all available promo codes (for admin or testing)
const getAllPromoCodes = async (req, res) => {
    try {
        const promoCodes = getPromoCodes();
        const codesList = Object.entries(promoCodes).map(([code, discount]) => ({
            code,
            discount: `${discount}%`
        }));
        
        res.json({ 
            success: true, 
            codes: codesList 
        });
    } catch (error) {
        console.error("Get promo codes error:", error);
        res.json({ success: false, message: "Error fetching promo codes" });
    }
};

export { validatePromoCode, getAllPromoCodes };
