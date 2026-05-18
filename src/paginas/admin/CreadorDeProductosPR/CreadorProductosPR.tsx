import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@/compat/router'
import './CreadorProductosPR.css'

import ContenidoPestana from './Componentes/ContenidoPestana'
import { clienteSupabase } from '../../../configuracion/supabase'
import { construirDatosParaGuardar } from './utilsProducto'

const STORAGE_KEY = 'creadorProductosPR_estado'
const PESTANA_KEY = 'creadorProductosPR_pestana'

const PESTANAS = [
  { id: 'formulario', nombre: 'Formulario', icono: '📝' },
  { id: 'imagenes', nombre: 'Imágenes (Landing)', icono: '🖼️' },
  { id: 'videos', nombre: 'Videos (Producto)', icono: '🎬' },
  { id: 'crearIA', nombre: 'Crear con IA', icono: '🤖' },
  { id: 'imagenesIA', nombre: 'Imágenes con IA', icono: '🎨' },
  { id: 'vistaPrevia', nombre: 'Vista Previa', icono: '👁️' }
]

const CreadorProductosPR = ({ modo = 'crear', slug = null, onSuccess = null }) => {
  const navigate = useNavigate()

  const pestanasBarRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const isDragging = useRef(false)

  const [pestanaActiva, setPestanaActiva] = useState(() => {
    if (modo === 'crear') {
      try { return localStorage.getItem(PESTANA_KEY) || 'formulario' } catch {}
    }
    return 'formulario'
  })

  const [datosProducto, setDatosProducto] = useState(() => {
    if (modo === 'crear' && !slug) {
      try {
        const guardado = localStorage.getItem(STORAGE_KEY)
        if (guardado) {
          const parsed = JSON.parse(guardado)
          if (parsed.datosProducto) return parsed.datosProducto
          return {
            nombre: parsed.nombre || '',
            slug: parsed.slug || '',
            descripcion: parsed.descripcion || '',
            precio: parsed.precio || '',
            categoria_id: parsed.categoria_id || '',
            estado: parsed.estado || 'borrador',
            ganchos: parsed.ganchos || parsed.ganchos_persuasivos || [],
            beneficios: parsed.beneficios || [],
            ventajas: parsed.ventajas || parsed.ventajas_competitivas || [],
            palabras_clave: parsed.palabras_clave || [],
            imagenes: parsed.imagenes || []
          }
        }
      } catch {}
    }
    return {
      nombre: '', slug: '', descripcion: '', precio: '',
      categoria_id: '', estado: 'borrador',
      ganchos: [], beneficios: [], ventajas: [], palabras_clave: [], imagenes: []
    }
  })

  const [cargando, setCargando] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [productoId, setProductoId] = useState(null)
  const [cargandoProducto, setCargandoProducto] = useState(false)
  const [estadoGuardado, setEstadoGuardado] = useState(true)

  useEffect(() => {
    cargarCategorias()
    if (modo === 'editar' && slug) {
      cargarProductoParaEditar(slug)
    }
  }, [modo, slug])

  useEffect(() => {
    if (modo === 'editar') {
      limpiarEstadoGuardado()
    }
  }, [modo])

  useEffect(() => {
    if (modo === 'crear' && (datosProducto.nombre || datosProducto.descripcion || datosProducto.precio)) {
      setEstadoGuardado(false)
      const t = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(datosProducto))
          setEstadoGuardado(true)
        } catch {}
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [datosProducto, modo])

  const cargarCategorias = async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
      if (error) throw error
      setCategorias(data || [])
    } catch {
      setCategorias([])
    }
  }

  const cargarProductoParaEditar = async (slugProducto) => {
    setCargandoProducto(true)
    try {
      const { data, error } = await clienteSupabase
        .from('productos')
        .select('*, categoria:categorias(id, nombre)')
        .eq('slug', slugProducto)
        .single()
      if (error) throw error
      if (data) {
        setDatosProducto({
          id: data.id,
          nombre: data.nombre || '',
          slug: data.slug || '',
          descripcion_titulo: typeof data.descripcion === 'object' && data.descripcion?.titulo ? data.descripcion.titulo : '',
          descripcion_contenido: typeof data.descripcion === 'object' && data.descripcion?.contenido ? data.descripcion.contenido : (typeof data.descripcion === 'string' ? data.descripcion : ''),
          precio: data.precio || '',
          precio_original: data.precio_original || '',
          descuento: data.descuento || 0,
          categoria_id: data.categoria_id || '',
          estado: data.estado || 'borrador',
          ganchos: data.ganchos || [],
          beneficios: data.beneficios_jsonb || data.beneficios || [],
          ventajas: data.ventajas_jsonb || data.ventajas || [],
          palabras_clave: data.palabras_clave || [],
          stock: data.stock || 0,
          stock_minimo: data.stock_minimo || 5,
          destacado: data.destacado || false,
          activo: data.activo !== false,
          landing_tipo: data.landing_tipo || 'temu',
          peso: data.peso || '',
          dimensiones: data.dimensiones || null,
          marca: data.marca || '',
          modelo: data.modelo || '',
          color: data.color || '',
          talla: data.talla || '',
          material: data.material || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          fotos_principales: data.fotos_principales || [],
          fotos_secundarias: data.fotos_secundarias || [],
          promociones: data.promociones || null,
          banner_animado: data.banner_animado || null,
          puntos_dolor: data.puntos_dolor || null,
          caracteristicas: data.caracteristicas_jsonb || data.caracteristicas || null,
          testimonios: data.testimonios || null,
          faq: data.faq || null,
          garantias: data.garantias || null,
          cta_final: data.cta_final || null
        })
        setProductoId(data.id)
      }
    } catch {
      manejarError('Error al cargar el producto para editar')
    } finally {
      setCargandoProducto(false)
    }
  }

  const actualizarDatosProducto = (nuevosDatos) => {
    setDatosProducto(prev => {
      const actualizado = { ...prev, ...nuevosDatos }
      if (modo === 'crear') {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado)) } catch {}
      }
      return actualizado
    })
  }

  const limpiarEstadoGuardado = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PESTANA_KEY)
    } catch {}
  }

  const cambiarPestana = (nuevaPestana) => {
    if (nuevaPestana === pestanaActiva) return
    setPestanaActiva(nuevaPestana)
    if (modo === 'crear') {
      try { localStorage.setItem(PESTANA_KEY, nuevaPestana) } catch {}
    }
    if (pestanasBarRef.current) {
      const el = pestanasBarRef.current.querySelector(`[data-pestana="${nuevaPestana}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    isDragging.current = false
  }

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartX.current
    const dy = touch.clientY - touchStartY.current
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      isDragging.current = true
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

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      const ids = PESTANAS.map(p => p.id)
      const i = ids.indexOf(pestanaActiva)
      if (diffX > 0 && i < ids.length - 1) cambiarPestana(ids[i + 1])
      else if (diffX < 0 && i > 0) cambiarPestana(ids[i - 1])
    }

    touchStartX.current = 0
    touchEndX.current = 0
    touchStartY.current = 0
    touchEndY.current = 0
    isDragging.current = false
  }

  const handlePestanaClick = (pestanaId, e) => {
    if (isDragging.current) { e.preventDefault(); return }
    cambiarPestana(pestanaId)
  }

  const guardarProducto = async () => {
    try {
      setCargando(true)
      if (!datosProducto.nombre?.trim()) { manejarError('El nombre del producto es obligatorio'); return }
      if (!datosProducto.precio || datosProducto.precio <= 0) { manejarError('El precio debe ser mayor a 0'); return }

      const datosParaGuardar = construirDatosParaGuardar(datosProducto, modo)

      const resultado = modo === 'crear'
        ? await clienteSupabase.from('productos').insert([datosParaGuardar]).select()
        : await clienteSupabase.from('productos').update(datosParaGuardar).eq('id', productoId).select()

      const { data, error } = resultado
      if (error) throw error

      if (data && data[0]) {
        setProductoId(data[0].id)
        setDatosProducto(prev => ({ ...prev, ...data[0] }))
        manejarExito(`Producto ${modo === 'crear' ? 'creado' : 'actualizado'} exitosamente`)
      }
    } catch (err) {
      manejarError(`Error al ${modo === 'crear' ? 'crear' : 'actualizar'} el producto: ${err.message}`)
    } finally {
      setCargando(false)
    }
  }

  const manejarExito = (mensaje) => {
    if (modo === 'crear') limpiarEstadoGuardado()
    if (onSuccess) onSuccess(mensaje)
    if (modo === 'crear') navigate('/admin/productos')
  }

  const manejarError = (_mensaje) => {}

  const manejarProductoCreado = (producto) => {
    actualizarDatosProducto(producto)
    setPestanaActiva('formulario')
  }

  return (
    <div className="creador-productos-pr">
      {cargandoProducto && (
        <div className="cargando-producto">
          <div className="spinner"></div>
          <p>Cargando producto para editar...</p>
        </div>
      )}

      <div className="creador-pr-header">
        <div className="header-contenido">
          <h1 className="creador-pr-titulo">
            {modo === 'editar' ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h1>
          <p className="creador-pr-subtitulo">
            {modo === 'editar'
              ? 'Modifica la información de tu producto usando las pestañas disponibles'
              : 'Utiliza las pestañas para completar la información de tu producto'}
          </p>
        </div>

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

      <div
        className="pestanas-bar-pr"
        ref={pestanasBarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {PESTANAS.map(pestana => (
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

      <div
        className="pestana-contenido-pr"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ContenidoPestana
          pestanaActiva={pestanaActiva}
          datosProducto={datosProducto}
          modo={modo}
          cargando={cargando}
          categorias={categorias}
          productoId={productoId}
          setCargando={setCargando}
          actualizarDatosProducto={actualizarDatosProducto}
          guardarProducto={guardarProducto}
          manejarExito={manejarExito}
          manejarError={manejarError}
          manejarProductoCreado={manejarProductoCreado}
        />
      </div>
    </div>
  )
}

export default CreadorProductosPR
