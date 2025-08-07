# TexuraClothing - Full Stack E-Commerce Platform

A modern, responsive e-commerce platform for textile and clothing sales built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🌟 Features

### Frontend (Customer)
- **Product Catalog**: Browse textiles with advanced filtering and search
- **User Authentication**: Secure registration and login system
- **Profile Management**: Complete user profile with picture upload
- **Shopping Cart**: Add/remove items with quantity management
- **Order Management**: Place orders, track status, view order history
- **Payment Integration**: Stripe payment gateway
- **Invoice Generation**: PDF invoice download
- **Promo Codes**: Discount code system
- **Responsive Design**: Mobile-first approach

### Admin Panel
- **Product Management**: Add, edit, delete products
- **Order Management**: View and update order status
- **Customer Management**: View all customers with search and statistics
- **Dashboard**: Overview of business metrics
- **Secure Admin Access**: Protected admin routes

### Backend API
- **RESTful APIs**: Complete CRUD operations
- **Authentication**: JWT-based auth system
- **File Upload**: Multer integration for images
- **Database**: MongoDB with Mongoose ODM
- **Security**: Input validation and sanitization

## 🚀 Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Modern styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Stripe** - Payment processing

### Admin Panel
- **React.js** - UI library
- **React Router** - Routing
- **React Toastify** - Notifications
- **Axios** - API requests

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Stripe account for payments

### 1. Clone Repository
```bash
git clone https://github.com/Arpit21345/TexuraClothing.git
cd TexuraClothing
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGO_URI=mongodb://localhost:27017/texura-clothing
PORT=4000
JWT_SECRET=your-jwt-secret-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
ADMIN_EMAIL=admin@texuraclothing.com
ADMIN_PASSWORD=admin123
PROMO_CODES=WELCOME10:10,SAVE20:20,NEWUSER15:15
```

Start backend server:
```bash
npm run server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Admin Panel Setup
```bash
cd admin
npm install
npm run dev
```

### 5. Initialize Admin User
```bash
cd backend
npm run setup-admin
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password
- `PROMO_CODES` - Promotional codes (CODE:DISCOUNT format)

### Default Ports
- Backend API: `http://localhost:4000`
- Frontend: `http://localhost:5173`
- Admin Panel: `http://localhost:5174`

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/user/register - User registration
POST /api/user/login - User login
POST /api/admin/login - Admin login
```

### Product Endpoints
```
GET /api/textile/list - Get all products
POST /api/textile/add - Add product (Admin)
DELETE /api/textile/remove - Remove product (Admin)
GET /api/textile/categories - Get product categories
```

### User Profile Endpoints
```
GET /api/user/profile - Get user profile
PUT /api/user/profile - Update user profile
POST /api/user/profile/picture - Upload profile picture
GET /api/user/all - Get all users (Admin)
GET /api/user/stats - Get user statistics (Admin)
```

### Order Endpoints
```
POST /api/order/place - Place new order
GET /api/order/user - Get user orders
GET /api/order/list - Get all orders (Admin)
PUT /api/order/status - Update order status (Admin)
```

### Cart Endpoints
```
GET /api/cart/get - Get user cart
POST /api/cart/add - Add item to cart
DELETE /api/cart/remove - Remove item from cart
```

## 🗂️ Project Structure

```
TexuraClothing/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication & upload middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # File uploads directory
│   └── server.js        # Server entry point
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # React context
│       ├── pages/       # Page components
│       └── assets/      # Images and assets
├── admin/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Admin components
│       ├── pages/       # Admin pages
│       └── assets/      # Admin assets
└── README.md
```

## 🛠️ Development

### Adding New Features
1. Backend: Create model, controller, and routes
2. Frontend: Create components and integrate API
3. Admin: Add management interface if needed

### Code Style
- Use ES6+ features
- Follow React best practices
- Implement proper error handling
- Add PropTypes for components
- Use async/await for API calls

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Restricted file types and sizes
- **CORS Protection**: Configured for secure cross-origin requests
- **Environment Variables**: Sensitive data in environment files

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Admin tests
cd admin
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables
3. Deploy to Heroku, Vercel, or similar platform
4. Set up file storage (AWS S3, Cloudinary)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Netlify, Vercel, or similar platform
3. Configure API base URL for production

### Admin Panel Deployment
1. Build the application: `npm run build`
2. Deploy to hosting platform
3. Configure admin API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Arpit21345
- **Project**: TexuraClothing E-Commerce Platform

## 📞 Support

For support, email support@texuraclothing.com or create an issue in the GitHub repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added user profile management
- **v1.2.0** - Implemented admin customer management
- **v1.3.0** - Enhanced UI/UX with modern design

---

**TexuraClothing** - Modern E-Commerce Solution for Textile Industry
