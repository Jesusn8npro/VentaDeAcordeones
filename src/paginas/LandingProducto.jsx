import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usarProducto } from '../hooks/usarProducto'
import { usarLandingData } from '../hooks/usarLandingData'
import LandingPage from '../componentes/landing/LandingPage'
// import DebugProductoImagenes from '../componentes/debug/DebugProductoImagenes' // Eliminado
import { AlertCircle, ArrowLeft } from 'lucide-react'

/**
 * LandingProducto - Página que renderiza las landing pages de productos
 * 
 * Esta página se accede mediante /landing/:slug
 * Es diferente a /producto/:slug (que es la vista normal del producto)
 * 
 * Aquí se renderizan las landing pages optimizadas para conversión
 */

const LandingProducto = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { producto, cargando, error } = usarProducto(slug)
  const { 
    landingConfig, 
    reviews, 
    notificaciones, 
    cargando: cargandoLanding 
  } = usarLandingData(producto?.id)

  // Estado de carga
  if (cargando || cargandoLanding) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Cargando landing page...</p>
      </div>
    )
  }

  // Estado de error
  if (error || !producto) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <AlertCircle size={48} color="#e74c3c" />
        <h2>Landing page no encontrada</h2>
        <p>{error || 'El producto que buscas no existe o no está disponible'}</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </button>
      </div>
    )
  }

  // Landing renderizada exitosamente

  return (
    <div className="landing-producto-page">
      <LandingPage 
        producto={producto}
        config={landingConfig}
        reviews={reviews}
        notificaciones={notificaciones}
      />

      {/* Estilos para animación de carga */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default LandingProducto
