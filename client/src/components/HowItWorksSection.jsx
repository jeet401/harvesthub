export default function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '48px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>How it works</h2>
        <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
          <li style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>Browse products</li>
          <li style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>Add to cart</li>
          <li style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>Checkout securely</li>
        </ol>
      </div>
    </section>
  )
}


