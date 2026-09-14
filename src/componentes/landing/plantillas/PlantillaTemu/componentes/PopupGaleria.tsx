'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-react'
import BotonCarritoAnimado from '../../../../../componentes/ui/BotonCarritoAnimado'

interface Props {
  imagenes: string[]
  imagenSeleccionada: number
  producto: any
  cantidad: number
  variante: any
  touchStart: number | null
  touchEnd: number | null
  onCerrar: () => void
  onCambioImagen: (index: number) => void
  onImagenAnterior: () => void
  onImagenSiguiente: () => void
  onTouchStart: (x: number) => void
  onTouchMove: (x: number) => void
  onTouchEnd: () => void
  onAgregarCarrito: (producto: any, cantidad: number, variante: any) => Promise<any>
}

export default function PopupGaleria({
  imagenes,
  imagenSeleccionada,
  producto,
  cantidad,
  variante,
  onCerrar,
  onCambioImagen,
  onImagenAnterior,
  onImagenSiguiente,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onAgregarCarrito
}: Props) {
  return (
    <div className="hero-temu-popup-galeria" onClick={onCerrar}>
      <div className="hero-temu-popup-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="hero-temu-popup-header">
          <span className="hero-temu-popup-contador">{imagenSeleccionada + 1}/{imagenes.length}</span>
          <div className="hero-temu-popup-botones">
            <button
              className="hero-temu-popup-compartir"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Mira este producto increíble', text: 'Te va a encantar este producto que encontré', url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('¡Enlace copiado al portapapeles!')
                }
              }}
            >
              <Share2 size={20} />
            </button>
            <button className="hero-temu-popup-cerrar" onClick={onCerrar}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="hero-temu-popup-layout-desktop">
          {imagenes.length > 1 && (
            <div className="hero-temu-popup-miniaturas-desktop">
              {imagenes.map((imagen, index) => (
                <button
                  key={index}
                  className={`hero-temu-popup-miniatura-desktop ${index === imagenSeleccionada ? 'activa' : ''}`}
                  onClick={() => onCambioImagen(index)}
                >
                  <img src={imagen} alt={`Vista ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
                </button>
              ))}
            </div>
          )}
          <div className="hero-temu-popup-imagen-container">
            <img src={imagenes[imagenSeleccionada]} alt={producto?.nombre || 'Producto'} className="hero-temu-popup-imagen" loading="eager" />
            {imagenes.length > 1 && (
              <>
                <button className="hero-temu-popup-flecha hero-temu-popup-flecha-izquierda" onClick={onImagenAnterior}>
                  <ChevronLeft size={24} />
                </button>
                <button className="hero-temu-popup-flecha hero-temu-popup-flecha-derecha" onClick={onImagenSiguiente}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        <div
          className="hero-temu-popup-layout-mobile"
          onTouchStart={(e) => { if (imagenes.length <= 1) return; onTouchStart(e.touches[0].clientX) }}
          onTouchMove={(e) => { if (imagenes.length <= 1) return; onTouchMove(e.touches[0].clientX) }}
          onTouchEnd={onTouchEnd}
        >
          <div className="hero-temu-popup-imagen-container-mobile">
            <img src={imagenes[imagenSeleccionada]} alt={producto?.nombre || 'Producto'} className="hero-temu-popup-imagen" loading="eager" />
          </div>
          {imagenes.length > 1 && (
            <div className="hero-temu-popup-miniaturas-mobile">
              {imagenes.map((imagen, index) => (
                <button
                  key={index}
                  className={`hero-temu-popup-miniatura-mobile ${index === imagenSeleccionada ? 'activa' : ''}`}
                  onClick={() => onCambioImagen(index)}
                >
                  <img src={imagen} alt={`Vista ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hero-temu-popup-acciones">
          <BotonCarritoAnimado
            producto={producto}
            cantidad={cantidad}
            variante={variante}
            className="hero-temu-popup-boton-carrito"
            onAgregar={async (p, c, v) => { await onAgregarCarrito(p, c, v); onCerrar() }}
            onError={() => {}}
          >
            Añadir al carrito
          </BotonCarritoAnimado>
        </div>
      </div>
    </div>
  )
}
