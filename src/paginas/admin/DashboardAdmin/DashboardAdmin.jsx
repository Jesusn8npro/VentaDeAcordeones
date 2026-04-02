import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import DisposicionAdmin from '../../../componentes/admin/DisposicionAdmin/DisposicionAdmin'
import MetricasEcommerce from '../../../componentes/admin/ecommerce/Pagina_AdminPrincipal/MetricasEcommerce'
import PedidosRecientes from '../../../componentes/admin/ecommerce/Pagina_AdminPrincipal/PedidosRecientes'
import '../../../componentes/admin/ecommerce/Pagina_AdminPrincipal/EstilosEcommerceComponentes.css'
import './AdminDashboard.css'

const ContenidoDashboardAdmin = () => {
  const [metricas, setMetricas] = useState({
    ventasHoy: 0,
    pedidosPendientes: 0,
    clientesNuevos: 0,
    ingresosMes: 0
  })

  const [pedidosRecientes, setPedidosRecientes] = useState([])
  const [cargandoMetricas, setCargandoMetricas] = useState(true)
  const [cargandoPedidos, setCargandoPedidos] = useState(true)

  useEffect(() => {
    // Simular carga de métricas
    setTimeout(() => {
      setMetricas({
        ventasHoy: 12,
        pedidosPendientes: 8,
        clientesNuevos: 5,
        ingresosMes: 45000
      })
      setCargandoMetricas(false)
    }, 500)
  }, [])

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p>Resumen general de tu tienda online</p>
      </div>
      
      <MetricasEcommerce metricas={metricas} cargando={cargandoMetricas} />
      <PedidosRecientes pedidos={pedidosRecientes} cargando={cargandoPedidos} />
    </div>
  )
}

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const { usuario, cargando, sesionInicializada, esAdmin } = useAuth()

  // Verificación simplificada - solo redirigir si definitivamente no tiene acceso
  useEffect(() => {
    // Solo verificar si ya no está cargando y tenemos información definitiva
    if (!cargando) {
      if (!sesionInicializada || !usuario) {
        console.log('🚪 No hay sesión o usuario, redirigiendo a login')
        navigate('/login')
        return
      }

      if (!esAdmin()) {
        console.log('🚫 Usuario no es admin, redirigiendo a home')
        navigate('/')
        return
      }
      
      console.log('✅ Acceso verificado - Usuario admin confirmado')
    }
  }, [cargando, sesionInicializada, usuario, navigate, esAdmin])

  // Mostrar loading solo si realmente está cargando la autenticación inicial
  if (cargando && !usuario) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        gap: '8px'
      }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          border: '2px solid #f3f3f3', 
          borderTop: '2px solid #3498db', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <div>Cargando dashboard...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Renderizar el dashboard inmediatamente si tenemos usuario (RutaAdmin ya verificó permisos)
  return (
    <DisposicionAdmin>
      <ContenidoDashboardAdmin />
    </DisposicionAdmin>
  )
}
