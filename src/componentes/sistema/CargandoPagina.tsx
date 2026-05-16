export default function CargandoPagina() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#fff', zIndex: 9999, flexDirection: 'column', gap: '16px'
    }}>
      <img src="/logo.svg" alt="VentaDeAcordeones.com" style={{ width: '160px', opacity: 0.8 }} />
      <div style={{
        width: '40px', height: '40px', border: '3px solid #e9ecef',
        borderTop: '3px solid #e94560', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
