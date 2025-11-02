import { Routes, Route, Link } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import Navbar from './components/Navbar.jsx'
import AuthSync from './components/AuthSync.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/auth/Login.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import CompleteProfile from './pages/auth/CompleteProfile.jsx'
import SignUpSuccess from './pages/auth/SignUpSuccess.jsx'
import Profile from './pages/Profile.jsx'
import BuyerDashboard from './pages/buyer/BuyerDashboard.jsx'
import Products from './pages/buyer/Products.jsx'
import Cart from './pages/buyer/Cart.jsx'
import Checkout from './pages/buyer/Checkout.jsx'
import OrderSuccess from './pages/buyer/OrderSuccess.jsx'
import Orders from './pages/buyer/Orders.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import UserManagement from './pages/admin/UserManagement.jsx'
import ProductManagement from './pages/admin/ProductManagement.jsx'
import OrderManagement from './pages/admin/OrderManagement.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import Verifications from './pages/admin/Verifications.jsx'
import Settings from './pages/admin/Settings.jsx'
import FarmerDashboard from './pages/farmer/FarmerDashboard.jsx'
import SimpleFarmerDashboard from './pages/farmer/SimpleFarmerDashboard.jsx'
import ProductDetail from './pages/farmer/ProductDetail.jsx'
import OrderTracking from './pages/farmer/OrderTracking.jsx'
import AddProduct from './pages/farmer/AddProduct.jsx'
import FarmerSignUpSuccess from './pages/auth/FarmerSignUpSuccess.jsx'
import FarmerAnalytics from './pages/farmer/Analytics.jsx'
import BuyerAnalytics from './pages/buyer/Analytics.jsx'
import Chat from './pages/Chat.jsx'


function Placeholder({ title }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold text-center">{title}</h2>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
            <div className="min-h-screen bg-background transition-colors duration-300">
              <Navbar />
              <AuthSync />
              <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/auth/complete-profile" element={<CompleteProfile />} />
            <Route path="/auth/sign-up-success" element={<SignUpSuccess />} />
            <Route path="/auth/farmer-signup-success" element={<FarmerSignUpSuccess />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/buyer/cart" element={<Cart />} />
            <Route path="/buyer/checkout" element={<Checkout />} />
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/order-success" element={<OrderSuccess />} />
            <Route path="/buyer/orders" element={<Orders />} />
            <Route path="/buyer/products" element={<Products />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/dashboard-simple" element={<SimpleFarmerDashboard />} />
            <Route path="/farmer/products/add" element={<AddProduct />} />
            <Route path="/farmer/products/:id" element={<ProductDetail />} />
            <Route path="/farmer/orders" element={<OrderTracking />} />
            <Route path="/farmer/analytics" element={<FarmerAnalytics />} />
            <Route path="/buyer/analytics" element={<BuyerAnalytics />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/orders" element={<OrderManagement />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/verifications" element={<Verifications />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Routes>
            </div>
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
