'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Package } from 'lucide-react'

// Miniatura de la tabla de Gestión de Productos. Reúne TODAS las imágenes del producto
// (producto_imagenes principal + secundarias, con fotos_principales como respaldo) y las va rotando
// mientras el mouse está encima; además muestra una ampliación flotante para revisar el recorte.
export function imagenesDeProducto(producto: any): string[] {
  const img = Array.isArray(producto?.producto_imagenes) ? producto.producto_imagenes[0] : producto?.producto_imagenes
  const lista = [
    img?.imagen_principal, img?.imagen_secundaria_1, img?.imagen_secundaria_2, img?.imagen_secundaria_3, img?.imagen_secundaria_4,
    ...(Array.isArray(producto?.fotos_principales) ? producto.fotos_principales : []),
  ].filter((u): u is string => typeof u === 'string' && u.length > 0)
  return Array.from(new Set(lista))
}

export default function MiniaturaProducto({ producto }: { producto: any }) {
  const imagenes = useMemo(() => imagenesDeProducto(producto), [producto])
  const [indice, setIndice] = useState(0)
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!hover || imagenes.length < 2) return
    temporizador.current = setInterval(() => setIndice((i) => (i + 1) % imagenes.length), 800)
    return () => { if (temporizador.current) clearInterval(temporizador.current) }
  }, [hover, imagenes.length])

  if (!imagenes.length) return <div className="gestion-placeholder"><Package /></div>

  const salir = () => { setHover(false); setIndice(0); setPos(null) }
  const mover = (e: React.MouseEvent) => {
    // La ampliación se coloca a la derecha del cursor, sin salirse de la ventana.
    const ancho = 320, alto = 320
    const x = Math.min(e.clientX + 24, window.innerWidth - ancho - 12)
    const y = Math.min(Math.max(e.clientY - alto / 2, 12), window.innerHeight - alto - 12)
    setPos({ x, y })
  }

  return (
    <>
      <div
        className="gestion-imagen"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={salir}
        onMouseMove={mover}
        title={`${imagenes.length} imagen${imagenes.length === 1 ? '' : 'es'}`}
      >
        {imagenes.map((src, i) => (
          <img key={src} src={src} alt={i === 0 ? producto.nombre : `${producto.nombre} ${i + 1}`} className={i === indice ? 'visible' : ''} loading="lazy" />
        ))}
        {imagenes.length > 1 && (hover
          ? <div className="gestion-imagen-puntos">{imagenes.map((_, i) => <i key={i} className={i === indice ? 'activo' : ''} />)}</div>
          : <span className="gestion-imagen-conteo">{imagenes.length}</span>)}
      </div>
      {hover && pos && (
        <div className="gestion-miniatura-grande" style={{ left: pos.x, top: pos.y }}>
          <img src={imagenes[indice]} alt="" />
        </div>
      )}
    </>
  )
}
