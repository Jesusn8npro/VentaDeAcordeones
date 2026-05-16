import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../../configuracion/supabase'
import { UserCircleIcon, BoxCubeIcon, PieChartIcon, ShoppingCartIcon } from '../../iconos/IconosAdmin'

interface Metricas {
  ingresosMes: number
  pedidosPendientes: number
  clientesNuevos: number
  productosActivos: number
  cargando: boolean
}

const formatearCOP = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)

const formatearNumero = (valor: number) =>
  new Intl.NumberFormat('es-CO').format(valor)

const SkeletonCard = () => (
  <div className="kpi-card kpi-skeleton" aria-hidden="true">
    <div className="skeleton-icon"></div>
    <div className="skeleton-lines">
      <div className="skeleton-line skeleton-line-corta"></div>
      <div className="skeleton-line skeleton-line-larga"></div>
      <div className="skeleton-line skeleton-line-media"></div>
    </div>
  </div>
)

const MetricasEcommerce = () => {
  const [metricas, setMetricas] = useState<Metricas>({
    ingresosMes: 0,
    pedidosPendientes: 0,
    clientesNuevos: 0,
    productosActivos: 0,
    cargando: true
  })

  useEffect(() => {
    cargarMetricas()
  }, [])

  const cargarMetricas = async () => {
    try {
      const ahora = new Date()
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
      const inicioSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [
        { data: pedidosMes },
        { count: pedidosPendientes },
        { count: clientesNuevos },
        { count: productosActivos }
      ] = await Promise.all([
        clienteSupabase
          .from('pedidos')
          .select('total')
          .gte('creado_el', inicioMes)
          .neq('estado', 'cancelado'),
        clienteSupabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'pendiente'),
        clienteSupabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('rol', 'cliente')
          .gte('creado_el', inicioSemana),
        clienteSupabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)
      ])

      const ingresosMes = pedidosMes?.reduce((sum, p) => sum + (p.total || 0), 0) ?? 0

      setMetricas({
        ingresosMes,
        pedidosPendientes: pedidosPendientes ?? 0,
        clientesNuevos: clientesNuevos ?? 0,
        productosActivos: productosActivos ?? 0,
        cargando: false
      })
    } catch {
      setMetricas(prev => ({ ...prev, cargando: false }))
    }
  }

  if (metricas.cargando) {
    return (
      <div className="kpi-grid" aria-label="Cargando métricas">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const cards = [
    {
      icono: <PieChartIcon />,
      variante: 'kpi-primario',
      label: 'Ingresos del mes',
      valor: formatearCOP(metricas.ingresosMes),
      cambio: null
    },
    {
      icono: <ShoppingCartIcon />,
      variante: 'kpi-advertencia',
      label: 'Pedidos pendientes',
      valor: formatearNumero(metricas.pedidosPendientes),
      cambio: null
    },
    {
      icono: <UserCircleIcon />,
      variante: 'kpi-exito',
      label: 'Clientes nuevos',
      sublabel: 'esta semana',
      valor: formatearNumero(metricas.clientesNuevos),
      cambio: null
    },
    {
      icono: <BoxCubeIcon />,
      variante: 'kpi-acento',
      label: 'Productos activos',
      valor: formatearNumero(metricas.productosActivos),
      cambio: null
    }
  ]

  return (
    <div className="kpi-grid">
      {cards.map((card, i) => (
        <div key={i} className={`kpi-card ${card.variante}`}>
          <div className="kpi-icono">
            {card.icono}
          </div>
          <div className="kpi-cuerpo">
            <span className="kpi-label">
              {card.label}
              {card.sublabel && <span className="kpi-sublabel"> · {card.sublabel}</span>}
            </span>
            <p className="kpi-valor">{card.valor}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MetricasEcommerce
