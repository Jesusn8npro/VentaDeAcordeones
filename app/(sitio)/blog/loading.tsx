export default function LoadingBlog() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '8px',
  }

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div>
          <div style={{ ...shimmer, height: '2.5rem', width: '300px', marginBottom: '2rem' }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem' }}>
              <div style={{ ...shimmer, width: '180px', height: '130px', flexShrink: 0, borderRadius: '10px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ ...shimmer, height: '1.25rem', width: '90%' }} />
                <div style={{ ...shimmer, height: '1rem', width: '70%' }} />
                <div style={{ ...shimmer, height: '0.875rem', width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ ...shimmer, height: '200px', borderRadius: '10px' }} />
          <div style={{ ...shimmer, height: '150px', borderRadius: '10px' }} />
        </div>
      </div>
    </>
  )
}
