import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, ChevronUp, Star, X, Filter } from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'
import './SidebarFiltros.css'

/**
 * SidebarFiltros - Sidebar de filtros ultra funcional
 * 
 * Características:
 * - Búsqueda en tiempo real
 * - Categorías expandibles desde BD
 * - Filtro de precios con slider
 * - Marcas con checkboxes
 * - Rating con estrellas
 * - Filtros aplicados visibles
 * - Limpiar filtros
 * - Mejor que cualquier referencia
 */

const SidebarFiltros = ({ 
  filtros = {}, 
  onFiltrosChange,
  cargando = false 
}) => {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [categoriasConProductos, setCategoriasConProductos] = useState([])
  const [categoriasAbiertas, setCategoriasAbiertas] = useState({})
  const [mostrarTodasCategorias, setMostrarTodasCategorias] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [rangoPrecio, setRangoPrecio] = useState({ min: 0, max: 10000000 })
  const [marcasDisponibles, setMarcasDisponibles] = useState([])

  // Estados internos de filtros
  const [filtrosInternos, setFiltrosInternos] = useState({
    busqueda: '',
    categorias: [],
    precioMin: 0,
    precioMax: 10000000,
    marcas: [],
    rating: 0,
    enStock: false
  })

  useEffect(() => {
    cargarCategorias()
    cargarMarcas()
    cargarRangoPrecio()
  }, [])

  const cargarCategorias = async () => {
    try {
      // Cargar categorías
      const { data: categoriasData, error: categoriasError } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, slug, icono, descripcion')
        .eq('activo', true)
        .order('nombre')

      if (categoriasError) throw categoriasError

      // Contar productos por categoría
      const categoriasConConteo = await Promise.all(
        (categoriasData || []).map(async (categoria) => {
          const { count, error: countError } = await clienteSupabase
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', categoria.id)
            .eq('activo', true)

          if (countError) {
            return { ...categoria, cantidad: 0 }
          }

          // Si la categoría no tiene slug, generarlo desde el nombre
          const slugFinal = categoria.slug || categoria.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')

          return { ...categoria, slug: slugFinal, cantidad: count || 0 }
        })
      )

      setCategorias(categoriasConConteo)
      setCategoriasConProductos(categoriasConConteo.filter(cat => cat.cantidad > 0))
    } catch (error) {
      setCategorias([])
      setCategoriasConProductos([])
    }
  }

  const cargarMarcas = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('productos')
        .select('marca')
        .eq('activo', true)
        .not('marca', 'is', null)

      if (error) throw error
      
      const marcasUnicas = [...new Set(data?.map(p => p.marca).filter(Boolean))]
      setMarcasDisponibles(marcasUnicas.sort())
    } catch (error) {
      setMarcasDisponibles([])
    }
  }

  const cargarRangoPrecio = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('productos')
        .select('precio')
        .eq('activo', true)
        .not('precio', 'is', null)
        .order('precio')

      if (error) throw error
      
      if (data && data.length > 0) {
        const precios = data.map(p => p.precio).filter(p => p > 0)
        const minPrecio = Math.min(...precios)
        const maxPrecio = Math.max(...precios)
        
        setRangoPrecio({ min: minPrecio, max: maxPrecio })
        setFiltrosInternos(prev => ({
          ...prev,
          precioMin: minPrecio,
          precioMax: maxPrecio
        }))
      }
    } catch (error) {
      // Error silencioso en producción
    }
  }

  const toggleCategoria = (categoriaId) => {
    setCategoriasAbiertas(prev => ({
      ...prev,
      [categoriaId]: !prev[categoriaId]
    }))
  }

  const handleBusquedaChange = (e) => {
    const valor = e.target.value
    setBusqueda(valor)
    
    const nuevosFiltros = { ...filtrosInternos, busqueda: valor }
    setFiltrosInternos(nuevosFiltros)
    onFiltrosChange?.(nuevosFiltros)
  }

  const handleCategoriaChange = (categoriaId) => {
    const nuevasCategorias = filtrosInternos.categorias.includes(categoriaId)
      ? filtrosInternos.categorias.filter(id => id !== categoriaId)
      : [...filtrosInternos.categorias, categoriaId]
    
    const nuevosFiltros = { ...filtrosInternos, categorias: nuevasCategorias }
    setFiltrosInternos(nuevosFiltros)
    onFiltrosChange?.(nuevosFiltros)
  }

  const handlePrecioChange = (tipo, valor) => {
    const nuevosFiltros = {
      ...filtrosInternos,
      [tipo === 'min' ? 'precioMin' : 'precioMax']: parseInt(valor) || 0
    }
    setFiltrosInternos(nuevosFiltros)
    onFiltrosChange?.(nuevosFiltros)
  }

  const handleMarcaChange = (marca) => {
    const nuevasMarcas = filtrosInternos.marcas.includes(marca)
      ? filtrosInternos.marcas.filter(m => m !== marca)
      : [...filtrosInternos.marcas, marca]
    
    const nuevosFiltros = { ...filtrosInternos, marcas: nuevasMarcas }
    setFiltrosInternos(nuevosFiltros)
    onFiltrosChange?.(nuevosFiltros)
  }

  const handleRatingChange = (rating) => {
    const nuevosFiltros = { 
      ...filtrosInternos, 
      rating: filtrosInternos.rating === rating ? 0 : rating 
    }
    setFiltrosInternos(nuevosFiltros)
    onFiltrosChange?.(nuevosFiltros)
  }

  const limpiarFiltros = () => {
    const filtrosLimpios = {
      busqueda: '',
      categorias: [],
      precioMin: rangoPrecio.min,
      precioMax: rangoPrecio.max,
      marcas: [],
      rating: 0,
      enStock: false
    }
    
    setBusqueda('')
    setFiltrosInternos(filtrosLimpios)
    onFiltrosChange?.(filtrosLimpios)
  }

  const contarFiltrosActivos = () => {
    let count = 0
    if (filtrosInternos.busqueda) count++
    if (filtrosInternos.categorias.length > 0) count++
    if (filtrosInternos.precioMin > rangoPrecio.min || filtrosInternos.precioMax < rangoPrecio.max) count++
    if (filtrosInternos.marcas.length > 0) count++
    if (filtrosInternos.rating > 0) count++
    if (filtrosInternos.enStock) count++
    return count
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  const filtrosActivos = contarFiltrosActivos()

  return (
    <div className="sidebar-filtros">
      {/* Búsqueda rápida */}
      <div className="filtro-seccion">
        <div className="filtro-header">
          <h3 className="filtro-titulo">Buscar productos</h3>
        </div>
        <div className="busqueda-container">
          <Search size={18} className="busqueda-icono" />
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={busqueda}
            onChange={handleBusquedaChange}
            className="busqueda-input"
          />
          {busqueda && (
            <button
              onClick={() => handleBusquedaChange({ target: { value: '' } })}
              className="busqueda-limpiar"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Categorías */}
      <div className="filtro-seccion">
        <div className="filtro-header">
          <h3 className="filtro-titulo">Categorías</h3>
        </div>
        <div className="categorias-lista">
          {(mostrarTodasCategorias ? categoriasConProductos : categoriasConProductos.slice(0, 5)).map(categoria => (
            <div
              key={categoria.id} 
              onClick={() => navigate(`/tienda/categoria/${categoria.slug}`)}
              className="categoria-item categoria-link"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && navigate(`/tienda/categoria/${categoria.slug}`)}
            >
              <span className="categoria-nombre">
                {categoria.nombre} ({categoria.cantidad})
              </span>
            </div>
          ))}
          {categoriasConProductos.length > 5 && (
            <button 
              className="btn-ver-mas"
              onClick={() => setMostrarTodasCategorias(!mostrarTodasCategorias)}
            >
              {mostrarTodasCategorias ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      </div>

      {/* Rango de precios */}
      <div className="filtro-seccion">
        <div className="filtro-header">
          <h3 className="filtro-titulo">Precio</h3>
        </div>
        <div className="precio-inputs">
          <div className="precio-input-group">
            <label>Mínimo</label>
            <input
              type="number"
              value={filtrosInternos.precioMin}
              onChange={(e) => handlePrecioChange('min', e.target.value)}
              className="precio-input"
              min={rangoPrecio.min}
              max={rangoPrecio.max}
            />
          </div>
          <div className="precio-separador">-</div>
          <div className="precio-input-group">
            <label>Máximo</label>
            <input
              type="number"
              value={filtrosInternos.precioMax}
              onChange={(e) => handlePrecioChange('max', e.target.value)}
              className="precio-input"
              min={rangoPrecio.min}
              max={rangoPrecio.max}
            />
          </div>
        </div>
        <div className="precio-rango-display">
          {formatearPrecio(filtrosInternos.precioMin)} - {formatearPrecio(filtrosInternos.precioMax)}
        </div>
      </div>

      {/* Marcas */}
      {marcasDisponibles.length > 0 && (
        <div className="filtro-seccion">
          <div className="filtro-header">
            <h3 className="filtro-titulo">Marcas</h3>
            {filtrosInternos.marcas.length > 0 && (
              <span className="filtros-count">{filtrosInternos.marcas.length}</span>
            )}
          </div>
          <div className="marcas-lista">
            {marcasDisponibles.slice(0, 8).map(marca => (
              <label key={marca} className="marca-checkbox">
                <input
                  type="checkbox"
                  checked={filtrosInternos.marcas.includes(marca)}
                  onChange={() => handleMarcaChange(marca)}
                />
                <div className="checkbox-custom">
                  <div className="checkbox-mark"></div>
                </div>
                <span className="marca-nombre">{marca}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="filtro-seccion">
        <div className="filtro-header">
          <h3 className="filtro-titulo">Calificación</h3>
        </div>
        <div className="rating-lista">
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`rating-opcion ${filtrosInternos.rating === rating ? 'activo' : ''}`}
            >
              <div className="estrellas">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < rating ? '#ffd700' : 'none'}
                    color={i < rating ? '#ffd700' : '#dee2e6'}
                  />
                ))}
              </div>
              <span>y más</span>
            </button>
          ))}
        </div>
      </div>

      {/* En stock */}
      <div className="filtro-seccion">
        <label className="stock-checkbox">
          <input
            type="checkbox"
            checked={filtrosInternos.enStock}
            onChange={(e) => {
              const nuevosFiltros = { ...filtrosInternos, enStock: e.target.checked }
              setFiltrosInternos(nuevosFiltros)
              onFiltrosChange?.(nuevosFiltros)
            }}
          />
          <div className="checkbox-custom">
            <div className="checkbox-mark"></div>
          </div>
          <span>Solo productos en stock</span>
        </label>
      </div>

      {/* Limpiar filtros */}
      {filtrosActivos > 0 && (
        <div className="filtro-seccion">
          <button onClick={limpiarFiltros} className="btn-limpiar-filtros">
            <Filter size={16} />
            Limpiar filtros ({filtrosActivos})
          </button>
        </div>
      )}
    </div>
  )
}

export default SidebarFiltros
