'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { usarProducto } from '../../../hooks/usarProducto'
import { usarLandingData } from '../../../hooks/usarLandingData'
import SelectorPlantilla from '../../../componentes/landing/SelectorPlantilla'

/**
 * PaginaProducto - Página que detecta automáticamente la plantilla del producto
 * 
 * Esta página ahora funciona como un router inteligente que:
 * 1. Carga el producto
 * 2. Detecta qué plantilla tiene asignada (landing_tipo)
 * 3. Renderiza automáticamente la plantilla correcta
 * 
 * Ya NO necesitas hacer clic en "Ver Landing Page", se detecta automáticamente
 */
export default function PaginaProducto({ initialData: _initialData }: { initialData?: any }) {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()

  // âš¡ Estado de carga paralela optimizada
  const [cargaCompleta, setCargaCompleta] = useState(false)

  // Usar los hooks para cargar datos EN PARALELO
  const { producto, cargando: cargandoProducto, error } = usarProducto(slug)
  const { 
    landingConfig, 
    reviews, 
    notificaciones, 
    cargando: cargandoLanding 
  } = usarLandingData(producto?.id)

  // âš¡ Efecto para detectar cuando ambas cargas están completas
  useEffect(() => {
    if (!cargandoProducto && !cargandoLanding && producto) {
      // Pequeño delay para suavizar la transición (opcional)
      const timer = setTimeout(() => {
        setCargaCompleta(true)
      }, 50) // 50ms para transición suave
      
      return () => clearTimeout(timer)
    }
  }, [cargandoProducto, cargandoLanding, producto])

  // âš¡ Estado de carga ultra optimizado - solo mientras ambos cargan
  const estasCargando = cargandoProducto || cargandoLanding || !cargaCompleta
  
  if (estasCargando) {
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
          width: '32px', 
          height: '32px', 
          border: '3px solid var(--vda-linea)',
          borderTop: '3px solid #ff6b35',
          borderRadius: '50%',
          animation: 'ultraSpin 0.6s linear infinite' // âš¡ Animación más rápida
        }}></div>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--vda-tinta-dim)',
          fontWeight: '500'
        }}>
          Cargando...
        </p>
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
        gap: '1rem'
      }}>
        <AlertCircle size={48} color="#e74c3c" />
        <h2>Producto no encontrado</h2>
        <p>{error || 'El producto que buscas no existe o no está disponible'}</p>
        <button 
          onClick={() => router.push('/')}
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

  return (
    <div className="pagina-producto-auto">
      <SelectorPlantilla 
        producto={producto}
        config={landingConfig}
        reviews={reviews}
        notificaciones={notificaciones}
      />

      {/* âš¡ Estilos optimizados para animación ultra rápida */}
      <style>
        {`
          @keyframes ultraSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* âš¡ Optimización para transiciones suaves */
          .pagina-producto-auto {
            animation: fadeIn 0.2s ease-in-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}
