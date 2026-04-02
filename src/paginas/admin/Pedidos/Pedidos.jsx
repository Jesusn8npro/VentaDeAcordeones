import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../../configuracion/supabase'
import { 
  Search,
  Filter,
  Download,
  AlertCircle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import './PedidosTransacciones.css'
import '../../../componentes/admin/EstilosBotonesAdmin.css'

// Página de Pedidos renovada estilo "Transacciones"
// Todo el código y textos en español, con datos reales desde Supabase

const FORMATO_MONEDA = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

function formatearPrecio(valor = 0) {
  try { return FORMATO_MONEDA.format(Number(valor || 0)) } catch { return `$${valor}` }
}

function formatearFecha(iso) {
  if (!iso) return '—'
  const f = new Date(iso)
  const opciones = { day: '2-digit', month: 'short', year: 'numeric' }
  const hora = f.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  return `${f.toLocaleDateString('es-CO', opciones)} · ${hora}`
}

const ESTADOS_UI = {
  pendiente: { etiqueta: 'Pendiente', clase: 'estado-pendiente', icono: Clock },
  en_proceso: { etiqueta: 'En proceso', clase: 'estado-pendiente', icono: Clock },
  enviado: { etiqueta: 'Enviado', clase: 'estado-pendiente', icono: Clock },
  entregado: { etiqueta: 'Completado', clase: 'estado-completado', icono: CheckCircle },
  cancelado: { etiqueta: 'Cancelado', clase: 'estado-cancelado', icono: XCircle }
}

export default function Pedidos() {
  const navigate = useNavigate()
  const { sesionInicializada, usuario, esAdmin } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [pedidos, setPedidos] = useState([])

  // Filtros UI
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos') // todos | pendiente | completado | cancelado
  const [ordenReciente, setOrdenReciente] = useState(true)

  // Métricas
  const [metricas, setMetricas] = useState({
    transaccionesMes: 0,
    ingresosTotales: 0,
    totalGastos: 0
  })

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {
    setCargando(true)
    setError(null)
    try {
      // Construir consulta según rol: admin ve todo; cliente solo sus pedidos
      const esUsuarioAdmin = typeof esAdmin === 'function' ? esAdmin() : false
      let consulta = clienteSupabase
        .from('pedidos')
        // Nota: evitar join con "usuarios" cuando es admin por RLS (solo permite ver su propio registro)
        .select(esUsuarioAdmin
          ? 'id, numero_pedido, creado_el, estado, total, metodo_pago, nombre_cliente, email_cliente, telefono_cliente, referencia_pago, direccion_envio, productos'
          : 'id, numero_pedido, creado_el, estado, total, metodo_pago, nombre_cliente, email_cliente, telefono_cliente, referencia_pago, direccion_envio, usuarios(nombre, email), productos'
        )

      const usuarioId = usuario?.id || null
      if (!esUsuarioAdmin && usuarioId) {
        consulta = consulta.eq('usuario_id', usuarioId)
      }

      const { data, error } = await consulta
        .order('creado_el', { ascending: false })
        .limit(200)

      if (error) throw error
      setPedidos(data || [])

      // Calcular métricas básicas
      const ahora = new Date()
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      const transaccionesMes = (data || []).filter(p => {
        const fecha = p?.creado_el || p?.created_at
        return fecha && new Date(fecha) >= inicioMes
      }).length
      const ingresosTotales = (data || []).reduce((acc, p) => acc + (Number(p.total) || 0), 0)
      const totalGastos = 0 // Placeholder: puedes ajustar con costos operativos reales
      setMetricas({ transaccionesMes, ingresosTotales, totalGastos })
    } catch (e) {
      console.error('Error cargando pedidos:', e)
      // Mostrar mensaje amigable pero útil
      setError(e?.message ? `Error al cargar los pedidos: ${e.message}` : 'Error al cargar los pedidos')
    } finally {
      setCargando(false)
    }
  }

  // Derivar lista filtrada/ordenada
  const pedidosFiltrados = useMemo(() => {
    let lista = [...pedidos]
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(p => (
        (p.numero_pedido || '').toLowerCase().includes(q) ||
        (p.usuarios?.nombre || p.nombre_cliente || '').toLowerCase().includes(q) ||
        (p.usuarios?.email || p.email_cliente || '').toLowerCase().includes(q) ||
        (p.metodo_pago || '').toLowerCase().includes(q)
      ))
    }
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'completado') {
        lista = lista.filter(p => (p.estado === 'entregado'))
      } else if (filtroEstado === 'pendiente') {
        lista = lista.filter(p => ['pendiente','en_proceso','enviado'].includes(p.estado))
      } else if (filtroEstado === 'cancelado') {
        lista = lista.filter(p => p.estado === 'cancelado')
      }
    }
    lista.sort((a,b) => {
      const ta = new Date(a.creado_el).getTime()
      const tb = new Date(b.creado_el).getTime()
      return ordenReciente ? (tb - ta) : (ta - tb)
    })
    return lista
  }, [pedidos, busqueda, filtroEstado, ordenReciente])

  function exportarCSV() {
    const encabezados = ['ID', 'Número', 'Cliente', 'Email', 'Método de pago', 'Total', 'Fecha', 'Estado']
    const filas = pedidosFiltrados.map(p => [
      p.id,
      p.numero_pedido || '',
      p.usuarios?.nombre || p.nombre_cliente || '—',
      p.usuarios?.email || p.email_cliente || '—',
      p.metodo_pago || '—',
      Number(p.total || 0),
      p.creado_el ? new Date(p.creado_el).toISOString() : '',
      p.estado || 'pendiente'
    ])
    const csv = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="transacciones-contenedor">
      {!sesionInicializada && (
        <div className="estado-aviso">
          <AlertCircle className="icono" />
          <div>
            <strong>No has iniciado sesión</strong>
            <div>Inicia sesión para ver la información real de pedidos según tus políticas RLS.</div>
          </div>
          <button className="btn-primario-trans" onClick={()=>navigate('/login')}>Ir a Login</button>
        </div>
      )}
      {/* Barra superior */}
      <div className="transacciones-header">
        <div>
          <h1 className="titulo-pagina">Transacciones</h1>
          <p className="subtitulo-pagina">Resumen y gestión de pedidos</p>
        </div>
        <div className="acciones-header">
          <button className="btn-secundario-trans" onClick={cargarPedidos}>Refrescar</button>
          <button className="btn-secundario-trans" onClick={exportarCSV}>
            <Download className="icono" /> Exportar
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="tarjetas-metricas">
        <div className="tarjeta-metrica">
          <div className="tarjeta-tit">Transacciones este mes</div>
          <div className="tarjeta-valor">{metricas.transaccionesMes}</div>
          <div className="tarjeta-sub">Comparado con el mes pasado</div>
        </div>
        <div className="tarjeta-metrica">
          <div className="tarjeta-tit">Ingresos totales</div>
          <div className="tarjeta-valor">{formatearPrecio(metricas.ingresosTotales)}</div>
          <div className="tarjeta-sub">Actualizado en tiempo real</div>
        </div>
        <div className="tarjeta-metrica">
          <div className="tarjeta-tit">Gastos totales</div>
          <div className="tarjeta-valor">{formatearPrecio(metricas.totalGastos)}</div>
          <div className="tarjeta-sub">Estimado</div>
        </div>
      </div>

      <div className="layout-grid">
        {/* Bloque principal: Tabla */}
        <section className="bloque-principal">
          <div className="bloque-card">
            <div className="bloque-card-header">
              <div className="titulo">Transacciones</div>
              <div className="herramientas">
                <div className="buscador">
                  <Search className="icono" />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar pedido, cliente o método..."
                  />
                </div>
                <div className="filtros">
                  <select value={filtroEstado} onChange={(e)=>setFiltroEstado(e.target.value)}>
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                  <button className="btn-orden-trans" onClick={()=>setOrdenReciente(v=>!v)}>
                    <Filter className="icono" /> {ordenReciente ? 'Más recientes' : 'Más antiguos'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="estado-error">
                <AlertCircle className="icono" />
                <div>
                  <h3>Error al cargar pedidos</h3>
                  <p>{error}</p>
                </div>
                <button className="btn-secundario-trans" onClick={cargarPedidos}>Reintentar</button>
              </div>
            )}

            {cargando ? (
              <div className="estado-cargando"><div className="spinner" /> Cargando pedidos...</div>
            ) : (
              <div className="tabla-contenedor">
                <table className="tabla-transacciones">
                  <thead>
                    <tr>
                      <th></th>
                      <th>ID Transacción</th>
                      <th>Cliente</th>
                      <th>Email</th>
                      <th>Nombre del pago</th>
                      <th>Items</th>
                      <th>Método</th>
                      <th>Ref. Pago</th>
                      <th>Teléfono</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map(p => {
                      const ui = ESTADOS_UI[p.estado] || ESTADOS_UI.pendiente
                      const Icono = ui.icono
                      const productos = Array.isArray(p.productos) ? p.productos : []
                      const nombrePago = productos[0]?.nombre || (p.metodo_pago === 'contraentrega' ? 'Contra entrega' : (p.metodo_pago || 'Pago'))
                      const montoClase = Number(p.total) >= 0 ? 'monto-positivo' : 'monto-negativo'
                      const nombreCliente = (p.usuarios?.nombre || p.nombre_cliente || '—')
                      const emailCliente = (p.usuarios?.email || p.email_cliente || '—')
                      const metodo = p.metodo_pago || '—'
                      const referencia = p.referencia_pago || '—'
                      const telefono = typeof p.telefono_cliente === 'object' 
                        ? (p.telefono_cliente?.telefono || p.telefono_cliente?.numero || '—')
                        : (p.telefono_cliente || '—')
                      return (
                        <tr key={p.id}>
                          <td><input type="checkbox" /></td>
                          <td className="txid">TXN-{p.numero_pedido || String(p.id).slice(0,8)}</td>
                          <td className="cliente-nombre">{nombreCliente}</td>
                          <td className="cliente-email">{emailCliente}</td>
                          <td className="pago-nombre">{nombrePago}</td>
                          <td className="items">{productos.length}</td>
                          <td className="metodo">{metodo}</td>
                          <td className="referencia">{referencia}</td>
                          <td className="telefono">{telefono}</td>
                          <td className={`monto ${montoClase}`}>{Number(p.total) >= 0 ? '+' : '-'}{formatearPrecio(Math.abs(Number(p.total) || 0))}</td>
                          <td className="fecha">{formatearFecha(p.creado_el || p.created_at)}</td>
                          <td className="estado">
                            <span className={`badge ${ui.clase}`}>
                              <Icono className="icono" /> {ui.etiqueta}
                            </span>
                          </td>
                          <td className="acciones"><button className="btn-acciones-trans"><MoreHorizontal className="icono" /></button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div className="tabla-footer">
                  <span>Mostrando {Math.min(10, pedidosFiltrados.length)} de {pedidos.length} pedidos</span>
                  <div className="paginacion-simple">
                    <button className="btn-secundario-trans" disabled>«</button>
                    <button className="btn-primario-trans">1</button>
                    <button className="btn-secundario-trans" disabled>»</button>
                  </div>
                </div>
              </div>
            )}
            {!cargando && !error && pedidosFiltrados.length === 0 && (
              <div className="estado-aviso" style={{marginTop: 12}}>
                <AlertCircle className="icono" />
                <div>
                  <strong>Sin pedidos visibles</strong>
                  <div>
                    {sesionInicializada ? (
                      <>No hay pedidos para tu usuario actual (<code>{usuario?.email || '—'}</code>). Si el pedido existe, verifica que el <code>usuario_id</code> del pedido coincida con tu cuenta o inicia sesión con el dueño del pedido.</>
                    ) : (
                      <>Inicia sesión para ver tus pedidos. Las políticas RLS ocultan datos a usuarios anónimos.</>
                    )}
                  </div>
                </div>
                <button className="btn-primario-trans" onClick={()=>navigate('/login')}>Ir a Login</button>
              </div>
            )}
          </div>
        </section>

        {/* Lateral derecho: Paneles informativos */}
        <aside className="bloque-lateral">
          <div className="card-lateral">
            <div className="card-header">
              <span>Desglose por categoría</span>
              <button className="btn-secundario-trans">Exportar</button>
            </div>
            <div className="donut-placeholder">
              <div className="donut"></div>
              <div className="donut-texto">
                <div className="donut-num">{pedidos.length}</div>
                <div className="donut-sub">Pedidos</div>
              </div>
            </div>
            <ul className="leyenda">
              <li><span className="punto ingreso"></span>Ingresos</li>
              <li><span className="punto gasto"></span>Gastos</li>
            </ul>
          </div>

          <div className="card-lateral insight">
            <div className="insight-texto">
              <h4>Insight</h4>
              <p>Tu volumen de pedidos aumentó este mes. Mantén ofertas en productos populares para mejorar ingresos.</p>
            </div>
            <button className="btn-primario-trans">Ver recomendaciones</button>
          </div>

          <div className="card-lateral subs">
            <div className="card-header"><span>Lista rápida</span></div>
            <ul className="subs-lista">
              <li><span className="subs-nombre">Contra entrega</span><span className="subs-monto">{pedidos.filter(p=>p.metodo_pago==='contraentrega').length}</span></li>
              <li><span className="subs-nombre">Epayco</span><span className="subs-monto">{pedidos.filter(p=>p.metodo_pago==='epayco').length}</span></li>
              <li><span className="subs-nombre">Otros</span><span className="subs-monto">{pedidos.filter(p=>!['contraentrega','epayco'].includes(p.metodo_pago)).length}</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
