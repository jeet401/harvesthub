import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section style={{ padding: '80px 16px', background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0, color: '#111827', lineHeight: 1.1 }}>Fresh from Farmers to You</h1>
            <p style={{ marginTop: 12, fontSize: 18, color: '#4b5563' }}>
              Discover locally grown produce, connect with farmers, and support sustainable agriculture.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link to="/auth/login?type=buyer" style={{ background: '#16a34a', color: '#fff', padding: '14px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Sign in as Buyer →</Link>
            <Link to="/auth/login?type=farmer" style={{ border: '2px solid #16a34a', color: '#16a34a', padding: '12px 22px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Sign in as Farmer</Link>
          </div>
          <Link to="#how-it-works" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Learn more →</Link>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ aspectRatio: '1 / 1', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(135deg,#bbf7d0,#a7f3d0)', padding: 24 }}>
            <img src="/farmers-market-with-fresh-vegetables-and-fruits--p.png" alt="FarmByte Marketplace" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
          </div>
          <div style={{ position: 'absolute', top: -16, left: -16, background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: '#22c55e', borderRadius: 9999 }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Fresh Produce</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: -16, right: -16, background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, background: '#fb923c', borderRadius: 9999 }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Direct from Farm</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


