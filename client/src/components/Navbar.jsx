import { Link } from 'react-router-dom'
import { Button } from './ui/button.jsx'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'

export function Navbar() {
  const { t } = useLanguage()
  
  return (
    <header className="border-b border-border bg-card">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary">
              <div className="w-6 h-6 bg-white rounded text-center flex items-center justify-center">
                🌾
              </div>
            </div>
            <h1 className="text-2xl font-bold text-primary">HarvestHub</h1>
          </Link>

          {/* Right side: Auth buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth/login">
                {t.nav?.signIn || 'Login'}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/auth/sign-up?type=farmer">
                {t.nav?.signUpFarmer || 'Get Started'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar


