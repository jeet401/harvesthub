# 🌾 HarvestHub - Agricultural Marketplace Platform

<div align="center">

![HarvestHub Banner](https://img.shields.io/badge/HarvestHub-Agricultural_Marketplace-green?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Connecting Farmers Directly with Buyers for Transparent Agricultural Trading**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-local-setup-guide) • [Usage](#-usage) • [API Documentation](#-api-endpoints)

</div>

---

## 📖 About The Project

**HarvestHub** is a comprehensive MERN stack agricultural marketplace platform that connects farmers directly with buyers, eliminating middlemen and increasing profits for all stakeholders. The platform supports AGMARK certification, real-time chat, analytics, and secure payment processing through Razorpay.

### 🎯 Problem Statement

Traditional agricultural supply chains involve multiple intermediaries, resulting in:
- Reduced profits for farmers
- Higher prices for buyers
- Lack of transparency in quality and pricing
- Delayed payments and communication gaps

### 💡 Solution

HarvestHub provides:
- **Direct Connection** between farmers and buyers
- **AGMARK Certification** for quality assurance
- **Real-time Communication** through integrated chat
- **Secure Payments** via Razorpay integration
- **Analytics Dashboard** for informed decision-making
- **Role-based Access** for Farmers, Buyers, and Admins

---

## ✨ Features

### 👨‍🌾 For Farmers
- ✅ List and manage agricultural products
- ✅ Track orders and order status
- ✅ View sales analytics and revenue insights
- ✅ Real-time chat with buyers
- ✅ AGMARK certification management
- ✅ Product inventory management

### 🛒 For Buyers
- ✅ Browse and search products with filters
- ✅ Add products to cart
- ✅ Secure checkout with Razorpay
- ✅ Order tracking and history
- ✅ Purchase analytics
- ✅ Direct communication with farmers

### ⚙️ For Admins
- ✅ User management (farmers, buyers)
- ✅ Product moderation
- ✅ Order management and monitoring
- ✅ AGMARK verification system
- ✅ Platform-wide analytics
- ✅ System settings and configurations

### 🌟 General Features
- 🌓 Dark/Light mode toggle
- 🌍 Multi-language support (ready)
- 💬 Real-time chat with Socket.io
- 📊 Interactive analytics dashboards
- 🔒 JWT-based authentication
- 🔄 Automatic token refresh
- 📱 Fully responsive design
- ✨ Animated UI with "magical" theme

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI Framework |
| **Vite** | 7.1.6 | Build tool & Dev server |
| **React Router** | 6.30.1 | Client-side routing |
| **TailwindCSS** | 3.4.14 | Styling framework |
| **Framer Motion** | 12.23.22 | Animations |
| **GSAP** | 3.13.0 | Advanced animations |
| **Socket.io Client** | 4.8.1 | Real-time communication |
| **Recharts** | 3.2.1 | Data visualization |
| **Lucide React** | 0.454.0 | Icon library |
| **Radix UI** | Latest | Accessible components |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 16+ | Runtime environment |
| **Express** | 4.19.2 | Web framework |
| **MongoDB** | 8.6.0 | Database |
| **Mongoose** | 8.6.0 | ODM |
| **Socket.io** | 4.8.1 | WebSocket server |
| **JWT** | 9.0.2 | Authentication |
| **Bcrypt** | 2.4.3 | Password hashing |
| **Razorpay** | 2.9.6 | Payment gateway |
| **Helmet** | 7.1.0 | Security middleware |
| **CORS** | 2.8.5 | Cross-origin requests |

---

## 📦 Local Setup Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

Check your installations:
```bash
node --version
npm --version
mongod --version
git --version
```

### 🚀 Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/jeet401/trials.git
cd trials
```

#### 2. Backend Setup

##### Navigate to server directory
```bash
cd server
```

##### Install dependencies
```bash
npm install
```

##### Configure environment variables
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/farmbyte

# JWT Secrets (Change these in production!)
JWT_ACCESS_SECRET=my_super_secret_access_key_for_development_only_123456789
JWT_REFRESH_SECRET=my_super_secret_refresh_key_for_development_only_987654321

# CORS Configuration
CLIENT_ORIGIN=http://localhost:5173

# Razorpay Configuration
# Get these from https://dashboard.razorpay.com/#/app/keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional: Webhook secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

##### Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
# MongoDB should be running as a service
# Or start manually:
mongod --dbpath="C:\data\db"
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

##### Seed the database (Optional)
```bash
npm run seed
```

##### Start the backend server
```bash
npm run dev
```

Server will run on: `http://localhost:5000`

#### 3. Frontend Setup

##### Open a new terminal and navigate to client directory
```bash
cd client
```

##### Install dependencies
```bash
npm install
```

##### Configure environment variables
Create a `.env` file in the `client` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Razorpay Configuration
# Get this from https://dashboard.razorpay.com/#/app/keys (Public Key ID only)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# App Configuration
VITE_APP_NAME=HarvestHub
VITE_APP_VERSION=1.0.0
```

##### Start the frontend development server
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

#### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🎮 Usage

### Creating Accounts

#### 1. **Farmer Account**
- Click "Join as Farmer" on the homepage
- Fill in registration details
- Complete profile with farm information
- Start listing products

#### 2. **Buyer Account**
- Click "Join as Buyer" on the homepage
- Fill in registration details
- Browse products and start purchasing

#### 3. **Admin Account**
- Access via `/auth/login?type=admin`
- Use admin credentials
- Manage platform operations

### Default Test Credentials

After seeding the database, you can use these test accounts:

```
Farmer:
Email: farmer@test.com
Password: password123

Buyer:
Email: buyer@test.com
Password: password123

Admin:
Email: admin@test.com
Password: password123
```

---

## 📂 Project Structure

```
trials/
├── client/                    # Frontend React Application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # UI components (buttons, cards, etc.)
│   │   │   ├── Navbar.jsx
│   │   │   ├── MagicCard.jsx
│   │   │   └── ...
│   │   ├── contexts/        # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── buyer/       # Buyer dashboard pages
│   │   │   ├── farmer/      # Farmer dashboard pages
│   │   │   └── admin/       # Admin dashboard pages
│   │   ├── lib/             # Utility functions
│   │   │   └── api.js       # API client
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── .env                 # Environment variables
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                   # Backend Node.js Application
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Cart.js
│   │   │   └── ...
│   │   ├── routes/          # Express routes
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── cart.js
│   │   │   ├── payment.js
│   │   │   ├── chat.js
│   │   │   ├── analytics.js
│   │   │   └── admin.js
│   │   ├── middleware/      # Custom middleware
│   │   │   └── auth.js
│   │   ├── lib/             # Utility libraries
│   │   │   ├── mongo.js
│   │   │   ├── socket.js
│   │   │   └── razorpay.js
│   │   ├── utils/           # Helper functions
│   │   │   └── jwt.js
│   │   ├── index.js         # Server entry point
│   │   └── seed.js          # Database seeder
│   ├── .env                 # Environment variables
│   └── package.json
│
└── README.md                # Project documentation
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
POST   /api/auth/refresh         - Refresh access token
GET    /api/auth/profile         - Get user profile
PUT    /api/auth/profile         - Update user profile
POST   /api/auth/complete-profile - Complete user profile
GET    /api/auth/users           - Get all users (Admin)
```

### Products
```
GET    /api/products             - Get all products (with filters)
GET    /api/products/:id         - Get single product
GET    /api/products/my-products - Get farmer's products
POST   /api/products             - Create product (Farmer)
PUT    /api/products/:id         - Update product (Farmer)
DELETE /api/products/:id         - Delete product (Farmer)
GET    /api/products/categories  - Get product categories
```

### Cart
```
GET    /api/cart                 - Get user's cart
POST   /api/cart/add             - Add item to cart
PUT    /api/cart/:id             - Update cart item
DELETE /api/cart/:id             - Remove item from cart
```

### Orders
```
GET    /api/orders               - Get buyer's orders
GET    /api/orders/farmer        - Get farmer's orders
GET    /api/orders/:id           - Get single order
PUT    /api/orders/:id/status    - Update order status
PUT    /api/orders/:id/received  - Mark order as received
```

### Payment
```
POST   /api/payment/create-order - Create Razorpay order
POST   /api/payment/verify       - Verify payment
```

### Analytics
```
GET    /api/analytics/farmer     - Get farmer analytics
GET    /api/analytics/buyer      - Get buyer analytics
```

### Chat
```
GET    /api/chat/conversations           - Get user conversations
POST   /api/chat/conversations           - Create conversation
GET    /api/chat/conversations/:id/messages - Get messages
POST   /api/chat/conversations/:id/messages - Send message
```

### Admin
```
GET    /api/admin/stats          - Get platform statistics
PUT    /api/admin/users/:id      - Update user status
DELETE /api/admin/users/:id      - Delete user
```

---

## 🎨 Key Features Explained

### 1. **Authentication System**
- JWT-based authentication with access and refresh tokens
- HttpOnly cookies for secure token storage
- Automatic token refresh on expiration
- Cross-tab authentication synchronization
- Role-based access control (Farmer, Buyer, Admin)

### 2. **Real-time Chat**
- Socket.io integration for instant messaging
- Conversation management between farmers and buyers
- Message history persistence
- Online status indicators

### 3. **Payment Integration**
- Razorpay payment gateway integration
- Secure payment verification
- Order confirmation flow
- Payment history tracking

### 4. **Analytics Dashboard**
- Revenue tracking for farmers
- Purchase insights for buyers
- Platform-wide statistics for admins
- Interactive charts with Recharts
- Date range filtering

### 5. **Theme System**
- Light/Dark mode toggle
- Consistent color scheme with CSS variables
- Smooth transitions between themes
- Persistent theme preference

### 6. **Magical UI Components**
- Custom animated components (MagicCard, MagicBento)
- Gradient effects and glows
- Smooth animations with Framer Motion
- GSAP-powered advanced animations

---

## 🔐 Security Features

- 🔒 JWT token-based authentication
- 🔑 Bcrypt password hashing
- 🍪 HttpOnly cookies for token storage
- 🛡️ Helmet.js security headers
- 🔄 CORS configuration
- 🚫 XSS protection
- ✅ Input validation
- 🔐 Environment variable protection

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd client
npm run build
```

2. Deploy the `dist` folder to your hosting platform

3. Update environment variables on the hosting platform

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. Ensure MongoDB is accessible (MongoDB Atlas recommended)

2. Update environment variables:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/farmbyte
CLIENT_ORIGIN=https://your-frontend-domain.com
```

3. Deploy using your preferred platform

### Environment Variables Checklist

**Production Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_APP_NAME=HarvestHub
```

**Production Backend (.env):**
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
CLIENT_ORIGIN=https://your-frontend-domain.com
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **MongoDB Connection Failed**
```
Error: MongooseServerSelectionError
```
**Solution:**
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Verify network connectivity

#### 2. **Port Already in Use**
```
Error: Port 5000 is already in use
```
**Solution:**
- Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```
- Or change the PORT in `.env`

#### 3. **CORS Errors**
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Verify `CLIENT_ORIGIN` in backend `.env`
- Ensure credentials: true in CORS config
- Check frontend API URL in client `.env`

#### 4. **PowerShell Script Execution Error**
```
npm cannot be loaded because running scripts is disabled
```
**Solution:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

#### 5. **Module Not Found**
```
Error: Cannot find module 'xxx'
```
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Development Workflow

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Database Seeding

Populate the database with sample data:
```bash
cd server
npm run seed
```

### Code Style

- Frontend: ESLint with React rules
- Backend: Standard Node.js conventions
- Use Prettier for formatting

---

## 📊 Database Schema

### User Model
```javascript
{
  email: String,
  password: String (hashed),
  role: ['farmer', 'buyer', 'admin'],
  isVerified: Boolean,
  createdAt: Date
}
```

### Product Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  stock: Number,
  sellerId: ObjectId (User),
  agmarkCertified: Boolean,
  createdAt: Date
}
```

### Order Model
```javascript
{
  buyerId: ObjectId (User),
  items: [{
    productId: ObjectId (Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: ['pending', 'confirmed', 'shipped', 'delivered'],
  paymentId: String,
  createdAt: Date
}
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Jeet Gandhi** - *Initial work and Backend* - [@jeet401](https://github.com/jeet401)
- **Heet Mistry** - *Design and Frontend* - [@Heet146](https://github.com/Heet146)
- **Jatin Vora** - *Database Connection and Frontend* - [@Jatinvora11](https://github.com/Jatinvora11)
---

## 🙏 Acknowledgments

- Icons from [Lucide React](https://lucide.dev/)
- UI Components inspired by [Radix UI](https://www.radix-ui.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Charts by [Recharts](https://recharts.org/)
- Payment processing by [Razorpay](https://razorpay.com/)

---

## 📞 Support

For support, email support@harvesthub.com or join our Slack channel.

---

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Multi-language support implementation
- [ ] AI-powered crop recommendation
- [ ] Weather integration
- [ ] Blockchain for supply chain tracking
- [ ] Advanced analytics with ML
- [ ] Video call support for negotiations
- [ ] Automated quality grading

---

## 📸 Screenshots

### Landing Page
Beautiful gradient design with role-based authentication

### Farmer Dashboard
Product management and sales analytics

### Buyer Dashboard
Product browsing and order tracking

### Chat Interface
Real-time communication between farmers and buyers

### Analytics Dashboard
Interactive charts and insights

---

<div align="center">

**Built with ❤️ and 🌱 for the Agricultural Community**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/jeet401/trials/issues) • [Request Feature](https://github.com/jeet401/trials/issues)

</div>
