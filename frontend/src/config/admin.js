// Admin Panel Configuration
const adminConfig = {
    // Development URLs
    development: {
        adminPanelUrl: 'http://localhost:5174',
        backendUrl: 'http://localhost:4000'
    },
    
    // Production URLs (update these when deploying)
    production: {
        adminPanelUrl: 'https://your-admin-domain.com', // Update this with your deployed admin URL
        backendUrl: 'https://your-backend-domain.com'   // Update this with your deployed backend URL
    }
};

// Get current environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Export the appropriate configuration
export const getAdminConfig = () => {
    return isDevelopment ? adminConfig.development : adminConfig.production;
};

export default adminConfig;
