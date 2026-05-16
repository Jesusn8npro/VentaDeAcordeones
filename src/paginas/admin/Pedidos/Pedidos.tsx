import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../../configuracion/supabase'
import {
  Search, Download, AlertCircle, CheckCircle, XCircle, Clock,
  Truck, Eye, ChevronDown, X, Package
} from 'lucide-react'
import './PedidosTransacciones.css'
import '../../../componentes/admin/EstilosBotonesAdmin.css'

const FORMATO_MONEDA = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

function formatearPrecio(valor = 0) {
  try { return FORMATO_MONEDA.format(Number(valor || 0)) } catch { return `$${valor}` }
}

function formatearFecha(iso) {
  if (!iso) return '—'
  const f = new Date(iso)
  return f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatearFechaHora(iso) {
  if (!iso) return '—'
  const f = new Date(iso)
  const hora = f.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  return `${f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} · ${hora}`
}

const ESTADOS_CONFIG = {
  pendiente:   { etiqueta: 'Pendiente',   clase: 'badge-pendiente',   icono: Clock,        color: 'advertencia' },
  en_proceso:  { etiqueta: 'En proceso',  clase: 'badge-pendiente',   icono: Clock,        color: 'advertencia' },
  enviado:     { etiqueta: 'Enviado',     clase: 'badge-enviado',     icono: Truck,        color: 'info' },
  entregado:   { etiqueta: 'Entregado',   clase: 'badge-entregado',   icono: CheckCircle,  color: 'exito' },
  cancelado:   { etiqueta: 'Cancelado',   clase: 'badge-cancelado',   icono: XCircle,      color: 'error' },
}

const FILTROS_RAPIDOS = [
  { valor: 'todos',     etiqueta: 'Todos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'enviado',   etiqueta: 'Enviados' },
  { valor: 'entregado', etiqueta: 'Entregados' },
  { valor: 'cancelado', etiqueta: 'Cancelados' },
]

const ESTADOS_OPCIONES = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado']

export default function Pedidos() {
  const navigate = useNavigate()
  const { sesionInicializada, usuario, esAdmin } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [pedidos, setPedidos] = useState([])

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Bulk ops
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [estadoBulk, setEstadoBulk] = useState('enviado')
  const [aplicandoBulk, setAplicandoBulk] = useState(false)

  // Modal detalle
  const [pedidoDetalle, setPedidoDetalle] = useState(null)

  // Modal cambio de estado individual
  const [modalEstado, setModalEstado] = useState<{ pedido: any; abierto: boolean }>({ pedido: null, abierto: false })
  const [nuevoEstado, setNuevoEstado] = useState('')

  useEffect(() => { cargarPedidos() }, [])

  async function cargarPedidos() {
    setCargando(true)
    setError(null)
    try {
      const esUsuarioAdmin = typeof esAdmin === 'function' ? esAdmin() : false
      let consulta = clienteSupabase
        .from('pedidos')
        .select(esUsuarioAdmin
          ? 'id, numero_pedido, creado_el, estado, total, metodo_pago, nombre_cliente, email_cliente, telefono_cliente, referencia_pago, direccion_envio, productos'
          : 'id, numero_pedido, creado_el, estado, total, metodo_pago, nombre_cliente, email_cliente, telefono_cliente, referencia_pago, direccion_envio, usuarios(nombre, email), productos'
        )
      if (!esUsuarioAdmin && usuario?.id) {
        consulta = consulta.eq('usuario_id', usuario.id)
      }
      const { data, error } = await consulta.order('creado_el', { ascending: false }).limit(200)
      if (error) throw error
      setPedidos(data || [])
      setSeleccionados([])
    } catch (e) {
      setError(e?.message ? `Error al cargar los pedidos: ${e.message}` : 'Error al cargar los pedidos')
    } finally {
      setCargando(false)
    }
  }

  const pedidosFiltrados = useMemo(() => {
    let lista = [...pedidos]
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(p => (
        (p.numero_pedido || '').toLowerCase().includes(q) ||
        (p.usuarios?.nombre || p.nombre_cliente || '').toLowerCase().includes(q) ||
        (p.usuarios?.email || p.email_cliente || '').toLowerCase().includes(q)
      ))
    }
    if (filtroEstado !== 'todos') {
      lista = lista.filter(p => p.estado === filtroEstado)
    }
    if (fechaDesde) {
      lista = lista.filter(p => p.creado_el && new Date(p.creado_el) >= new Date(fechaDesde))
    }
    if (fechaHasta) {
      lista = lista.filter(p => p.creado_el && new Date(p.creado_el) <= new Date(fechaHasta + 'T23:59:59'))
    }
    return lista
  }, [pedidos, busqueda, filtroEstado, fechaDesde, fechaHasta])

  // Stats
  const stats = useMemo(() => {
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const pendientes  = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_proceso').length
    const enviados    = pedidos.filter(p => p.estado === 'enviado').length
    const entregados  = pedidos.filter(p => p.estado === 'entregado').length
    const totalMes    = pedidos.filter(p => p.creado_el && new Date(p.creado_el) >= inicioMes)
                               .reduce((a, p) => a + (Number(p.total) || 0), 0)
    return { pendientes, enviados, entregados, totalMes }
  }, [pedidos])

  // Bulk helpers
  const todosSeleccionados = pedidosFiltrados.length > 0 && seleccionados.length === pedidosFiltrados.length
  const toggleTodos = () => setSeleccionados(todosSeleccionados ? [] : pedidosFiltrados.map(p => p.id))
  const toggleUno = (id: string) => setSeleccionados(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

  async function aplicarCambioEstadoBulk() {
    if (!seleccionados.length || !estadoBulk) return
    const label = ESTADOS_CONFIG[estadoBulk]?.etiqueta || estadoBulk
    if (!confirm(`¿Cambiar ${seleccionados.length} pedido(s) al estado "${label}"?`)) return
    setAplicandoBulk(true)
    try {
      const { error } = await clienteSupabase
        .from('pedidos')
        .update({ estado: estadoBulk })
        .in('id', seleccionados)
      if (error) throw error
      await cargarPedidos()
    } catch {
      alert('Error al actualizar los pedidos')
    } finally {
      setAplicandoBulk(false)
    }
  }

  async function guardarCambioEstado() {
    if (!modalEstado.pedido || !nuevoEstado) return
    try {
      const { error } = await clienteSupabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', modalEstado.pedido.id)
      if (error) throw error
      setPedidos(prev => prev.map(p => p.id === modalEstado.pedido.id ? { ...p, estado: nuevoEstado } : p))
      setModalEstado({ pedido: null, abierto: false })
    } catch {
      alert('Error al cambiar el estado')
    }
  }

  function exportarCSV() {
    const enc = ['#Pedido', 'Cliente', 'Email', 'Total COP', 'Estado', 'Fecha']
    const filas = pedidosFiltrados.map(p => [
      p.numero_pedido || p.id,
      p.usuarios?.nombre || p.nombre_cliente || '—',
      p.usuarios?.email || p.email_cliente || '—',
      Number(p.total || 0),
      p.estado || 'pendiente',
      p.creado_el ? new Date(p.creado_el).toISOString() : '',
    ])
    const csv = [enc.join(','), ...filas.map(f => f.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `pedidos_${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="ped-contenedor">
      {/* Header */}
      <div className="ped-header">
        <div>
          <h1 className="ped-titulo">Pedidos <span className="ped-total-badge">{pedidos.length}</span></h1>
          <p className="ped-subtitulo">Gestión y seguimiento de órdenes</p>
        </div>
        <div className="ped-header-acciones">
          <button className="ped-btn-sec" onClick={cargarPedidos}>Refrescar</button>
          <button className="ped-btn-sec" onClick={exportarCSV}><Download size={15} /> Exportar CSV</button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="ped-stats">
        <div className="ped-stat">
          <span className="ped-stat-num ped-stat-warn">{stats.pendientes}</span>
          <span className="ped-stat-lbl">pendientes</span>
        </div>
        <span className="ped-stat-sep">·</span>
        <div className="ped-stat">
          <span className="ped-stat-num ped-stat-info">{stats.enviados}</span>
          <span className="ped-stat-lbl">enviados</span>
        </div>
        <span className="ped-stat-sep">·</span>
        <div className="ped-stat">
          <span className="ped-stat-num ped-stat-ok">{stats.entregados}</span>
          <span className="ped-stat-lbl">entregados</span>
        </div>
        <span className="ped-stat-sep">·</span>
        <div className="ped-stat">
          <span className="ped-stat-num">{formatearPrecio(stats.totalMes)}</span>
          <span className="ped-stat-lbl">este mes</span>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="ped-filtros-rapidos">
        {FILTROS_RAPIDOS.map(f => (
          <button
            key={f.valor}
            className={`ped-filtro-btn${filtroEstado === f.valor ? ' activo' : ''}`}
            onClick={() => setFiltroEstado(f.valor)}
          >{f.etiqueta}</button>
        ))}
      </div>

      {/* Barra de búsqueda + fechas */}
      <div className="ped-toolbar">
        <div className="ped-buscador">
          <Search size={15} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por #pedido, email o cliente..."
          />
          {busqueda && <button className="ped-clear" onClick={() => setBusqueda('')}><X size={13} /></button>}
        </div>
        <div className="ped-fechas">
          <label>Desde</label>
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
          <label>Hasta</label>
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
          {(fechaDesde || fechaHasta) && (
            <button className="ped-clear" onClick={() => { setFechaDesde(''); setFechaHasta('') }}><X size={13} /></button>
          )}
        </div>
      </div>

      {!sesionInicializada && (
        <div className="ped-aviso">
          <AlertCircle size={16} />
          <span>No has iniciado sesión. <button className="ped-link" onClick={() => navigate('/login')}>Ir a Login</button></span>
        </div>
      )}

      {error && (
        <div className="ped-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="ped-btn-sec" onClick={cargarPedidos}>Reintentar</button>
        </div>
      )}

      {/* Tabla */}
      <div className="ped-tabla-wrap">
        {cargando ? (
          <div className="ped-cargando"><div className="ped-spinner" /> Cargando pedidos...</div>
        ) : (
          <table className="ped-tabla">
            <thead>
              <tr>
                <th><input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} /></th>
                <th>#Pedido</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Total COP</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr><td colSpan={8} className="ped-vacio">Sin pedidos que coincidan con los filtros</td></tr>
              ) : pedidosFiltrados.map(p => {
                const ui = ESTADOS_CONFIG[p.estado] || ESTADOS_CONFIG.pendiente
                const Icono = ui.icono
                const nombre = p.usuarios?.nombre || p.nombre_cliente || '—'
                const email = p.usuarios?.email || p.email_cliente || '—'
                const selec = seleccionados.includes(p.id)
                return (
                  <tr key={p.id} className={`ped-fila${selec ? ' seleccionada' : ''}`}>
                    <td><input type="checkbox" checked={selec} onChange={() => toggleUno(p.id)} /></td>
                    <td className="ped-num">TXN-{p.numero_pedido || String(p.id).slice(0, 8)}</td>
                    <td className="ped-cliente">{nombre}</td>
                    <td className="ped-email">{email}</td>
                    <td className="ped-monto">{formatearPrecio(Number(p.total) || 0)}</td>
                    <td>
                      <span className={`ped-badge ${ui.clase}`}>
                        <Icono size={12} /> {ui.etiqueta}
                      </span>
                    </td>
                    <td className="ped-fecha">{formatearFecha(p.creado_el)}</td>
                    <td className="ped-acciones-col">
                      <button className="ped-accion-btn" title="Ver detalle" onClick={() => setPedidoDetalle(p)}>
                        <Eye size={14} />
                      </button>
                      <button className="ped-accion-btn" title="Cambiar estado"
                        onClick={() => { setModalEstado({ pedido: p, abierto: true }); setNuevoEstado(p.estado || 'pendiente') }}>
                        <ChevronDown size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <div className="ped-footer">
          <span>{pedidosFiltrados.length} de {pedidos.length} pedidos</span>
        </div>
      </div>

      {/* Barra bulk flotante */}
      {seleccionados.length > 0 && (
        <div className="barra-acciones-bulk">
          <span className="bulk-info">{seleccionados.length} seleccionado(s)</span>
          <select value={estadoBulk} onChange={e => setEstadoBulk(e.target.value)} className="bulk-select">
            {ESTADOS_OPCIONES.map(e => (
              <option key={e} value={e}>{ESTADOS_CONFIG[e]?.etiqueta || e}</option>
            ))}
          </select>
          <button className="bulk-btn-aplicar" onClick={aplicarCambioEstadoBulk} disabled={aplicandoBulk}>
            {aplicandoBulk ? 'Aplicando...' : 'Cambiar estado'}
          </button>
          <button className="bulk-btn-cancel" onClick={() => setSeleccionados([])}><X size={14} /></button>
        </div>
      )}

      {/* Modal detalle */}
      {pedidoDetalle && (
        <div className="ped-modal-overlay" onClick={() => setPedidoDetalle(null)}>
          <div className="ped-modal" onClick={e => e.stopPropagation()}>
            <div className="ped-modal-header">
              <h2>Detalle del pedido</h2>
              <button className="ped-modal-cerrar" onClick={() => setPedidoDetalle(null)}><X size={18} /></button>
            </div>
            <div className="ped-modal-body">
              <div className="ped-det-fila">
                <span className="ped-det-lbl">#Pedido</span>
                <span className="ped-det-val">TXN-{pedidoDetalle.numero_pedido || String(pedidoDetalle.id).slice(0, 8)}</span>
              </div>
              <div className="ped-det-fila">
                <span className="ped-det-lbl">Cliente</span>
                <span className="ped-det-val">{pedidoDetalle.usuarios?.nombre || pedidoDetalle.nombre_cliente || '—'}</span>
              </div>
              <div className="ped-det-fila">
                <span className="ped-det-lbl">Email</span>
                <span className="ped-det-val">{pedidoDetalle.usuarios?.email || pedidoDetalle.email_cliente || '—'}</span>
              </div>
              <div className="ped-det-fila">
                <span className="ped-det-lbl">Teléfono</span>
                <span className="ped-det-val">
                  {typeof pedidoDetalle.telefono_cliente === 'object'
                    ? pedidoDetalle.telefono_cliente?.telefono || '—'
                    : pedidoDetalle.telefono_cliente || '—'}
                </span>
              </div>
              <div className="ped-det-fila">
                <span className="ped-det-lbl">Total</span>
                <span className="ped-det-val ped-det-total">{formatearPrecio(Number(pedidoDetalle.total) || 0)}</span>
              </div>
              <div className="ped-det-fila">
                <span className="ped-det-lbl">Estado</span>
                <span className={`ped-badge ${(ESTADOS_CONFIG[pedidoDetalle.estado] || ESTADOS_CONFIG.pendiente).clase}`}>
                  {(ESTADOS_CONFIG[pedidoDetalle.estado] || ESTADOS_CONFIG.pendiente).etiqueta}
                </span>
              </div>
              <div className="ped-det-fila">
                <span className="ped-det-lbl">Fecha</span>
                <span className="ped-det-val">{formatearFechaHora(pedidoDetalle.creado_el)}</span>
              </div>
              <div className="ped-det-fila">
                <span className="ped-det-lbl">Método de pago</span>
                <span className="ped-det-val">{pedidoDetalle.metodo_pago || '—'}</span>
              </div>
              {pedidoDetalle.direccion_envio && (
                <div className="ped-det-fila">
                  <span className="ped-det-lbl">Dirección</span>
                  <span className="ped-det-val">{typeof pedidoDetalle.direccion_envio === 'object'
                    ? JSON.stringify(pedidoDetalle.direccion_envio)
                    : pedidoDetalle.direccion_envio}</span>
                </div>
              )}
              {Array.isArray(pedidoDetalle.productos) && pedidoDetalle.productos.length > 0 && (
                <div className="ped-det-productos">
                  <h3>Productos</h3>
                  {pedidoDetalle.productos.map((prod, i) => (
                    <div key={i} className="ped-det-prod-item">
                      <Package size={14} />
                      <span className="ped-det-prod-nombre">{prod.nombre || prod.name || '—'}</span>
                      {prod.cantidad && <span className="ped-det-prod-qty">x{prod.cantidad}</span>}
                      {prod.precio && <span className="ped-det-prod-precio">{formatearPrecio(prod.precio)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal cambio de estado individual */}
      {modalEstado.abierto && modalEstado.pedido && (
        <div className="ped-modal-overlay" onClick={() => setModalEstado({ pedido: null, abierto: false })}>
          <div className="ped-modal ped-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="ped-modal-header">
              <h2>Cambiar estado</h2>
              <button className="ped-modal-cerrar" onClick={() => setModalEstado({ pedido: null, abierto: false })}><X size={18} /></button>
            </div>
            <div className="ped-modal-body">
              <p className="ped-det-lbl">Pedido: <strong>TXN-{modalEstado.pedido.numero_pedido || String(modalEstado.pedido.id).slice(0, 8)}</strong></p>
              <select className="ped-select-estado" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                {ESTADOS_OPCIONES.map(e => (
                  <option key={e} value={e}>{ESTADOS_CONFIG[e]?.etiqueta || e}</option>
                ))}
              </select>
              <div className="ped-modal-acciones">
                <button className="ped-btn-sec" onClick={() => setModalEstado({ pedido: null, abierto: false })}>Cancelar</button>
                <button className="ped-btn-prim" onClick={guardarCambioEstado}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
