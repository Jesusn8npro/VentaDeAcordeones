import React, { useState, useEffect } from 'react'
import { Link } from '@/compat/router'
import { clienteSupabase } from '../../../configuracion/supabase'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import './EstilosCategoriasElegantes.css'
import './ListaProductos.css'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  CheckSquare
} from 'lucide-react'
import EstadisticasProductos from './EstadisticasProductos'

const ListaProductos = () => {
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

  useEffect(() => {
    if (!cargandoAuth) {
      cargarProductos()
      cargarCategorias()
      cargarEstadisticas()
    }
  }, [cargandoAuth, paginaActual, busqueda, filtroCategoria, filtroEstado])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)

      const { data: productosRaw, error: errorProductos, count } = await clienteSupabase
        .from('productos')
        .select('*', { count: 'exact' })
        .order('creado_el', { ascending: false })
        .limit(10)

      if (errorProductos) throw errorProductos

      const { data: categoriasRaw, error: errorCategorias } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, icono, slug, activo')

      if (errorCategorias) throw errorCategorias

      const productosConCategorias = productosRaw?.map(producto => {
        const categoria = categoriasRaw?.find(cat => cat.id === producto.categoria_id)
        return { ...producto, categorias: categoria || null }
      }) || []

      setProductos(productosConCategorias)
      setTotalProductos(count || 0)
      setError(null)
    } catch (error) {
      setError(`Error: ${error.message}`)
      setProductos([])
    } finally {
      setCargando(false)
    }
  }

  const cargarCategorias = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, slug, icono, orden, activo')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (error) {
        setCategorias([])
        return
      }
      setCategorias(data || [])
    } catch {
      setCategorias([])
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const { count: total } = await clienteSupabase
        .from('productos')
        .select('*', { count: 'exact', head: true })

      setEstadisticas({
        totalProductos: total || 0,
        productosActivos: total || 0,
        valorInventario: 0,
        productosBajoStock: 0
      })
    } catch {
      setEstadisticas({ totalProductos: 0, productosActivos: 0, valorInventario: 0, productosBajoStock: 0 })
    }
  }

  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return
    try {
      const { error } = await clienteSupabase.from('productos').delete().eq('id', id)
      if (error) throw error
      setProductos(productos.filter(p => p.id !== id))
      setSeleccionados(prev => prev.filter(s => s !== id))
      cargarEstadisticas()
    } catch {
      alert('Error al eliminar el producto')
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
      cargarEstadisticas()
    } catch {
      alert('Error al eliminar los productos seleccionados')
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
      cargarEstadisticas()
    } catch {
      alert('Error al actualizar el estado de los productos')
    }
  }

  const alternarEstadoProducto = async (id, estadoActual) => {
    try {
      const { error } = await clienteSupabase
        .from('productos')
        .update({ activo: !estadoActual })
        .eq('id', id)
      if (error) throw error
      setProductos(productos.map(p => p.id === id ? { ...p, activo: !estadoActual } : p))
      cargarEstadisticas()
    } catch {
      alert('Error al cambiar el estado del producto')
    }
  }

  const formatearPrecio = (precio) => {
    if (!precio && precio !== 0) return '$0'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = busqueda === '' ||
      producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const cumpleCategoria = filtroCategoria === '' || producto.categoria_id === filtroCategoria
    const cumpleEstado = filtroEstado === '' ||
      (filtroEstado === 'activo' && producto.activo) ||
      (filtroEstado === 'inactivo' && !producto.activo)
    return cumpleBusqueda && cumpleCategoria && cumpleEstado
  })

  const obtenerEstadoStock = (producto) => {
    const cantidad = producto.stock || 0
    const stockMinimo = producto.stock_minimo || 5
    if (cantidad === 0) return { estado: 'agotado', texto: 'Agotado', clase: 'estado-agotado' }
    if (cantidad <= stockMinimo) return { estado: 'bajo', texto: 'Bajo Stock', clase: 'estado-bajo-stock' }
    return { estado: 'disponible', texto: 'En Stock', clase: 'estado-disponible' }
  }

  // Seleccionar / deseleccionar todo
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

  const totalPaginas = Math.ceil(totalProductos / productosPorPagina)

  if (error) {
    return (
      <div className="lista-productos-error">
        <AlertCircle className="error-icono" />
        <h3>Error al cargar productos</h3>
        <p>{error}</p>
        <button onClick={cargarProductos} className="boton-reintentar">Reintentar</button>
      </div>
    )
  }

  return (
    <div className="lista-productos">
      <div className="lista-productos-header">
        <div className="header-info">
          <h1 className="titulo-pagina">Lista de Productos</h1>
          <p className="subtitulo-pagina">Gestiona tu inventario y controla tus productos</p>
        </div>
        <div className="header-acciones">
          <Link to="/admin/productos/agregar" className="boton-primario">
            <Plus className="boton-icono" />
            Agregar Producto
          </Link>
        </div>
      </div>

      <EstadisticasProductos estadisticas={estadisticas} formatearPrecio={formatearPrecio} />

      <div className="filtros-productos">
        <div className="filtro-busqueda">
          <Search className="filtro-icono" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>
        <div className="filtros-selectores">
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="selector-filtro">
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="selector-filtro">
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <button className="boton-filtro">
            <Filter className="boton-icono" />
            Filtros
          </button>
        </div>
      </div>

      <div className="tabla-productos-contenedor">
        {cargando ? (
          <div className="cargando-productos">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="productos-vacio">
            <Package className="vacio-icono" />
            <h3>No hay productos</h3>
            <p>Comienza agregando tu primer producto</p>
            <Link to="/admin/productos/agregar" className="boton-primario">
              <Plus className="boton-icono" />
              Agregar Producto
            </Link>
          </div>
        ) : (
          <>
            <table className="tabla-productos">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      onChange={toggleSeleccionTodos}
                      title="Seleccionar todos"
                      className="checkbox-tabla"
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
                    <tr key={producto.id} className={`fila-producto ${estaSeleccionado ? 'fila-seleccionada' : ''}`}>
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => toggleSeleccion(producto.id)}
                          className="checkbox-tabla"
                        />
                      </td>
                      <td className="celda-producto">
                        <div className="producto-info">
                          <div className="producto-imagen">
                            {producto.fotos_principales?.[0] ? (
                              <img
                                src={producto.fotos_principales[0]}
                                alt={producto.nombre}
                                className="imagen-miniatura"
                              />
                            ) : (
                              <div className="imagen-placeholder"><Package /></div>
                            )}
                          </div>
                          <div className="producto-detalles">
                            <h4 className="producto-nombre">{producto.nombre}</h4>
                            <p className="producto-sku">ID: {producto.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {producto.categorias?.nombre ? (
                          <div className="categoria-container">
                            <span className="categoria-badge categoria-premium">
                              <span className="categoria-icono-wrapper">{producto.categorias.icono}</span>
                              <span className="categoria-nombre-elegante">{producto.categorias.nombre}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="categoria-container">
                            <span className="categoria-badge categoria-sin-asignar-elegante">
                              <span className="categoria-icono-wrapper">❓</span>
                              <span className="categoria-nombre-elegante">Sin categoría</span>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="precio-celda">{formatearPrecio(producto.precio)}</td>
                      <td>
                        <div className="stock-info">
                          <span className="stock-cantidad">{producto.stock || 0}</span>
                          <span className={`stock-estado ${estadoStock.clase}`}>{estadoStock.texto}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => alternarEstadoProducto(producto.id, producto.activo)}
                          className={`estado-toggle ${producto.activo ? 'activo' : 'inactivo'}`}
                        >
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="fecha-celda">
                        {new Date(producto.creado_el).toLocaleDateString('es-ES')}
                      </td>
                      <td>
                        <div className="acciones-producto">
                          <Link
                            to={`/producto/${producto.slug}`}
                            className="accion-boton ver"
                            title="Ver producto"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye />
                          </Link>
                          <Link
                            to={`/admin/productos/editar/${encodeURIComponent(producto.slug || producto.nombre)}`}
                            className="accion-boton editar"
                            title="Editar producto"
                          >
                            <Edit />
                          </Link>
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="accion-boton eliminar"
                            title="Eliminar producto"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className="paginacion">
                <div className="paginacion-info">
                  Mostrando {((paginaActual - 1) * productosPorPagina) + 1} a {Math.min(paginaActual * productosPorPagina, totalProductos)} de {totalProductos} productos
                </div>
                <div className="paginacion-controles">
                  <button
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="boton-paginacion"
                  >
                    Anterior
                  </button>
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`boton-paginacion ${paginaActual === i + 1 ? 'activo' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="boton-paginacion"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Barra bulk flotante */}
      {seleccionados.length > 0 && (
        <div className="barra-bulk">
          <span>{seleccionados.length} producto(s) seleccionado(s)</span>
          <button
            className="bulk-btn bulk-btn-activar"
            onClick={() => alternarEstadoBulk(true)}
            title="Activar seleccionados"
          >
            Activar
          </button>
          <button
            className="bulk-btn bulk-btn-desactivar"
            onClick={() => alternarEstadoBulk(false)}
            title="Desactivar seleccionados"
          >
            Desactivar
          </button>
          <button
            className="bulk-btn bulk-btn-eliminar"
            onClick={eliminarBulk}
            disabled={eliminandoBulk}
          >
            <Trash2 size={14} />
            {eliminandoBulk ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button className="bulk-btn bulk-btn-cancelar" onClick={() => setSeleccionados([])}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

export default ListaProductos
