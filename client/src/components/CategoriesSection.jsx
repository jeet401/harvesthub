export default function CategoriesSection() {
  return (
    <section style={{ padding: '48px 16px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>Fruits</div>
          <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>Vegetables</div>
          <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>Seeds</div>
          <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>Fertilizers</div>
        </div>
      </div>
    </section>
  )
}


