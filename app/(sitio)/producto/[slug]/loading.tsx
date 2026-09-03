export default function LoadingProducto() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--vda-superficie-2) 25%, var(--vda-superficie-3) 50%, var(--vda-superficie-2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '8px',
  }

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ ...shimmer, height: '1.5rem', width: '120px', marginBottom: '2rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div style={{ ...shimmer, height: '450px', borderRadius: '12px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ ...shimmer, height: '2.5rem', width: '90%' }} />
            <div style={{ ...shimmer, height: '1rem', width: '60%' }} />
            <div style={{ ...shimmer, height: '2rem', width: '40%' }} />
            <div style={{ ...shimmer, height: '120px', borderRadius: '8px' }} />
            <div style={{ ...shimmer, height: '3rem', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    </>
  )
}
