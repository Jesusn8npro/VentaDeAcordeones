import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag, 
  Eye,
  EyeOff,
  AlertCircle,
  FolderOpen,
  Hash,
  Package,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import ModalCategoria from './ModalCategoria'
import './Categorias.css'

const Categorias = () => {
  // Estados principales
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaProductos, setBusquedaProductos] = useState('')
  const [soloSinCategoria, setSoloSinCategoria] = useState(false)

  // Estados del modal
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

  // Estados para imágenes
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [archivoImagen, setArchivoImagen] = useState(null)
  const [previewImagen, setPreviewImagen] = useState(null)

  // Estados para drag & drop
  const [dragOverCategoriaId, setDragOverCategoriaId] = useState(null)
  const [asignando, setAsignando] = useState(false)

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalCategorias: 0,
    categoriasActivas: 0,
    categoriasConProductos: 0,
    categoriasSinProductos: 0
  })

  // Estado de autenticación/rol
  const { esAdmin } = useAuth()

  useEffect(() => {
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
      console.error('Error al cargar categorías:', error)
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
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
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
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setCargandoProductos(false)
    }
  }

  // Funciones del modal
  const abrirModal = (categoria = null) => {
    if (categoria) {
      setCategoriaEditando(categoria)
      setFormulario({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        slug: categoria.slug,
        imagen_url: categoria.imagen_url || '',
        icono: categoria.icono || '',
        activo: categoria.activo,
        destacado: categoria.destacado || false,
        orden: categoria.orden || 0
      })
      if (categoria.imagen_url) {
        setPreviewImagen(categoria.imagen_url)
      }
    } else {
      setCategoriaEditando(null)
      setFormulario({
        nombre: '',
        descripcion: '',
        slug: '',
        imagen_url: '',
        icono: '',
        activo: true,
        destacado: false,
        orden: categorias.length
      })
    }
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setCategoriaEditando(null)
    setError(null)
    setArchivoImagen(null)
    setPreviewImagen(null)
    setSubiendoImagen(false)
  }

  const manejarCambio = (campo, valor) => {
    if (typeof campo === 'object' && campo.target) {
      // Manejo desde evento (e.target)
      const { name, value, type, checked } = campo.target
      setFormulario(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    } else {
      // Manejo desde ModalCategoria (campo, valor)
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

  // Funciones para manejo de imágenes
  const manejarSeleccionArchivo = (e) => {
    const archivo = e.target.files[0]
    if (archivo) {
      procesarArchivo(archivo)
    }
  }

  const procesarArchivo = (archivo) => {
    if (!archivo.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido')
      return
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB')
      return
    }

    setArchivoImagen(archivo)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImagen(e.target.result)
    }
    reader.readAsDataURL(archivo)
  }

  const manejarDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const manejarDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const archivo = e.dataTransfer.files[0]
    if (archivo) {
      procesarArchivo(archivo)
    }
  }

  const subirImagen = async () => {
    if (!archivoImagen) return null

    try {
      setSubiendoImagen(true)
      
      const extension = archivoImagen.name.split('.').pop()
      const nombreArchivo = `categoria_${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`
      
      const { data, error } = await clienteSupabase.storage
        .from('imagenes_categorias')
        .upload(nombreArchivo, archivoImagen, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = clienteSupabase.storage
        .from('imagenes_categorias')
        .getPublicUrl(nombreArchivo)

      return publicUrl
    } catch (error) {
      console.error('Error al subir imagen:', error)
      throw new Error('Error al subir la imagen: ' + error.message)
    } finally {
      setSubiendoImagen(false)
    }
  }

  const eliminarImagen = () => {
    setArchivoImagen(null)
    setPreviewImagen(null)
    setFormulario(prev => ({ ...prev, imagen_url: '' }))
  }

  const guardarCategoria = async (event) => {
    event.preventDefault()
    
    if (!formulario.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

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
        try {
          imagenUrl = await subirImagen()
        } catch (error) {
          setError(error.message)
          return
        }
      }

      const datosCategoria = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        slug: formulario.slug.trim(),
        imagen_url: imagenUrl || '',
        icono: formulario.icono.trim(),
        activo: formulario.activo,
        destacado: formulario.destacado,
        orden: parseInt(formulario.orden)
      }

      if (categoriaEditando) {
        const { error } = await clienteSupabase
          .from('categorias')
          .update(datosCategoria)
          .eq('id', categoriaEditando.id)

        if (error) throw error
      } else {
        const { error } = await clienteSupabase
          .from('categorias')
          .insert(datosCategoria)

        if (error) throw error
      }

      await cargarDatos()
      cerrarModal()
    } catch (error) {
      console.error('Error al guardar categoría:', error)
      setError('Error al guardar la categoría: ' + error.message)
    } finally {
      setGuardando(false)
    }
  }

  // Funciones para drag & drop
  const manejarDragInicio = (e, producto) => {
    e.dataTransfer.setData('text/productoId', String(producto.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  const asignarProductoACategoria = async (productoId, categoriaId) => {
    if (!productoId || asignando) return
    
    setAsignando(true)
    try {
      const { data: { session } } = await clienteSupabase.auth.getSession()
      if (!session?.user) {
        alert('Debes iniciar sesión para actualizar productos.')
        return
      }

      const { error } = await clienteSupabase
        .from('productos')
        .update({ categoria_id: categoriaId })
        .eq('id', productoId)

      if (error) throw error

      setProductos(prev => prev.map(p => 
        String(p.id) === String(productoId) ? { ...p, categoria_id: categoriaId } : p
      ))
      
      await cargarDatos()
    } catch (error) {
      console.error('Error al asignar producto:', error)
      alert('Error al asignar el producto a la categoría')
    } finally {
      setAsignando(false)
    }
  }

  const manejarDropEnCategoria = async (e, categoria) => {
    e.preventDefault()
    const productoId = e.dataTransfer.getData('text/productoId')
    if (productoId && categoria?.id) {
      await asignarProductoACategoria(productoId, categoria.id)
    }
  }

  const manejarDropSinCategoria = async (e) => {
    e.preventDefault()
    const productoId = e.dataTransfer.getData('text/productoId')
    if (productoId) {
      await asignarProductoACategoria(productoId, null)
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

      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
      alert('Error al eliminar la categoría')
    }
  }

  const alternarEstadoCategoria = async (id, estadoActual) => {
    try {
      const { error } = await clienteSupabase
        .from('categorias')
        .update({ activo: !estadoActual })
        .eq('id', id)

      if (error) throw error
      await cargarDatos()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('Error al cambiar el estado de la categoría')
    }
  }

  const obtenerNombreCategoria = (id) => {
    if (!id) return null
    const cat = categorias.find(c => String(c.id) === String(id))
    return cat?.nombre || null
  }

  // Filtros
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
      {/* Header */}
      <div className="categorias-header">
        <div className="header-info">
          <h1 className="titulo-pagina">Gestión de Categorías</h1>
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

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="estadistica-card">
          <div className="estadistica-icono">
            <FolderOpen />
          </div>
          <div className="estadistica-contenido">
            <h3>Total Categorías</h3>
            <p className="estadistica-numero">{estadisticas.totalCategorias}</p>
            <span className="estadistica-cambio">
              {estadisticas.categoriasActivas} activas
            </span>
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-icono">
            <Tag />
          </div>
          <div className="estadistica-contenido">
            <h3>Con Productos</h3>
            <p className="estadistica-numero">{estadisticas.categoriasConProductos}</p>
            <span className="estadistica-cambio positivo">
              {estadisticas.totalCategorias > 0 ? 
                ((estadisticas.categoriasConProductos / estadisticas.totalCategorias) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-icono">
            <Hash />
          </div>
          <div className="estadistica-contenido">
            <h3>Sin Productos</h3>
            <p className="estadistica-numero">{estadisticas.categoriasSinProductos}</p>
            <span className="estadistica-cambio">
              Necesitan contenido
            </span>
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-icono">
            <Eye />
          </div>
          <div className="estadistica-contenido">
            <h3>Activas</h3>
            <p className="estadistica-numero">{estadisticas.categoriasActivas}</p>
            <span className="estadistica-cambio positivo">
              Visibles al público
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Lista de categorías */}
      <div className="categorias-contenedor">
        {cargando ? (
          <div className="cargando-categorias">
            <div className="spinner"></div>
            <p>Cargando categorías...</p>
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <div className="categorias-vacio">
            <FolderOpen className="vacio-icono" />
            <h3>No hay categorías</h3>
            <p>Comienza creando tu primera categoría</p>
            <button onClick={() => abrirModal()} className="boton-primario">
              <Plus size={16} />
              Nueva Categoría
            </button>
          </div>
        ) : (
          <div className="categorias-grid-lista">
            {categoriasFiltradas.map(categoria => (
              <div
                key={categoria.id}
                className={`categoria-card ${dragOverCategoriaId === categoria.id ? 'dropzone-activa' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDragOverCategoriaId(categoria.id)}
                onDragLeave={() => setDragOverCategoriaId(null)}
                onDrop={(e) => manejarDropEnCategoria(e, categoria)}
              >
                <div className="categoria-imagen">
                  {categoria.imagen_url ? (
                    <img 
                      src={categoria.imagen_url} 
                      alt={categoria.nombre} 
                      className="categoria-imagen-img"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Sin+Imagen' }}
                    />
                  ) : (
                    <div className="categoria-imagen-placeholder">
                      <Tag size={24} />
                    </div>
                  )}
                  <div className="categoria-estado-overlay">
                    <button
                      onClick={() => alternarEstadoCategoria(categoria.id, categoria.activo)}
                      className={`estado-boton ${categoria.activo ? 'activo' : 'inactivo'}`}
                      title={categoria.activo ? 'Desactivar categoría' : 'Activar categoría'}
                    >
                      {categoria.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>

                <div className="categoria-contenido">
                  <div className="categoria-info">
                    <h3 className="categoria-nombre">
                      {categoria.icono && <span className="categoria-icono">{categoria.icono}</span>}
                      {categoria.nombre}
                    </h3>
                    <p className="categoria-descripcion">{categoria.descripcion}</p>
                    <div className="categoria-meta">
                      <span className="categoria-productos">
                        <Package size={12} />
                        {categoria.total_productos || 0} productos
                      </span>
                      <span className="categoria-orden">Orden: {categoria.orden}</span>
                    </div>
                  </div>

                  <div className="categoria-acciones">
                    <button 
                      onClick={() => abrirModal(categoria)}
                      className="accion-boton editar"
                      title="Editar categoría"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarCategoria(categoria.id)}
                      className="accion-boton eliminar"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asignación de productos por Drag & Drop */}
      <div className="asignacion-panel">
        <div className="asignacion-col izquierda">
          <div className="asignacion-header">
            <h3>Productos</h3>
            <div className="asignacion-filtros">
              <div className="filtro-busqueda">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={busquedaProductos}
                  onChange={(e) => setBusquedaProductos(e.target.value)}
                  className="input-busqueda-pequeno"
                />
              </div>
              <label className="filtro-checkbox">
                <input
                  type="checkbox"
                  checked={soloSinCategoria}
                  onChange={(e) => setSoloSinCategoria(e.target.checked)}
                />
                Solo sin categoría
              </label>
            </div>
          </div>
          
          <div className="productos-lista">
            {productosFiltrados.map(producto => (
              <div
                key={producto.id}
                className="producto-item"
                draggable
                onDragStart={(e) => manejarDragInicio(e, producto)}
              >
                <div className="producto-info">
                  <h4>{producto.nombre}</h4>
                </div>
                {producto.categoria_id && (
                  <span className="producto-categoria-actual">
                    {obtenerNombreCategoria(producto.categoria_id)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="asignacion-col derecha">
          <div className="asignacion-header">
            <h3>Zonas de Asignación</h3>
          </div>
          
          <div
            className="dropzone sin-categoria"
            onDragOver={(e) => e.preventDefault()}
            onDrop={manejarDropSinCategoria}
          >
            <Package size={24} />
            <h4>Sin Categoría</h4>
            <p>Arrastra productos aquí para quitar su categoría</p>
          </div>

          <div className="categorias-dropzones">
            {categorias.map(categoria => (
              <div
                key={categoria.id}
                className={`dropzone categoria-dropzone ${dragOverCategoriaId === categoria.id ? 'activa' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDragOverCategoriaId(categoria.id)}
                onDragLeave={() => setDragOverCategoriaId(null)}
                onDrop={(e) => manejarDropEnCategoria(e, categoria)}
              >
                <Tag size={20} />
                <h4>{categoria.nombre}</h4>
                <p>{categoria.total_productos || 0} productos</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
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

  return (
    <div className="categorias-admin">
      <div className="categorias-header">
        <h1>Gestión de Categorías</h1>
        <button 
          className="btn btn-primary"
          onClick={() => abrirModal()}
        >
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>
      
      {/* Contenido del componente */}
      <div className="categorias-content">
        {cargando ? (
          <div className="loading">Cargando categorías...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="categorias-grid">
            {/* Aquí iría el resto del contenido */}
            <p>Categorías cargadas: {categorias.length}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Categorias
