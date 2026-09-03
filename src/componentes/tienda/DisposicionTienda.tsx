'use client'

import React, { useEffect, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import './DisposicionTienda.css'

/**
 * DisposicionTienda — layout de la tienda: sidebar de filtros + columna de productos.
 *
 * Escritorio (>1024px): el <aside> es `position: sticky` puro (CSS) bajo el header del sitio,
 * con su propio scroll interno. No hay clases ni estilos inline que cambien al hacer scroll,
 * así que el panel nunca pierde estilos ni cambia de contenedor.
 * La única ayuda de JS es medir la altura real del <header> (varía 72→64px al scrollear)
 * y exponerla como --tienda-header-alto; sin JS el CSS usa un valor por defecto razonable.
 *
 * Móvil/tablet (≤1024px): el mismo <aside> se convierte en drawer lateral con cabecera,
 * lista scrolleable y botón fijo "Ver N productos". Cierra por overlay, × y Escape.
 */

interface Props {
  children: React.ReactNode
  sidebar: React.ReactNode
  abierto: boolean
  onCerrar: () => void
  filtrosActivos: number
  onLimpiar: () => void
  totalProductos: number | null
  cargando?: boolean
}

export default function DisposicionTienda({
  children, sidebar, abierto, onCerrar, filtrosActivos, onLimpiar, totalProductos, cargando = false,
}: Props) {
  const raizRef = useRef<HTMLDivElement>(null)

  // Altura real del header del sitio → --tienda-header-alto (para sticky del sidebar y la toolbar)
  useEffect(() => {
    const header = document.querySelector('header')
    const raiz = raizRef.current
    if (!header || !raiz) return
    const aplicar = () => raiz.style.setProperty('--tienda-header-alto', `${Math.round(header.getBoundingClientRect().height)}px`)
    aplicar()
    const ro = new ResizeObserver(aplicar)
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  // Drawer móvil: bloquear scroll del body y cerrar con Escape
  useEffect(() => {
    if (!abierto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', alTeclear)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', alTeclear)
    }
  }, [abierto, onCerrar])

  const textoVer = cargando
    ? 'Buscando…'
    : totalProductos == null
      ? 'Ver productos'
      : totalProductos === 0
        ? 'Sin resultados'
        : `Ver ${totalProductos} ${totalProductos === 1 ? 'producto' : 'productos'}`

  return (
    <div className="layout-tienda" ref={raizRef}>
      {abierto && <div className="sidebar-overlay" onClick={onCerrar} aria-hidden="true" />}

      <div className="layout-contenedor">
        <aside
          className={`layout-sidebar ${abierto ? 'abierto' : ''}`}
          aria-label="Filtros de la tienda"
          aria-hidden={!abierto ? undefined : false}
        >
          <div className="sidebar-panel">
            <div className="sidebar-cabecera">
              <h2 className="sidebar-titulo">
                Filtros
                {filtrosActivos > 0 && <span className="sidebar-titulo-badge">{filtrosActivos}</span>}
              </h2>
              <div className="sidebar-cabecera-acciones">
                {filtrosActivos > 0 && (
                  <button type="button" className="btn-limpiar-sidebar" onClick={onLimpiar}>
                    <RotateCcw size={13} aria-hidden="true" />
                    Limpiar
                  </button>
                )}
                <button type="button" className="btn-cerrar-sidebar" onClick={onCerrar} aria-label="Cerrar filtros">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="sidebar-cuerpo">{sidebar}</div>

            <div className="sidebar-pie">
              <button type="button" className="btn-ver-productos" onClick={onCerrar} disabled={cargando}>
                {textoVer}
              </button>
            </div>
          </div>
        </aside>

        <main className="layout-contenido">{children}</main>
      </div>
    </div>
  )
}
