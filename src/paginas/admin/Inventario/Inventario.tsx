import React, { useState, useEffect, useRef } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { Search, AlertTriangle, AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react'
import ModalAjusteStock from './ModalAjusteStock'
import FilaInventario from './FilaInventario'
import './Inventario.css'

const FORMATO_COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const formatearPrecio = (p: number) => { try { return FORMATO_COP.format(p) } catch { return `$${p}` } }

const Inventario = () => {
  const [inventario, setInventario] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroStock, setFiltroStock] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [categorias, setCategorias] = useState<any[]>([])
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [ajusteStock, setAjusteStock] = useState({ tipo: 'entrada', cantidad: '', motivo: '' })

  // Inline edit
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoValor, setEditandoValor] = useState('')
  const inputInlineRef = useRef<HTMLInputElement>(null)

  // Bulk ops
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [aplicandoBulk, setAplicandoBulk] = useState(false)

  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0, valorInventario: 0, productosBajoStock: 0, productosAgotados: 0
  })

  const { usuario } = useAuth()

  useEffect(() => {
    cargarInventario()
    cargarCategorias()
    cargarEstadisticas()
  }, [busqueda, filtroStock, filtroCategoria])

  useEffect(() => {
    if (editandoId && inputInlineRef.current) inputInlineRef.current.focus()
  }, [editandoId])

  const cargarInventario = async () => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase
        .from('inventario')
        .select('id, cantidad, stock_minimo, ubicacion, actualizado_el, productos(id, nombre, slug, precio, categoria_id)')
        .order('actualizado_el', { ascending: false })
      if (error) throw error

      let lista = data || []
      const texto = busqueda?.toLowerCase().trim()
      if (texto) {
        lista = lista.filter(item =>
          (item.productos?.nombre?.toLowerCase() || '').includes(texto) ||
          (item.productos?.slug?.toLowerCase() || '').includes(texto)
        )
      }
      if (filtroCategoria) {
        lista = lista.filter(item => item.productos?.categoria_id == filtroCategoria)
      }
      if (filtroStock) {
        lista = lista.filter(item => {
          switch (filtroStock) {
            case 'agotado': return item.cantidad === 0
            case 'bajo': return item.cantidad > 0 && item.cantidad <= item.stock_minimo
            case 'critico': return item.cantidad > 0 && item.cantidad < 5
            case 'disponible': return item.cantidad > item.stock_minimo
            default: return true
          }
        })
      }
      setInventario(lista)
    } catch {
      setError('Error al cargar el inventario')
    } finally {
      setCargando(false)
    }
  }

  const cargarCategorias = async () => {
    try {
      const { data } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, slug, icono, activo, orden')
        .eq('activo', true)
        .order('orden', { ascending: true })
      setCategorias(data || [])
    } catch { /* silencioso */ }
  }

  const cargarEstadisticas = async () => {
    try {
      const { data } = await clienteSupabase
        .from('inventario')
        .select('cantidad, stock_minimo, productos(precio)')
      const total = data?.length || 0
      const valorInventario = (data || []).reduce((a, i) => a + (i.cantidad * (i.productos?.precio || 0)), 0)
      const bajoStock = (data || []).filter(i => i.cantidad > 0 && i.cantidad <= i.stock_minimo).length
      const agotados = (data || []).filter(i => i.cantidad === 0).length
      setEstadisticas({ totalProductos: total, valorInventario, productosBajoStock: bajoStock, productosAgotados: agotados })
    } catch { /* silencioso */ }
  }

  const obtenerEstadoStock = (item: any) => {
    if (item.cantidad === 0) return { estado: 'agotado', texto: 'Agotado', clase: 'inv-sem-rojo', icono: AlertCircle }
    if (item.cantidad < 5) return { estado: 'critico', texto: 'Crítico', clase: 'inv-sem-rojo', icono: AlertCircle }
    if (item.cantidad <= item.stock_minimo) return { estado: 'bajo', texto: 'Bajo Stock', clase: 'inv-sem-amarillo', icono: AlertTriangle }
    return { estado: 'disponible', texto: 'Disponible', clase: 'inv-sem-verde', icono: CheckCircle }
  }

  const abrirModalAjuste = (producto: any) => {
    setProductoSeleccionado(producto)
    setAjusteStock({ tipo: 'entrada', cantidad: '', motivo: '' })
    setModalAjusteAbierto(true)
  }

  const cerrarModalAjuste = () => {
    setModalAjusteAbierto(false)
    setProductoSeleccionado(null)
    setAjusteStock({ tipo: 'entrada', cantidad: '', motivo: '' })
  }

  const procesarAjusteStock = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!ajusteStock.cantidad || Number(ajusteStock.cantidad) <= 0) { alert('La cantidad debe ser mayor a 0'); return }
    if (!ajusteStock.motivo.trim()) { alert('El motivo es requerido'); return }
    try {
      const cantidadAjuste = parseInt(ajusteStock.cantidad)
      const nuevaCantidad = ajusteStock.tipo === 'entrada'
        ? productoSeleccionado.cantidad + cantidadAjuste
        : Math.max(0, productoSeleccionado.cantidad - cantidadAjuste)
      const { error: errInv } = await clienteSupabase.from('inventario')
        .update({ cantidad: nuevaCantidad, actualizado_el: new Date().toISOString() })
        .eq('id', productoSeleccionado.id)
      if (errInv) throw errInv
      await clienteSupabase.from('movimientos_inventario').insert({
        producto_id: productoSeleccionado.productos.id,
        tipo: ajusteStock.tipo,
        cantidad: cantidadAjuste,
        cantidad_anterior: productoSeleccionado.cantidad,
        cantidad_nueva: nuevaCantidad,
        motivo: ajusteStock.motivo.trim(),
        usuario_id: usuario?.id || null
      })
      setInventario(prev => prev.map(item => item.id === productoSeleccionado.id ? { ...item, cantidad: nuevaCantidad } : item))
      cargarEstadisticas()
      cerrarModalAjuste()
    } catch {
      alert('Error al procesar el ajuste de stock')
    }
  }

  // Inline edit handlers
  const iniciarEdicionInline = (item: any) => {
    setEditandoId(item.id)
    setEditandoValor(String(item.cantidad))
  }

  const guardarEdicionInline = async (item: any) => {
    const nuevaCantidad = parseInt(editandoValor)
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) { cancelarEdicionInline(); return }
    if (nuevaCantidad === item.cantidad) { cancelarEdicionInline(); return }
    try {
      const { error } = await clienteSupabase.from('inventario')
        .update({ cantidad: nuevaCantidad, actualizado_el: new Date().toISOString() })
        .eq('id', item.id)
      if (error) throw error
      await clienteSupabase.from('movimientos_inventario').insert({
        producto_id: item.productos?.id,
        tipo: nuevaCantidad > item.cantidad ? 'entrada' : 'salida',
        cantidad: Math.abs(nuevaCantidad - item.cantidad),
        cantidad_anterior: item.cantidad,
        cantidad_nueva: nuevaCantidad,
        motivo: 'Edición directa desde inventario',
        usuario_id: usuario?.id || null
      })
      setInventario(prev => prev.map(i => i.id === item.id ? { ...i, cantidad: nuevaCantidad } : i))
      cargarEstadisticas()
    } catch {
      alert('Error al actualizar stock')
    }
    cancelarEdicionInline()
  }

  const cancelarEdicionInline = () => { setEditandoId(null); setEditandoValor('') }

  // Bulk helpers
  const todosSeleccionados = inventario.length > 0 && seleccionados.length === inventario.length
  const toggleTodos = () => setSeleccionados(todosSeleccionados ? [] : inventario.map(i => i.id))
  const toggleUno = (id: string) => setSeleccionados(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

  const activarDesactivarBulk = async (activar: boolean) => {
    if (!seleccionados.length) return
    const accion = activar ? 'activar' : 'desactivar'
    if (!confirm(`¿${accion} ${seleccionados.length} producto(s) en inventario?`)) return
    setAplicandoBulk(true)
    try {
      // Actualizar productos asociados (activo)
      const productosIds = inventario
        .filter(i => seleccionados.includes(i.id) && i.productos?.id)
        .map(i => i.productos.id)
      if (productosIds.length) {
        await clienteSupabase.from('productos').update({ activo: activar }).in('id', productosIds)
      }
      await cargarInventario()
      setSeleccionados([])
    } catch {
      alert('Error al actualizar productos')
    }
    setAplicandoBulk(false)
  }

  if (error) {
    return (
      <div className="inventario-error">
        <AlertCircle className="error-icono" />
        <h3>Error al cargar inventario</h3>
        <p>{error}</p>
        <button onClick={cargarInventario} className="boton-reintentar">Reintentar</button>
      </div>
    )
  }

  return (
    <div className="inventario">
      {/* Header */}
      <div className="inventario-header">
        <div className="header-info">
          <h1 className="titulo-pagina">
            Inventario
            <span className="inv-quick-stats">
              {estadisticas.totalProductos} productos
              {estadisticas.productosBajoStock > 0 && (
                <span className="inv-stat-warn"> · {estadisticas.productosBajoStock} bajo stock</span>
              )}
              {estadisticas.productosAgotados > 0 && (
                <span className="inv-stat-err"> · {estadisticas.productosAgotados} sin stock</span>
              )}
            </span>
          </h1>
          <p className="subtitulo-pagina">Valor total: {formatearPrecio(estadisticas.valorInventario)}</p>
        </div>
        <div className="header-acciones">
          <button onClick={cargarInventario} className="boton-secundario">
            <RefreshCw className="boton-icono" /> Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-inventario">
        <div className="filtro-busqueda">
          <Search className="filtro-icono" />
          <input
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
          {busqueda && (
            <button className="inv-clear-btn" onClick={() => setBusqueda('')}><X size={14} /></button>
          )}
        </div>
        <div className="filtros-selectores">
          <select value={filtroStock} onChange={e => setFiltroStock(e.target.value)} className="selector-filtro">
            <option value="">Todos los stocks</option>
            <option value="disponible">Disponible</option>
            <option value="bajo">Bajo Stock</option>
            <option value="critico">Crítico (&lt; 5)</option>
            <option value="agotado">Agotado</option>
          </select>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="selector-filtro">
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-inventario-contenedor">
        {cargando ? (
          <div className="cargando-inventario"><div className="spinner" /><p>Cargando inventario...</p></div>
        ) : inventario.length === 0 ? (
          <div className="inventario-vacio"><p>No hay productos que coincidan con los filtros.</p></div>
        ) : (
          <table className="tabla-inventario">
            <thead>
              <tr>
                <th><input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} /></th>
                <th>Producto</th>
                <th>SKU / Slug</th>
                <th>Stock</th>
                <th>Stock mín.</th>
                <th>Estado</th>
                <th>Valor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map(item => (
                <FilaInventario
                  key={item.id}
                  item={item}
                  selec={seleccionados.includes(item.id)}
                  editando={editandoId === item.id}
                  editandoValor={editandoValor}
                  inputRef={inputInlineRef}
                  obtenerEstadoStock={obtenerEstadoStock}
                  formatearPrecio={formatearPrecio}
                  onToggle={toggleUno}
                  onIniciarEdicion={iniciarEdicionInline}
                  onGuardarEdicion={guardarEdicionInline}
                  onCancelarEdicion={cancelarEdicionInline}
                  onEditandoValorChange={setEditandoValor}
                  onAbrirModal={abrirModalAjuste}
                />
              ))}
            </tbody>
          </table>
        )}
        <div className="paginacion">
          <span className="paginacion-info">{inventario.length} producto(s)</span>
        </div>
      </div>

      {/* Bulk flotante */}
      {seleccionados.length > 0 && (
        <div className="barra-acciones-bulk">
          <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{seleccionados.length} seleccionado(s)</span>
          <button
            className="bulk-btn-aplicar"
            style={{ background: 'var(--color-exito)' }}
            onClick={() => activarDesactivarBulk(true)}
            disabled={aplicandoBulk}
          >Activar</button>
          <button
            className="bulk-btn-aplicar"
            style={{ background: 'var(--color-advertencia)' }}
            onClick={() => activarDesactivarBulk(false)}
            disabled={aplicandoBulk}
          >Desactivar</button>
          <button className="bulk-btn-cancel" onClick={() => setSeleccionados([])}><X size={14} /></button>
        </div>
      )}

      {modalAjusteAbierto && productoSeleccionado && (
        <ModalAjusteStock
          productoSeleccionado={productoSeleccionado}
          ajusteStock={ajusteStock}
          onCambioAjuste={setAjusteStock}
          onGuardar={procesarAjusteStock}
          onCerrar={cerrarModalAjuste}
        />
      )}
    </div>
  )
}

export default Inventario
