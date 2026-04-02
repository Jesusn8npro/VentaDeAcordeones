import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  MoreHorizontal,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

const ListaProductos = () => {
  const { usuario, sesionInicializada, cargando: cargandoAuth } = useAuth()
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

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    productosActivos: 0,
    valorInventario: 0,
    productosBajoStock: 0
  })

  // SIMPLIFICADO: Solo cargar cuando auth esté listo
  useEffect(() => {
    if (!cargandoAuth) {
      console.log('🔄 Auth listo, cargando datos...', {
        sesionInicializada,
        usuario: usuario?.id
      })
      
      // Cargar inmediatamente sin delays
      cargarProductos()
      cargarCategorias()
      cargarEstadisticas()
    }
  }, [cargandoAuth, paginaActual, busqueda, filtroCategoria, filtroEstado])



  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)
      
      console.log('🔍 Cargando productos con categorías...', {
        usuario: usuario?.email,
        sesionInicializada,
        timestamp: new Date().toISOString()
      })

      // ESTRATEGIA MANUAL - Cargar por separado para evitar problemas con JOIN
      console.log('📦 Cargando productos y categorías por separado...')
      
      // 1. Cargar productos
      const { data: productosRaw, error: errorProductos, count } = await clienteSupabase
        .from('productos')
        .select('*', { count: 'exact' })
        .order('creado_el', { ascending: false })
        .limit(10)

      if (errorProductos) {
        console.error('❌ Error cargando productos:', errorProductos)
        throw errorProductos
      }

      // 2. Cargar categorías
      const { data: categoriasRaw, error: errorCategorias } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, icono, slug, activo')

      if (errorCategorias) {
        console.error('❌ Error cargando categorías:', errorCategorias)
        throw errorCategorias
      }

      console.log('📦 Productos obtenidos:', productosRaw?.length || 0)
      console.log('📂 Categorías obtenidas:', categoriasRaw?.length || 0)

      // 3. Mapear manualmente
      const productosConCategorias = productosRaw?.map(producto => {
        const categoria = categoriasRaw?.find(cat => cat.id === producto.categoria_id)
        return {
          ...producto,
          categorias: categoria || null
        }
      }) || []

      console.log('📋 Productos mapeados con categorías:')
      productosConCategorias.forEach(p => {
        console.log(`  - ${p.nombre}: categoria_id=${p.categoria_id} → ${p.categorias?.nombre || 'Sin categoría'} ${p.categorias?.icono || ''}`)
        if (p.categoria_id && !p.categorias) {
          console.warn(`⚠️ PROBLEMA: Producto "${p.nombre}" tiene categoria_id="${p.categoria_id}" pero no se encontró la categoría`)
        }
      })

      setProductos(productosConCategorias)
      setTotalProductos(count || 0)
      
      setError(null)
      console.log('✅ Productos cargados exitosamente')
      
    } catch (error) {
      console.error('💥 Error al cargar productos:', error)
      setError(`Error: ${error.message}`)
      setProductos([])
    } finally {
      setCargando(false)
    }
  }

  const cargarCategorias = async () => {
    try {
      console.log('📂 Cargando categorías...')
      // CAMPOS OPTIMIZADOS según esquema real
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select(`
          id,
          nombre,
          slug,
          icono,
          orden,
          activo
        `)
        .eq('activo', true)
        .order('orden', { ascending: true })

      console.log('📂 Respuesta categorías:', { data: data?.length || 0, error: error?.message })

      if (error) {
        console.error('❌ Error cargando categorías:', error)
        // No lanzar error, solo loguearlo
        setCategorias([])
        return
      }

      setCategorias(data || [])
      console.log('✅ Categorías cargadas:', data?.length || 0)
    } catch (error) {
      console.error('💥 Error al cargar categorías:', error)
      setCategorias([])
    }
  }

  const cargarEstadisticas = async () => {
    try {
      console.log('📊 Cargando estadísticas básicas...')
      
      // Solo contar productos totales por ahora
      const { count: total } = await clienteSupabase
        .from('productos')
        .select('*', { count: 'exact', head: true })

      console.log('📊 Total productos encontrados:', total)

      setEstadisticas({
        totalProductos: total || 0,
        productosActivos: total || 0,
        valorInventario: 0,
        productosBajoStock: 0
      })
    } catch (error) {
      console.error('💥 Error al cargar estadísticas:', error)
      setEstadisticas({
        totalProductos: 0,
        productosActivos: 0,
        valorInventario: 0,
        productosBajoStock: 0
      })
    }
  }

  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    try {
      const { error } = await clienteSupabase
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProductos(productos.filter(p => p.id !== id))
      cargarEstadisticas()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Error al eliminar el producto')
    }
  }

  const alternarEstadoProducto = async (id, estadoActual) => {
    try {
      const { error } = await clienteSupabase
        .from('productos')
        .update({ activo: !estadoActual })
        .eq('id', id)

      if (error) throw error

      setProductos(productos.map(p => 
        p.id === id ? { ...p, activo: !estadoActual } : p
      ))
      cargarEstadisticas()
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error)
      alert('Error al cambiar el estado del producto')
    }
  }

  // Importar utilidad de formateo
  const formatearPrecio = (precio) => {
    if (!precio && precio !== 0) return '$0'
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  // Filtrar productos basado en búsqueda, categoría y estado
  const productosFiltrados = productos.filter(producto => {
    // Filtro por búsqueda
    const cumpleBusqueda = busqueda === '' || 
      producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())

    // Filtro por categoría
    const cumpleCategoria = filtroCategoria === '' || 
      producto.categoria_id === filtroCategoria

    // Filtro por estado
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

  const totalPaginas = Math.ceil(totalProductos / productosPorPagina)

  if (error) {
    return (
      <div className="lista-productos-error">
        <AlertCircle className="error-icono" />
        <h3>Error al cargar productos</h3>
        <p>{error}</p>
        <button onClick={cargarProductos} className="boton-reintentar">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="lista-productos">
      {/* Header */}
      <div className="lista-productos-header">
        <div className="header-info">
          <h1 className="titulo-pagina">Lista de Productos</h1>
          <p className="subtitulo-pagina">
            Gestiona tu inventario y controla tus productos
          </p>
        </div>
        <div className="header-acciones">
          <Link to="/admin/productos/agregar" className="boton-primario">
            <Plus className="boton-icono" />
            Agregar Producto
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="estadistica-card estadistica-total">
          <div className="estadistica-icono">
            <Package />
          </div>
          <div className="estadistica-contenido">
            <h3>Total Productos</h3>
            <p className="estadistica-numero">{estadisticas.totalProductos}</p>
            <span className="estadistica-cambio positivo">
              {estadisticas.productosActivos} activos
            </span>
          </div>
        </div>

        <div className="estadistica-card estadistica-valor">
          <div className="estadistica-icono">
            <DollarSign />
          </div>
          <div className="estadistica-contenido">
            <h3>Valor Inventario</h3>
            <p className="estadistica-numero">{formatearPrecio(estadisticas.valorInventario)}</p>
            <span className="estadistica-cambio">Total en stock</span>
          </div>
        </div>

        <div className="estadistica-card estadistica-stock">
          <div className="estadistica-icono">
            <TrendingUp />
          </div>
          <div className="estadistica-contenido">
            <h3>Productos Activos</h3>
            <p className="estadistica-numero">{estadisticas.productosActivos}</p>
            <span className="estadistica-cambio positivo">
              {((estadisticas.productosActivos / estadisticas.totalProductos) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="estadistica-card estadistica-alerta">
          <div className="estadistica-icono">
            <AlertCircle />
          </div>
          <div className="estadistica-contenido">
            <h3>Bajo Stock</h3>
            <p className="estadistica-numero">{estadisticas.productosBajoStock}</p>
            <span className="estadistica-cambio negativo">Requieren atención</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
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
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="selector-filtro"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="selector-filtro"
          >
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

      {/* Tabla de productos */}
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
                  return (
                    <tr key={producto.id} className="fila-producto">
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
                              <div className="imagen-placeholder">
                                <Package />
                              </div>
                            )}
                          </div>
                          <div className="producto-detalles">
                            <h4 className="producto-nombre">{producto.nombre}</h4>
                            <p className="producto-sku">ID: {producto.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {producto.categorias && producto.categorias.nombre ? (
                          <div className="categoria-container">
                            <span className="categoria-badge categoria-premium">
                              <span className="categoria-icono-wrapper">
                                {producto.categorias.icono}
                              </span>
                              <span className="categoria-nombre-elegante">
                                {producto.categorias.nombre}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <div className="categoria-container">
                            <span className="categoria-badge categoria-sin-asignar-elegante">
                              <span className="categoria-icono-wrapper">
                                ❓
                              </span>
                              <span className="categoria-nombre-elegante">
                                Sin categoría
                              </span>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="precio-celda">
                        {formatearPrecio(producto.precio)}
                      </td>
                      <td>
                        <div className="stock-info">
                          <span className="stock-cantidad">
                            {producto.stock || 0}
                          </span>
                          <span className={`stock-estado ${estadoStock.clase}`}>
                            {estadoStock.texto}
                          </span>
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
                          <button className="accion-boton mas">
                            <MoreHorizontal />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Paginación */}
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
    </div>
  )
}

export default ListaProductos
