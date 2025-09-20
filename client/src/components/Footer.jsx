import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#111827', color: '#ffffff', padding: '64px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ height: 32, width: 32, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>FB</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 20, color: '#34d399' }}>FarmByte</span>
            </div>
            <p style={{ color: '#9ca3af', marginTop: 12 }}>Connecting buyers with farmers for fresh, local produce.</p>
          </div>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 18 }}>Quick Links</h3>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link>
              <a href="#how-it-works" style={{ color: '#9ca3af', textDecoration: 'none' }}>How it works</a>
              <Link to="/auth/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>Sign in</Link>
              <Link to="/auth/sign-up" style={{ color: '#9ca3af', textDecoration: 'none' }}>Sign up</Link>
            </div>
          </div>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 18 }}>Contact</h3>
            <div style={{ color: '#9ca3af', marginTop: 12 }}>
              <p>support@farmbyte.com</p>
              <p>+91 12345 67890</p>
            </div>
          </div>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 18 }}>Follow us</h3>
            <p style={{ color: '#9ca3af', marginTop: 12 }}>Coming soon...</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1f2937', marginTop: 48, paddingTop: 24, textAlign: 'center', color: '#9ca3af' }}>
          <p>© {new Date().getFullYear()} FarmByte. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


