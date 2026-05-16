import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { Plus, Search, AlertCircle, Trash2 } from 'lucide-react'
import ModalCategoria from './ModalCategoria'
import PanelAsignacionProductos from './PanelAsignacionProductos'
import GridCategorias from './GridCategorias'
import EstadisticasCategorias from './EstadisticasCategorias'
import { useImagenCategoria } from './useImagenCategoria'
import { useDragDropCategorias } from './useDragDropCategorias'
import './Categorias.css'
import './CategoriasExtra.css'

const Categorias = () => {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaProductos, setBusquedaProductos] = useState('')
  const [soloSinCategoria, setSoloSinCategoria] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    slug: '',
    imagen_url: '',
    icono: '',
    activo: true,
    destacado: false,
    orden: 0
  })

  // Bulk selection
  const [seleccionadas, setSeleccionadas] = useState<(string | number)[]>([])
  const [eliminandoMasivo, setEliminandoMasivo] = useState(false)

  const {
    dragOverCategoriaId,
    setDragOverCategoriaId,
    manejarDragInicio,
    manejarDropEnCategoria,
    manejarDropSinCategoria,
    registrarActualizacion
  } = useDragDropCategorias()
  const {
    archivoImagen,
    previewImagen,
    subiendoImagen,
    setPreviewImagen,
    manejarSeleccionArchivo,
    manejarDragOver,
    manejarDrop,
    subirImagen,
    eliminarImagen: eliminarImagenArchivo,
    resetImagen
  } = useImagenCategoria(setError)
  const [estadisticas, setEstadisticas] = useState({
    totalCategorias: 0,
    categoriasActivas: 0,
    categoriasConProductos: 0,
    categoriasSinProductos: 0
  })

  const { esAdmin } = useAuth()

  useEffect(() => {
    registrarActualizacion(cargarDatos)
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    await Promise.all([
      cargarCategorias(),
      cargarEstadisticas(),
      cargarProductos()
    ])
  }

  const cargarCategorias = async () => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('id,nombre,slug,descripcion,icono,imagen_url,destacado,orden,activo,total_productos')
        .order('orden', { ascending: true })

      if (error) throw error
      setCategorias(data || [])
    } catch (error) {
      setError('Error al cargar las categorías')
    } finally {
      setCargando(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const { count: total } = await clienteSupabase
        .from('categorias')
        .select('*', { count: 'exact', head: true })

      const { count: activas } = await clienteSupabase
        .from('categorias')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      const { data: categoriasConProductos } = await clienteSupabase
        .from('categorias')
        .select('id,total_productos')

      const conProductos = categoriasConProductos?.filter(cat =>
        (cat.total_productos || 0) > 0
      ).length || 0

      setEstadisticas({
        totalCategorias: total || 0,
        categoriasActivas: activas || 0,
        categoriasConProductos: conProductos,
        categoriasSinProductos: (total || 0) - conProductos
      })
    } catch {
    }
  }

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true)
      let query = clienteSupabase
        .from('productos')
        .select('id, nombre, categoria_id')
        .order('nombre')

      if (soloSinCategoria) {
        query = query.is('categoria_id', null)
      }

      if (busquedaProductos.trim()) {
        query = query.ilike('nombre', `%${busquedaProductos.trim()}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setProductos(data || [])
    } catch {
    } finally {
      setCargandoProductos(false)
    }
  }

  const abrirModal = (categoria = null) => {
    setCategoriaEditando(categoria)
    setFormulario(categoria ? {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      slug: categoria.slug,
      imagen_url: categoria.imagen_url || '',
      icono: categoria.icono || '',
      activo: categoria.activo,
      destacado: categoria.destacado || false,
      orden: categoria.orden || 0
    } : {
      nombre: '', descripcion: '', slug: '', imagen_url: '',
      icono: '', activo: true, destacado: false, orden: categorias.length
    })
    if (categoria?.imagen_url) setPreviewImagen(categoria.imagen_url)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setCategoriaEditando(null)
    setError(null)
    resetImagen()
  }

  const manejarCambio = (campo, valor) => {
    if (typeof campo === 'object' && campo.target) {
      const { name, value, type, checked } = campo.target
      setFormulario(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    } else {
      setFormulario(prev => ({ ...prev, [campo]: valor }))
    }

    if (campo === 'nombre') {
      const slug = valor
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      setFormulario(prev => ({ ...prev, slug }))
    }

    if (campo === 'imagen_url' && valor && !archivoImagen) {
      setPreviewImagen(valor)
    }
  }

  const eliminarImagen = () => {
    eliminarImagenArchivo()
    setFormulario(prev => ({ ...prev, imagen_url: '' }))
  }

  const guardarCategoria = async (event) => {
    event.preventDefault()
    if (!formulario.nombre.trim()) { setError('El nombre es requerido'); return }

    setGuardando(true)
    setError(null)
    try {
      const { data: { session } } = await clienteSupabase.auth.getSession()
      if (!session?.user || !esAdmin()) {
        setError('No tienes permisos para realizar esta acción')
        return
      }

      let imagenUrl = formulario.imagen_url
      if (archivoImagen) {
        try { imagenUrl = await subirImagen() }
        catch (error) { setError(error.message); return }
      }

      const datos = {
        nombre: formulario.nombre.trim(), descripcion: formulario.descripcion.trim(),
        slug: formulario.slug.trim(), imagen_url: imagenUrl || '',
        icono: formulario.icono.trim(), activo: formulario.activo,
        destacado: formulario.destacado, orden: parseInt(formulario.orden)
      }

      const query = categoriaEditando
        ? clienteSupabase.from('categorias').update(datos).eq('id', categoriaEditando.id)
        : clienteSupabase.from('categorias').insert(datos)
      const { error } = await query
      if (error) throw error

      await cargarDatos()
      cerrarModal()
    } catch (error) {
      setError('Error al guardar la categoría: ' + error.message)
    } finally {
      setGuardando(false)
    }
  }

  const eliminarCategoria = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return

    try {
      const { count } = await clienteSupabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('categoria_id', id)

      if (count > 0) {
        alert('No se puede eliminar una categoría que tiene productos asociados')
        return
      }

      const { error } = await clienteSupabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSeleccionadas(prev => prev.filter(s => s !== id))
      await cargarDatos()
    } catch (err: any) {
      alert(`Error al eliminar categoría: ${err?.message || err?.details || JSON.stringify(err)}`)
    }
  }

  const eliminarMasivo = async () => {
    if (seleccionadas.length === 0) return
    if (!confirm(`¿Eliminar ${seleccionadas.length} categoría(s)? Esta acción no se puede deshacer.`)) return

    setEliminandoMasivo(true)
    try {
      // Verificar que ninguna tiene productos
      const { data: conProductos } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, total_productos')
        .in('id', seleccionadas)

      const bloqueadas = conProductos?.filter(c => (c.total_productos || 0) > 0) || []
      if (bloqueadas.length > 0) {
        const nombres = bloqueadas.map(c => c.nombre).join(', ')
        alert(`No se pueden eliminar las siguientes categorías porque tienen productos: ${nombres}`)
        return
      }

      const { error } = await clienteSupabase
        .from('categorias')
        .delete()
        .in('id', seleccionadas)

      if (error) throw error

      setSeleccionadas([])
      await cargarDatos()
    } catch (err: any) {
      alert(`Error al eliminar: ${err?.message || err?.details || JSON.stringify(err)}`)
    } finally {
      setEliminandoMasivo(false)
    }
  }

  const toggleSeleccion = (id: string | number) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const alternarEstadoCategoria = async (id, estadoActual) => {
    try {
      const { error } = await clienteSupabase
        .from('categorias')
        .update({ activo: !estadoActual })
        .eq('id', id)

      if (error) throw error
      await cargarDatos()
    } catch {
      alert('Error al cambiar el estado de la categoría')
    }
  }

  const obtenerNombreCategoria = (id) => {
    if (!id) return null
    const cat = categorias.find(c => String(c.id) === String(id))
    return cat?.nombre || null
  }

  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    categoria.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busquedaProductos.toLowerCase())
    const coincideFiltro = soloSinCategoria ? !producto.categoria_id : true
    return coincideBusqueda && coincideFiltro
  })

  if (error && !modalAbierto) {
    return (
      <div className="categorias-error">
        <AlertCircle className="error-icono" />
        <h3>Error al cargar categorías</h3>
        <p>{error}</p>
        <button onClick={cargarDatos} className="boton-reintentar">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="categorias">
      <div className="categorias-header">
        <div className="header-info">
          <h1 className="titulo-pagina">Categorías</h1>
          <p className="subtitulo-pagina">
            Organiza tus productos en categorías para facilitar la navegación
          </p>
        </div>
        <div className="header-acciones">
          <button onClick={() => abrirModal()} className="boton-primario">
            <Plus size={16} />
            Nueva Categoría
          </button>
        </div>
      </div>

      <EstadisticasCategorias estadisticas={estadisticas} />

      <div className="categorias-filtros">
        <div className="filtro-busqueda">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>
      </div>

      <div className="categorias-contenedor">
        <GridCategorias
          cargando={cargando}
          categoriasFiltradas={categoriasFiltradas}
          dragOverCategoriaId={dragOverCategoriaId}
          seleccionadas={seleccionadas}
          onToggleSeleccion={toggleSeleccion}
          onNuevaCategoria={() => abrirModal()}
          onEditar={abrirModal}
          onEliminar={eliminarCategoria}
          onAlternarEstado={alternarEstadoCategoria}
          onDropEnCategoria={manejarDropEnCategoria}
          onDragOverCategoria={setDragOverCategoriaId}
          onDragLeaveCategoria={() => setDragOverCategoriaId(null)}
        />
      </div>

      <PanelAsignacionProductos
        productosFiltrados={productosFiltrados}
        categorias={categorias}
        busquedaProductos={busquedaProductos}
        soloSinCategoria={soloSinCategoria}
        dragOverCategoriaId={dragOverCategoriaId}
        obtenerNombreCategoria={obtenerNombreCategoria}
        onBusquedaProductos={setBusquedaProductos}
        onSoloSinCategoria={setSoloSinCategoria}
        onDragInicioProducto={manejarDragInicio}
        onDropEnCategoria={manejarDropEnCategoria}
        onDropSinCategoria={manejarDropSinCategoria}
        onDragOverCategoria={setDragOverCategoriaId}
        onDragLeaveCategoria={() => setDragOverCategoriaId(null)}
      />

      {/* Barra bulk flotante */}
      {seleccionadas.length > 0 && (
        <div className="barra-bulk">
          <span>{seleccionadas.length} categoría(s) seleccionada(s)</span>
          <button
            className="btn-peligro"
            onClick={eliminarMasivo}
            disabled={eliminandoMasivo}
          >
            <Trash2 size={14} />
            {eliminandoMasivo ? 'Eliminando...' : 'Eliminar seleccionadas'}
          </button>
          <button className="btn-neutro" onClick={() => setSeleccionadas([])}>
            Cancelar
          </button>
        </div>
      )}

      <ModalCategoria
        modalAbierto={modalAbierto}
        categoriaEditando={categoriaEditando}
        formulario={formulario}
        guardando={guardando}
        subiendoImagen={subiendoImagen}
        archivoImagen={archivoImagen}
        previewImagen={previewImagen}
        error={error}
        onCerrar={cerrarModal}
        onGuardar={guardarCategoria}
        onCambio={manejarCambio}
        onSeleccionArchivo={manejarSeleccionArchivo}
        onDragOver={manejarDragOver}
        onDrop={manejarDrop}
        onEliminarImagen={eliminarImagen}
      />
    </div>
  )

}

export default Categorias
