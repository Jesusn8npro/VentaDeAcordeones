import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreadorProductosPR.css'

// Importar componentes de las pestañas
import FormularioProducto from './Componentes/FormularioProducto'
import ImagenesLanding from './Componentes/ImagenesLanding'
import CrearProductoIA from './Componentes/CrearProductoIA'
import VideosProducto from './Componentes/VideosProducto'
import ChatImagenesIAInline from './Componentes/ChatImagenesIAInline'

// Importar configuración de Supabase
import { clienteSupabase } from '../../../configuracion/supabase'

// Importar utilidades
import { usarFormato } from '../../../hooks/usarFormato'

// Clave para localStorage
const STORAGE_KEY = 'creadorProductosPR_estado'
const PESTANA_KEY = 'creadorProductosPR_pestana'

// Funciones helper para normalizar tipos de datos
const toNum = (value) => {
  if (!value || value === '') return null
  // Reemplazar coma por punto para manejar formato colombiano
  const cleanValue = String(value).replace(',', '.')
  const num = parseFloat(cleanValue)
  return isNaN(num) ? null : num
}

const toInt = (value) => {
  if (!value || value === '') return null
  // Reemplazar coma por punto y convertir a entero
  const cleanValue = String(value).replace(',', '.')
  const num = parseInt(cleanValue, 10)
  return isNaN(num) ? null : num
}

// Helper para manejar dimensiones que pueden ser objeto o string
const procesarDimensiones = (dimensiones) => {
  if (!dimensiones) return null
  
  // Si es un objeto, convertirlo a string o mantenerlo como objeto según necesidad
  if (typeof dimensiones === 'object') {
    // Si es un objeto con propiedades de dimensiones, mantenerlo como objeto
    if (dimensiones.alto !== undefined || dimensiones.ancho !== undefined || dimensiones.profundidad !== undefined) {
      return dimensiones
    }
    // Si es otro tipo de objeto, convertir a string
    return JSON.stringify(dimensiones)
  }
  
  // Si es string, hacer trim
  if (typeof dimensiones === 'string') {
    return dimensiones.trim() || null
  }
  
  return null
}

