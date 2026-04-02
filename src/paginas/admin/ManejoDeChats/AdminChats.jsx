import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import './AdminChats.css'

const AdminChats = () => {
  // Estados principales
  const [leads, setLeads] = useState([])
  const [conversaciones, setConversaciones] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Estados de filtros y búsqueda
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroConvertido, setFiltroConvertido] = useState('todos')
  const [filtroTipoConsulta, setFiltroTipoConsulta] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('fecha_desc')

  // Estados de modales y vistas
  const [leadSeleccionado, setLeadSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarConversaciones, setMostrarConversaciones] = useState(false)
  const [conversacionesActuales, setConversacionesActuales] = useState([])

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [leadsPerPage] = useState(12)

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [])

  // Función principal para cargar todos los datos
  const cargarDatos = async () => {
    setCargando(true)
    setError(null)
    
    try {
      await Promise.all([
        cargarLeads(),
        cargarEstadisticas()
      ])
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar los datos. Por favor, intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  // Cargar leads desde la tabla leads_chat
  const cargarLeads = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('leads_chat')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      console.error('Error cargando leads:', err)
      throw err
    }
  }

  // Cargar estadísticas generales
  const cargarEstadisticas = async () => {
    try {
      const { data: leadsData, error } = await clienteSupabase
        .from('leads_chat')
        .select('converted, created_at, nivel_interes, probabilidad_compra, valor_potencial')

      if (error) throw error

      const total = leadsData?.length || 0
      const convertidos = leadsData?.filter(lead => lead.converted)?.length || 0
      const hoy = new Date()
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const nuevosEsteMes = leadsData?.filter(lead => 
        new Date(lead.created_at) >= inicioMes
      )?.length || 0

      const promedioInteres = leadsData?.length > 0 
        ? Math.round(leadsData.reduce((sum, lead) => sum + (lead.nivel_interes || 5), 0) / leadsData.length)
        : 5

      const promedioCompra = leadsData?.length > 0
        ? Math.round(leadsData.reduce((sum, lead) => sum + (lead.probabilidad_compra || 50), 0) / leadsData.length)
        : 50

      const valorTotal = leadsData?.reduce((sum, lead) => sum + (parseFloat(lead.valor_potencial) || 0), 0) || 0

      setEstadisticas({
        total,
        convertidos,
        pendientes: total - convertidos,
        tasaConversion: total > 0 ? Math.round((convertidos / total) * 100) : 0,
        nuevosEsteMes,
        promedioInteres,
        promedioCompra,
        valorTotal
      })
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
      throw err
    }
  }

  // Obtener conversaciones para un lead específico
  const obtenerConversaciones = async (lead) => {
    try {
      const { data, error } = await clienteSupabase
        .from('chats_de_la_web')
        .select('*')
        .eq('session_id', lead.chat_id)
        .order('id', { ascending: true })

      if (error) throw error

      // Procesar mensajes JSONB
      const conversacionesProcesadas = (data || []).map(conv => {
        let mensaje = ''
        let tipo = 'usuario'
        
        if (conv.message && typeof conv.message === 'object') {
          if (conv.message.content) {
            mensaje = conv.message.content
            tipo = conv.message.type === 'ai' ? 'bot' : 'usuario'
          } else if (conv.message.texto) {
            mensaje = conv.message.texto
            tipo = conv.message.tipo || 'usuario'
          } else {
            mensaje = JSON.stringify(conv.message)
            tipo = 'sistema'
          }
        } else {
          mensaje = conv.message || 'Mensaje vacío'
        }

        return {
          id: conv.id,
          mensaje,
          tipo_mensaje: tipo,
          timestamp: conv.created_at || new Date().toISOString()
        }
      })

      return conversacionesProcesadas
    } catch (err) {
      console.error('Error obteniendo conversaciones:', err)
      return []
    }
  }

  // Filtrar leads según los criterios seleccionados
  const leadsFiltrados = leads.filter(lead => {
    // Filtro por estado
    if (filtroEstado !== 'todos' && lead.estado !== filtroEstado) return false
    
    // Filtro por conversión
    if (filtroConvertido === 'si' && !lead.converted) return false
    if (filtroConvertido === 'no' && lead.converted) return false
    
    // Filtro por tipo de consulta
    if (filtroTipoConsulta !== 'todos' && lead.tipo_consulta !== filtroTipoConsulta) return false
    
    // Filtro por búsqueda
    if (busqueda) {
      const textoBusqueda = `${lead.nombre || ''} ${lead.apellido || ''} ${lead.email || ''} ${lead.whatsapp || ''} ${lead.contexto_inicial || ''}`.toLowerCase()
      if (!textoBusqueda.includes(busqueda.toLowerCase())) return false
    }
    
    return true
  })

  // Ordenar leads
  const leadsOrdenados = [...leadsFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case 'fecha_desc':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'fecha_asc':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'nombre':
        return (a.nombre || '').localeCompare(b.nombre || '')
      case 'interes_desc':
        return (b.nivel_interes || 5) - (a.nivel_interes || 5)
      case 'probabilidad_desc':
        return (b.probabilidad_compra || 50) - (a.probabilidad_compra || 50)
      default:
        return 0
    }
  })

  // Paginación
  const totalPaginas = Math.ceil(leadsOrdenados.length / leadsPerPage)
  const indiceInicio = (paginaActual - 1) * leadsPerPage
  const leadsEnPagina = leadsOrdenados.slice(indiceInicio, indiceInicio + leadsPerPage)

  // Funciones de utilidad
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearPrecio = (precio) => {
    if (!precio) return '$0'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  const obtenerColorEstado = (estado) => {
    const colores = {
      activo: 'estado-activo',
      inactivo: 'estado-inactivo',
      completado: 'estado-completado',
      cancelado: 'estado-cancelado'
    }
    return colores[estado] || 'estado-default'
  }

  const obtenerColorInteres = (nivel) => {
    if (nivel >= 8) return 'interes-alto'
    if (nivel >= 6) return 'interes-medio'
    if (nivel >= 4) return 'interes-bajo'
    return 'interes-muy-bajo'
  }

  // Funciones de acciones
  const verDetalle = (lead) => {
    setLeadSeleccionado(lead)
    setMostrarModal(true)
  }

  const verConversaciones = async (lead) => {
    setLeadSeleccionado(lead)
    const conversaciones = await obtenerConversaciones(lead)
    setConversacionesActuales(conversaciones)
    setMostrarConversaciones(true)
  }

  const cerrarModales = () => {
    setMostrarModal(false)
    setMostrarConversaciones(false)
    setLeadSeleccionado(null)
    setConversacionesActuales([])
  }

  const abrirWhatsApp = (whatsapp) => {
    if (!whatsapp) return
    const numeroLimpio = whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${numeroLimpio}`, '_blank')
  }

  if (cargando) {
    return (
      <div className="admin-chats">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos de chats y leads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-chats">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar los datos</h3>
          <p>{error}</p>
          <button onClick={cargarDatos} className="btn-reintentar">
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-chats">
      {/* Header con título y acciones */}
      <div className="header-admin">
        <div className="titulo-seccion">
          <h1>💬 Gestión de Chats y Leads</h1>
          <p>Administra todas las conversaciones y leads de tu sitio web</p>
        </div>
        <div className="acciones-header">
          <button onClick={cargarDatos} className="btn-actualizar" disabled={cargando}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{estadisticas.total || 0}</h3>
            <p>Total Leads</p>
          </div>
        </div>
        
        <div className="stat-card convertidos">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{estadisticas.convertidos || 0}</h3>
            <p>Convertidos</p>
          </div>
        </div>
        
        <div className="stat-card pendientes">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{estadisticas.pendientes || 0}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        
        <div className="stat-card conversion">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{estadisticas.tasaConversion || 0}%</h3>
            <p>Tasa Conversión</p>
          </div>
        </div>
        
        <div className="stat-card nuevos">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>{estadisticas.nuevosEsteMes || 0}</h3>
            <p>Nuevos este mes</p>
          </div>
        </div>
        
        <div className="stat-card valor">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatearPrecio(estadisticas.valorTotal)}</h3>
            <p>Valor Potencial</p>
          </div>
        </div>
      </div>

      {/* Panel de filtros y búsqueda */}
      <div className="filtros-panel">
        <div className="busqueda-container">
          <div className="input-group">
            <span className="input-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, email, WhatsApp o contexto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="campo-busqueda"
            />
          </div>
        </div>
        
        <div className="filtros-container">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">📋 Todos los estados</option>
            <option value="activo">🟢 Activo</option>
            <option value="inactivo">🔴 Inactivo</option>
            <option value="completado">✅ Completado</option>
            <option value="cancelado">❌ Cancelado</option>
          </select>
          
          <select
            value={filtroConvertido}
            onChange={(e) => setFiltroConvertido(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">🔄 Todos</option>
            <option value="si">✅ Convertidos</option>
            <option value="no">⏳ No convertidos</option>
          </select>
          
          <select
            value={filtroTipoConsulta}
            onChange={(e) => setFiltroTipoConsulta(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">💬 Todos los tipos</option>
            <option value="general">💬 General</option>
            <option value="ventas">💰 Ventas</option>
            <option value="soporte">🛠️ Soporte</option>
            <option value="tecnico">⚙️ Técnico</option>
            <option value="pagos">💳 Pagos</option>
          </select>
          
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="filtro-select"
          >
            <option value="fecha_desc">📅 Más recientes</option>
            <option value="fecha_asc">📅 Más antiguos</option>
            <option value="nombre">👤 Por nombre</option>
            <option value="interes_desc">❤️ Mayor interés</option>
            <option value="probabilidad_desc">📈 Mayor probabilidad</option>
          </select>
        </div>
      </div>

      {/* Grid de leads */}
      {leadsEnPagina.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay leads que mostrar</h3>
          <p>No se encontraron resultados con los filtros aplicados</p>
        </div>
      ) : (
        <>
          <div className="leads-grid">
            {leadsEnPagina.map(lead => (
              <div key={lead.id} className="lead-card">
                <div className="lead-header">
                  <div className="lead-info">
                    <h3 className="lead-nombre">
                      {lead.nombre} {lead.apellido}
                    </h3>
                    <span className="lead-id">ID: {lead.chat_id}</span>
                  </div>
                  <div className="lead-badges">
                    <span className={`estado-badge ${obtenerColorEstado(lead.estado)}`}>
                      {lead.estado || 'activo'}
                    </span>
                    {lead.converted && (
                      <span className="convertido-badge">✅</span>
                    )}
                  </div>
                </div>
                
                <div className="lead-content">
                  <div className="contacto-info">
                    {lead.email && (
                      <div className="contacto-item">
                        <span className="contacto-icon">📧</span>
                        <span className="contacto-texto">{lead.email}</span>
                      </div>
                    )}
                    {lead.whatsapp && (
                      <div className="contacto-item">
                        <span className="contacto-icon">📱</span>
                        <span className="contacto-texto">{lead.whatsapp}</span>
                      </div>
                    )}
                    {lead.ubicacion_usuario && (
                      <div className="contacto-item">
                        <span className="contacto-icon">📍</span>
                        <span className="contacto-texto">{lead.ubicacion_usuario}</span>
                      </div>
                    )}
                  </div>
                  
                  {lead.contexto_inicial && (
                    <div className="contexto-inicial">
                      <p>"{lead.contexto_inicial}"</p>
                    </div>
                  )}
                  
                  {lead.intereses_cliente && (
                    <div className="intereses-cliente">
                      <span className="intereses-label">🎯 Intereses:</span>
                      <div className="intereses-tags">
                        {lead.intereses_cliente.split(',').map((interes, index) => (
                          <span key={index} className="interes-tag">
                            {interes.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {lead.productos_consultados && lead.productos_consultados.length > 0 && (
                    <div className="productos-consultados">
                      <span className="productos-label">🛍️ Productos consultados:</span>
                      <div className="productos-tags">
                        {(Array.isArray(lead.productos_consultados) 
                          ? lead.productos_consultados 
                          : lead.productos_consultados.split(',')
                        ).map((producto, index) => (
                          <span key={index} className="producto-tag">
                            {typeof producto === 'string' ? producto.trim() : producto}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="metricas-lead">
                    <div className="metrica">
                      <span className="metrica-label">Interés:</span>
                      <span className={`metrica-valor ${obtenerColorInteres(lead.nivel_interes)}`}>
                        {lead.nivel_interes || 5}/10
                      </span>
                    </div>
                    <div className="metrica">
                      <span className="metrica-label">Probabilidad:</span>
                      <span className="metrica-valor">
                        {lead.probabilidad_compra || 50}%
                      </span>
                    </div>
                    {lead.valor_potencial && (
                      <div className="metrica">
                        <span className="metrica-label">Valor:</span>
                        <span className="metrica-valor">
                          {formatearPrecio(lead.valor_potencial)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="fecha-lead">
                    <span className="fecha-icon">⏰</span>
                    <span className="fecha-texto">
                      {formatearFecha(lead.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="lead-actions">
                  <button
                    onClick={() => verDetalle(lead)}
                    className="btn-action ver-detalle"
                    title="Ver detalle completo"
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => verConversaciones(lead)}
                    className="btn-action ver-chat"
                    title="Ver conversaciones"
                  >
                    💬 Chat
                  </button>
                  {lead.whatsapp && (
                    <button
                      onClick={() => abrirWhatsApp(lead.whatsapp)}
                      className="btn-action whatsapp"
                      title="Contactar por WhatsApp"
                    >
                      📱 WA
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="btn-pagina"
              >
                ⬅️ Anterior
              </button>
              
              <div className="info-pagina">
                <span>Página {paginaActual} de {totalPaginas}</span>
                <span className="total-resultados">
                  ({leadsOrdenados.length} resultados)
                </span>
              </div>
              
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="btn-pagina"
              >
                Siguiente ➡️
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      {mostrarModal && leadSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal-content modal-detalle" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Detalle Completo del Lead</h3>
              <button onClick={cerrarModales} className="btn-cerrar">❌</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-grid">
                {/* Información Básica del Lead */}
                <div className="detalle-seccion">
                  <h4>🆔 Información del Sistema</h4>
                  <div className="detalle-items">
                    <div className="detalle-item">
                      <strong>ID Lead:</strong>
                      <span>{leadSeleccionado.id}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Chat ID:</strong>
                      <span>{leadSeleccionado.chat_id}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Fuente:</strong>
                      <span className="source-badge">{leadSeleccionado.source || 'web'}</span>
                    </div>
                  </div>
                </div>

                {/* Información Personal */}
                <div className="detalle-seccion">
                  <h4>👤 Información Personal</h4>
                  <div className="detalle-items">
                    <div className="detalle-item">
                      <strong>Nombre Completo:</strong>
                      <span>{leadSeleccionado.nombre} {leadSeleccionado.apellido}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Email:</strong>
                      <span>{leadSeleccionado.email || 'No proporcionado'}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>WhatsApp:</strong>
                      <span>{leadSeleccionado.whatsapp || 'No proporcionado'}</span>
                    </div>
                  </div>
                </div>

                {/* Ubicación y Envío */}
                <div className="detalle-seccion">
                  <h4>📍 Ubicación y Envío</h4>
                  <div className="detalle-items">
                    <div className="detalle-item">
                      <strong>Ciudad:</strong>
                      <span>{leadSeleccionado.ciudad || 'No especificada'}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Dirección:</strong>
                      <span>{leadSeleccionado.direccion || 'No especificada'}</span>
                    </div>
                    {leadSeleccionado.datos_envio && (
                      <div className="detalle-item full-width">
                        <strong>Datos de Envío:</strong>
                        <div className="json-display">
                          {typeof leadSeleccionado.datos_envio === 'object' 
                            ? JSON.stringify(leadSeleccionado.datos_envio, null, 2)
                            : leadSeleccionado.datos_envio
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Información Comercial */}
                <div className="detalle-seccion">
                  <h4>💰 Información Comercial</h4>
                  <div className="detalle-items">
                    <div className="detalle-item">
                      <strong>Tipo de consulta:</strong>
                      <span>{leadSeleccionado.tipo_consulta || 'General'}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Método de pago preferido:</strong>
                      <span>{leadSeleccionado.metodo_pago_preferido || 'No especificado'}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Precio máximo mencionado:</strong>
                      <span>{leadSeleccionado.precio_maximo_mencionado ? formatearPrecio(leadSeleccionado.precio_maximo_mencionado) : 'No especificado'}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Urgencia de compra:</strong>
                      <span>{leadSeleccionado.urgencia_compra || 'No especificada'}</span>
                    </div>
                  </div>
                </div>

                {/* Estado y Conversión */}
                <div className="detalle-seccion">
                  <h4>📊 Estado y Conversión</h4>
                  <div className="detalle-items">
                    <div className="detalle-item">
                      <strong>Estado:</strong>
                      <span className={`estado-badge ${obtenerColorEstado(leadSeleccionado.estado)}`}>
                        {leadSeleccionado.estado || 'activo'}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <strong>Convertido:</strong>
                      <span className={leadSeleccionado.converted ? 'convertido-si' : 'convertido-no'}>
                        {leadSeleccionado.converted ? '✅ Sí' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Métricas y Análisis */}
                <div className="detalle-seccion">
                  <h4>📈 Métricas y Análisis</h4>
                  <div className="detalle-items">
                    <div className="detalle-item">
                      <strong>Nivel de interés:</strong>
                      <span className={`metrica-valor ${obtenerColorInteres(leadSeleccionado.nivel_interes)}`}>
                        {leadSeleccionado.nivel_interes || 5}/10
                      </span>
                    </div>
                    <div className="detalle-item">
                      <strong>Probabilidad de compra:</strong>
                      <span>{leadSeleccionado.probabilidad_compra || 50}%</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Valor potencial:</strong>
                      <span>{formatearPrecio(leadSeleccionado.valor_potencial)}</span>
                    </div>
                  </div>
                </div>

                {/* Análisis Psicológico */}
                {(leadSeleccionado.principales_objeciones || leadSeleccionado.miedos_cliente || leadSeleccionado.tecnicas_persuasion) && (
                  <div className="detalle-seccion full-width">
                    <h4>🧠 Análisis Psicológico</h4>
                    <div className="detalle-items">
                      {leadSeleccionado.principales_objeciones && (
                        <div className="detalle-item full-width">
                          <strong>Principales Objeciones:</strong>
                          <div className="texto-largo">{leadSeleccionado.principales_objeciones}</div>
                        </div>
                      )}
                      {leadSeleccionado.miedos_cliente && (
                        <div className="detalle-item full-width">
                          <strong>Miedos del Cliente:</strong>
                          <div className="texto-largo">{leadSeleccionado.miedos_cliente}</div>
                        </div>
                      )}
                      {leadSeleccionado.tecnicas_persuasion && (
                        <div className="detalle-item full-width">
                          <strong>Técnicas de Persuasión:</strong>
                          <div className="texto-largo">{leadSeleccionado.tecnicas_persuasion}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Contexto Inicial */}
                {leadSeleccionado.contexto_inicial && (
                  <div className="detalle-seccion full-width">
                    <h4>💭 Contexto Inicial</h4>
                    <div className="contexto-box">
                      {leadSeleccionado.contexto_inicial}
                    </div>
                  </div>
                )}
                
                {/* Productos Consultados */}
                {leadSeleccionado.productos_consultados && leadSeleccionado.productos_consultados.length > 0 && (
                  <div className="detalle-seccion full-width">
                    <h4>🛍️ Productos Consultados</h4>
                    <div className="productos-consultados">
                      {leadSeleccionado.productos_consultados.map((producto, index) => (
                        <div key={index} className="producto-item">
                          <span>{producto}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas Adicionales */}
                {leadSeleccionado.notas_adicionales && (
                  <div className="detalle-seccion full-width">
                    <h4>📝 Notas Adicionales</h4>
                    <div className="notas-box">
                      {leadSeleccionado.notas_adicionales}
                    </div>
                  </div>
                )}
                
                {/* Fechas Importantes */}
                <div className="detalle-seccion">
                  <h4>📅 Fechas Importantes</h4>
                  <div className="detalle-items">
                    <div className="detalle-item">
                      <strong>Creado:</strong>
                      <span>{formatearFecha(leadSeleccionado.created_at)}</span>
                    </div>
                    <div className="detalle-item">
                      <strong>Última actualización:</strong>
                      <span>{formatearFecha(leadSeleccionado.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => verConversaciones(leadSeleccionado)}
                className="btn-modal conversaciones"
              >
                💬 Ver Conversaciones
              </button>
              {leadSeleccionado.whatsapp && (
                <button
                  onClick={() => abrirWhatsApp(leadSeleccionado.whatsapp)}
                  className="btn-modal whatsapp"
                >
                  📱 Contactar por WhatsApp
                </button>
              )}
              <button onClick={cerrarModales} className="btn-modal cerrar">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de conversaciones */}
      {mostrarConversaciones && leadSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal-content modal-conversaciones" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💬 Conversaciones - {leadSeleccionado.nombre} {leadSeleccionado.apellido}</h3>
              <button onClick={cerrarModales} className="btn-cerrar">❌</button>
            </div>
            
            <div className="modal-body">
              <div className="conversaciones-container">
                {conversacionesActuales.length === 0 ? (
                  <div className="no-conversaciones">
                    <div className="no-conv-icon">💬</div>
                    <p>No se encontraron conversaciones para este lead</p>
                  </div>
                ) : (
                  <div className="mensajes-lista">
                    {conversacionesActuales.map(mensaje => (
                      <div
                        key={mensaje.id}
                        className={`mensaje ${mensaje.tipo_mensaje === 'bot' ? 'mensaje-bot' : 'mensaje-usuario'}`}
                      >
                        <div className="mensaje-contenido">
                          {mensaje.mensaje}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={cerrarModales} className="btn-modal cerrar">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminChats