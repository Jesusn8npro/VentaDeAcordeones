import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clienteSupabase } from '../../../configuracion/supabase'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus,
  Package,
  DollarSign,
  Tag,
  Image,
  FileText,
  Settings,
  Globe,
  Truck,
  AlertCircle,
  Sparkles,
  Camera,
  Loader,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import CrearProductoIA from '../../../paginas/admin/CreadorDeProductosPR/Componentes/CrearProductoIA'
import ChatImagenesIA from '../../../paginas/admin/CreadorDeProductosPR/Componentes/ChatImagenesIAInline'
import '../../../paginas/admin/CreadorDeProductosPR/CreadorProductosPR.css'

/**
 * FormularioProductoIndependiente - Componente independiente para crear y editar productos
 * 
 * Props:
 * - modo: 'crear' | 'editar' (por defecto: 'crear')
 * - slug: slug del producto (solo para modo editar)
 * - onSuccess: callback cuando se guarda exitosamente
 * - onCancel: callback cuando se cancela la operación
 * - showNavigation: mostrar navegación de vuelta (por defecto: true)
 * - containerClass: clase CSS personalizada para el contenedor
 */

const FormularioProductoIndependiente = ({ 
  modo = 'crear', 
  slug = null, 
  onSuccess = null,
  onCancel = null,
  showNavigation = true,
  containerClass = ''
}) => {
  const navigate = useNavigate()
  const { usuario, sesionInicializada } = useAuth()
  
  // Estados principales
  const [cargando, setCargando] = useState(false)
  const [cargandoProducto, setCargandoProducto] = useState(modo === 'editar')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [categorias, setCategorias] = useState([])
  const [productoId, setProductoId] = useState(null)
  
  // Estados de pestañas
  const [pestanaActiva, setPestanaActiva] = useState('detalles')
  const [productoCreado, setProductoCreado] = useState(null)

  // Estado del formulario principal
  const [formulario, setFormulario] = useState({
    // Información básica
    nombre: '',
    slug: '',
    descripcion: '',
    ganchos: [],
    beneficios: [],
    ventajas: [],
    
    // Precios
    precio: '',
    precio_original: '',
    descuento: '',

    // Estado del producto
    estado: 'nuevo',
    
    // Categoría
    categoria_id: '',
    
    // Videos
    videos: [],
    
    // Inventario
    stock: '',
    stock_minimo: '5',
    
    // Configuración
    destacado: false,
    activo: true,
    landing_tipo: 'catalogo',
    
    // Especificaciones físicas
    peso: '',
    dimensiones: '',
    marca: '',
    modelo: '',
    color: '',
    talla: '',
    material: '',
    garantia_meses: '',
    origen_pais: '',
    
    // SEO
    palabras_clave: [],
    meta_title: '',
    meta_description: ''
  })

  // Estados para campos dinámicos
  const [nuevoGancho, setNuevoGancho] = useState('')
  const [nuevoBeneficio, setNuevoBeneficio] = useState('')
  const [nuevaVentaja, setNuevaVentaja] = useState('')
  const [nuevaPalabraClave, setNuevaPalabraClave] = useState('')
  const [nuevoVideo, setNuevoVideo] = useState('')

  // Estados para imágenes de landing
  const [imagenesLanding, setImagenesLanding] = useState({
    imagen_principal: '',
    imagen_secundaria_1: '',
    imagen_secundaria_2: '',
    imagen_secundaria_3: '',
    imagen_secundaria_4: '',
    imagen_punto_dolor_1: '',
    imagen_punto_dolor_2: '',
    imagen_punto_dolor_3: '',
    imagen_punto_dolor_4: '',
    imagen_solucion_1: '',
    imagen_solucion_2: '',
    imagen_solucion_3: '',
    imagen_solucion_4: '',
    imagen_testimonio_persona_1: '',
    imagen_testimonio_persona_2: '',
    imagen_testimonio_persona_3: '',
    imagen_testimonio_persona_4: '',
    imagen_testimonio_persona_5: '',
    imagen_testimonio_persona_6: '',
    imagen_testimonio_producto_1: '',
    imagen_testimonio_producto_2: '',
    imagen_testimonio_producto_3: '',
    imagen_testimonio_producto_4: '',
    imagen_testimonio_producto_5: '',
    imagen_testimonio_producto_6: '',
    imagen_caracteristicas: '',
    imagen_garantias: '',
    imagen_cta_final: '',
    estado: 'pendiente',
    total_imagenes_generadas: 0,
    prompts_utilizados: {}
  })
  const [imagenesLandingId, setImagenesLandingId] = useState(null)
  const [subiendoImagenLanding, setSubiendoImagenLanding] = useState(false)

  // Efectos
  useEffect(() => {
    if (sesionInicializada) {
      cargarCategorias()
      if (modo === 'editar' && slug) {
        cargarProducto()
      }
    }
  }, [modo, slug, sesionInicializada])

  useEffect(() => {
    if (modo === 'editar' && productoId) {
      cargarImagenesProducto(productoId)
    }
  }, [modo, productoId])

  // Funciones de carga
  const cargarCategorias = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, icono, activo')
        .eq('activo', true)
        .order('nombre')

      if (error) {
        throw error
      }
      
      setCategorias(data || [])
    } catch (error) {
      setError(`Error al cargar las categorías: ${error.message}`)
    }
  }

  const cargarProducto = async () => {
    try {
      setCargandoProducto(true)
      
      // Intentar por slug primero
      const { data: porSlug, error: errorSlug } = await clienteSupabase
        .from('productos')
        .select('*')
        .eq('slug', slug)
        .limit(1)

      if (errorSlug) {
        throw errorSlug
      }

      let productoEncontrado = porSlug && porSlug.length ? porSlug[0] : null

      // Si no se encontró por slug, intentar por nombre
      if (!productoEncontrado) {
        const { data: porNombre, error: errorNombre } = await clienteSupabase
          .from('productos')
          .select('*')
          .eq('nombre', slug)
          .limit(1)

        if (errorNombre) {
          throw errorNombre
        }

        productoEncontrado = porNombre && porNombre.length ? porNombre[0] : null
      }

      if (!productoEncontrado) {
        throw new Error('Producto no encontrado')
      }
      
      // Mapear datos del producto al formulario
      setFormulario({
        nombre: productoEncontrado.nombre || '',
        slug: productoEncontrado.slug || '',
        descripcion: productoEncontrado.descripcion || '',
        ganchos: productoEncontrado.ganchos || [],
        beneficios: productoEncontrado.beneficios || [],
        ventajas: productoEncontrado.ventajas || [],
        precio: productoEncontrado.precio || '',
        precio_original: productoEncontrado.precio_original || '',
        descuento: productoEncontrado.descuento || '',
        estado: productoEncontrado.estado || 'nuevo',
        categoria_id: productoEncontrado.categoria_id || '',
        videos: productoEncontrado.videos || [],
        stock: productoEncontrado.stock || '',
        stock_minimo: productoEncontrado.stock_minimo || '5',
        destacado: productoEncontrado.destacado || false,
        activo: productoEncontrado.activo !== undefined ? productoEncontrado.activo : true,
        landing_tipo: productoEncontrado.landing_tipo || 'catalogo',
        peso: productoEncontrado.peso || '',
        dimensiones: productoEncontrado.dimensiones || '',
        marca: productoEncontrado.marca || '',
        modelo: productoEncontrado.modelo || '',
        color: productoEncontrado.color || '',
        talla: productoEncontrado.talla || '',
        material: productoEncontrado.material || '',
        garantia_meses: productoEncontrado.garantia_meses || '',
        origen_pais: productoEncontrado.origen_pais || '',
        palabras_clave: productoEncontrado.palabras_clave || [],
        meta_title: productoEncontrado.meta_title || '',
        meta_description: productoEncontrado.meta_description || ''
      })

      setProductoId(productoEncontrado.id)
      
    } catch (error) {
      setError(`Error al cargar el producto: ${error.message}`)
    } finally {
      setCargandoProducto(false)
    }
  }

  const cargarImagenesProducto = async (idProducto) => {
    try {
      const { data, error } = await clienteSupabase
        .from('producto_imagenes')
        .select('*')
        .eq('producto_id', idProducto)
        .limit(1)

      if (error) throw error

      if (data && data.length) {
        const registro = data[0]
        setImagenesLanding(prev => ({
          ...prev,
          ...registro,
          prompts_utilizados: registro.prompts_utilizados || {},
          estado: registro.estado || 'pendiente',
          total_imagenes_generadas: registro.total_imagenes_generadas || 0
        }))
        setImagenesLandingId(registro.id)
      }
    } catch (error) {
      // Error silencioso para producción
    }
  }

  // Función de manejo de cambios
  const manejarCambio = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }))

    // Auto-generar slug desde el nombre
    if (campo === 'nombre') {
      const slug = valor
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormulario(prev => ({
        ...prev,
        slug: slug
      }))
    }

    // Limpiar mensajes
    if (error) setError('')
    if (exito) setExito('')
  }

  // Funciones para arrays dinámicos
  const agregarElementoArray = (campo, valor, setterValor) => {
    if (!valor.trim()) return
    
    setFormulario(prev => ({
      ...prev,
      [campo]: [...prev[campo], valor.trim()]
    }))
    setterValor('')
  }

  const eliminarElementoArray = (campo, index) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: prev[campo].filter((_, i) => i !== index)
    }))
  }

  // Validación
  const validarFormulario = () => {
    const errores = []

    if (!formulario.nombre.trim()) errores.push('El nombre es obligatorio')
    if (!formulario.descripcion.trim()) errores.push('La descripción es obligatoria')
    if (!formulario.precio || formulario.precio <= 0) errores.push('El precio debe ser mayor a 0')
    if (!formulario.stock || formulario.stock < 0) errores.push('El stock debe ser mayor o igual a 0')
    if (!formulario.categoria_id) errores.push('Debe seleccionar una categoría')

    return errores
  }

  // Función principal de guardado
  const guardarProducto = async () => {
    try {
      setCargando(true)
      setError('')
      setExito('')

      const errores = validarFormulario()
      if (errores.length > 0) {
        setError(errores.join(', '))
        return
      }

      // Preparar datos para insertar/actualizar
      const datosProducto = {
        nombre: formulario.nombre.trim(),
        slug: formulario.slug.trim(),
        descripcion: formulario.descripcion.trim(),
        ganchos: formulario.ganchos,
        beneficios: formulario.beneficios,
        ventajas: formulario.ventajas,
        precio: parseFloat(formulario.precio),
        precio_original: formulario.precio_original ? parseFloat(formulario.precio_original) : null,
        descuento: formulario.descuento ? parseFloat(formulario.descuento) : null,
        estado: formulario.estado || 'nuevo',
        categoria_id: formulario.categoria_id || null,
        videos: formulario.videos,
        stock: parseInt(formulario.stock),
        stock_minimo: parseInt(formulario.stock_minimo),
        destacado: formulario.destacado,
        activo: formulario.activo,
        landing_tipo: formulario.landing_tipo,
        peso: formulario.peso ? parseFloat(formulario.peso) : null,
        dimensiones: formulario.dimensiones || null,
        marca: formulario.marca || null,
        modelo: formulario.modelo || null,
        color: formulario.color || null,
        talla: formulario.talla || null,
        material: formulario.material || null,
        garantia_meses: formulario.garantia_meses ? parseInt(formulario.garantia_meses) : null,
        origen_pais: formulario.origen_pais || null,
        palabras_clave: formulario.palabras_clave,
        meta_title: formulario.meta_title || null,
        meta_description: formulario.meta_description || null,
        ...(modo === 'crear' && { creado_por: usuario?.id }),
        ...(modo === 'editar' && { actualizado_el: new Date().toISOString() })
      }

      let result
      if (modo === 'crear') {
        result = await clienteSupabase
          .from('productos')
          .insert([datosProducto])
          .select()
      } else {
        result = await clienteSupabase
          .from('productos')
          .update(datosProducto)
          .eq('id', productoId)
          .select()
      }

      const { data, error } = result

      if (error) {
        throw error
      }
      const mensaje = modo === 'crear' ? '¡Producto creado exitosamente!' : '¡Producto actualizado exitosamente!'
      setExito(mensaje)
      
      if (modo === 'crear') {
        setProductoCreado(data[0])
        setProductoId(data[0].id)
      }

      // Callback de éxito
      if (onSuccess) {
        onSuccess(data[0])
      }

    } catch (error) {
      setError(`Error al guardar: ${error.message}`)
    } finally {
      setCargando(false)
    }
  }

  // Función para cancelar
  const manejarCancelar = () => {
    if (onCancel) {
      onCancel()
    } else if (showNavigation) {
      navigate('/admin/productos')
    }
  }

  // Función para calcular progreso
  const calcularProgreso = () => {
    const camposObligatorios = ['nombre', 'descripcion', 'precio', 'stock', 'categoria_id']
    const camposOpcionales = ['slug', 'precio_original', 'descuento', 'peso', 'marca', 'modelo', 'color', 'meta_title', 'meta_description']
    
    let completados = 0
    const totalCampos = camposObligatorios.length + camposOpcionales.length
    
    camposObligatorios.forEach(campo => {
      if (formulario[campo] && String(formulario[campo]).trim()) {
        completados++
      }
    })
    
    camposOpcionales.forEach(campo => {
      if (formulario[campo] && String(formulario[campo]).trim()) {
        completados++
      }
    })
    
    if (formulario.ganchos && formulario.ganchos.length > 0) completados += 0.5
    if (formulario.beneficios && formulario.beneficios.length > 0) completados += 0.5
    if (formulario.ventajas && formulario.ventajas.length > 0) completados += 0.5
    if (formulario.palabras_clave && formulario.palabras_clave.length > 0) completados += 0.5
    
    return Math.round((completados / (totalCampos + 2)) * 100)
  }

  // Título dinámico
  const titulo = modo === 'crear' ? 'Agregar Producto' : 'Editar Producto'
  const subtitulo = modo === 'crear' 
    ? 'Completa la información del producto para agregarlo al catálogo'
    : 'Modifica la información del producto'

  // Si está cargando el producto para editar
  if (cargandoProducto) {
    return (
      <div className={`agregar-producto ${containerClass}`}>
        <div className="cargando-producto">
          <Loader className="spinner" />
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`agregar-producto ${containerClass}`}>
      {/* Header */}
      <div className="agregar-producto-header">
        {showNavigation && (
          <div className="header-navegacion">
            <button onClick={manejarCancelar} className="boton-volver">
              <ArrowLeft className="icono" />
              Volver
            </button>
          </div>
        )}
        
        <div className="header-titulo">
          <h1 className="titulo-pagina">
            <Package className="icono-titulo" />
            {titulo}
          </h1>
          <p className="subtitulo-pagina">
            {subtitulo}
          </p>
        </div>

        {/* Barra de pestañas */}
        <div className="tabs-bar" role="tablist" aria-label="Secciones del producto">
          <button
            className={`tab-button ${pestanaActiva === 'detalles' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('detalles')}
            role="tab"
            aria-selected={pestanaActiva === 'detalles'}
          >
            <FileText className="tab-icon" />
            <span>Formulario</span>
          </button>
          <button
            className={`tab-button ${pestanaActiva === 'imagenesLanding' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('imagenesLanding')}
            role="tab"
            aria-selected={pestanaActiva === 'imagenesLanding'}
          >
            <Image className="tab-icon" />
            <span>Imágenes</span>
          </button>
          {modo === 'crear' && (
            <>
              <button
                className={`tab-button ${pestanaActiva === 'crearIA' ? 'activa' : ''}`}
                onClick={() => setPestanaActiva('crearIA')}
                role="tab"
                aria-selected={pestanaActiva === 'crearIA'}
              >
                <Sparkles className="tab-icon" />
                <span>Crear con IA</span>
              </button>
              <button
                className={`tab-button ${pestanaActiva === 'imagenesIA' ? 'activa' : ''}`}
                onClick={() => setPestanaActiva('imagenesIA')}
                role="tab"
                aria-selected={pestanaActiva === 'imagenesIA'}
              >
                <Camera className="tab-icon" />
                <span>Imágenes con IA</span>
              </button>
            </>
          )}
          <button
            className={`tab-button ${pestanaActiva === 'vistaPrevia' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('vistaPrevia')}
            role="tab"
            aria-selected={pestanaActiva === 'vistaPrevia'}
          >
            <Eye className="tab-icon" />
            <span>Vista Previa</span>
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="mensaje-error">
          <XCircle className="icono" />
          {error}
        </div>
      )}

      {exito && (
        <div className="mensaje-exito">
          <CheckCircle className="icono" />
          {exito}
        </div>
      )}

      {/* Contenido de las pestañas */}
      <div className="tabs-content">
        {pestanaActiva === 'detalles' && (
          <div className="tab-panel" role="tabpanel">
            <div className="formulario-producto">
              {/* Información básica */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <Package className="icono" />
                  Información Básica
                </h3>
                
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label">Nombre del Producto *</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.nombre}
                      onChange={(e) => manejarCambio('nombre', e.target.value)}
                      placeholder="Ej: iPhone 15 Pro Max"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Slug (URL)</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.slug}
                      onChange={(e) => manejarCambio('slug', e.target.value)}
                      placeholder="iphone-15-pro-max"
                    />
                  </div>

                  <div className="campo-grupo campo-completo">
                    <label className="campo-label">Descripción *</label>
                    <textarea
                      className="campo-textarea"
                      value={formulario.descripcion}
                      onChange={(e) => manejarCambio('descripcion', e.target.value)}
                      placeholder="Describe las características principales del producto..."
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Precios */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <DollarSign className="icono" />
                  Precios
                </h3>
                
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label">Precio *</label>
                    <input
                      type="number"
                      className="campo-input"
                      value={formulario.precio}
                      onChange={(e) => manejarCambio('precio', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    {formulario.precio && (
                      <span className="precio-formateado">
                        {formatearPrecioCOP(formulario.precio)}
                      </span>
                    )}
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Precio Original</label>
                    <input
                      type="number"
                      className="campo-input"
                      value={formulario.precio_original}
                      onChange={(e) => manejarCambio('precio_original', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Descuento (%)</label>
                    <input
                      type="number"
                      className="campo-input"
                      value={formulario.descuento}
                      onChange={(e) => manejarCambio('descuento', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Categoría y Stock */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <Tag className="icono" />
                  Categoría y Stock
                </h3>
                
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label">Categoría *</label>
                    <select
                      className="campo-select"
                      value={formulario.categoria_id}
                      onChange={(e) => manejarCambio('categoria_id', e.target.value)}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Stock *</label>
                    <input
                      type="number"
                      className="campo-input"
                      value={formulario.stock}
                      onChange={(e) => manejarCambio('stock', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Stock Mínimo</label>
                    <input
                      type="number"
                      className="campo-input"
                      value={formulario.stock_minimo}
                      onChange={(e) => manejarCambio('stock_minimo', e.target.value)}
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Ganchos de Venta */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <Sparkles className="icono" />
                  Ganchos de Venta
                </h3>
                
                <div className="campo-array">
                  <div className="array-input">
                    <input
                      type="text"
                      className="campo-input"
                      value={nuevoGancho}
                      onChange={(e) => setNuevoGancho(e.target.value)}
                      placeholder="Ej: ¡Envío gratis en 24 horas!"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          agregarElementoArray('ganchos', nuevoGancho, setNuevoGancho)
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="boton-agregar"
                      onClick={() => agregarElementoArray('ganchos', nuevoGancho, setNuevoGancho)}
                    >
                      <Plus className="icono" />
                    </button>
                  </div>
                  
                  <div className="array-items">
                    {formulario.ganchos.map((gancho, index) => (
                      <div key={index} className="array-item">
                        <span>{gancho}</span>
                        <button
                          type="button"
                          className="boton-eliminar"
                          onClick={() => eliminarElementoArray('ganchos', index)}
                        >
                          <X className="icono" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Beneficios */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <CheckCircle className="icono" />
                  Beneficios
                </h3>
                
                <div className="campo-array">
                  <div className="array-input">
                    <input
                      type="text"
                      className="campo-input"
                      value={nuevoBeneficio}
                      onChange={(e) => setNuevoBeneficio(e.target.value)}
                      placeholder="Ej: Ahorra tiempo en tus tareas diarias"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          agregarElementoArray('beneficios', nuevoBeneficio, setNuevoBeneficio)
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="boton-agregar"
                      onClick={() => agregarElementoArray('beneficios', nuevoBeneficio, setNuevoBeneficio)}
                    >
                      <Plus className="icono" />
                    </button>
                  </div>
                  
                  <div className="array-items">
                    {formulario.beneficios.map((beneficio, index) => (
                      <div key={index} className="array-item">
                        <span>{beneficio}</span>
                        <button
                          type="button"
                          className="boton-eliminar"
                          onClick={() => eliminarElementoArray('beneficios', index)}
                        >
                          <X className="icono" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ventajas Competitivas */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <Settings className="icono" />
                  Ventajas Competitivas
                </h3>
                
                <div className="campo-array">
                  <div className="array-input">
                    <input
                      type="text"
                      className="campo-input"
                      value={nuevaVentaja}
                      onChange={(e) => setNuevaVentaja(e.target.value)}
                      placeholder="Ej: Mejor precio del mercado"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          agregarElementoArray('ventajas', nuevaVentaja, setNuevaVentaja)
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="boton-agregar"
                      onClick={() => agregarElementoArray('ventajas', nuevaVentaja, setNuevaVentaja)}
                    >
                      <Plus className="icono" />
                    </button>
                  </div>
                  
                  <div className="array-items">
                    {formulario.ventajas.map((ventaja, index) => (
                      <div key={index} className="array-item">
                        <span>{ventaja}</span>
                        <button
                          type="button"
                          className="boton-eliminar"
                          onClick={() => eliminarElementoArray('ventajas', index)}
                        >
                          <X className="icono" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Especificaciones Físicas */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <Package className="icono" />
                  Especificaciones Físicas
                </h3>
                
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label">Peso (kg)</label>
                    <input
                      type="number"
                      className="campo-input"
                      value={formulario.peso}
                      onChange={(e) => manejarCambio('peso', e.target.value)}
                      placeholder="0.5"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Dimensiones</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.dimensiones}
                      onChange={(e) => manejarCambio('dimensiones', e.target.value)}
                      placeholder="20cm x 15cm x 5cm"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Marca</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.marca}
                      onChange={(e) => manejarCambio('marca', e.target.value)}
                      placeholder="Apple"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Modelo</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.modelo}
                      onChange={(e) => manejarCambio('modelo', e.target.value)}
                      placeholder="iPhone 15 Pro Max"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Color</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.color}
                      onChange={(e) => manejarCambio('color', e.target.value)}
                      placeholder="Negro"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Talla</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.talla}
                      onChange={(e) => manejarCambio('talla', e.target.value)}
                      placeholder="M, L, XL"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Material</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.material}
                      onChange={(e) => manejarCambio('material', e.target.value)}
                      placeholder="Aluminio"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Garantía (meses)</label>
                    <input
                      type="number"
                      className="campo-input"
                      value={formulario.garantia_meses}
                      onChange={(e) => manejarCambio('garantia_meses', e.target.value)}
                      placeholder="12"
                      min="0"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">País de Origen</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.origen_pais}
                      onChange={(e) => manejarCambio('origen_pais', e.target.value)}
                      placeholder="Estados Unidos"
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <Globe className="icono" />
                  SEO
                </h3>
                
                <div className="campos-grid">
                  <div className="campo-grupo campo-completo">
                    <label className="campo-label">Título SEO</label>
                    <input
                      type="text"
                      className="campo-input"
                      value={formulario.meta_title}
                      onChange={(e) => manejarCambio('meta_title', e.target.value)}
                      placeholder="iPhone 15 Pro Max - Comprar Online | Me Llevo Esto"
                      maxLength="60"
                    />
                    <small className="campo-ayuda">
                      {formulario.meta_title.length}/60 caracteres
                    </small>
                  </div>

                  <div className="campo-grupo campo-completo">
                    <label className="campo-label">Descripción SEO</label>
                    <textarea
                      className="campo-textarea"
                      value={formulario.meta_description}
                      onChange={(e) => manejarCambio('meta_description', e.target.value)}
                      placeholder="Compra el iPhone 15 Pro Max con envío gratis. Mejor precio garantizado..."
                      maxLength="160"
                      rows="3"
                    />
                    <small className="campo-ayuda">
                      {formulario.meta_description.length}/160 caracteres
                    </small>
                  </div>
                </div>

                <div className="campo-array">
                  <label className="campo-label">Palabras Clave</label>
                  <div className="array-input">
                    <input
                      type="text"
                      className="campo-input"
                      value={nuevaPalabraClave}
                      onChange={(e) => setNuevaPalabraClave(e.target.value)}
                      placeholder="iphone, smartphone, apple"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          agregarElementoArray('palabras_clave', nuevaPalabraClave, setNuevaPalabraClave)
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="boton-agregar"
                      onClick={() => agregarElementoArray('palabras_clave', nuevaPalabraClave, setNuevaPalabraClave)}
                    >
                      <Plus className="icono" />
                    </button>
                  </div>
                  
                  <div className="array-items">
                    {formulario.palabras_clave.map((palabra, index) => (
                      <div key={index} className="array-item">
                        <span>{palabra}</span>
                        <button
                          type="button"
                          className="boton-eliminar"
                          onClick={() => eliminarElementoArray('palabras_clave', index)}
                        >
                          <X className="icono" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configuración */}
              <div className="seccion-formulario">
                <h3 className="seccion-titulo">
                  <Settings className="icono" />
                  Configuración
                </h3>
                
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label">Estado del Producto</label>
                    <select
                      className="campo-select"
                      value={formulario.estado}
                      onChange={(e) => manejarCambio('estado', e.target.value)}
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="usado">Usado</option>
                      <option value="reacondicionado">Reacondicionado</option>
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Tipo de Landing</label>
                    <select
                      className="campo-select"
                      value={formulario.landing_tipo}
                      onChange={(e) => manejarCambio('landing_tipo', e.target.value)}
                    >
                      <option value="catalogo">Catálogo</option>
                      <option value="temu">Temu Style</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <div className="campo-checkbox">
                      <input
                        type="checkbox"
                        id="destacado"
                        checked={formulario.destacado}
                        onChange={(e) => manejarCambio('destacado', e.target.checked)}
                      />
                      <label htmlFor="destacado">Producto Destacado</label>
                    </div>
                  </div>

                  <div className="campo-grupo">
                    <div className="campo-checkbox">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formulario.activo}
                        onChange={(e) => manejarCambio('activo', e.target.checked)}
                      />
                      <label htmlFor="activo">Producto Activo</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {pestanaActiva === 'imagenesLanding' && (
          <div className="tab-panel" role="tabpanel">
            <div className="imagenes-landing-panel">
              <h3>Gestión de Imágenes para Landing Page</h3>
              <p>Aquí puedes gestionar todas las imágenes que se mostrarán en la landing page del producto.</p>
              
              {/* Nota informativa */}
              <div className="nota-imagenes">
                <AlertCircle className="icono" />
                <p>
                  Las imágenes se organizan por secciones de la landing page. 
                  Puedes subir archivos directamente o pegar URLs de imágenes.
                </p>
              </div>
            </div>
          </div>
        )}

        {pestanaActiva === 'crearIA' && modo === 'crear' && (
          <div className="tab-panel" role="tabpanel">
            <CrearProductoIA
              modo="embed"
              mostrar={true}
              onProductoCreado={(producto) => {
                setProductoCreado(producto)
                setExito('¡Producto creado con IA exitosamente!')
              }}
            />
          </div>
        )}

        {pestanaActiva === 'imagenesIA' && modo === 'crear' && (
          <div className="tab-panel" role="tabpanel">
            <ChatImagenesIA
              modo="embed"
              mostrar={true}
              productoId={productoId}
              onImagenesGeneradas={(imagenes) => {
                setExito('¡Imágenes generadas exitosamente!')
              }}
            />
          </div>
        )}

        {pestanaActiva === 'vistaPrevia' && (
          <div className="tab-panel" role="tabpanel">
            <div className="vista-previa-panel">
              <h3>Vista Previa del Producto</h3>
              {productoId || productoCreado ? (
                <div className="preview-container">
                  <iframe
                    src={`/producto/${formulario.slug || productoCreado?.slug}`}
                    className="preview-iframe"
                    title="Vista previa del producto"
                  />
                </div>
              ) : (
                <div className="preview-placeholder">
                  <Eye className="icono" />
                  <p>Guarda el producto primero para ver la vista previa</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botón de guardado mejorado */}
      <div className="formulario-acciones">
        <div className="progreso-formulario">
          <div className="progreso-barra">
            <div 
              className="progreso-relleno" 
              style={{ width: `${calcularProgreso()}%` }}
            />
          </div>
          <span className="progreso-texto">
            {calcularProgreso()}% completado
          </span>
        </div>
        
        <div className="botones-accion">
          <button
            type="button"
            className="boton-secundario"
            onClick={manejarCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            className="boton-principal"
            onClick={guardarProducto}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <Loader className="icono spinner" />
                {modo === 'crear' ? 'Creando...' : 'Actualizando...'}
              </>
            ) : (
              <>
                <Save className="icono" />
                {modo === 'crear' ? 'Crear Producto' : 'Actualizar Producto'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FormularioProductoIndependiente