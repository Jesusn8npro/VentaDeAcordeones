import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../../configuracion/supabase'
import { UserCircleIcon, BoxCubeIcon, PieChartIcon } from '../../iconos/IconosAdmin'

const MetricasEcommerce = () => {
  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    totalPedidos: 0,
    totalProductos: 0,
    ingresosTotales: 0,
    cargando: true
  })

  useEffect(() => {
    cargarMetricas()
  }, [])

  const cargarMetricas = async () => {
    try {
      console.log('📊 Cargando métricas de ecommerce...')
      
      // Obtener total de clientes
      const { count: totalClientes } = await clienteSupabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'cliente')

      // Obtener total de pedidos
      const { count: totalPedidos } = await clienteSupabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })

      // Obtener total de productos
      const { count: totalProductos } = await clienteSupabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      // Obtener ingresos totales
      const { data: pedidosCompletados } = await clienteSupabase
        .from('pedidos')
        .select('total')
        .eq('estado', 'completado')

      const ingresosTotales = pedidosCompletados?.reduce((sum, pedido) => sum + (pedido.total || 0), 0) || 0

      setMetricas({
        totalClientes: totalClientes || 0,
        totalPedidos: totalPedidos || 0,
        totalProductos: totalProductos || 0,
        ingresosTotales,
        cargando: false
      })

      console.log('✅ Métricas cargadas:', {
        totalClientes,
        totalPedidos,
        totalProductos,
        ingresosTotales
      })
    } catch (error) {
      console.error('❌ Error cargando métricas:', error)
      setMetricas(prev => ({ ...prev, cargando: false }))
    }
  }

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(cantidad)
  }

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-CO').format(numero)
  }

  if (metricas.cargando) {
    return (
      <div className="metricas-ecommerce-contenedor">
        <div className="metricas-ecommerce-cargando">
          <div className="spinner"></div>
          <span>Cargando métricas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="metricas-ecommerce-contenedor">
      <div className="metricas-ecommerce-grid">
        {/* Métrica de Clientes */}
        <div className="metrica-card">
          <div className="metrica-icono metrica-icono-clientes">
            <UserCircleIcon />
          </div>
          <div className="metrica-contenido">
            <div className="metrica-info">
              <span className="metrica-label">Clientes</span>
              <h4 className="metrica-valor">{formatearNumero(metricas.totalClientes)}</h4>
            </div>
            <div className="metrica-badge metrica-badge-success">
              <span className="metrica-porcentaje">+12.5%</span>
            </div>
          </div>
        </div>

        {/* Métrica de Pedidos */}
        <div className="metrica-card">
          <div className="metrica-icono metrica-icono-pedidos">
            <BoxCubeIcon />
          </div>
          <div className="metrica-contenido">
            <div className="metrica-info">
              <span className="metrica-label">Pedidos</span>
              <h4 className="metrica-valor">{formatearNumero(metricas.totalPedidos)}</h4>
            </div>
            <div className="metrica-badge metrica-badge-warning">
              <span className="metrica-porcentaje">-2.1%</span>
            </div>
          </div>
        </div>

        {/* Métrica de Productos */}
        <div className="metrica-card">
          <div className="metrica-icono metrica-icono-productos">
            <BoxCubeIcon />
          </div>
          <div className="metrica-contenido">
            <div className="metrica-info">
              <span className="metrica-label">Productos</span>
              <h4 className="metrica-valor">{formatearNumero(metricas.totalProductos)}</h4>
            </div>
            <div className="metrica-badge metrica-badge-info">
              <span className="metrica-porcentaje">+5.3%</span>
            </div>
          </div>
        </div>

        {/* Métrica de Ingresos */}
        <div className="metrica-card">
          <div className="metrica-icono metrica-icono-ingresos">
            <PieChartIcon />
          </div>
          <div className="metrica-contenido">
            <div className="metrica-info">
              <span className="metrica-label">Ingresos</span>
              <h4 className="metrica-valor">{formatearMoneda(metricas.ingresosTotales)}</h4>
            </div>
            <div className="metrica-badge metrica-badge-success">
              <span className="metrica-porcentaje">+18.7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetricasEcommerce
