import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'

export function Navbar() {
  const { t } = useLanguage()
  return (
    <nav className="border-b" style={{ backdropFilter: 'blur(6px)' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ height: 32, width: 32, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>FB</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 20, color: '#16a34a' }}>FarmByte</span>
            </Link>
          </div>
          <div className="nav-links" style={{ display: 'none' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>{t.nav.home}</Link>
            <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>{t.nav.howItWorks}</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/auth/login" style={{ textDecoration: 'none', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: 6 }}>{t.nav.signIn}</Link>
            <Link to="/auth/sign-up?type=farmer" style={{ textDecoration: 'none', background: '#16a34a', color: 'white', padding: '8px 12px', borderRadius: 6 }}>{t.nav.signUpFarmer}</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


