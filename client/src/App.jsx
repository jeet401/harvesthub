import { Routes, Route, Link } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/auth/Login.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import CompleteProfile from './pages/auth/CompleteProfile.jsx'
import SignUpSuccess from './pages/auth/SignUpSuccess.jsx'
import BuyerDashboard from './pages/buyer/BuyerDashboard.jsx'
import Products from './pages/buyer/Products.jsx'
import Cart from './pages/buyer/Cart.jsx'
import Checkout from './pages/buyer/Checkout.jsx'
import OrderSuccess from './pages/buyer/OrderSuccess.jsx'
import './App.css'


function Placeholder({ title }) {
  return (
    <div style={{ padding: 16 }}>
      <h2>{title}</h2>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/sign-up" element={<SignUp />} />
        <Route path="/auth/complete-profile" element={<CompleteProfile />} />
        <Route path="/auth/sign-up-success" element={<SignUpSuccess />} />
        <Route path="/buyer/cart" element={<Cart />} />
        <Route path="/buyer/checkout" element={<Checkout />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/order-success" element={<OrderSuccess />} />
        <Route path="/buyer/orders" element={<Placeholder title="Buyer Orders" />} />
        <Route path="/buyer/products" element={<Products />} />
        <Route path="/farmer/dashboard" element={<Placeholder title="Farmer Dashboard" />} />
        <Route path="/farmer/products" element={<Placeholder title="Farmer Products" />} />
        <Route path="/farmer/orders" element={<Placeholder title="Farmer Orders" />} />
      </Routes>
    </LanguageProvider>
  )
}
