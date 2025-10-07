import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import MagicBento from '../../components/MagicBento'
import MagicCard from '../../components/MagicCard'

export default function OrderSuccess() {
  const { isDarkMode } = useTheme()
  
  return (
    <MagicBento className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
    }`}>
      <div className="p-6 max-w-2xl mx-auto pt-20">
        <MagicCard className="p-12 text-center" glowIntensity="medium">
          <div className="text-6xl mb-6">✅</div>
          <h1 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${isDarkMode 
            ? 'from-emerald-400 to-green-300' 
            : 'from-emerald-700 to-green-600'
          } bg-clip-text text-transparent`}>
            Order Placed Successfully! ✨
          </h1>
          <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Thank you for your order. We'll send you a confirmation email shortly with magical precision! 🎉
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/buyer/orders" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 glow-pulse"
            >
              📦 View Orders
            </Link>
            <Link 
              to="/buyer/products" 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 border-2 ${isDarkMode 
                ? 'border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🛒 Continue Shopping
            </Link>
          </div>
        </MagicCard>
      </div>
    </MagicBento>
  )
}
