export default function FeaturesSection() {
  return (
    <section style={{ padding: '48px 16px', background: '#ffffff', color: '#000000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: '#000000' }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#ffffff', color: '#000000' }}>Quality produce</div>
          <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#ffffff', color: '#000000' }}>Direct from farmers</div>
          <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#ffffff', color: '#000000' }}>Secure payments</div>
        </div>
      </div>
    </section>
  )
}


