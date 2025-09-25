import { Routes, Route, Link } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import Navbar from './components/Navbar.jsx'
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
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import './App.css'


function Placeholder({ title }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold text-center">{title}</h2>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/auth/complete-profile" element={<CompleteProfile />} />
            <Route path="/auth/sign-up-success" element={<SignUpSuccess />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/buyer/cart" element={<Cart />} />
            <Route path="/buyer/checkout" element={<Checkout />} />
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/order-success" element={<OrderSuccess />} />
            <Route path="/buyer/orders" element={<Placeholder title="Buyer Orders" />} />
            <Route path="/buyer/products" element={<Products />} />
            <Route path="/farmer/dashboard" element={<Placeholder title="Farmer Dashboard" />} />
            <Route path="/farmer/products" element={<Placeholder title="Farmer Products" />} />
            <Route path="/farmer/orders" element={<Placeholder title="Farmer Orders" />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Placeholder title="User Management" />} />
            <Route path="/admin/products" element={<Placeholder title="Product Management" />} />
            <Route path="/admin/orders" element={<Placeholder title="Order Management" />} />
            <Route path="/admin/analytics" element={<Placeholder title="Analytics" />} />
          </Routes>
          </div>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
