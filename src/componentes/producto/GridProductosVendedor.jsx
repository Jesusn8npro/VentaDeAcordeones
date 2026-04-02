import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../configuracion/supabase'
import TarjetaProductoLujo from './TarjetaProductoLujo'
import { Filter, Grid, List, ChevronDown, Loader, AlertCircle, Zap, Flame, TrendingUp } from 'lucide-react'
import './GridProductosVendedor.css'

// 🚀 OPTIMIZACIÓN DE IMÁGENES ACTIVADA
import ImagenOptimizada from '../ImagenOptimizada'

/**
 * GridProductosVendedor - Grid ultra vendedor de productos estilo Temu/Shein
 * 
 * Características:
 * - Filtros avanzados y ordenamiento
 * - Carga dinámica de productos desde Supabase
 * - Responsive grid con diferentes tamaños
 * - Animaciones y efectos vendedores
 * - Paginación infinita opcional
 * - Estados de carga y error
 */

const GridProductosVendedor = ({
  categoriaId = null,
  limite = 12,
  mostrarFiltros = true,
  mostrarOrdenamiento = true,
  mostrarHeader = true,
  columnas = { desktop: 4, tablet: 3, mobile: 2 },
  paginacionInfinita = false,
  titulo = "Productos Destacados",
  subtitulo = "Los mejores precios y ofertas increíbles",
  filtrosExternos = null,
  vistaActiva = 'grid',
  ordenar = 'relevancia',
  onTotalChange = null,
  mostrarEmpty = true
}) => {
  // Estados
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({
    categoria: categoriaId || '',
    precioMin: '',
    precioMax: '',
    ordenar: 'destacados',
    soloOfertas: false,
    soloStock: true
  })
  const [categorias, setCategorias] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalProductos, setTotalProductos] = useState(0)
  const [mostrarFiltrosMovil, setMostrarFiltrosMovil] = useState(false)

  // Usar filtros externos o internos
  const filtrosActivos = filtrosExternos || filtros

  // Cargar productos
  useEffect(() => {
    cargarProductos()
  }, [filtrosExternos, filtros, paginaActual, ordenar])

  // Cargar categorías
  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError(null)

      let query = clienteSupabase
        .from('productos')
        .select(`
          *,
          categorias (
            id,
            nombre,
            icono
          ),
          producto_imagenes (
            imagen_principal,
            imagen_secundaria_1,
            imagen_secundaria_2,
            imagen_secundaria_3,
            imagen_secundaria_4
          )
        `, { count: 'exact' })
        .eq('activo', true)
        .or('stock.gt.0,estado.eq.vendido') // Productos con stock O productos vendidos

      // Aplicar filtros externos (desde PaginaTienda)
      if (filtrosExternos) {
        // Categorías - PRIORIDAD MÁXIMA
        if (filtrosExternos.categorias && filtrosExternos.categorias.length > 0) {
          query = query.in('categoria_id', filtrosExternos.categorias)
        }
        
        // Búsqueda por texto
        if (filtrosExternos.busqueda) {
          query = query.or(`nombre.ilike.%${filtrosExternos.busqueda}%,descripcion.ilike.%${filtrosExternos.busqueda}%`)
        }

        // Rango de precios
        if (filtrosExternos.precioMin > 0) {
          query = query.gte('precio', filtrosExternos.precioMin)
        }
        if (filtrosExternos.precioMax < 10000000) {
          query = query.lte('precio', filtrosExternos.precioMax)
        }

        // Marcas
        if (filtrosExternos.marcas && filtrosExternos.marcas.length > 0) {
          query = query.in('marca', filtrosExternos.marcas)
        }

        // Stock
        if (filtrosExternos.enStock) {
          query = query.gt('stock', 0)
        }
      } else {
        // Filtros internos (modo legacy)
        if (filtrosActivos.categoria) {
          query = query.eq('categoria_id', filtrosActivos.categoria)
        }

        if (filtrosActivos.precioMin) {
          query = query.gte('precio', parseFloat(filtrosActivos.precioMin))
        }

        if (filtrosActivos.precioMax) {
          query = query.lte('precio', parseFloat(filtrosActivos.precioMax))
        }

        if (filtrosActivos.soloOfertas) {
          query = query.not('precio_original', 'is', null)
        }

        if (filtrosActivos.soloStock) {
          query = query.gt('stock', 0)
        }
      }

      // Aplicar ordenamiento
      const ordenarActivo = ordenar || filtrosActivos.ordenar
      switch (ordenarActivo) {
        case 'nuevos':
          query = query.order('creado_el', { ascending: false })
          break
        case 'precio-menor':
        case 'precio_asc':
          query = query.order('precio', { ascending: true })
          break
        case 'precio-mayor':
        case 'precio_desc':
          query = query.order('precio', { ascending: false })
          break
        case 'nombre':
          query = query.order('nombre', { ascending: true })
          break
        case 'nuevo':
        case 'fecha':
          query = query.order('creado_el', { ascending: false })
          break
        case 'popular':
          query = query.order('destacado', { ascending: false })
          break
        case 'relevancia':
        case 'destacados':
        default:
          query = query.order('destacado', { ascending: false })
                      .order('creado_el', { ascending: false })
          break
      }

      // Paginación
      const desde = (paginaActual - 1) * limite
      query = query.range(desde, desde + limite - 1)

      const { data, error: errorQuery, count } = await query

      if (errorQuery) {
        throw errorQuery
      }

      // ✅ PROCESAR IMÁGENES DE GOOGLE DRIVE
      const productosConImagenes = (data || []).map(producto => {
        const imagenesReales = []
        
        // Si tiene producto_imagenes, procesarlas
        if (producto.producto_imagenes && producto.producto_imagenes.length > 0) {
          const imagenes = producto.producto_imagenes[0]
          
          // Agregar imágenes en orden de prioridad
          if (imagenes.imagen_principal) imagenesReales.push(imagenes.imagen_principal)
          if (imagenes.imagen_secundaria_1) imagenesReales.push(imagenes.imagen_secundaria_1)
          if (imagenes.imagen_secundaria_2) imagenesReales.push(imagenes.imagen_secundaria_2)
          if (imagenes.imagen_secundaria_3) imagenesReales.push(imagenes.imagen_secundaria_3)
          if (imagenes.imagen_secundaria_4) imagenesReales.push(imagenes.imagen_secundaria_4)
        }
        
        // Si no hay imágenes reales, usar fotos_principales del producto
        if (imagenesReales.length === 0 && producto.fotos_principales && producto.fotos_principales.length > 0) {
          imagenesReales.push(...producto.fotos_principales)
        }
        
        // Retornar producto con las imágenes convertidas en fotos_principales
        return {
          ...producto,
          fotos_principales: imagenesReales.length > 0 ? imagenesReales : producto.fotos_principales
        }
      })

      if (paginacionInfinita && paginaActual > 1) {
        setProductos(prev => [...prev, ...productosConImagenes])
      } else {
        setProductos(productosConImagenes)
      }

      const total = count || 0
      setTotalProductos(total)
      if (onTotalChange) {
        onTotalChange(total)
      }

    } catch (error) {
      setError('Error al cargar los productos. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const cargarCategorias = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, icono')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (error) throw error

      setCategorias(data || [])
    } catch (error) {
      // Error silencioso para producción
    }
  }

  const aplicarFiltro = (nuevoFiltro) => {
    setFiltros(prev => ({ ...prev, ...nuevoFiltro }))
    setPaginaActual(1)
    if (!paginacionInfinita) {
      setProductos([])
    }
  }

  const limpiarFiltros = () => {
    setFiltros({
      categoria: '',
      precioMin: '',
      precioMax: '',
      ordenar: 'destacados',
      soloOfertas: false,
      soloStock: true
    })
    setPaginaActual(1)
  }

  const cargarMasProductos = () => {
    if (!cargando && productos.length < totalProductos) {
      setPaginaActual(prev => prev + 1)
    }
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  if (error) {
    return (
      <div className="grid-productos-error">
        <AlertCircle size={48} />
        <h3>¡Ups! Algo salió mal</h3>
        <p>{error}</p>
        <button onClick={cargarProductos} className="btn-reintentar">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="grid-productos-vendedor">
      {/* Header con título y controles */}
      {mostrarHeader && (
      <div className="grid-header">
        <div className="titulo-seccion">
        <h2 className="titulo-principal">
          <Flame className="titulo-icono" />
          {titulo}
        </h2>
          <p className="subtitulo">{subtitulo}</p>
        </div>

        <div className="controles-header">
          {mostrarOrdenamiento && (
            <div className="ordenamiento">
              <select
                value={filtros.ordenar}
                onChange={(e) => aplicarFiltro({ ordenar: e.target.value })}
                className="select-ordenar"
              >
                <option value="destacados">🔥 Más Destacados</option>
                <option value="precio_asc">💰 Menor Precio</option>
                <option value="precio_desc">💎 Mayor Precio</option>
                <option value="fecha">🆕 Más Recientes</option>
                <option value="nombre">📝 Por Nombre</option>
              </select>
            </div>
          )}

          {/* Vista toggle - Solo mostrar si NO hay control externo */}
          {!filtrosExternos && (
            <div className="vista-toggle">
              <button
                className={`vista-btn ${vistaActiva === 'grid' ? 'activo' : ''}`}
                onClick={() => {/* Controlado externamente */}}
                title="Vista en cuadrícula"
              >
                <Grid size={20} />
              </button>
              <button
                className={`vista-btn ${vistaActiva === 'lista' ? 'activo' : ''}`}
                onClick={() => {/* Controlado externamente */}}
                title="Vista en lista"
              >
                <List size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Filtros */}
      {mostrarFiltros && !filtrosExternos && (
        <>
          {/* Botón filtros móvil */}
          <button
            className="filtros-movil-toggle"
            onClick={() => setMostrarFiltrosMovil(!mostrarFiltrosMovil)}
          >
            <Filter size={20} />
            Filtros
            <ChevronDown className={mostrarFiltrosMovil ? 'rotado' : ''} />
          </button>

          <div className={`filtros-container ${mostrarFiltrosMovil ? 'visible' : ''}`}>
            <div className="filtros-grid">
              {/* Filtro por categoría */}
              <div className="filtro-grupo">
                <label>Categoría</label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => aplicarFiltro({ categoria: e.target.value })}
                  className="filtro-select"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.icono} {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por precio */}
              <div className="filtro-grupo">
                <label>Precio mínimo</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filtros.precioMin}
                  onChange={(e) => aplicarFiltro({ precioMin: e.target.value })}
                  className="filtro-input"
                />
              </div>

              <div className="filtro-grupo">
                <label>Precio máximo</label>
                <input
                  type="number"
                  placeholder="Sin límite"
                  value={filtros.precioMax}
                  onChange={(e) => aplicarFiltro({ precioMax: e.target.value })}
                  className="filtro-input"
                />
              </div>

              {/* Filtros especiales */}
              <div className="filtro-grupo">
                <label className="filtro-checkbox">
                  <input
                    type="checkbox"
                    checked={filtros.soloOfertas}
                    onChange={(e) => aplicarFiltro({ soloOfertas: e.target.checked })}
                  />
                  <span className="checkmark"></span>
                  Solo ofertas
                </label>
              </div>

              <div className="filtro-grupo">
                <label className="filtro-checkbox">
                  <input
                    type="checkbox"
                    checked={filtros.soloStock}
                    onChange={(e) => aplicarFiltro({ soloStock: e.target.checked })}
                  />
                  <span className="checkmark"></span>
                  Solo disponibles
                </label>
              </div>

              <div className="filtro-grupo">
                <button onClick={limpiarFiltros} className="btn-limpiar">
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </>
      )}


      {/* Grid de productos */}
      <div className={`productos-grid ${vistaActiva === 'grid' ? 'vista-grid' : 'vista-lista'}`}>
        {cargando && productos.length === 0 ? (
          <div className="cargando-productos">
            <Loader className="spinner" />
            <p>Cargando productos increíbles...</p>
          </div>
        ) : productos.length === 0 ? (
          mostrarEmpty ? (
            <div className="sin-productos">
              <AlertCircle size={48} />
              <h3>No encontramos productos</h3>
              <p>Intenta ajustar los filtros o buscar algo diferente</p>
              <button onClick={limpiarFiltros} className="btn-limpiar-grande">
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="sin-productos-compacto" />
          )
        ) : (
          <>
            {productos.map((producto, index) => (
              <TarjetaProductoLujo
                key={producto.id}
                producto={producto}
              />
            ))}
          </>
        )}
      </div>

      {/* Carga más productos */}
      {paginacionInfinita && productos.length < totalProductos && (
        <div className="cargar-mas-container">
          <button
            onClick={cargarMasProductos}
            disabled={cargando}
            className="btn-cargar-mas"
          >
            {cargando ? (
              <>
                <Loader className="spinner-pequeño" />
                Cargando más...
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                Ver más productos ({totalProductos - productos.length} restantes)
              </>
            )}
          </button>
        </div>
      )}

      {/* Paginación tradicional */}
      {!paginacionInfinita && totalProductos > limite && (
        <div className="paginacion">
          <button
            onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
            disabled={paginaActual === 1 || cargando}
            className="btn-paginacion"
          >
            Anterior
          </button>
          
          <span className="info-paginacion">
            Página {paginaActual} de {Math.ceil(totalProductos / limite)}
          </span>
          
          <button
            onClick={() => setPaginaActual(prev => prev + 1)}
            disabled={productos.length < limite || cargando}
            className="btn-paginacion"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default GridProductosVendedor
