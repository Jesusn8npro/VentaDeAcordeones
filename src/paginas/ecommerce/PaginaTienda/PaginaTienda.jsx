import React, { useState, useEffect } from 'react'
import { useSearchParams, useParams, useNavigate } from 'react-router-dom'
import LayoutTienda from '../../../componentes/tienda/LayoutTienda'
import SidebarFiltros from '../../../componentes/tienda/SidebarFiltros'
import GridProductosVendedor from '../../../componentes/producto/GridProductosVendedor'
import { Grid, List, SlidersHorizontal, X, Check, Flame, TrendingUp, Package, Zap } from 'lucide-react'
import { clienteSupabase } from '../../../configuracion/supabase'
import './PaginaTienda.css'

/**
 * PaginaTienda - Página principal de la tienda
 * 
 * Características:
 * - Layout con sidebar fijo
 * - Filtros funcionales integrados
 * - Vista grid/lista
 * - URL params para filtros
 * - Responsive completo
 * - Mejor que cualquier referencia
 */

const PaginaTienda = () => {
  const { slug } = useParams() // Detectar slug de categoría
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [categoriaActual, setCategoriaActual] = useState(null)
  const [cargandoCategoria, setCargandoCategoria] = useState(!!slug)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categorias: [],
    precioMin: 0,
    precioMax: 10000000,
    marcas: [],
    rating: 0,
    enStock: false
  })
  const [vista, setVista] = useState('grid') // 'grid' | 'lista'
  const [ordenar, setOrdenar] = useState('nuevos')
  const [totalProductos, setTotalProductos] = useState(0)
  
  // Estados para modales móviles
  const [modalFiltrosAbierto, setModalFiltrosAbierto] = useState(false)
  const [modalOrdenarAbierto, setModalOrdenarAbierto] = useState(false)

  // Cargar datos de la categoría si hay slug
  useEffect(() => {
    const cargarCategoria = async () => {
      if (!slug || slug === 'undefined') {
        console.log('Sin slug válido, mostrando todos los productos')
        setCategoriaActual(null)
        setCargandoCategoria(false)
        return
      }

      try {
        setCargandoCategoria(true)
        console.log('Cargando categoría con slug:', slug)
        
        // Cargar categoría - usar maybeSingle() en vez de single()
        const { data: categoria, error } = await clienteSupabase
          .from('categorias')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (error) {
          console.error('Error al buscar categoría:', error)
          throw error
        }

        if (!categoria) {
          console.warn(`Categoría con slug "${slug}" no encontrada`)
          setCategoriaActual(null)
          setCargandoCategoria(false)
          return
        }

        console.log('Categoría encontrada:', categoria)

        // Contar productos de la categoría
        const { count: totalProductos } = await clienteSupabase
          .from('productos')
          .select('*', { count: 'exact', head: true })
          .eq('categoria_id', categoria.id)

        // Calcular stats de ofertas
        const { data: productosConDescuento } = await clienteSupabase
          .from('productos')
          .select('precio, precio_original')
          .eq('categoria_id', categoria.id)
          .not('precio_original', 'is', null)

        const productosEnOferta = productosConDescuento?.length || 0
        const descuentoPromedio = productosEnOferta > 0
          ? Math.round(productosConDescuento.reduce((sum, p) => {
              const descuento = ((p.precio_original - p.precio) / p.precio_original) * 100
              return sum + descuento
            }, 0) / productosEnOferta)
          : 0

        const categoriaConStats = {
          ...categoria,
          total_productos: totalProductos || 0,
          productos_en_oferta: productosEnOferta,
          descuento_promedio: descuentoPromedio
        }

        console.log('✅ Categoría con stats:', categoriaConStats)
        setCategoriaActual(categoriaConStats)

        // Aplicar filtro de categoría automáticamente usando el ID
        const nuevosFiltros = {
          busqueda: '',
          categorias: [categoria.id],
          precioMin: 0,
          precioMax: 10000000,
          marcas: [],
          rating: 0,
          enStock: false
        }
        console.log('✅ Aplicando filtros de categoría:', nuevosFiltros)
        console.log('✅ ID de categoría a filtrar:', categoria.id)
        setFiltros(nuevosFiltros)
        
        // Forzar la actualización
        setTimeout(() => {
          console.log('✅ Filtros después de setFiltros:', nuevosFiltros)
        }, 100)

      } catch (error) {
        console.error('Error cargando categoría:', error)
        setCategoriaActual(null)
      } finally {
        setCargandoCategoria(false)
      }
    }

    cargarCategoria()
  }, [slug])

  // Inicializar filtros desde URL
  useEffect(() => {
    // Si hay slug, no sobrescribir el filtro de categoría
    if (slug) {
      setVista(searchParams.get('vista') || 'grid')
      setOrdenar(searchParams.get('ordenar') || 'relevancia')
      return
    }

    const filtrosUrl = {
      busqueda: searchParams.get('busqueda') || '',
      categorias: searchParams.get('categorias')?.split(',').filter(Boolean) || [],
      precioMin: parseInt(searchParams.get('precioMin')) || 0,
      precioMax: parseInt(searchParams.get('precioMax')) || 10000000,
      marcas: searchParams.get('marcas')?.split(',').filter(Boolean) || [],
      rating: parseInt(searchParams.get('rating')) || 0,
      enStock: searchParams.get('enStock') === 'true'
    }
    
    setFiltros(filtrosUrl)
    setVista(searchParams.get('vista') || 'grid')
    setOrdenar(searchParams.get('ordenar') || 'relevancia')
  }, [searchParams, slug])

  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros)
    
    // Actualizar URL
    const params = new URLSearchParams()
    
    if (nuevosFiltros.busqueda) params.set('busqueda', nuevosFiltros.busqueda)
    if (nuevosFiltros.categorias.length > 0) params.set('categorias', nuevosFiltros.categorias.join(','))
    if (nuevosFiltros.precioMin > 0) params.set('precioMin', nuevosFiltros.precioMin.toString())
    if (nuevosFiltros.precioMax < 10000000) params.set('precioMax', nuevosFiltros.precioMax.toString())
    if (nuevosFiltros.marcas.length > 0) params.set('marcas', nuevosFiltros.marcas.join(','))
    if (nuevosFiltros.rating > 0) params.set('rating', nuevosFiltros.rating.toString())
    if (nuevosFiltros.enStock) params.set('enStock', 'true')
    if (vista !== 'grid') params.set('vista', vista)
    if (ordenar !== 'relevancia') params.set('ordenar', ordenar)
    
    setSearchParams(params)
  }

  const handleVistaChange = (nuevaVista) => {
    setVista(nuevaVista)
    
    const params = new URLSearchParams(searchParams)
    if (nuevaVista !== 'grid') {
      params.set('vista', nuevaVista)
    } else {
      params.delete('vista')
    }
    setSearchParams(params)
  }

  const handleOrdenarChange = (nuevoOrdenar) => {
    setOrdenar(nuevoOrdenar)
    
    const params = new URLSearchParams(searchParams)
    if (nuevoOrdenar !== 'relevancia') {
      params.set('ordenar', nuevoOrdenar)
    } else {
      params.delete('ordenar')
    }
    setSearchParams(params)
  }

  const contarFiltrosActivos = () => {
    let count = 0
    if (filtros.busqueda) count++
    if (filtros.categorias.length > 0) count++
    if (filtros.precioMin > 0 || filtros.precioMax < 10000000) count++
    if (filtros.marcas.length > 0) count++
    if (filtros.rating > 0) count++
    if (filtros.enStock) count++
    return count
  }

  const limpiarFiltros = () => {
    // Resetear filtros a valores por defecto (excepto si hay slug de categoría)
    const filtrosLimpios = {
      busqueda: '',
      categorias: slug && categoriaActual ? [categoriaActual.id] : [], // Mantener categoría si viene de slug
      precioMin: 0,
      precioMax: 10000000,
      marcas: [],
      rating: 0,
      enStock: false
    }
    setFiltros(filtrosLimpios)
    
    // Limpiar URL params
    const params = new URLSearchParams()
    if (ordenar !== 'relevancia') {
      params.set('ordenar', ordenar)
    }
    if (vista !== 'grid') {
      params.set('vista', vista)
    }
    setSearchParams(params)
  }

  const sidebar = (
    <SidebarFiltros
      filtros={filtros}
      onFiltrosChange={handleFiltrosChange}
    />
  )

  const opcionesOrdenar = [
    { value: 'relevancia', label: 'Por defecto' },
    { value: 'popular', label: 'Popularidad' },
    { value: 'rating', label: 'Calificación promedio' },
    { value: 'nuevo', label: 'Más recientes' },
    { value: 'precio-menor', label: 'Precio: menor a mayor' },
    { value: 'precio-mayor', label: 'Precio: mayor a menor' }
  ]

  return (
    <>
      {/* Modal de Filtros Móvil */}
      {modalFiltrosAbierto && (
        <div className="modal-filtros-overlay">
          <div className="modal-filtros-container">
            {/* Header del modal */}
            <div className="modal-filtros-header">
              <h2>Filtros</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setModalFiltrosAbierto(false)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Header de Refine by */}
            <div className="modal-filtros-refine-header">
              <h3>Refinar por</h3>
              <button 
                className="clear-all-btn"
                onClick={() => handleFiltrosChange({
                  busqueda: '',
                  categorias: [],
                  precioMin: 0,
                  precioMax: 10000000,
                  marcas: [],
                  rating: 0,
                  enStock: false
                })}
              >
                Limpiar todo
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="modal-filtros-contenido">
              <SidebarFiltros
                filtros={filtros}
                onFiltrosChange={handleFiltrosChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ordenar Móvil */}
      {modalOrdenarAbierto && (
        <div className="modal-ordenar-overlay" onClick={() => setModalOrdenarAbierto(false)}>
          <div className="modal-ordenar-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-ordenar-header">
              <h3>Ordenar por</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setModalOrdenarAbierto(false)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Opciones */}
            <div className="modal-ordenar-opciones">
              {opcionesOrdenar.map((opcion) => (
                <button
                  key={opcion.value}
                  className={`opcion-ordenar ${ordenar === opcion.value ? 'activo' : ''}`}
                  onClick={() => {
                    handleOrdenarChange(opcion.value)
                    setModalOrdenarAbierto(false)
                  }}
                >
                  <span>{opcion.label}</span>
                  {ordenar === opcion.value && <Check size={20} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <LayoutTienda
        titulo="Tienda"
        sidebar={sidebar}
      >
      {/* Controles móviles */}
      <div className="tienda-controles-movil">
        <button 
          className="btn-filtros-movil"
          onClick={() => setModalFiltrosAbierto(true)}
        >
          <SlidersHorizontal size={20} />
          <span>Filtros</span>
        </button>
        <button 
          className="btn-ordenar-movil"
          onClick={() => setModalOrdenarAbierto(true)}
        >
          <span>Ordenar por: {opcionesOrdenar.find(o => o.value === ordenar)?.label || 'Por defecto'}</span>
        </button>
      </div>

      {/* Barra de resultados y vista */}
      <div className="tienda-barra-resultados">
        <div className="resultados-info">
          <span>{totalProductos > 0 ? `1-${Math.min(12, totalProductos)} de ${totalProductos}` : '0'} Resultados</span>
        </div>
        <div className="vista-botones-movil">
          <button
            onClick={() => handleVistaChange('grid')}
            className={`vista-btn-icono ${vista === 'grid' ? 'activo' : ''}`}
            title="Vista en cuadrícula"
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => handleVistaChange('lista')}
            className={`vista-btn-icono ${vista === 'lista' ? 'activo' : ''}`}
            title="Vista en lista"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Header de controles */}
      <div className="tienda-header">
        {/* Info de la categoría o tienda general */}
        <div className="tienda-info-categoria">
          {categoriaActual ? (
            <>
              {/* Badges superiores */}
              <div className="categoria-badges">
                {categoriaActual.productos_en_oferta > 0 && (
                  <span className="categoria-badge badge-ofertas">
                    <Flame size={14} />
                    {categoriaActual.productos_en_oferta} Ofertas Activas
                  </span>
                )}
                {categoriaActual.descuento_promedio > 0 && (
                  <span className="categoria-badge badge-descuento">
                    <TrendingUp size={14} />
                    Hasta {categoriaActual.descuento_promedio}% OFF
                  </span>
                )}
              </div>

              {/* Título y descripción */}
              <h1 className="tienda-titulo">{categoriaActual.nombre}</h1>
              <p className="tienda-descripcion">
                {categoriaActual.descripcion || `Explora nuestra selección de ${categoriaActual.nombre.toLowerCase()}`}
              </p>

              {/* Stats de la categoría */}
              <div className="categoria-stats">
                <div className="stat-item">
                  <Package size={18} />
                  <span><strong>{categoriaActual.total_productos}+</strong> Productos</span>
                </div>
                <div className="stat-item">
                  <Zap size={18} />
                  <span><strong>24h</strong> Envío Express</span>
                </div>
                <div className="stat-item">
                  <TrendingUp size={18} />
                  <span><strong>TOP</strong> Ventas</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="tienda-titulo">Todos los productos</h1>
              <p className="tienda-descripcion">
                Descubre nuestra colección completa con los mejores precios
              </p>
            </>
          )}
        </div>

        <div className="tienda-controles">
          {/* Filtros activos con botón para limpiar */}
          {contarFiltrosActivos() > 0 && (
            <div className="filtros-activos-grupo">
              <div className="filtros-activos">
                <SlidersHorizontal size={16} />
                <span>{contarFiltrosActivos()} filtro{contarFiltrosActivos() !== 1 ? 's' : ''} activo{contarFiltrosActivos() !== 1 ? 's' : ''}</span>
              </div>
              <button 
                onClick={limpiarFiltros}
                className="btn-limpiar-filtros"
                title="Limpiar todos los filtros"
              >
                <X size={16} />
                Limpiar
              </button>
            </div>
          )}

          {/* Ordenar */}
          <div className="control-grupo">
            <label htmlFor="ordenar">Ordenar por:</label>
            <select
              id="ordenar"
              value={ordenar}
              onChange={(e) => handleOrdenarChange(e.target.value)}
              className="control-select"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-menor">Precio: menor a mayor</option>
              <option value="precio-mayor">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="nuevo">Más recientes</option>
              <option value="popular">Más populares</option>
            </select>
          </div>

          {/* Vista */}
          <div className="control-grupo">
            <label>Vista:</label>
            <div className="vista-botones">
              <button
                onClick={() => handleVistaChange('grid')}
                className={`vista-btn ${vista === 'grid' ? 'activo' : ''}`}
                title="Vista en cuadrícula"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => handleVistaChange('lista')}
                className={`vista-btn ${vista === 'lista' ? 'activo' : ''}`}
                title="Vista en lista"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="tienda-productos">
        {totalProductos === 0 ? (
          <div className="tienda-empty">
            <div className="tienda-empty-icono">!</div>
            <h3 className="tienda-empty-titulo">No encontramos productos</h3>
            <p className="tienda-empty-desc">Ajusta los filtros o explora otras categorías</p>
            <div className="tienda-empty-acciones">
              <button className="btn-primario" onClick={() => navigate('/tienda')}>Ver todos los productos</button>
              <button className="btn-secundario" onClick={() => setModalFiltrosAbierto(true)}>Abrir filtros</button>
            </div>
          </div>
        ) : null}
        <GridProductosVendedor
          filtrosExternos={filtros}
          vistaActiva={vista}
          ordenar={ordenar}
          titulo=""
          mostrarHeader={false}
          mostrarFiltros={false}
          onTotalChange={setTotalProductos}
          mostrarEmpty={false}
        />
      </div>
    </LayoutTienda>
    </>
  )
}

export default PaginaTienda
