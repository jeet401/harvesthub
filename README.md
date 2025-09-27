# FarmByte - MERN Stack E-commerce Platform

A full-stack e-commerce platform for agricultural products built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🏗️ Architecture

```
farmbyte-mern-app/
├── client/          # React + Vite frontend application
├── server/          # Express.js backend API
├── scripts/         # Database setup and migration scripts
└── package.json     # Root package.json for development scripts
```

## 🚀 Tech Stack

### Frontend (client/)
- **React 19.1.1** - UI library
- **Vite 7.1.6** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui components** - Modern component library
- **Lucide React** - Icon library
- **Context API** - State management (Auth, Language, Cart)

### Backend (server/)
- **Node.js** - JavaScript runtime
- **Express.js 4.19.2** - Web framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT Authentication** - Token-based auth
- **bcryptjs** - Password hashing
- **Razorpay** - Payment gateway integration
- **CORS & Helmet** - Security middleware

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd trials
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

**Server (.env in server/ directory):**
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/farmbyte
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
CLIENT_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

**Client (.env in client/ directory):**
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## 🏃‍♂️ Running the Application

### Development Mode
Start both client and server concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

### Production Build
```bash
# Build client
npm run build:client

# Start server in production
cd server && npm start
```

## 🗄️ Database Setup

1. Make sure MongoDB is running
2. The application will automatically connect to MongoDB
3. Use the SQL scripts in `scripts/` directory for additional setup if needed

## 🧭 Application Routes

### Frontend Routes (React Router)
- `/` - Home page
- `/auth/login` - User login
- `/auth/sign-up` - User registration
- `/auth/complete-profile` - Profile completion
- `/buyer/dashboard` - Buyer dashboard
- `/buyer/products` - Product catalog
- `/buyer/cart` - Shopping cart
- `/buyer/checkout` - Checkout process
- `/buyer/orders` - Order history
- `/farmer/dashboard` - Farmer dashboard
- `/admin/dashboard` - Admin dashboard
- `/profile` - User profile management

### API Routes (Express.js)
- `GET /api/health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/products` - Get products
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

## 👥 User Roles

The application supports three types of users:
1. **Buyers** - Browse and purchase products
2. **Farmers** - List and manage products
3. **Admins** - Platform administration

## 🔐 Authentication

- JWT-based authentication with access and refresh tokens
- Role-based access control
- Secure password hashing with bcrypt
- Session management with HTTP-only cookies

## 💳 Payment Integration

- Razorpay payment gateway
- Support for multiple payment methods (UPI, Cards, Net Banking, Wallets)
- Secure payment verification

## 🎨 UI Features

- Responsive design with Tailwind CSS
- Dark/Light theme support
- Modern component library (shadcn/ui)
- Real-time cart updates
- Multi-language support (English/Hindi)
- Loading states and error handling

## 🛠️ Development Scripts

```bash
# Root level
npm run dev                    # Start both client and server
npm run dev:client            # Start only client
npm run dev:server            # Start only server
npm run build:client          # Build client for production
npm run install:all           # Install all dependencies

# Client level (cd client/)
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
npm run preview               # Preview production build
npm run lint                  # Run ESLint

# Server level (cd server/)
npm run dev                    # Start with nodemon
npm run seed                  # Seed database with sample data
```

## 📁 Project Structure

```
client/
├── public/                   # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── Navbar.jsx      # Navigation component
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.jsx # Authentication state
│   │   ├── CartContext.jsx # Cart state management
│   │   └── LanguageContext.jsx # Multi-language support
│   ├── lib/               # Utility libraries
│   │   └── api.js         # API client functions
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── buyer/         # Buyer-specific pages
│   │   ├── farmer/        # Farmer-specific pages
│   │   └── admin/         # Admin-specific pages
│   └── App.jsx            # Main application component

server/
├── src/
│   ├── lib/               # Utilities
│   │   └── mongo.js       # Database connection
│   ├── middleware/        # Express middleware
│   │   └── auth.js        # Authentication middleware
│   ├── models/           # Mongoose models
│   │   ├── User.js       # User model
│   │   ├── Product.js    # Product model
│   │   ├── Cart.js       # Cart model
│   │   └── Order.js      # Order model
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── products.js   # Product routes
│   │   ├── cart.js       # Cart routes
│   │   └── payment.js    # Payment routes
│   └── index.js          # Server entry point
```

## 🔧 Configuration

### Vite Configuration (client/vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Tailwind Configuration (client/tailwind.config.js)
- Custom color scheme
- shadcn/ui integration
- Animation utilities

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ using the MERN stack**