'use client'

import { useState, useEffect, useRef } from 'react'

interface PropContador {
  hasta: number
  duracion?: number
  decimales?: number
  sufijo?: string
}

function Contador({ hasta, duracion = 1800, decimales = 0, sufijo = '' }: PropContador) {
  const [valor, setValor] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const iniciado = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting && !iniciado.current) {
          iniciado.current = true
          const inicio = performance.now()
          const paso = (ahora: number) => {
            const t = Math.min(1, (ahora - inicio) / duracion)
            const suavizado = 1 - Math.pow(1 - t, 3)
            setValor(suavizado * hasta)
            if (t < 1) requestAnimationFrame(paso)
            else setValor(hasta)
          }
          requestAnimationFrame(paso)
        }
      })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [hasta, duracion])

  const mostrar = decimales > 0
    ? valor.toFixed(decimales)
    : Math.round(valor).toLocaleString('es-CO')

  return <span ref={ref}>{mostrar}{sufijo}</span>
}

const ESTADISTICAS = [
  { hasta: 27,   sufijo: '',  etiqueta: 'Años de Oficio',           decimales: 0, plus: true },
  { hasta: 3400, sufijo: '',  etiqueta: 'Instrumentos Entregados',  decimales: 0, plus: true },
  { hasta: 42,   sufijo: '',  etiqueta: 'Países Atendidos',          decimales: 0, plus: false },
  { hasta: 4.9,  sufijo: '★', etiqueta: 'Reseñas Verificadas',       decimales: 1, plus: false },
]

export default function EstadisticasMarca() {
  return (
    <div className="stats-strip reveal">
      <div className="stats-strip-inner">
        {ESTADISTICAS.map((stat, i) => (
          <div key={i} className="ss-item">
            <div className="ss-num">
              <Contador hasta={stat.hasta} decimales={stat.decimales} />
              {stat.plus && <span className="ss-plus">+</span>}
              {stat.sufijo}
            </div>
            <div className="ss-lbl">{stat.etiqueta}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
