import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { clienteSupabase } from '../../../configuracion/supabase'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import './GestionProductos.css'
import { Search, Filter, Plus, Edit, Trash2, Eye, Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

const GestionProductos = () => {
  const { cargando: cargandoAuth } = useAuth()

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalProductos, setTotalProductos] = useState(0)
  const productosPorPagina = 10

  // Bulk selection
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [eliminandoBulk, setEliminandoBulk] = useState(false)

  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    productosActivos: 0,
    valorInventario: 0,
    productosBajoStock: 0
  })

  const formatearPrecio = (valor) => {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor || 0)
    } catch {
      return `$${Number(valor || 0).toLocaleString('es-CO')}`
    }
  }

  const obtenerEstadoStock = (producto) => {
    const cantidad = Number(producto?.stock || 0)
    if (cantidad <= 0) return { estado: 'agotado', texto: 'Agotado' }
    if (cantidad < 5) return { estado: 'bajo', texto: 'Bajo stock' }
    return { estado: 'disponible', texto: 'Disponible' }
  }

  useEffect(() => {
    if (!cargandoAuth) {
      cargarCategorias()
      cargarProductos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoAuth, paginaActual])

  const cargarCategorias = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, slug, icono, activo')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (error) throw error
      setCategorias(data || [])
    } catch {
      setCategorias([])
    }
  }

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)

      const offset = (paginaActual - 1) * productosPorPagina
      const { data: productosRaw, error: errorProductos, count } = await clienteSupabase
        .from('productos')
        .select('*', { count: 'exact' })
        .order('creado_el', { ascending: false })
        .range(offset, offset + productosPorPagina - 1)

      if (errorProductos) throw errorProductos

      const { data: categoriasRaw, error: errorCategorias } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, icono, slug, activo')

      if (errorCategorias) throw errorCategorias

      const productosConCategoria = (productosRaw || []).map(p => ({
        ...p,
        categoria: categoriasRaw?.find(c => c.id === p.categoria_id) || null
      }))

      setProductos(productosConCategoria)
      setTotalProductos(count || productosConCategoria.length)
      calcularEstadisticas(productosConCategoria)
    } catch (e) {
      setError(e?.message || 'Error cargando productos')
      setProductos([])
      setTotalProductos(0)
      calcularEstadisticas([])
    } finally {
      setCargando(false)
    }
  }

  const calcularEstadisticas = (lista) => {
    const total = lista.length
    const activos = lista.filter(p => p.activo).length
    const bajo = lista.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 5).length
    const valor = lista.reduce((acc, p) => acc + (Number(p.stock || 0) * Number(p.precio || 0)), 0)
    setEstadisticas({ totalProductos: total, productosActivos: activos, valorInventario: valor, productosBajoStock: bajo })
  }

  const productosFiltrados = useMemo(() => {
    let lista = [...productos]
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      lista = lista.filter(p => `${p.nombre || ''} ${p.id}`.toLowerCase().includes(q))
    }
    if (filtroCategoria) {
      lista = lista.filter(p => String(p.categoria_id || '') === String(filtroCategoria))
    }
    if (filtroEstado) {
      const activo = filtroEstado === 'activo'
      lista = lista.filter(p => Boolean(p.activo) === activo)
    }
    return lista
  }, [productos, busqueda, filtroCategoria, filtroEstado])

  const alternarEstadoProducto = async (producto) => {
    try {
      const nuevoEstado = !producto.activo
      const { error } = await clienteSupabase
        .from('productos')
        .update({ activo: nuevoEstado })
        .eq('id', producto.id)
      if (error) throw error
      setProductos(prev => prev.map(p => p.id === producto.id ? { ...p, activo: nuevoEstado } : p))
    } catch {
      alert('No se pudo actualizar el estado del producto')
    }
  }

  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      const { error } = await clienteSupabase.from('productos').delete().eq('id', id)
      if (error) throw error
      setProductos(prev => prev.filter(p => p.id !== id))
      setSeleccionados(prev => prev.filter(s => s !== id))
    } catch (err: any) {
      alert(`Error al eliminar: ${err?.message || err?.details || JSON.stringify(err)}`)
    }
  }

  const eliminarBulk = async () => {
    if (seleccionados.length === 0) return
    if (!confirm(`¿Eliminar ${seleccionados.length} producto(s)? Esta acción no se puede deshacer.`)) return

    setEliminandoBulk(true)
    try {
      const { error } = await clienteSupabase
        .from('productos')
        .delete()
        .in('id', seleccionados)

      if (error) throw error
      setProductos(prev => prev.filter(p => !seleccionados.includes(p.id)))
      setSeleccionados([])
    } catch (err: any) {
      alert(`Error al eliminar: ${err?.message || err?.details || JSON.stringify(err)}`)
    } finally {
      setEliminandoBulk(false)
    }
  }

  const alternarEstadoBulk = async (nuevoEstado: boolean) => {
    if (seleccionados.length === 0) return
    try {
      const { error } = await clienteSupabase
        .from('productos')
        .update({ activo: nuevoEstado })
        .in('id', seleccionados)

      if (error) throw error
      setProductos(prev => prev.map(p => seleccionados.includes(p.id) ? { ...p, activo: nuevoEstado } : p))
      setSeleccionados([])
    } catch {
      alert('Error al actualizar el estado de los productos')
    }
  }

  const todosSeleccionados = productosFiltrados.length > 0 &&
    productosFiltrados.every(p => seleccionados.includes(p.id))

  const toggleSeleccionTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados([])
    } else {
      setSeleccionados(productosFiltrados.map(p => p.id))
    }
  }

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const totalPaginas = Math.max(1, Math.ceil((productosFiltrados.length || totalProductos) / productosPorPagina))

  if (error) {
    return (
      <div className="gestion-productos gestion-error">
        <AlertCircle />
        <h3>Error al cargar productos</h3>
        <p>{error}</p>
        <button onClick={cargarProductos} className="gestion-boton">Reintentar</button>
      </div>
    )
  }

  return (
    <div className="gestion-productos">
      <div className="gestion-contenido">
        {/* Encabezado */}
        <div className="gestion-encabezado">
          <div className="gestion-encabezado-info">
            <h1 className="gestion-titulo">Gestión de Productos</h1>
            <p className="gestion-subtitulo">Administra tu inventario y catálogo fácilmente</p>
          </div>
          <div className="gestion-acciones-encabezado">
            <Link to="/admin/productos/agregar" className="gestion-boton gestion-boton-primario">
              <Plus />
              Agregar Producto
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="gestion-estadisticas">
          <div className="gestion-card">
            <div className="gestion-card-icono"><Package /></div>
            <div>
              <h4>Total</h4>
              <p className="gestion-card-numero">{estadisticas.totalProductos}</p>
            </div>
          </div>
          <div className="gestion-card">
            <div className="gestion-card-icono"><DollarSign /></div>
            <div>
              <h4>Inventario</h4>
              <p className="gestion-card-numero">{formatearPrecio(estadisticas.valorInventario)}</p>
            </div>
          </div>
          <div className="gestion-card">
            <div className="gestion-card-icono"><TrendingUp /></div>
            <div>
              <h4>Activos</h4>
              <p className="gestion-card-numero">{estadisticas.productosActivos}</p>
            </div>
          </div>
          <div className="gestion-card">
            <div className="gestion-card-icono"><AlertCircle /></div>
            <div>
              <h4>Bajo stock</h4>
              <p className="gestion-card-numero">{estadisticas.productosBajoStock}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="gestion-filtros">
          <div className="gestion-busqueda">
            <Search className="gestion-busqueda-icono" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="gestion-input"
            />
          </div>
          <div className="gestion-selectores">
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="gestion-select">
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="gestion-select">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <button className="gestion-boton gestion-boton-secundario">
              <Filter /> Filtros
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="gestion-tabla-contenedor">
          {cargando ? (
            <div className="gestion-cargando">
              <div className="gestion-spinner" />
              <p>Cargando productos...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="gestion-vacio">
              <Package />
              <h3>No hay productos</h3>
              <p>Agrega tu primer producto para comenzar</p>
              <Link to="/admin/productos/agregar" className="gestion-boton gestion-boton-primario">
                <Plus /> Agregar Producto
              </Link>
            </div>
          ) : (
            <table className="gestion-tabla">
              <thead>
                <tr>
                  <th className="gestion-th-check">
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      onChange={toggleSeleccionTodos}
                      className="gestion-checkbox"
                      title="Seleccionar todos"
                    />
                  </th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(producto => {
                  const estadoStock = obtenerEstadoStock(producto)
                  const estaSeleccionado = seleccionados.includes(producto.id)
                  return (
                    <tr key={producto.id} className={`gestion-fila ${estaSeleccionado ? 'gestion-fila-seleccionada' : ''}`}>
                      <td className="gestion-td-check">
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => toggleSeleccion(producto.id)}
                          className="gestion-checkbox"
                        />
                      </td>
                      <td>
                        <div className="gestion-producto">
                          <div className="gestion-imagen">
                            {producto.fotos_principales?.[0] ? (
                              <img src={producto.fotos_principales[0]} alt={producto.nombre} className="gestion-miniatura" />
                            ) : (
                              <div className="gestion-placeholder"><Package /></div>
                            )}
                          </div>
                          <div className="gestion-detalles">
                            <h4 className="gestion-nombre">{producto.nombre}</h4>
                            <p className="gestion-id">ID: {producto.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {producto.categoria?.nombre ? (
                          <span className="gestion-badge gestion-badge-categoria">
                            <span className="gestion-badge-icono">{producto.categoria.icono}</span>
                            <span className="gestion-badge-texto">{producto.categoria.nombre}</span>
                          </span>
                        ) : (
                          <span className="gestion-badge gestion-badge-sin-categoria">
                            <span className="gestion-badge-icono">❓</span>
                            <span className="gestion-badge-texto">Sin categoría</span>
                          </span>
                        )}
                      </td>
                      <td className="gestion-precio">{formatearPrecio(producto.precio)}</td>
                      <td>
                        <div className="gestion-stock">
                          <span className="gestion-stock-cantidad">{producto.stock || 0}</span>
                          <span className={`gestion-stock-estado ${estadoStock.estado}`}>{estadoStock.texto}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`gestion-toggle ${producto.activo ? 'activo' : 'inactivo'}`}
                          onClick={() => alternarEstadoProducto(producto)}
                        >
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td>{new Date(producto.creado_el).toLocaleDateString('es-CO')}</td>
                      <td>
                        <div className="gestion-acciones">
                          <Link to={`/admin/productos/editar/${encodeURIComponent(producto.slug || producto.nombre || producto.id)}`} className="gestion-accion" title="Editar"><Edit /></Link>
                          <Link to={`/producto/${producto.slug || producto.id}`} className="gestion-accion" title="Ver"><Eye /></Link>
                          <button onClick={() => eliminarProducto(producto.id)} className="gestion-accion eliminar" title="Eliminar"><Trash2 /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {productosFiltrados.length > 0 && (
          <div className="gestion-paginacion">
            <button
              onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className="gestion-boton"
            >
              Anterior
            </button>
            <span className="gestion-paginacion-info">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className="gestion-boton"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Barra bulk flotante */}
      {seleccionados.length > 0 && (
        <div className="gestion-barra-bulk">
          <span>{seleccionados.length} producto(s) seleccionado(s)</span>
          <button className="gestion-bulk-btn gestion-bulk-activar" onClick={() => alternarEstadoBulk(true)}>Activar</button>
          <button className="gestion-bulk-btn gestion-bulk-desactivar" onClick={() => alternarEstadoBulk(false)}>Desactivar</button>
          <button className="gestion-bulk-btn gestion-bulk-eliminar" onClick={eliminarBulk} disabled={eliminandoBulk}>
            <Trash2 size={14} />
            {eliminandoBulk ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button className="gestion-bulk-btn gestion-bulk-cancelar" onClick={() => setSeleccionados([])}>Cancelar</button>
        </div>
      )}
    </div>
  )
}

export default GestionProductos
