export default function LoadingTienda() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '8px',
  }

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ ...shimmer, height: '2rem', width: '200px', marginBottom: '2rem' }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ ...shimmer, height: '220px', borderRadius: 0 }} />
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ ...shimmer, height: '1rem', width: '80%' }} />
                <div style={{ ...shimmer, height: '0.875rem', width: '50%' }} />
                <div style={{ ...shimmer, height: '1.25rem', width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