const CreadorProductosPR = ({ modo = 'crear', slug = null, onSuccess = null }) => {
  const navigate = useNavigate()
  const { generarSlug } = usarFormato()
  
  // Referencias para el deslizamiento táctil
  const pestanasBarRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const isDragging = useRef(false)
  
  // Estado de pestañas con persistencia
  const [pestanaActiva, setPestanaActiva] = useState(() => {
    // Solo cargar pestaña guardada si estamos en modo crear
    if (modo === 'crear') {
      try {
        const pestanaGuardada = localStorage.getItem(PESTANA_KEY)
        return pestanaGuardada || 'formulario'
      } catch (error) {
        console.error('Error al cargar pestaña desde localStorage:', error)
      }
    }
    return 'formulario'
  })
  
  // Estados para datos del producto con valores iniciales desde localStorage
  const [datosProducto, setDatosProducto] = useState(() => {
    // Solo cargar desde localStorage si estamos en modo crear y no hay slug
    if (modo === 'crear' && !slug) {
      try {
        const estadoGuardado = localStorage.getItem(STORAGE_KEY)
        if (estadoGuardado) {
          const estadoParsed = JSON.parse(estadoGuardado)
          console.log('🔄 Cargando estado desde localStorage:', estadoParsed)
          
          // Si hay datosProducto en el estado guardado, usarlos
          if (estadoParsed.datosProducto) {
            return estadoParsed.datosProducto
          }
          
          // Fallback al formato anterior
          return {
            nombre: estadoParsed.nombre || '',
            slug: estadoParsed.slug || '',
            descripcion: estadoParsed.descripcion || '',
            precio: estadoParsed.precio || '',
            categoria_id: estadoParsed.categoria_id || '',
            estado: estadoParsed.estado || 'borrador',
            ganchos: estadoParsed.ganchos || estadoParsed.ganchos_persuasivos || [],
            beneficios: estadoParsed.beneficios || [],
            ventajas: estadoParsed.ventajas || estadoParsed.ventajas_competitivas || [],
            palabras_clave: estadoParsed.palabras_clave || [],
            imagenes: estadoParsed.imagenes || []
          }
        }
      } catch (error) {
        console.error('Error al cargar estado desde localStorage:', error)
      }
    }
    
    // Valores por defecto
    return {
      nombre: '',
      slug: '',
      descripcion: '',
      precio: '',
      categoria_id: '',
      estado: 'borrador',
      ganchos: [],
      beneficios: [],
      ventajas: [],
      palabras_clave: [],
      imagenes: []
    }
  })
  
  // Estados para funcionalidad
  const [cargando, setCargando] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [productoId, setProductoId] = useState(null)
  const [cargandoProducto, setCargandoProducto] = useState(false)
  const [estadoGuardado, setEstadoGuardado] = useState(true) // Para mostrar indicador de guardado
  
  // Cargar categorías y producto (si está en modo edición) al montar el componente
  useEffect(() => {
    cargarCategorias()
    
    if (modo === 'editar' && slug) {
      cargarProductoParaEditar(slug)
    }
  }, [modo, slug])
  
  // Función para cargar categorías
  const cargarCategorias = async () => {
    try {
      console.log('📂 Cargando categorías para CreadorProductosPR...')
      
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
      
      if (error) throw error
      
      console.log('📂 Categorías cargadas:', data?.length || 0, data)
      setCategorias(data || [])
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error)
      setCategorias([])
    }
  }

  // Función para cargar producto existente para editar
  const cargarProductoParaEditar = async (slugProducto) => {
    setCargandoProducto(true)
    try {
      console.log('🔍 CARGANDO PRODUCTO PARA EDITAR:', slugProducto)
      
      const { data, error } = await clienteSupabase
        .from('productos')
        .select(`
          *,
          categoria:categorias(id, nombre)
        `)
        .eq('slug', slugProducto)
        .single()
      
      if (error) throw error
      
      if (data) {
        console.log('📦 DATOS COMPLETOS DESDE SUPABASE:', data)
        
        // Mapear TODOS los datos del producto a nuestro estado
        setDatosProducto({
          // ID del producto - CRÍTICO para modo edición
          id: data.id,
          
          // Campos básicos
          nombre: data.nombre || '',
          slug: data.slug || '',
          // Descripción como JSON: { titulo, contenido } con retrocompatibilidad
          descripcion_titulo: typeof data.descripcion === 'object' && data.descripcion?.titulo ? data.descripcion.titulo : '',
          descripcion_contenido: typeof data.descripcion === 'object' && data.descripcion?.contenido ? data.descripcion.contenido : (typeof data.descripcion === 'string' ? data.descripcion : ''),
          precio: data.precio || '',
          precio_original: data.precio_original || '',
          descuento: data.descuento || 0,
          categoria_id: data.categoria_id || '',
          estado: data.estado || 'borrador',
          
          // Arrays / objetos dinámicos
          ganchos: data.ganchos || [],
          // Soporte JSONB: preferir columnas *_jsonb si existen
          beneficios: data.beneficios_jsonb || data.beneficios || [],
          ventajas: data.ventajas_jsonb || data.ventajas || [],
          palabras_clave: data.palabras_clave || [],
          
          // Inventario y configuración
          stock: data.stock || 0,
          stock_minimo: data.stock_minimo || 5,
          destacado: data.destacado || false,
          activo: data.activo !== false, // Por defecto true
          
          // Configuración de landing
          landing_tipo: data.landing_tipo || 'temu',
          
          // Especificaciones físicas
          peso: data.peso || '',
          dimensiones: data.dimensiones || null,
          marca: data.marca || '',
          modelo: data.modelo || '',
          color: data.color || '',
          talla: data.talla || '',
          material: data.material || '',
          
          // SEO
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          
          // Imágenes
          fotos_principales: data.fotos_principales || [],
          fotos_secundarias: data.fotos_secundarias || [],
          
          // CAMPOS JSON COMPLEJOS
          promociones: data.promociones || null,
          banner_animado: data.banner_animado || null,
          puntos_dolor: data.puntos_dolor || null,
          caracteristicas: data.caracteristicas_jsonb || data.caracteristicas || null,
          testimonios: data.testimonios || null,
          faq: data.faq || null,
          garantias: data.garantias || null,
          cta_final: data.cta_final || null
        })
        
        console.log('✅ PRODUCTO MAPEADO CORRECTAMENTE CON TODOS LOS CAMPOS')
        setProductoId(data.id)
      }
    } catch (error) {
      console.error('❌ Error al cargar producto:', error)
      manejarError('Error al cargar el producto para editar')
    } finally {
      setCargandoProducto(false)
    }
  }
  
  // Función para actualizar datos del producto
  const actualizarDatosProducto = (nuevosDatos) => {
    console.log('🔍 ANTES DE ACTUALIZAR - Estado actual completo:', datosProducto)
    console.log('🔍 ANTES DE ACTUALIZAR - Campos visibles:', Object.keys(datosProducto).filter(k => datosProducto[k] !== '' && datosProducto[k] !== null && datosProducto[k] !== undefined))
    console.log('🔍 DATOS NUEVOS que llegan:', nuevosDatos)
    
    setDatosProducto(prev => {
      console.log('🔍 DENTRO DE setDatosProducto - Estado anterior:', prev)
      console.log('🔍 DENTRO DE setDatosProducto - Campos anteriores:', Object.keys(prev).filter(k => prev[k] !== '' && prev[k] !== null && prev[k] !== undefined))
      
      const datosActualizados = { ...prev, ...nuevosDatos }
      
      console.log('🔍 DESPUÉS DE MERGE - Estado resultante:', datosActualizados)
      console.log('🔍 DESPUÉS DE MERGE - Campos resultantes:', Object.keys(datosActualizados).filter(k => datosActualizados[k] !== '' && datosActualizados[k] !== null && datosActualizados[k] !== undefined))
      console.log('🔍 DESPUÉS DE MERGE - Nombre:', datosActualizados.nombre)
      console.log('🔍 DESPUÉS DE MERGE - Precio:', datosActualizados.precio)
      console.log('🔍 DESPUÉS DE MERGE - Slug:', datosActualizados.slug)
      
      // Guardar en localStorage solo si estamos en modo crear
      if (modo === 'crear') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(datosActualizados))
          console.log('💾 Estado guardado en localStorage:', datosActualizados)
        } catch (error) {
          console.error('Error al guardar estado en localStorage:', error)
        }
      }
      
      return datosActualizados
    })
    
    // Log después de que React procese el estado
    setTimeout(() => {
      console.log('🔍 ESTADO FINAL después de React update:', datosProducto)
    }, 100)
  }

  // Función para limpiar el estado guardado
  const limpiarEstadoGuardado = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PESTANA_KEY)
    } catch (error) {
      console.error('Error al limpiar estado guardado:', error)
    }
  }

  // Función para cambiar pestaña con animación suave
  const cambiarPestana = (nuevaPestana) => {
    if (nuevaPestana === pestanaActiva) return
    
    setPestanaActiva(nuevaPestana)
    
    // Guardar pestaña activa en localStorage solo en modo crear
    if (modo === 'crear') {
      try {
        localStorage.setItem(PESTANA_KEY, nuevaPestana)
      } catch (error) {
        console.error('Error al guardar pestaña en localStorage:', error)
      }
    }
    
    // Scroll suave hacia la pestaña activa en móvil
    if (pestanasBarRef.current) {
      const pestanaActual = pestanasBarRef.current.querySelector(`[data-pestana="${nuevaPestana}"]`)
      if (pestanaActual) {
        pestanaActual.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }

  // Funciones para manejar el deslizamiento táctil
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    isDragging.current = false
  }

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return
    
    const touch = e.touches[0]
    const currentX = touch.clientX
    const currentY = touch.clientY
    const dx = currentX - touchStartX.current
    const dy = currentY - touchStartY.current
    
    // Considerar arrastre solo si el gesto es mayormente horizontal
    const umbral = 8
    const mayormenteHorizontal = Math.abs(dx) > Math.abs(dy)
    if (Math.abs(dx) > umbral && mayormenteHorizontal) {
      isDragging.current = true
      // Evitar interferencia de scroll cuando el gesto es horizontal
      if (e.cancelable) e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return
    
    const touch = e.changedTouches[0]
    touchEndX.current = touch.clientX
    touchEndY.current = touch.clientY
    const diffX = touchStartX.current - touchEndX.current
    const diffY = touchStartY.current - touchEndY.current
    const minSwipeDistance = 30
    const horizontalDominante = Math.abs(diffX) > Math.abs(diffY)
    
    // Solo procesar si es mayormente horizontal y supera el umbral
    if (horizontalDominante && Math.abs(diffX) > minSwipeDistance) {
      const pestanasArray = pestanas.map(p => p.id)
      const indiceActual = pestanasArray.indexOf(pestanaActiva)
      
      if (diffX > 0 && indiceActual < pestanasArray.length - 1) {
        // Deslizar hacia la izquierda - siguiente pestaña
        cambiarPestana(pestanasArray[indiceActual + 1])
      } else if (diffX < 0 && indiceActual > 0) {
        // Deslizar hacia la derecha - pestaña anterior
        cambiarPestana(pestanasArray[indiceActual - 1])
      }
    }
    
    // Resetear valores
    touchStartX.current = 0
    touchEndX.current = 0
    touchStartY.current = 0
    touchEndY.current = 0
    isDragging.current = false
  }

  // Prevenir el click si se está arrastrando
  const handlePestanaClick = (pestanaId, e) => {
    if (isDragging.current) {
      e.preventDefault()
      return
    }
    cambiarPestana(pestanaId)
  }

  // Efecto para guardar automáticamente los datos del producto
  useEffect(() => {
    // Solo guardar en modo crear y si hay datos que guardar
    if (modo === 'crear' && (datosProducto.nombre || datosProducto.descripcion || datosProducto.precio)) {
      setEstadoGuardado(false) // Indicar que hay cambios sin guardar
      
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(datosProducto))
          setEstadoGuardado(true) // Indicar que se guardó correctamente
        } catch (error) {
          console.error('Error al guardar en localStorage:', error)
        }
      }, 1000) // Debounce de 1 segundo

      return () => clearTimeout(timeoutId)
    }
  }, [datosProducto, modo])

  // Efecto para limpiar localStorage cuando se cambia de modo crear a editar
  useEffect(() => {
    if (modo === 'editar') {
      limpiarEstadoGuardado()
    }
  }, [modo])
  
  // Función para guardar producto
  const guardarProducto = async () => {
    try {
      setCargando(true)
      
      // Validaciones básicas
      if (!datosProducto.nombre?.trim()) {
        manejarError('El nombre del producto es obligatorio')
        return
      }
      
      if (!datosProducto.precio || datosProducto.precio <= 0) {
        manejarError('El precio debe ser mayor a 0')
        return
      }

      // Helper: asegurar que los campos JSONB se envíen como objetos
      const toJsonb = (val, fallback = null) => {
        if (val === null || val === undefined) return fallback
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val)
            return parsed
          } catch (e) {
            console.warn('No se pudo parsear JSON, usando fallback:', e?.message)
            return fallback
          }
        }
        if (typeof val === 'object') return val
        return fallback
      }

      // Preparar datos para Supabase con tipos correctos
      const datosParaGuardar = {
        nombre: datosProducto.nombre ? datosProducto.nombre.trim() : null,
        slug: datosProducto.slug || datosProducto.nombre.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        // Descripción: enviar siempre como objeto JSONB si hay datos
        descripcion: (datosProducto.descripcion_titulo || datosProducto.descripcion_contenido)
          ? {
              titulo: (datosProducto.descripcion_titulo || '🚀 Descubre Todo lo que Necesitas Saber').trim(),
              contenido: (datosProducto.descripcion_contenido || '').trim()
            }
          : (datosProducto.descripcion ? datosProducto.descripcion.trim() : null),
        // Campos NUMERIC (permiten decimales)
        precio: toNum(datosProducto.precio),
        precio_original: toNum(datosProducto.precio_original),
        // Campos INT4 (solo enteros)
        descuento: toInt(datosProducto.descuento),
        categoria_id: datosProducto.categoria_id || null,
        stock: toInt(datosProducto.stock),
        stock_minimo: toInt(datosProducto.stock_minimo),
        estado: datosProducto.estado || 'borrador',
        destacado: datosProducto.destacado || false,
        activo: datosProducto.activo !== false, // Por defecto true
        
        // Campos de texto
        ganchos: datosProducto.ganchos || [],
        palabras_clave: datosProducto.palabras_clave || [],

        // Campos JSONB nuevos (editor avanzado)
        ventajas_jsonb: toJsonb(datosProducto.ventajas),
        beneficios_jsonb: toJsonb(datosProducto.beneficios),
        caracteristicas_jsonb: toJsonb(datosProducto.caracteristicas),
        
        // Especificaciones físicas
        peso: toNum(datosProducto.peso),
        dimensiones: procesarDimensiones(datosProducto.dimensiones),
        marca: datosProducto.marca ? datosProducto.marca.trim() : null,
        modelo: datosProducto.modelo ? datosProducto.modelo.trim() : null,
        color: datosProducto.color ? datosProducto.color.trim() : null,
        talla: datosProducto.talla ? datosProducto.talla.trim() : null,
        material: datosProducto.material ? datosProducto.material.trim() : null,
        origen_pais: datosProducto.origen_pais ? datosProducto.origen_pais.trim() : null,
        
        // Métricas - Usar helpers correctos según tipo de campo
        numero_de_ventas: toInt(datosProducto.numero_de_ventas),
        calificacion_promedio: toNum(datosProducto.calificacion_promedio),
        total_resenas: toInt(datosProducto.total_resenas),
        
        // Campos JSON complejos (aseguramos objeto JSONB)
        banner_animado: toJsonb(datosProducto.banner_animado),
        puntos_dolor: toJsonb(datosProducto.puntos_dolor),
        testimonios: toJsonb(datosProducto.testimonios),
        faq: toJsonb(datosProducto.faq),
        garantias: toJsonb(datosProducto.garantias),
        cta_final: toJsonb(datosProducto.cta_final),
        promociones: toJsonb(datosProducto.promociones),
        
        // SEO
        meta_title: datosProducto.meta_title ? datosProducto.meta_title.trim() : null,
        meta_description: datosProducto.meta_description ? datosProducto.meta_description.trim() : null,
        landing_tipo: datosProducto.landing_tipo ? datosProducto.landing_tipo.trim() : 'basico',
        garantia_meses: toInt(datosProducto.garantia_meses),
        
        // Timestamps
        ...(modo === 'editar' && { actualizado_el: new Date().toISOString() })
      }

      // Log de verificación de tipos antes del envío
      console.log('=== VERIFICACIÓN DE TIPOS ===')
      console.log('precio (numeric):', datosParaGuardar.precio, typeof datosParaGuardar.precio)
      console.log('precio_original (numeric):', datosParaGuardar.precio_original, typeof datosParaGuardar.precio_original)
      console.log('descuento (int4):', datosParaGuardar.descuento, typeof datosParaGuardar.descuento)
      console.log('stock (int4):', datosParaGuardar.stock, typeof datosParaGuardar.stock)
      console.log('stock_minimo (int4):', datosParaGuardar.stock_minimo, typeof datosParaGuardar.stock_minimo)
      console.log('garantia_meses (int4):', datosParaGuardar.garantia_meses, typeof datosParaGuardar.garantia_meses)
      console.log('=== FIN VERIFICACIÓN ===')

      console.log(`${modo === 'crear' ? 'Creando' : 'Actualizando'} producto:`, datosParaGuardar)

      let resultado
      if (modo === 'crear') {
        resultado = await clienteSupabase
          .from('productos')
          .insert([datosParaGuardar])
          .select()
      } else {
        resultado = await clienteSupabase
          .from('productos')
          .update(datosParaGuardar)
          .eq('id', productoId)
          .select()
      }

      const { data, error } = resultado

      if (error) {
        console.error('Error al guardar producto:', error)
        throw error
      }

      if (data && data[0]) {
        const productoGuardado = data[0]
        setProductoId(productoGuardado.id)
        
        // Actualizar datos locales con la respuesta de Supabase
        setDatosProducto(prev => ({ ...prev, ...productoGuardado }))
        
        manejarExito(`Producto ${modo === 'crear' ? 'creado' : 'actualizado'} exitosamente`)
      }

    } catch (error) {
      console.error('Error:', error)
      manejarError(`Error al ${modo === 'crear' ? 'crear' : 'actualizar'} el producto: ${error.message}`)
    } finally {
      setCargando(false)
    }
  }

  // Funciones de manejo de eventos
  const manejarExito = (mensaje) => {
    console.log('Éxito:', mensaje)
    
    // Limpiar estado guardado cuando se crea exitosamente un producto
    if (modo === 'crear') {
      limpiarEstadoGuardado()
    }
    
    // Llamar callback de éxito si existe
    if (onSuccess) {
      onSuccess(mensaje)
    }
    // Redirigir a la lista de productos después de crear/editar
    if (modo === 'crear') {
      navigate('/admin/productos')
    }
  }

  const manejarError = (error) => {
    console.error('Error:', error)
    // Aquí podrías agregar una notificación de error
  }
  
  // Función para manejar producto creado con IA (Transfiere datos al formulario)
  const manejarProductoCreado = async (producto) => {
    try {
      console.log('🎯 Producto recibido de IA para transferir al formulario:', producto)
      
      // 🔄 SIEMPRE usar actualizarDatosProducto para preservar campos existentes
      console.log('🔧 MODO: Actualización preservando campos existentes')
      console.log('🔍 ESTADO ACTUAL antes de actualizar:', datosProducto)
      
      // Usar actualizarDatosProducto que preserva automáticamente todos los campos existentes
      actualizarDatosProducto(producto)
      
      console.log('✅ Actualización completada - TODOS los campos preservados')
      
      // Cambiar a la pestaña del formulario
      setPestanaActiva('formulario')
      
      console.log('✅ Producto transferido exitosamente al formulario')
      console.log('ℹ️ El usuario ahora puede editar el producto antes de guardarlo')
      
    } catch (error) {
      console.error('❌ Error procesando producto de IA:', error)
      
      // Aún así intentar actualizar los datos básicos para que el usuario pueda ver algo
      try {
        const datosBasicos = {
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          precio: parseFloat(producto.precio) || 0,
          slug: producto.slug || generarSlug(producto.nombre || '')
        }
        actualizarDatosProducto(datosBasicos)
        setPestanaActiva('formulario')
        console.log('⚠️ Datos básicos cargados a pesar del error')
      } catch (fallbackError) {
        console.error('❌ Error crítico cargando datos:', fallbackError)
      }
      
      // Mostrar error al usuario
      console.log('⚠️ Hubo un error procesando el producto, pero se cargaron los datos básicos.')
    }
  }

  // Configuración de pestañas
  const pestanas = [
    { id: 'formulario', nombre: 'Formulario', icono: '📝' },
    { id: 'imagenes', nombre: 'Imágenes (Landing)', icono: '🖼️' },
    { id: 'videos', nombre: 'Videos (Producto)', icono: '🎬' },
    { id: 'crearIA', nombre: 'Crear con IA', icono: '🤖' },
    { id: 'imagenesIA', nombre: 'Imágenes con IA', icono: '🎨' },
    { id: 'vistaPrevia', nombre: 'Vista Previa', icono: '👁️' }
  ]

  // Renderizar contenido de pestaña activa
  const renderizarContenidoPestana = () => {
    switch (pestanaActiva) {
      case 'formulario':
        return (
          <FormularioProducto
            datosProducto={datosProducto}
            actualizarDatosProducto={actualizarDatosProducto}
            modo={modo}
            onGuardar={guardarProducto}
            cargando={cargando}
          />
        )
      
      case 'imagenes':
        return (
          <ImagenesLanding
            datosProducto={datosProducto}
            cargando={cargando}
            setCargando={setCargando}
            manejarExito={manejarExito}
            manejarError={manejarError}
            productoId={productoId}
          />
        )
      case 'videos':
        return (
          <VideosProducto
            productoId={productoId}
            manejarExito={manejarExito}
            manejarError={manejarError}
          />
        )
      
      case 'crearIA':
        return (
          <CrearProductoIA
            mostrar={true}
            onCerrar={() => {}} // No necesario cerrar en modo embed
            onProductoCreado={manejarProductoCreado}
            categorias={categorias}
            modo="embed" // Modo embed para integrarse en la pestaña sin modal
            productoParaEditar={modo === 'editar' ? datosProducto : null} // Pasar producto en modo edición
          />
        )
      
      case 'imagenesIA':
        return (
          <ChatImagenesIAInline
            producto={datosProducto}
            onImagenesGeneradas={(imagenes) => {
              actualizarDatosProducto({ imagenes: [...datosProducto.imagenes, ...imagenes] })
              manejarExito('Imágenes generadas correctamente')
            }}
          />
        )
      
      case 'vistaPrevia':
        return (
          <div className="contenido-pestana">
            <div className="seccion-informacion">
              <div className="icono-seccion">👁️</div>
              <h3>Vista Previa</h3>
              <p>Revisa cómo se verá tu producto antes de publicarlo.</p>
            </div>
            
            <div className="zona-vista-previa">
              <div className="icono-preview">🔍</div>
              <h4>Vista Previa del Producto</h4>
              <p>Aquí podrás ver una simulación de cómo se verá tu producto en la tienda</p>
              <div className="placeholder-preview">
                <div className="preview-card">
                  <h5>{datosProducto.nombre || 'Nombre del producto'}</h5>
                  <p>{datosProducto.descripcion || 'Descripción del producto'}</p>
                  <div className="preview-price">
                    ${datosProducto.precio || '0'} COP
                  </div>
                  {datosProducto.imagenes && datosProducto.imagenes.length > 0 && (
                    <div className="preview-images">
                      <p>Imágenes: {datosProducto.imagenes.length}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="contenido-pestana">
            <p>Selecciona una pestaña para comenzar</p>
          </div>
        )
    }
  }

  return (
    <div className="creador-productos-pr">
      {/* Mostrar indicador de carga si está cargando el producto */}
      {cargandoProducto && (
        <div className="cargando-producto">
          <div className="spinner"></div>
          <p>Cargando producto para editar...</p>
        </div>
      )}
      
      {/* Encabezado principal */}
      <div className="creador-pr-header">
        <div className="header-contenido">
          <h1 className="creador-pr-titulo">
            {modo === 'editar' ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h1>
          <p className="creador-pr-subtitulo">
            {modo === 'editar' 
              ? 'Modifica la información de tu producto usando las pestañas disponibles'
              : 'Utiliza las pestañas para completar la información de tu producto'
            }
          </p>
        </div>
        
        {/* Indicador de guardado automático - solo en modo crear */}
        {modo === 'crear' && (
          <div className="indicador-guardado">
            {estadoGuardado ? (
              <span className="guardado-exitoso">
                <span className="icono-check">✓</span>
                Guardado automáticamente
              </span>
            ) : (
              <span className="guardando">
                <span className="icono-guardando">⋯</span>
                Guardando...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Barra de pestañas con soporte táctil */}
      <div 
        className="pestanas-bar-pr"
        ref={pestanasBarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pestanas.map(pestana => (
          <button
            key={pestana.id}
            data-pestana={pestana.id}
            className={`pestana-boton-pr ${pestanaActiva === pestana.id ? 'activa' : ''}`}
            onClick={(e) => handlePestanaClick(pestana.id, e)}
          >
            <span className="pestana-icono-pr">{pestana.icono}</span>
            <span className="pestana-nombre-pr">{pestana.nombre}</span>
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa con soporte de deslizamiento táctil */}
      <div 
        className="pestana-contenido-pr"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderizarContenidoPestana()}
      </div>
    </div>
  )
}

export default CreadorProductosPR