'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import DisposicionAdmin from '../../../componentes/admin/DisposicionAdmin/DisposicionAdmin'
import MetricasEcommerce from '../../../componentes/admin/ecommerce/Pagina_AdminPrincipal/MetricasEcommerce'
import PedidosRecientes from '../../../componentes/admin/ecommerce/Pagina_AdminPrincipal/PedidosRecientes'
import AccesosRapidos from '../../../componentes/admin/ecommerce/Pagina_AdminPrincipal/AccesosRapidos'
import '../../../componentes/admin/ecommerce/Pagina_AdminPrincipal/EstilosEcommerceComponentes.css'
import './AdminDashboard.css'

const obtenerSaludo = () => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const obtenerFechaFormateada = () => {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const ContenidoDashboardAdmin = () => {
  const { usuario } = useAuth()
  const nombreCorto = usuario?.nombre?.split(' ')[0] || 'Admin'

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <div className="dashboard-header-texto">
          <h1 className="dashboard-titulo">Dashboard</h1>
          <p className="dashboard-saludo">
            {obtenerSaludo()}, <strong>{nombreCorto}</strong>
          </p>
          <span className="dashboard-fecha">{obtenerFechaFormateada()}</span>
        </div>
      </div>

      <MetricasEcommerce />
      <PedidosRecientes />
      <AccesosRapidos />
    </div>
  )
}

export default function DashboardAdmin() {
  const router = useRouter()
  const { usuario, cargando, sesionInicializada, esAdmin } = useAuth()

  useEffect(() => {
    if (!cargando) {
      if (!sesionInicializada || !usuario) {
        router.push('/login')
        return
      }
      if (!esAdmin()) {
        router.push('/')
        return
      }
    }
  }, [cargando, sesionInicializada, usuario, router, esAdmin])

  if (cargando && !usuario) {
    return (
      <div className="dashboard-cargando-auth">
        <div className="dashboard-spinner-auth"></div>
        <span>Cargando dashboard...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <DisposicionAdmin>
      <ContenidoDashboardAdmin />
    </DisposicionAdmin>
  )
}
