import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import ModalDetalleChat from './ModalDetalleChat'
import ModalConversaciones from './ModalConversaciones'
import EstadisticasChats from './EstadisticasChats'
import GridLeads from './GridLeads'
import './AdminChats.css'

const AdminChats = () => {
  const [leads, setLeads] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroConvertido, setFiltroConvertido] = useState('todos')
  const [filtroTipoConsulta, setFiltroTipoConsulta] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('fecha_desc')
  const [leadSeleccionado, setLeadSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarConversaciones, setMostrarConversaciones] = useState(false)
  const [conversacionesActuales, setConversacionesActuales] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [leadsPerPage] = useState(12)
  const [tabActiva, setTabActiva] = useState<'conversaciones' | 'agente'>('conversaciones')
  const [configAgente, setConfigAgente] = useState({ nombre: 'Melodía', tono: 'calido_motivador', prompt_adicional: '', activo: true })
  const [guardandoConfig, setGuardandoConfig] = useState(false)
  const [configCargada, setConfigCargada] = useState(false)

  useEffect(() => {
    cargarDatos()
    cargarConfigAgente()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    setError(null)
    try {
      await Promise.all([cargarLeads(), cargarEstadisticas()])
    } catch {
      setError('Error al cargar los datos. Por favor, intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const cargarConfigAgente = async () => {
    const { data } = await clienteSupabase.from('agente_chat_config').select('*').limit(1).single()
    if (data) { setConfigAgente(data); setConfigCargada(true) }
  }

  const guardarConfigAgente = async () => {
    setGuardandoConfig(true)
    try {
      await clienteSupabase.from('agente_chat_config')
        .update({ nombre: configAgente.nombre, tono: configAgente.tono, prompt_adicional: configAgente.prompt_adicional, activo: configAgente.activo, updated_at: new Date().toISOString() })
        .eq('id', (configAgente as any).id)
      alert('Configuración guardada correctamente')
    } catch { alert('Error al guardar') } finally { setGuardandoConfig(false) }
  }

  const cargarLeads = async () => {
    const { data, error } = await clienteSupabase
      .from('leadschat')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    setLeads(data || [])
  }

  const cargarEstadisticas = async () => {
    const { data: leadsData, error } = await clienteSupabase
      .from('leadschat')
      .select('converted, created_at, nivel_interes, probabilidad_compra, valor_potencial')

    if (error) throw error

    const total = leadsData?.length || 0
    const convertidos = leadsData?.filter(l => l.converted)?.length || 0
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const nuevosEsteMes = leadsData?.filter(l => new Date(l.created_at) >= inicioMes)?.length || 0

    const promedioInteres = total > 0
      ? Math.round(leadsData.reduce((sum, l) => sum + (l.nivel_interes || 5), 0) / total)
      : 5

    const promedioCompra = total > 0
      ? Math.round(leadsData.reduce((sum, l) => sum + (l.probabilidad_compra || 50), 0) / total)
      : 50

    const valorTotal = leadsData?.reduce((sum, l) => sum + (parseFloat(l.valor_potencial) || 0), 0) || 0

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
  }

  const obtenerConversaciones = async (lead) => {
    // Usamos función SQL que extrae role y content directamente con ->>
    const { data, error } = await clienteSupabase
      .rpc('get_chat_mensajes', { p_session_id: lead.chat_id })

    if (error || !data) return []

    return (data as any[]).map((row) => ({
      id:          row.id,
      mensaje:     row.contenido,
      tipo_mensaje: row.rol === 'assistant' ? 'bot' : 'usuario',
      timestamp:   row.creado_en
    }))
  }

  const leadsFiltrados = leads.filter(lead => {
    if (filtroEstado !== 'todos' && lead.estado !== filtroEstado) return false
    if (filtroConvertido === 'si' && !lead.converted) return false
    if (filtroConvertido === 'no' && lead.converted) return false
    if (filtroTipoConsulta !== 'todos' && lead.tipo_consulta !== filtroTipoConsulta) return false
    if (busqueda) {
      const texto = `${lead.nombre || ''} ${lead.apellido || ''} ${lead.email || ''} ${lead.whatsapp || ''} ${lead.contexto_inicial || ''}`.toLowerCase()
      if (!texto.includes(busqueda.toLowerCase())) return false
    }
    return true
  })

  const leadsOrdenados = [...leadsFiltrados].sort((a, b) => {
    switch (ordenarPor) {
      case 'fecha_desc':       return new Date(b.created_at) - new Date(a.created_at)
      case 'fecha_asc':        return new Date(a.created_at) - new Date(b.created_at)
      case 'nombre':           return (a.nombre || '').localeCompare(b.nombre || '')
      case 'interes_desc':     return (b.nivel_interes || 5) - (a.nivel_interes || 5)
      case 'probabilidad_desc':return (b.probabilidad_compra || 50) - (a.probabilidad_compra || 50)
      default:                 return 0
    }
  })

  const totalPaginas = Math.ceil(leadsOrdenados.length / leadsPerPage)
  const indiceInicio = (paginaActual - 1) * leadsPerPage
  const leadsEnPagina = leadsOrdenados.slice(indiceInicio, indiceInicio + leadsPerPage)

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatearPrecio = (precio) => {
    if (!precio) return '$0'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
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
          <div className="error-icon">⚠</div>
          <h3>Error al cargar los datos</h3>
          <p>{error}</p>
          <button onClick={cargarDatos} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-chats">
      <div className="header-admin">
        <div className="titulo-seccion">
          <h1>Chats y Leads ({leads.length})</h1>
          <p>Administra todas las conversaciones y leads del sitio web</p>
        </div>
        <div className="acciones-header">
          <button onClick={cargarDatos} className="btn-actualizar" disabled={cargando}>
            Actualizar
          </button>
        </div>
      </div>

      <div className="admin-chats-tabs">
        <button className={`tab-btn ${tabActiva === 'conversaciones' ? 'activa' : ''}`} onClick={() => setTabActiva('conversaciones')}>Conversaciones y Leads</button>
        <button className={`tab-btn ${tabActiva === 'agente' ? 'activa' : ''}`} onClick={() => setTabActiva('agente')}>Agente IA</button>
      </div>

      {tabActiva === 'conversaciones' && (
        <>
          <EstadisticasChats estadisticas={estadisticas} formatearPrecio={formatearPrecio} />

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
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>

              <select
                value={filtroConvertido}
                onChange={(e) => setFiltroConvertido(e.target.value)}
                className="filtro-select"
              >
                <option value="todos">Todos</option>
                <option value="si">Convertidos</option>
                <option value="no">No convertidos</option>
              </select>

              <select
                value={filtroTipoConsulta}
                onChange={(e) => setFiltroTipoConsulta(e.target.value)}
                className="filtro-select"
              >
                <option value="todos">Todos los tipos</option>
                <option value="general">General</option>
                <option value="ventas">Ventas</option>
                <option value="soporte">Soporte</option>
                <option value="tecnico">Técnico</option>
                <option value="pagos">Pagos</option>
              </select>

              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="filtro-select"
              >
                <option value="fecha_desc">Más recientes</option>
                <option value="fecha_asc">Más antiguos</option>
                <option value="nombre">Por nombre</option>
                <option value="interes_desc">Mayor interés</option>
                <option value="probabilidad_desc">Mayor probabilidad</option>
              </select>
            </div>
          </div>

          <GridLeads
            leadsEnPagina={leadsEnPagina}
            totalPaginas={totalPaginas}
            paginaActual={paginaActual}
            totalResultados={leadsOrdenados.length}
            obtenerColorEstado={obtenerColorEstado}
            obtenerColorInteres={obtenerColorInteres}
            formatearFecha={formatearFecha}
            formatearPrecio={formatearPrecio}
            onVerDetalle={verDetalle}
            onVerConversaciones={verConversaciones}
            onAbrirWhatsApp={abrirWhatsApp}
            onCambiarPagina={setPaginaActual}
          />

          {mostrarModal && leadSeleccionado && (
            <ModalDetalleChat
              lead={leadSeleccionado}
              formatearFecha={formatearFecha}
              formatearPrecio={formatearPrecio}
              obtenerColorEstado={obtenerColorEstado}
              obtenerColorInteres={obtenerColorInteres}
              onVerConversaciones={verConversaciones}
              onAbrirWhatsApp={abrirWhatsApp}
              onCerrar={cerrarModales}
            />
          )}

          {mostrarConversaciones && leadSeleccionado && (
            <ModalConversaciones
              lead={leadSeleccionado}
              conversaciones={conversacionesActuales}
              onCerrar={cerrarModales}
            />
          )}
        </>
      )}

      {tabActiva === 'agente' && (
        <div className="config-agente-panel">
          <div className="config-agente-header">
            <h2>Configuración del Agente IA</h2>
            <p>Personaliza cómo se comporta Melodía con tus clientes</p>
          </div>
          <div className="config-agente-form">
            <div className="form-grupo">
              <label>Nombre del agente</label>
              <input type="text" value={configAgente.nombre} onChange={e => setConfigAgente(p => ({...p, nombre: e.target.value}))} className="form-input" placeholder="Ej: Melodía" />
            </div>
            <div className="form-grupo">
              <label>Tono de comunicación</label>
              <div className="tono-opciones">
                {[
                  { id: 'calido_motivador', label: 'Cálido y motivador', emoji: '🤝' },
                  { id: 'profesional_formal', label: 'Profesional y formal', emoji: '💼' },
                  { id: 'jovial_energico', label: 'Jovial y enérgico', emoji: '🎵' },
                  { id: 'experto_tecnico', label: 'Experto técnico', emoji: '🎼' }
                ].map(t => (
                  <button key={t.id} className={`tono-btn ${configAgente.tono === t.id ? 'seleccionado' : ''}`} onClick={() => setConfigAgente(p => ({...p, tono: t.id}))}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-grupo">
              <label>Instrucciones del agente</label>
              <p className="form-ayuda">Define cómo debe comportarse, qué preguntar, qué enfatizar, cómo manejar objeciones.</p>
              <textarea
                value={configAgente.prompt_adicional}
                onChange={e => setConfigAgente(p => ({...p, prompt_adicional: e.target.value}))}
                className="form-textarea"
                rows={14}
                placeholder="Escribe las instrucciones personalizadas del agente..."
              />
            </div>
            <div className="form-grupo form-grupo-inline">
              <label>Agente activo</label>
              <input type="checkbox" checked={configAgente.activo} onChange={e => setConfigAgente(p => ({...p, activo: e.target.checked}))} />
            </div>
            <button className="btn-guardar-config" onClick={guardarConfigAgente} disabled={guardandoConfig}>
              {guardandoConfig ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminChats
