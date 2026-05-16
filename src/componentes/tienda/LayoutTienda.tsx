import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import usarStickyElemento from '../../hooks/usarStickyElemento'
import './LayoutTienda.css'

/**
 * LayoutTienda - Layout principal para la tienda con sidebar fijo
 * 
 * Características:
 * - Sidebar fijo en desktop (280px)
 * - Sidebar colapsable en tablet
 * - Modal sidebar en móvil
 * - Área de contenido responsive
 * - Mejor que las referencias mostradas
 */

const LayoutTienda = ({ 
  children, 
  sidebar, 
  titulo = "Tienda",
  mostrarSidebar = true 
}) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  
  // Hook sticky para el sidebar (solo en desktop)
  const { ref: sidebarRef, estilos: estilosSticky, modo: modoSticky } = usarStickyElemento({
    distanciaTop: 0, // Sin distancia extra, pegado exactamente al header
    atributoContenedor: "data-contenedor-tienda"
  })

  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto)
  }

  const cerrarSidebar = () => {
    setSidebarAbierto(false)
  }

  return (
    <div className="layout-tienda">
      {/* Header móvil con botón hamburguesa */}
      <div className="layout-header-movil">
        <button 
          className="btn-toggle-sidebar"
          onClick={toggleSidebar}
          aria-label="Abrir filtros"
        >
          <Menu size={24} />
        </button>
        <h1 className="titulo-tienda-movil">{titulo}</h1>
      </div>

      {/* Overlay para móvil */}
      {sidebarAbierto && (
        <div 
          className="sidebar-overlay"
          onClick={cerrarSidebar}
        />
      )}

      <div className="layout-contenedor" data-contenedor-tienda>
        {/* Sidebar */}
        {mostrarSidebar && (
          <aside className={`layout-sidebar ${sidebarAbierto ? 'abierto' : ''}`}>
            {/* Contenido del sidebar con sticky (incluye header) */}
            <div 
              ref={sidebarRef}
              className={`sidebar-contenido-completo ${modoSticky === 'fijo' ? 'sticky-activo' : ''}`}
              style={estilosSticky}
            >
              {/* Header del sidebar dentro del sticky */}
              <div className="sidebar-header-interno">
                <h2 className="sidebar-titulo">Filtros</h2>
                <button 
                  className="btn-cerrar-sidebar"
                  onClick={cerrarSidebar}
                  aria-label="Cerrar filtros"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido de filtros */}
              <div className="sidebar-filtros-contenido">
                {sidebar}
              </div>
            </div>
          </aside>
        )}

        {/* Contenido principal */}
        <main className={`layout-contenido ${!mostrarSidebar ? 'sin-sidebar' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default LayoutTienda
