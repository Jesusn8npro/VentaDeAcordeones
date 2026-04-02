import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, Grid, List, ShoppingCart, Eye, Trash2, Star } from 'lucide-react'
import { useFavoritos } from '../../../contextos/FavoritosContext'
import TarjetaProductoLujo from '../../../componentes/producto/TarjetaProductoLujo'
import './PaginaFavoritos.css'

const PaginaFavoritos = () => {
  const { favoritos, quitarFavorito, cargando } = useFavoritos()
  const [busqueda, setBusqueda] = useState('')
  const [ordenamiento, setOrdenamiento] = useState('recientes')
  const [vistaActual, setVistaActual] = useState('grid')
  const [paginaActual, setPaginaActual] = useState(1)
  const productosPorPagina = 12

  // 🔍 LOGS DE DEBUGGING
  console.log('🚀 PaginaFavoritos - Renderizando componente')
  console.log('📦 Favoritos del contexto:', favoritos)
  console.log('📊 Cantidad de favoritos:', favoritos?.length || 0)
  console.log('🔍 Búsqueda actual:', busqueda)
  console.log('📋 Ordenamiento actual:', ordenamiento)

  // Filtrar y ordenar favoritos
  const favoritosFiltrados = useMemo(() => {
    console.log('🔄 Procesando filtros y ordenamiento...')
    
    if (!favoritos || favoritos.length === 0) {
      console.log('❌ No hay favoritos para procesar')
      return []
    }
    
    console.log('✅ Favoritos disponibles para filtrar:', favoritos.length)
    
    // Primero eliminar duplicados por producto_id conservando el más reciente
    const ordenadosBase = [...favoritos].sort((a, b) => {
      const fa = new Date(a?.created_at || a?.fecha_agregado || 0)
      const fb = new Date(b?.created_at || b?.fecha_agregado || 0)
      return fb - fa
    })
    const mapa = new Map()
    for (const item of ordenadosBase) {
      const key = item.producto_id || item.id
      if (!mapa.has(key)) mapa.set(key, item)
    }
    const baseSinDuplicados = Array.from(mapa.values())
    console.log('🧹 Dedupe aplicado. Restantes:', baseSinDuplicados.length)

    const query = busqueda.trim().toLowerCase()
    
    // Filtrar por búsqueda usando campos reales de vista_favoritos
    let filtrados = baseSinDuplicados.filter((favorito) => {
      const nombre = (favorito.producto_nombre || favorito.nombre || '').toLowerCase()
      const descripcion = (favorito.producto_descripcion || favorito.descripcion || '').toLowerCase()
      if (!query) return true
      return nombre.includes(query) || descripcion.includes(query)
    })
    
    console.log('🔍 Después del filtro de búsqueda:', filtrados.length)
    
    // Ordenar
    switch (ordenamiento) {
      case 'nombre':
        filtrados.sort((a, b) => (a.producto_nombre || a.nombre || '').localeCompare(b.producto_nombre || b.nombre || ''))
        break
      case 'precio_asc':
        filtrados.sort((a, b) => (a.precio || 0) - (b.precio || 0))
        break
      case 'precio_desc':
        filtrados.sort((a, b) => (b.precio || 0) - (a.precio || 0))
        break
      case 'recientes':
      default: {
        const getFecha = (x) => new Date(x?.created_at || x?.fecha_agregado || 0)
        filtrados.sort((a, b) => getFecha(b) - getFecha(a))
        break
      }
    }
    
    console.log('📋 Después del ordenamiento:', filtrados.length)
    console.log('📋 Favoritos filtrados:', filtrados)
    
    return filtrados
  }, [favoritos, busqueda, ordenamiento])

  // Paginación
  const totalPaginas = Math.ceil(favoritosFiltrados.length / productosPorPagina)
  const indiceInicio = (paginaActual - 1) * productosPorPagina
  const indiceFin = indiceInicio + productosPorPagina
  const favoritosPaginados = favoritosFiltrados.slice(indiceInicio, indiceFin)

  console.log('📄 Paginación:')
  console.log('  - Total páginas:', totalPaginas)
  console.log('  - Página actual:', paginaActual)
  console.log('  - Índice inicio:', indiceInicio)
  console.log('  - Índice fin:', indiceFin)
  console.log('  - Favoritos paginados:', favoritosPaginados.length)
  console.log('  - Datos paginados:', favoritosPaginados)

  const manejarEliminarFavorito = (productoId) => {
    quitarFavorito(productoId)
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
  }



  // Función para generar slug válido desde el nombre
  const generarSlugDesdeNombre = (nombre, id) => {
    if (!nombre) return `producto-${id}`
    
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones múltiples
      .replace(/^-|-$/g, '') // Remover guiones al inicio y final
      || `producto-${id}` // Fallback si el resultado está vacío
  }

  const convertirFavoritoAProducto = (favorito) => {
    console.log('🔍 Convirtiendo favorito:', favorito)
    
    // Procesar imágenes directamente desde la vista_favoritos
    const imagenesReales = []
    
    // Agregar imagen principal si existe
    if (favorito.imagen_principal) {
      imagenesReales.push(favorito.imagen_principal)
    }
    
    // Agregar imágenes secundarias si existen
    if (favorito.imagen_secundaria_1) {
      imagenesReales.push(favorito.imagen_secundaria_1)
    }
    
    if (favorito.imagen_secundaria_2) {
      imagenesReales.push(favorito.imagen_secundaria_2)
    }
    
    if (favorito.imagen_secundaria_3) {
      imagenesReales.push(favorito.imagen_secundaria_3)
    }
    
    if (favorito.imagen_secundaria_4) {
      imagenesReales.push(favorito.imagen_secundaria_4)
    }
    
    // Calcular descuento si no está presente
    const descuentoCalculado = favorito.descuento || (favorito.precio_original > favorito.precio 
      ? Math.round(((favorito.precio_original - favorito.precio) / favorito.precio_original) * 100)
      : 0)
    
    const productoConvertido = {
      id: favorito.producto_id,
      nombre: favorito.producto_nombre || 'Producto sin nombre',
      slug: favorito.slug || generarSlugDesdeNombre(favorito.producto_nombre || favorito.nombre, favorito.producto_id || favorito.id),
      precio: favorito.precio || 0,
      precio_original: favorito.precio_original || favorito.precio || 0,
      descuento: descuentoCalculado,
      stock: favorito.stock || 1,
      fotos_principales: imagenesReales.length > 0 ? imagenesReales : [],
      categoria: favorito.categoria_nombre || 'General',
      vendedor_nombre: 'Tienda Oficial',
      vendedor_id: null,
      fecha_creacion: favorito.created_at || favorito.fecha_agregado || new Date().toISOString(),
      estado: favorito.producto_activo ? 'activo' : 'inactivo',
      descripcion: favorito.producto_descripcion || favorito.descripcion || ''
    }
    
    console.log('✅ Producto convertido:', productoConvertido)
    return productoConvertido
  }

  if (cargando) {
    return (
      <div className="favoritos-cargando">
        <div className="spinner-favoritos"></div>
        <p>Cargando favoritos...</p>
      </div>
    )
  }

  return (
    <div className="pagina-favoritos">
      {/* Hero Section */}
      <div className="favoritos-hero">
        <div className="favoritos-hero-contenido">
          <div className="favoritos-hero-texto">
            <div className="favoritos-hero-badge">
              <Heart className="icono-badge" />
              <span>Lista de Deseos</span>
            </div>
            <h1>Tus Productos Favoritos</h1>
            <p>Guarda y organiza los productos que más te gustan. Mantén un registro de todo lo que deseas comprar y no pierdas de vista esas ofertas especiales.</p>
            <div className="favoritos-estadisticas">
              <div className="estadistica">
                <span className="numero">{favoritos.length}</span>
                <span className="etiqueta">Productos guardados</span>
              </div>
              <div className="estadistica">
                <span className="numero">{favoritos.filter(f => f.precio).length}</span>
                <span className="etiqueta">Con precio</span>
              </div>
            </div>
          </div>
          <div className="favoritos-hero-visual">
            <div className="favoritos-hero-cards">
              <div className="hero-card card-1">
                <Heart className="card-icon" />
                <span>Guarda</span>
              </div>
              <div className="hero-card card-2">
                <ShoppingCart className="card-icon" />
                <span>Compra</span>
              </div>
              <div className="hero-card card-3">
                <Star className="card-icon" />
                <span>Disfruta</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {favoritos.length === 0 ? (
        <div className="favoritos-vacio">
          <div className="favoritos-vacio-contenido">
            <Heart className="favoritos-vacio-icono" />
            <h2>No tienes favoritos aún</h2>
            <p>Explora nuestros productos y guarda tus favoritos aquí</p>
            <Link to="/tienda" className="boton-explorar">
              Explorar productos
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="favoritos-herramientas">
            <div className="favoritos-toolbar-izquierda">
              <div className="busqueda-favoritos">
                <Search className="icono-busqueda" />
                <input
                  type="text"
                  placeholder="Buscar en favoritos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="favoritos-toolbar-derecha">
              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                className="selector-ordenamiento"
              >
                <option value="recientes">Más recientes</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="precio_asc">Precio menor a mayor</option>
                <option value="precio_desc">Precio mayor a menor</option>
              </select>

              <div className="controles-vista">
                <button
                  className={`boton-vista ${vistaActual === 'grid' ? 'activo' : ''}`}
                  onClick={() => setVistaActual('grid')}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={`boton-vista ${vistaActual === 'list' ? 'activo' : ''}`}
                  onClick={() => setVistaActual('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>



          <div className={`favoritos-contenido ${vistaActual}`}>
            {favoritosPaginados.length === 0 ? (
              <div className="favoritos-sin-resultados">
                <Heart className="icono-sin-resultados" />
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar tu búsqueda o explorar más productos</p>
              </div>
            ) : (
              favoritosPaginados.map((favorito) => {
                const productoConvertido = convertirFavoritoAProducto(favorito)
                console.log(`🎨 Renderizando producto convertido:`, productoConvertido)
                return (
                  <TarjetaProductoLujo
                    key={favorito.producto_id || favorito.id}
                    producto={productoConvertido}
                  />
                )
              })
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="favoritos-paginacion">
              <button
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="boton-paginacion"
              >
                Anterior
              </button>
              
              <div className="numeros-pagina">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                  <button
                    key={numero}
                    onClick={() => setPaginaActual(numero)}
                    className={`numero-pagina ${paginaActual === numero ? 'activo' : ''}`}
                  >
                    {numero}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="boton-paginacion"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PaginaFavoritos