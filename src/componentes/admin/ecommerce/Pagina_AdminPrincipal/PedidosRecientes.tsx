import React, { useState, useEffect } from 'react'
import { Link } from '@/compat/router'
import { clienteSupabase } from '../../../../configuracion/supabase'

interface Pedido {
  id: string
  numero_pedido?: string | number
  total: number
  estado: string
  creado_el: string
  usuarios?: { nombre?: string; email?: string } | null
}

const formatearCOP = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

const ESTADOS: Record<string, { clase: string; texto: string }> = {
  pendiente:  { clase: 'badge-advertencia', texto: 'Pendiente' },
  enviado:    { clase: 'badge-info',        texto: 'Enviado' },
  entregado:  { clase: 'badge-exito',       texto: 'Entregado' },
  completado: { clase: 'badge-exito',       texto: 'Completado' },
  cancelado:  { clase: 'badge-error',       texto: 'Cancelado' },
  procesando: { clase: 'badge-info',        texto: 'Procesando' }
}

const obtenerEstado = (estado: string) =>
  ESTADOS[estado?.toLowerCase()] ?? { clase: 'badge-advertencia', texto: estado ?? 'Pendiente' }

const SkeletonFila = () => (
  <div className="tabla-fila" aria-hidden="true">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="tabla-celda">
        <div className={`skeleton-line ${i === 0 ? 'skeleton-line-larga' : 'skeleton-line-media'}`}></div>
      </div>
    ))}
  </div>
)

const PedidosRecientes = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarPedidos()
  }, [])

  const cargarPedidos = async () => {
    try {
      const { data } = await clienteSupabase
        .from('pedidos')
        .select('*, usuarios(nombre, email)')
        .order('creado_el', { ascending: false })
        .limit(10)

      setPedidos(data ?? [])
    } catch {
      // silencioso en producción
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pedidos-recientes-card">
      <div className="pedidos-recientes-header">
        <h3 className="pedidos-recientes-titulo">Pedidos recientes</h3>
        <Link to="/admin/pedidos" className="pedidos-recientes-ver-todos">
          Ver todos →
        </Link>
      </div>

      <div className="pedidos-tabla-wrapper">
        <div className="tabla-header">
          <div className="tabla-col">#Pedido</div>
          <div className="tabla-col">Cliente</div>
          <div className="tabla-col tabla-col-ocultar-sm">Total</div>
          <div className="tabla-col tabla-col-ocultar-sm">Fecha</div>
          <div className="tabla-col">Estado</div>
        </div>

        <div className="tabla-body">
          {cargando ? (
            [...Array(5)].map((_, i) => <SkeletonFila key={i} />)
          ) : pedidos.length === 0 ? (
            <div className="pedidos-vacio">
              <span>No hay pedidos aún</span>
            </div>
          ) : (
            pedidos.map((pedido) => {
              const { clase, texto } = obtenerEstado(pedido.estado)
              return (
                <div key={pedido.id} className="tabla-fila">
                  <div className="tabla-celda">
                    <span className="pedido-numero">
                      #{pedido.numero_pedido ?? pedido.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="tabla-celda">
                    <div className="cliente-info">
                      <div className="cliente-avatar">
                        {pedido.usuarios?.nombre?.charAt(0)?.toUpperCase() ?? 'A'}
                      </div>
                      <div className="cliente-detalles">
                        <span className="cliente-nombre">
                          {pedido.usuarios?.nombre ?? 'Anónimo'}
                        </span>
                        <span className="cliente-email">
                          {pedido.usuarios?.email ?? ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="tabla-celda tabla-celda-ocultar-sm">
                    <span className="pedido-total">{formatearCOP(pedido.total ?? 0)}</span>
                  </div>
                  <div className="tabla-celda tabla-celda-ocultar-sm">
                    <span className="pedido-fecha">{formatearFecha(pedido.creado_el)}</span>
                  </div>
                  <div className="tabla-celda">
                    <span className={`estado-badge ${clase}`}>{texto}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default PedidosRecientes
