import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button.jsx'
import { ArrowRight, User, Tractor, Settings, LogOut, ShoppingCart, ChevronDown, Package } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import MagicCard from './MagicCard.jsx'

export function Navbar() {
  const { t } = useLanguage()
  const { user, logout, loading } = useAuth()
  const { cartCount } = useCart()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  // User state management

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-lg transition-colors duration-300">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg group-hover:shadow-xl transition-all duration-300 glow-pulse">
              <div className="w-6 h-6 bg-white rounded text-center flex items-center justify-center">
                🌾
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              HarvestHub ✨
            </h1>
          </Link>

          {/* Right side: Theme toggle, Auth buttons or User menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - Always visible */}
            <ThemeToggle />
            
            {loading ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            ) : user ? (
              /* Authenticated user menu */
              <div className="flex items-center space-x-4">
                {/* Cart button - only show for buyers */}
                {user.role === 'buyer' && (
                  <Link to="/buyer/cart">
                    <Button variant="ghost" className="flex items-center gap-2 relative">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="hidden sm:inline">Cart</span>
                      {/* Cart badge - shows cart item count (only when > 0) */}
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[1.25rem]">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                
                {/* User profile dropdown */}
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm capitalize">
                      {user.role}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-2">
                      <Link 
                        to="/profile" 
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        My Profile
                      </Link>
                      {user.role === 'buyer' && (
                        <Link 
                          to="/buyer/orders" 
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <Package className="w-4 h-4 text-blue-600" />
                          My Orders
                        </Link>
                      )}
                      {user.role === 'farmer' && (
                        <Link 
                          to="/farmer/orders" 
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <Package className="w-4 h-4 text-green-600" />
                          My Orders
                        </Link>
                      )}
                      {(user.role === 'farmer' || user.role === 'buyer') && (
                        <Link 
                          to="/chat" 
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <span className="w-4 h-4 text-purple-600">💬</span>
                          Live Chat
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin/orders" 
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <Package className="w-4 h-4 text-red-600" />
                          Manage Orders
                        </Link>
                      )}
                      <div className={`border-t my-1 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                      <button 
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors w-full text-left ${isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <LogOut className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Guest user - Login/Signup buttons */
              <>
                {/* Login Dropdown */}
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center gap-2">
                    {t.nav?.signIn || 'Login'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-2">
                      <Link 
                        to="/auth/login?type=buyer" 
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Login as Buyer
                      </Link>
                      <Link 
                        to="/auth/login?type=farmer" 
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Tractor className="w-4 h-4 text-green-600" />
                        Login as Farmer
                      </Link>
                      <Link 
                        to="/auth/login?type=admin" 
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-red-600" />
                        Admin Login
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Signup Dropdown */}
                <div className="relative group">
                  <Button className="flex items-center gap-2">
                    {t.nav?.signUpFarmer || 'Get Started'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-2">
                      <Link 
                        to="/auth/sign-up?type=buyer" 
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Join as Buyer
                      </Link>
                      <Link 
                        to="/auth/sign-up?type=farmer" 
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Tractor className="w-4 h-4 text-green-600" />
                        Join as Farmer
                      </Link>
                      <div className={`border-t my-1 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                      <Link 
                        to="/auth/sign-up?type=admin" 
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDarkMode 
                          ? 'text-gray-400 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4 text-red-600" />
                        Admin Access
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
