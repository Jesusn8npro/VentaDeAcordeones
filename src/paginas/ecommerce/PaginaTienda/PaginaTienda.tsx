'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useParams, useRouter, usePathname } from 'next/navigation'
import { useTituloPagina } from '../../../hooks/useTitulosPagina'
import DisposicionTienda from '../../../componentes/tienda/DisposicionTienda'
import PanelFiltros from '../../../componentes/tienda/PanelFiltros'
import GridProductosVendedor from '../../../componentes/producto/GridProductosVendedor'
import { ModalFiltrosMovil, ModalOrdenarMovil } from './ModalesTienda'
import { Grid, List, SlidersHorizontal } from 'lucide-react'
import { clienteSupabase } from '../../../configuracion/supabase'
import SkeletonCards from './SkeletonCards'
import EncabezadoTienda from './EncabezadoTienda'
import './PaginaTienda.css'

const PaginaTienda = () => {
  useTituloPagina('Tienda de Acordeones')
  const params = useParams() // Detectar slug de categorÃ­a
  const slug = params.slug as string | undefined
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
  
  // Estados para modales mÃ³viles
  const [modalFiltrosAbierto, setModalFiltrosAbierto] = useState(false)
  const [modalOrdenarAbierto, setModalOrdenarAbierto] = useState(false)

  useEffect(() => {
    const cargarCategoria = async () => {
      if (!slug || slug === 'undefined') {
        setCategoriaActual(null)
        setCargandoCategoria(false)
        return
      }

      try {
        setCargandoCategoria(true)
        const { data: categoria, error } = await clienteSupabase
          .from('categorias')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (error) throw error

        if (!categoria) {
          setCategoriaActual(null)
          setCargandoCategoria(false)
          return
        }

        // Contar productos de la categorÃ­a
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

        setCategoriaActual(categoriaConStats)

        setFiltros({
          busqueda: '',
          categorias: [categoria.id],
          precioMin: 0,
          precioMax: 10000000,
          marcas: [],
          rating: 0,
          enStock: false
        })

      } catch (error) {
        setCategoriaActual(null)
      } finally {
        setCargandoCategoria(false)
      }
    }

    cargarCategoria()
  }, [slug])

  useEffect(() => {
    if (slug) {
      setVista(searchParams.get('vista') || 'grid')
      setOrdenar(searchParams.get('ordenar') || 'relevancia')
      return
    }

    setFiltros({
      busqueda: searchParams.get('busqueda') || '',
      categorias: searchParams.get('categorias')?.split(',').filter(Boolean) || [],
      precioMin: parseInt(searchParams.get('precioMin')) || 0,
      precioMax: parseInt(searchParams.get('precioMax')) || 10000000,
      marcas: searchParams.get('marcas')?.split(',').filter(Boolean) || [],
      rating: parseInt(searchParams.get('rating')) || 0,
      enStock: searchParams.get('enStock') === 'true'
    })
    setVista(searchParams.get('vista') || 'grid')
    setOrdenar(searchParams.get('ordenar') || 'relevancia')
  }, [searchParams, slug])

  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros)
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
    router.push(pathname + '?' + params.toString())
  }

  const handleVistaChange = (nuevaVista) => {
    setVista(nuevaVista)
    const params = new URLSearchParams(searchParams)
    if (nuevaVista !== 'grid') {
      params.set('vista', nuevaVista)
    } else {
      params.delete('vista')
    }
    router.push(pathname + '?' + params.toString())
  }

  const handleOrdenarChange = (nuevoOrdenar) => {
    setOrdenar(nuevoOrdenar)
    
    const params = new URLSearchParams(searchParams)
    if (nuevoOrdenar !== 'relevancia') {
      params.set('ordenar', nuevoOrdenar)
    } else {
      params.delete('ordenar')
    }
    router.push(pathname + '?' + params.toString())
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
    const filtrosLimpios = {
      busqueda: '',
      categorias: slug && categoriaActual ? [categoriaActual.id] : [],
      precioMin: 0,
      precioMax: 10000000,
      marcas: [],
      rating: 0,
      enStock: false
    }
    setFiltros(filtrosLimpios)
    const params = new URLSearchParams()
    if (ordenar !== 'relevancia') {
      params.set('ordenar', ordenar)
    }
    if (vista !== 'grid') {
      params.set('vista', vista)
    }
    router.push(pathname + '?' + params.toString())
  }

  const opcionesOrdenar = [
    { value: 'relevancia', label: 'Por defecto' },
    { value: 'popular', label: 'Popularidad' },
    { value: 'rating', label: 'CalificaciÃ³n promedio' },
    { value: 'nuevo', label: 'MÃ¡s recientes' },
    { value: 'precio-menor', label: 'Precio: menor a mayor' },
    { value: 'precio-mayor', label: 'Precio: mayor a menor' }
  ]

  return (
    <>
      <ModalFiltrosMovil
        abierto={modalFiltrosAbierto}
        filtros={filtros}
        onCerrar={() => setModalFiltrosAbierto(false)}
        onFiltrosChange={handleFiltrosChange}
      />
      <ModalOrdenarMovil
        abierto={modalOrdenarAbierto}
        ordenar={ordenar}
        opciones={opcionesOrdenar}
        onCerrar={() => setModalOrdenarAbierto(false)}
        onOrdenarChange={handleOrdenarChange}
      />

      <DisposicionTienda
        titulo="Tienda"
        sidebar={<PanelFiltros filtros={filtros} onFiltrosChange={handleFiltrosChange} />}
      >
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

      <div className="tienda-barra-resultados">
        <div className="resultados-info">
          <span>{totalProductos > 0 ? `1-${Math.min(12, totalProductos)} de ${totalProductos}` : '0'} Resultados</span>
        </div>
        <div className="vista-botones-movil">
          <button
            onClick={() => handleVistaChange('grid')}
            className={`vista-btn-icono ${vista === 'grid' ? 'activo' : ''}`}
            title="Vista en cuadrÃ­cula"
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

      <EncabezadoTienda
        categoriaActual={categoriaActual}
        filtrosActivos={contarFiltrosActivos()}
        limpiarFiltros={limpiarFiltros}
        ordenar={ordenar}
        onOrdenarChange={handleOrdenarChange}
        vista={vista}
        onVistaChange={handleVistaChange}
      />

      {cargandoCategoria ? <SkeletonCards /> : <div className="tienda-productos">
        {totalProductos === 0 ? (
          <div className="tienda-empty">
            <div className="tienda-empty-icono">!</div>
            <h3 className="tienda-empty-titulo">No encontramos productos</h3>
            <p className="tienda-empty-desc">Ajusta los filtros o explora otras categorÃ­as</p>
            <div className="tienda-empty-acciones">
              <button className="btn-primario" onClick={() => router.push('/tienda')}>Ver todos los productos</button>
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
      </div>}
    </DisposicionTienda>
    </>
  )
}

export default PaginaTienda
