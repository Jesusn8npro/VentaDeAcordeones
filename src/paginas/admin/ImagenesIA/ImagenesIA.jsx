import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import Compressor from 'compressorjs'
import { comprimirImagen, CONFIGURACIONES_PREDEFINIDAS } from '../../../utilidades/compresionImagenes'
import './ImagenesIA.css'

// Página de administración para gestionar imágenes generadas (IA) en Storage
export default function ImagenesIA() {
  const BUCKETS = ['imagenes', 'imagenes_tienda', 'imagenes_categorias', 'imagenes_articulos']

  const [bucketSeleccionado, setBucketSeleccionado] = useState(BUCKETS[0])
  const [archivos, setArchivos] = useState([]) // [{key,name,path,size,created_at,updated_at}]
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recientes')
  const [tamMinKB, setTamMinKB] = useState('')
  const [tamMaxKB, setTamMaxKB] = useState('')
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [tamanosPorKey, setTamanosPorKey] = useState({})
  const [mostrandoUsos, setMostrandoUsos] = useState(null) // ruta del archivo
  const [usos, setUsos] = useState([])
  const [reemplazarOriginal, setReemplazarOriginal] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [imagenModal, setImagenModal] = useState(null)
  const [previewsProductos, setPreviewsProductos] = useState([])
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null)
  const [presetCompresion, setPresetCompresion] = useState('web')
  const [calidadManual, setCalidadManual] = useState(null)
  const [blobOriginalModal, setBlobOriginalModal] = useState(null)
  const [tamOriginalKB, setTamOriginalKB] = useState(null)
  const [tamEstimadoKB, setTamEstimadoKB] = useState(null)
  const [calculandoTamano, setCalculandoTamano] = useState(false)
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState(null)
  const [campoSeleccionado, setCampoSeleccionado] = useState('imagen_principal')
  const [nombreDestino, setNombreDestino] = useState('')
  const [guardandoCampo, setGuardandoCampo] = useState(false)
  const [actualizarActiva, setActualizarActiva] = useState(true)
  const [conservarOriginal, setConservarOriginal] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(12)
  const [archivoNuevo, setArchivoNuevo] = useState(null)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [bucketDestino, setBucketDestino] = useState('imagenes')
  const [optimizarNuevo, setOptimizarNuevo] = useState(true)
  const [presetNuevo, setPresetNuevo] = useState('web')
  const [calidadNueva, setCalidadNueva] = useState(null)
  const [conservarOriginalNuevo, setConservarOriginalNuevo] = useState(true)
  const [subiendoNuevo, setSubiendoNuevo] = useState(false)
  const [modalSubirAbierto, setModalSubirAbierto] = useState(false)
  const [urlPreviewNuevo, setUrlPreviewNuevo] = useState(null)
  const [tamOriginalNuevoKB, setTamOriginalNuevoKB] = useState(null)
  const [tamEstimadoNuevoKB, setTamEstimadoNuevoKB] = useState(null)
  const [calculandoTamanoNuevo, setCalculandoTamanoNuevo] = useState(false)
  const [carpetasDisponibles, setCarpetasDisponibles] = useState(['imagenes'])
  const [productosDisponibles, setProductosDisponibles] = useState([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [mensajeOk, setMensajeOk] = useState('')

  // Listar archivos del bucket seleccionado
  const listarArchivos = useCallback(async () => {
    const carpetas = new Set(['imagenes'])
    async function listarRecursivo(base = '', depth = 0, acc = []) {
      const { data, error } = await clienteSupabase.storage.from(bucketSeleccionado).list(base, { limit: 1000 })
      if (error) throw error
      for (const item of (data || [])) {
        const esImagen = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.name)
        if (esImagen) {
          const path = base ? `${base.endsWith('/') ? base : base + '/'}` : ''
          const key = `${path}${item.name}`
          acc.push({ key, name: item.name, path, size: item?.size ?? null, created_at: item?.created_at ?? null, updated_at: item?.updated_at ?? null })
        } else {
          const nextBase = base ? `${base}/${item.name}` : item.name
          if (depth < 3) {
            carpetas.add(nextBase)
            await listarRecursivo(nextBase, depth + 1, acc)
          }
        }
      }
      return acc
    }
    try {
      setCargando(true)
      setError(null)
      const archivosPlanos = await listarRecursivo('')
      setArchivos(archivosPlanos)
      setSeleccionados(new Set())
      setCarpetasDisponibles(Array.from(carpetas).sort((a,b)=>a.localeCompare(b)))
      if (!['imagenes','imagenes_tienda','imagenes_categorias','imagenes_articulos'].includes(bucketDestino)) setBucketDestino('imagenes')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [bucketSeleccionado])

  useEffect(() => { listarArchivos() }, [listarArchivos])

  useEffect(() => {
    if (mensajeOk) {
      const t = setTimeout(() => setMensajeOk(''), 3000)
      return () => clearTimeout(t)
    }
  }, [mensajeOk])

  const archivosFiltrados = useMemo(() => {
    let lista = [...archivos]
    const q = (busqueda || '').toLowerCase()
    if (q) {
      lista = lista.filter(a => a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q))
    }
    const min = parseFloat(tamMinKB)
    const max = parseFloat(tamMaxKB)
    const sizeOf = (a) => (a.size ?? tamanosPorKey[a.key] ?? 0)
    if (!isNaN(min)) lista = lista.filter(a => sizeOf(a) / 1024 >= min)
    if (!isNaN(max)) lista = lista.filter(a => sizeOf(a) / 1024 <= max)
    switch (orden) {
      case 'recientes':
        lista.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
        break
      case 'antiguas':
        lista.sort((a, b) => new Date(a.updated_at || a.created_at || 0) - new Date(b.updated_at || b.created_at || 0))
        break
      case 'tamano_mayor':
        lista.sort((a, b) => sizeOf(b) - sizeOf(a))
        break
      case 'tamano_menor':
        lista.sort((a, b) => sizeOf(a) - sizeOf(b))
        break
      case 'nombre':
        lista.sort((a, b) => a.name.localeCompare(b.name))
        break
    }
    return lista
  }, [archivos, busqueda, tamMinKB, tamMaxKB, orden, tamanosPorKey])

  const totalPaginas = useMemo(() => Math.max(1, Math.ceil(archivosFiltrados.length / porPagina)), [archivosFiltrados.length, porPagina])
  const inicio = useMemo(() => Math.min((pagina - 1) * porPagina, Math.max(0, (totalPaginas - 1) * porPagina)), [pagina, porPagina, totalPaginas])
  const archivosPaginados = useMemo(() => archivosFiltrados.slice(inicio, inicio + porPagina), [archivosFiltrados, inicio, porPagina])
  useEffect(() => { setPagina(1) }, [bucketSeleccionado, busqueda, tamMinKB, tamMaxKB, orden])

  const obtenerUrlPublica = useCallback((key) => {
    const { data } = clienteSupabase.storage.from(bucketSeleccionado).getPublicUrl(key)
    return data?.publicUrl || ''
  }, [bucketSeleccionado])

  const descargarArchivo = useCallback(async (file) => {
    try {
      const url = obtenerUrlPublica(file.key || `${file.path}${file.name}`)
      const resp = await fetch(url)
      if (!resp.ok) return
      const blob = await resp.blob()
      const a = document.createElement('a')
      const objectUrl = URL.createObjectURL(blob)
      a.href = objectUrl
      a.download = file.name || 'imagen'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 500)
    } catch {}
  }, [obtenerUrlPublica])

  const subirNuevaImagen = useCallback(async () => {
    try {
      if (!archivoNuevo) return
      setSubiendoNuevo(true)
      const nombreBase = (nombreNuevo || archivoNuevo.name).trim()
      const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreBase)
      const extOrig = (archivoNuevo.type.split('/')[1] || (tieneExt ? nombreBase.split('.').pop() : 'jpg'))
      const baseName = tieneExt ? nombreBase.replace(/\.[a-zA-Z0-9]+$/, '') : nombreBase

      if (conservarOriginalNuevo) {
        const nombreOriginal = `${baseName}.original.${extOrig}`
        await clienteSupabase.storage.from(bucketDestino).upload(nombreOriginal, archivoNuevo, { upsert: true, contentType: archivoNuevo.type })
      }

      let archivoFinal = archivoNuevo
      if (optimizarNuevo) {
        const base = CONFIGURACIONES_PREDEFINIDAS[presetNuevo] || CONFIGURACIONES_PREDEFINIDAS.web
        const config = typeof calidadNueva === 'number' ? { ...base, quality: calidadNueva, convertSize: 0 } : base
        const { archivoComprimido } = await comprimirImagen(archivoNuevo, config)
        archivoFinal = archivoComprimido || archivoNuevo
      }
      const extFinal = (archivoFinal.type.split('/')[1] || extOrig || 'webp')
      const nombreFinal = `${baseName}.${extFinal}`

      await clienteSupabase.storage.from(bucketDestino).upload(nombreFinal, archivoFinal, { upsert: true, contentType: archivoFinal.type })
      await listarArchivos()
      setArchivoNuevo(null); setNombreNuevo(''); setCalidadNueva(null)
      if (urlPreviewNuevo) { URL.revokeObjectURL(urlPreviewNuevo); setUrlPreviewNuevo(null) }
      setModalSubirAbierto(false)
      setMensajeOk('Imagen subida correctamente')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubiendoNuevo(false)
    }
  }, [archivoNuevo, nombreNuevo, conservarOriginalNuevo, optimizarNuevo, presetNuevo, calidadNueva, bucketDestino, listarArchivos, urlPreviewNuevo])

  // Previsualización y estimación de tamaño para la subida nueva
  useEffect(() => {
    const prepararPreview = async () => {
      try {
        setTamOriginalNuevoKB(null)
        setTamEstimadoNuevoKB(null)
        if (!archivoNuevo) return
        const url = URL.createObjectURL(archivoNuevo)
        setUrlPreviewNuevo(url)
        setTamOriginalNuevoKB(Math.round(archivoNuevo.size / 1024))
        if (optimizarNuevo) {
          setCalculandoTamanoNuevo(true)
          const base = CONFIGURACIONES_PREDEFINIDAS[presetNuevo] || CONFIGURACIONES_PREDEFINIDAS.web
          const config = typeof calidadNueva === 'number' ? { ...base, quality: calidadNueva, convertSize: 0 } : base
          try {
            const { archivoComprimido } = await comprimirImagen(archivoNuevo, config)
            setTamEstimadoNuevoKB(Math.round(archivoComprimido.size / 1024))
          } catch (_) {
            setTamEstimadoNuevoKB(null)
          } finally {
            setCalculandoTamanoNuevo(false)
          }
        }
      } catch {}
    }
    prepararPreview()
    return () => { if (urlPreviewNuevo) { URL.revokeObjectURL(urlPreviewNuevo); setUrlPreviewNuevo(null) } }
  }, [archivoNuevo, optimizarNuevo, presetNuevo, calidadNueva])

  const toggleSeleccion = useCallback((file) => {
    const key = file.key || `${file.path}${file.name}`
    setSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  // Ver en qué productos se usa una imagen
  const consultarUsos = useCallback(async (file) => {
    try {
      const key = `${file.path}${file.name}`
      setMostrandoUsos(key)
      setImagenModal(obtenerUrlPublica(key))
      setModalAbierto(true)
      // Reset de campos del formulario de edición
      setProductoSeleccionadoId(null)
      setCampoSeleccionado('')
      setNombreDestino('')
      setActualizarActiva(true)
      setConservarOriginal(true)
      setArchivoSeleccionado(file)
      setUsos([])
      const url = obtenerUrlPublica(key)
      // Campos de uso según tabla producto_imagenes
      const campos = [
        'imagen_principal','imagen_secundaria_1','imagen_secundaria_2','imagen_secundaria_3','imagen_secundaria_4',
        'imagen_punto_dolor_1','imagen_punto_dolor_2','imagen_solucion_1','imagen_solucion_2',
        'imagen_testimonio_persona_1','imagen_testimonio_persona_2','imagen_testimonio_persona_3',
        'imagen_testimonio_producto_1','imagen_testimonio_producto_2','imagen_testimonio_producto_3',
        'imagen_caracteristicas','imagen_garantias','imagen_cta_final'
      ]
      const { data: registros, error } = await clienteSupabase
        .from('producto_imagenes')
        .select(['producto_id', ...campos].join(','))
      if (error) throw error
      const coincidencias = []
      for (const r of (registros || [])) {
        for (const campo of campos) {
          const val = r[campo]
          if (typeof val === 'string' && (val.includes(url) || val.includes(file.name))) {
            coincidencias.push({ producto_id: r.producto_id, campo, valor: val })
          }
        }
      }
      const ids = Array.from(new Set(coincidencias.map(c => c.producto_id).filter(Boolean)))
      let productos = []
      if (ids.length > 0) {
        const { data: prods } = await clienteSupabase
          .from('productos')
          .select('id, nombre, slug')
          .in('id', ids)
        productos = prods || []
      }
      const mapa = new Map(productos.map(p => [p.id, p]))
      setUsos(coincidencias.map(c => ({ producto_id: c.producto_id, producto: mapa.get(c.producto_id), campo: c.campo, valor: c.valor })))
      if (coincidencias.length > 0) {
        setProductoSeleccionadoId(coincidencias[0].producto_id)
        setCampoSeleccionado(coincidencias[0].campo)
      }
      const { data: imgs } = ids.length > 0 ? await clienteSupabase
        .from('producto_imagenes')
        .select('producto_id, imagen_principal, imagen_secundaria_1')
        .in('producto_id', ids) : { data: [] }
      const mapaImgs = new Map((imgs || []).map(i => [i.producto_id, i]))
      setPreviewsProductos(ids.map(pid => ({ producto: mapa.get(pid), imagenes: mapaImgs.get(pid) || {} })))
      // Cargar catálogo completo de productos para selección manual
      setBusquedaProducto('')
      setCargandoProductos(true)
      try {
        const { data: prodsTodos } = await clienteSupabase
          .from('productos')
          .select('id, nombre, slug, precio')
          .eq('activo', true)
          .order('nombre', { ascending: true })
          .limit(200)
        setProductosDisponibles(prodsTodos || [])
      } finally {
        setCargandoProductos(false)
      }
    } catch (e) {
      setUsos([])
      setPreviewsProductos([])
    }
  }, [obtenerUrlPublica])

  const cargarProductosFiltrados = useCallback(async (q) => {
    try {
      setCargandoProductos(true)
      let consulta = clienteSupabase
        .from('productos')
        .select('id, nombre, slug, precio')
        .eq('activo', true)
        .order('nombre', { ascending: true })
        .limit(200)
      if (q && q.trim().length >= 2) {
        const like = `%${q.trim()}%`
        consulta = consulta.or(`nombre.ilike.${like},slug.ilike.${like}`)
      }
      const { data } = await consulta
      setProductosDisponibles(data || [])
    } finally {
      setCargandoProductos(false)
    }
  }, [])

  useEffect(() => {
    if (modalAbierto) {
      const t = setTimeout(() => cargarProductosFiltrados(busquedaProducto), 250)
      return () => clearTimeout(t)
    }
  }, [modalAbierto, busquedaProducto, cargarProductosFiltrados])

  const productosSelector = useMemo(() => {
    const lista = [...productosDisponibles]
    const ids = new Set(lista.map(p => p.id))
    previewsProductos.forEach(pv => {
      const p = pv.producto
      if (p && !ids.has(p.id)) { lista.push(p); ids.add(p.id) }
    })
    return lista
  }, [productosDisponibles, previewsProductos])

  // Cargar blob original al abrir modal
  useEffect(() => {
    const cargarBlob = async () => {
      try {
        if (!modalAbierto || !archivoSeleccionado) return
        const key = archivoSeleccionado.key || `${archivoSeleccionado.path}${archivoSeleccionado.name}`
        const url = obtenerUrlPublica(key)
        const resp = await fetch(url)
        const blob = await resp.blob()
        setBlobOriginalModal(blob)
        setTamOriginalKB(Math.round(blob.size / 1024))
      } catch (_) {
        setBlobOriginalModal(null)
        setTamOriginalKB(null)
      }
    }
    cargarBlob()
  }, [modalAbierto, archivoSeleccionado, obtenerUrlPublica])

  // Estimar tamaño con debounce cuando cambian preset/calidad
  useEffect(() => {
    let t
    const estimar = async () => {
      try {
        if (!blobOriginalModal) return
        setCalculandoTamano(true)
        const base = CONFIGURACIONES_PREDEFINIDAS[presetCompresion] || CONFIGURACIONES_PREDEFINIDAS.web
        const config = typeof calidadManual === 'number' ? { ...base, quality: calidadManual, convertSize: 0 } : base
        const { archivoComprimido } = await comprimirImagen(blobOriginalModal, config)
        setTamEstimadoKB(Math.round(archivoComprimido.size / 1024))
      } catch (_) {
        setTamEstimadoKB(null)
      } finally {
        setCalculandoTamano(false)
      }
    }
    t = setTimeout(estimar, 250)
    return () => clearTimeout(t)
  }, [blobOriginalModal, presetCompresion, calidadManual])

  // Calcular tamaños solo para la página visible (throttle y solo HEAD)
  useEffect(() => {
    const controller = new AbortController()
    const calcSizes = async () => {
      try {
        const visibles = archivosPaginados.filter(a => (!a.size || a.size === 0) && !(a.key in tamanosPorKey))
        const limit = 2
        let index = 0
        const worker = async () => {
          while (index < visibles.length && !controller.signal.aborted) {
            const a = visibles[index++]
            const url = obtenerUrlPublica(a.key)
            try {
              const head = await fetch(url, { method: 'HEAD', signal: controller.signal })
              if (head.ok) {
                const cl = head.headers.get('content-length')
                if (cl) {
                  const size = parseInt(cl, 10)
                  setTamanosPorKey(prev => ({ ...prev, [a.key]: size }))
                }
              }
            } catch {}
          }
        }
        const workers = Array.from({ length: Math.min(limit, visibles.length) }, () => worker())
        await Promise.allSettled(workers)
      } catch {}
    }
    calcSizes()
    return () => controller.abort()
  }, [archivosPaginados, obtenerUrlPublica, tamanosPorKey])

  const formatoKB = (bytes) => {
    if (typeof bytes === 'number' && bytes > 0) return Math.round(bytes / 1024)
    return '—'
  }

  // Eliminar archivo del bucket
  const eliminarArchivo = useCallback(async (file) => {
    try {
      setCargando(true)
      const key = file.key || `${file.path}${file.name}`
      const { error } = await clienteSupabase.storage.from(bucketSeleccionado).remove([key])
      if (error) throw error
      await listarArchivos()
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [bucketSeleccionado, listarArchivos])

  // Optimizar imagen (comprimir y subir como .webp o reemplazar)
  const optimizarArchivo = useCallback(async (file) => {
    try {
      setCargando(true)
      setError(null)
      const key = file.key || `${file.path}${file.name}`
      const url = obtenerUrlPublica(key)
      const respuesta = await fetch(url)
      const blobOriginal = await respuesta.blob()
      const blobOptimizado = await new Promise((resolve, reject) => {
        // Calidad 0.75 y salida webp cuando sea posible
        new Compressor(blobOriginal, {
          quality: 0.75,
          mimeType: 'image/webp',
          convertSize: 0,
          success: resolve,
          error: reject
        })
      })
      const destino = reemplazarOriginal
        ? key
        : `${file.path}${file.name.replace(/\.[a-zA-Z0-9]+$/, '')}-optimizado.webp`
      const { error } = await clienteSupabase
        .storage
        .from(bucketSeleccionado)
        .upload(destino, blobOptimizado, { upsert: true, contentType: 'image/webp' })
      if (error) throw error
      await listarArchivos()
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [bucketSeleccionado, obtenerUrlPublica, reemplazarOriginal, listarArchivos])

  return (
    <div className="imagenes-ia">
      <h1 className="titulo-pagina">Gestión de Imágenes IA</h1>

      <div className="barra-herramientas">
        <label>Bucket</label>
        <select
          value={bucketSeleccionado}
          onChange={(e) => setBucketSeleccionado(e.target.value)}
        >
          {BUCKETS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={orden} onChange={e => setOrden(e.target.value)}>
          <option value="recientes">Más recientes</option>
          <option value="antiguas">Más antiguas</option>
          <option value="tamano_mayor">Tamaño mayor</option>
          <option value="tamano_menor">Tamaño menor</option>
          <option value="nombre">Nombre A-Z</option>
        </select>
        <div className="filtro-tamano">
          <input type="number" min="0" placeholder="Tamaño min (KB)" value={tamMinKB} onChange={e => setTamMinKB(e.target.value)} />
          <input type="number" min="0" placeholder="Tamaño max (KB)" value={tamMaxKB} onChange={e => setTamMaxKB(e.target.value)} />
        </div>
        <button className="btn btn-primario" onClick={() => setModalSubirAbierto(true)}>Subir archivo</button>
        <button className="btn btn-peligro" disabled={seleccionados.size === 0} onClick={async () => {
          try {
            setCargando(true)
            const keys = Array.from(seleccionados)
            const { error: errDel } = await clienteSupabase.storage.from(bucketSeleccionado).remove(keys)
            if (errDel) throw errDel
            setSeleccionados(new Set())
            await listarArchivos()
          } catch (e) {
            setError(e.message)
          } finally {
            setCargando(false)
          }
        }}>Eliminar seleccionadas</button>
      </div>

      {error && (
        <div className="mensaje-error">{error}</div>
      )}
      {mensajeOk && (
        <div className="mensaje-exito">{mensajeOk}</div>
      )}

      {cargando && (
        <div className="cargando">Cargando...</div>
      )}

      <div className="grid-archivos">
        {archivosPaginados.map(file => (
          <div key={file.key} className={`tarjeta-archivo ${seleccionados.has(file.key) ? 'seleccionada' : ''}`}>
            <label className="seleccion-checkbox" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={seleccionados.has(file.key)}
                onChange={() => toggleSeleccion(file)}
                aria-label={`Seleccionar ${file.name}`}
              />
            </label>
            <div className="vista-cuadrada" onClick={() => consultarUsos(file)}>
              {/* imagen */}
              <img
                src={obtenerUrlPublica(`${file.path}${file.name}`)}
                alt={file.name}
                className="imagen-preview"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            <div className="contenido-tarjeta">
              <div className="nombre-archivo">{file.name}</div>
              <div className="detalle-archivo">Tamaño: {formatoKB(file.size ?? tamanosPorKey[file.key])} KB</div>
              <div className="acciones">
                <button className="btn btn-primario" onClick={() => consultarUsos(file)}>Ver usos</button>
                <button className="btn btn-peligro" onClick={() => { if (confirm('¿Eliminar esta imagen del storage?')) eliminarArchivo(file) }}>Eliminar</button>
              </div>
              <div className="acciones-secundarias">
                <button className="btn btn-secundario" onClick={() => navigator.clipboard.writeText(obtenerUrlPublica(`${file.path}${file.name}`))}>Copiar URL</button>
                <button className="btn btn-ligero" onClick={() => consultarUsos(file)}>Abrir</button>
                <button className="btn" onClick={() => descargarArchivo(file)}>Descargar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="paginacion-ia">
        <button className="btn" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>Anterior</button>
        <span className="pagina-info">Página {pagina} de {totalPaginas}</span>
        <button className="btn" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina >= totalPaginas}>Siguiente</button>
        <select className="select-por-pagina" value={porPagina} onChange={e => { setPagina(1); setPorPagina(parseInt(e.target.value)) }}>
          <option value={8}>8</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </select>
      </div>

      {modalSubirAbierto && (
        <div className="modal-subida-ia" onClick={() => setModalSubirAbierto(false)}>
          <div className="modal-subida-contenido" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-subida-titulo">Subir imagen al bucket</h2>
            <div className="modal-subida-form">
              <input type="file" accept="image/*" onChange={e => setArchivoNuevo(e.target.files?.[0] || null)} />
              <input type="text" placeholder="Nombre del archivo (opcional)" value={nombreNuevo} onChange={e => setNombreNuevo(e.target.value)} />
              <select className="select-preset" value={bucketDestino} onChange={e => setBucketDestino(e.target.value)}>
                {BUCKETS.map((b) => (
                  <option key={`bkt-${b}`} value={b}>{b}</option>
                ))}
              </select>
              {urlPreviewNuevo && (
                <div className="preview-subida">
                  <img src={urlPreviewNuevo} alt="Previsualización" />
                  <div className="preview-info">
                    <div>Nombre seleccionado: <b>{archivoNuevo?.name}</b></div>
                    <div>Tamaño original: {tamOriginalNuevoKB ? `${tamOriginalNuevoKB} KB` : '—'}</div>
                    <div>Optimizado: {calculandoTamanoNuevo ? 'Calculando…' : (tamEstimadoNuevoKB ? `${tamEstimadoNuevoKB} KB` : '—')}</div>
                  </div>
                </div>
              )}
              <label className="check"><input type="checkbox" checked={optimizarNuevo} onChange={e => setOptimizarNuevo(e.target.checked)} /> Optimizar imagen</label>
              <select className="select-preset" value={presetNuevo} onChange={e => setPresetNuevo(e.target.value)}>
                <option value="producto">Producto (90%)</option>
                <option value="web">Web (80%)</option>
                <option value="movil">Móvil (75%)</option>
                <option value="thumbnail">Thumbnail (70%)</option>
                <option value="ultra">Ultra (60%)</option>
                <option value="extremo">Extremo (35%)</option>
              </select>
              <input type="range" min={0.1} max={0.95} step={0.05} value={typeof calidadNueva === 'number' ? calidadNueva : 0.8} onChange={e => setCalidadNueva(parseFloat(e.target.value))} />
              <label className="check"><input type="checkbox" checked={conservarOriginalNuevo} onChange={e => setConservarOriginalNuevo(e.target.checked)} /> Conservar original (backup)</label>
            </div>
            <div className="modal-subida-acciones">
              <button className="btn" onClick={() => { setModalSubirAbierto(false); setArchivoNuevo(null); setNombreNuevo(''); setCalidadNueva(null) }}>Cancelar</button>
              <button className="btn btn-primario" disabled={!archivoNuevo || subiendoNuevo} onClick={async () => { await subirNuevaImagen(); setModalSubirAbierto(false) }}>{subiendoNuevo ? 'Subiendo...' : 'Subir'}</button>
            </div>
          </div>
        </div>
      )}

      {modalAbierto && imagenModal && (
        <div className="modal-imagen-ia fade-in" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenido-ia slide-up" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar-ia" onClick={() => setModalAbierto(false)}>Cerrar</button>
            <div className="modal-body-ia" style={{ position: 'relative' }}>
              <div className="modal-left">
                <img src={imagenModal} alt="Imagen" className="modal-imagen-preview" />
              </div>
              <div className="modal-right">
                <div className="modal-controles-optim">
              <div className="control">
                <label>Preset de optimización</label>
                <select value={presetCompresion} onChange={e => setPresetCompresion(e.target.value)}>
                  <option value="producto">Producto (90%)</option>
                  <option value="web">Web (80%)</option>
                  <option value="movil">Móvil (75%)</option>
                  <option value="thumbnail">Thumbnail (70%)</option>
                  <option value="ultra">Ultra (60%, WebP)</option>
                  <option value="extremo">Extremo (35%, WebP, 800×600)</option>
                </select>
              </div>
              <div className="control">
                <label>Calidad manual</label>
                <input type="range" min={0.1} max={0.95} step={0.05} value={typeof calidadManual === 'number' ? calidadManual : 0.8} onChange={e => setCalidadManual(parseFloat(e.target.value))} />
                <span className="valor">{Math.round(100 * (typeof calidadManual === 'number' ? calidadManual : 0.8))}%</span>
              </div>
              <div className="control">
                <label>Tamaño</label>
                <div className="tam-metrica">
                  <span className="origen">Original: {tamOriginalKB ? `${tamOriginalKB} KB` : '—'}</span>
                  <span className="estimado">{calculandoTamano ? 'Calculando…' : `Optimizado: ${tamEstimadoKB ? `${tamEstimadoKB} KB` : '—'}`}</span>
                </div>
              </div>
                  <button className="btn btn-ambar" disabled={guardandoCampo || !archivoSeleccionado || !productoSeleccionadoId || !campoSeleccionado} onClick={async () => {
                    try {
                      setGuardandoCampo(true)
                      // 1. Obtener blob actual de la imagen modal
                      const urlActual = imagenModal || obtenerUrlPublica(`${archivoSeleccionado.path}${archivoSeleccionado.name}`)
                      const respActual = await fetch(urlActual)
                      const blobActual = await respActual.blob()

                      // 2. Backup original si procede
                      if (conservarOriginal) {
                        const extOrig = (blobActual.type.split('/')[1] || 'jpg')
                        const pathBackup = `productos/${productoSeleccionadoId}/originales/${campoSeleccionado}.original.${extOrig}`
                        const { data: pubBackup } = clienteSupabase.storage.from(bucketSeleccionado).getPublicUrl(pathBackup)
                        const hayBackup = pubBackup?.publicUrl ? await (async () => {
                          try { const r = await fetch(pubBackup.publicUrl); return r.ok } catch { return false }
                        })() : false
                        if (!hayBackup) {
                          const { error: errBackup } = await clienteSupabase.storage
                            .from(bucketSeleccionado)
                            .upload(pathBackup, blobActual, { upsert: false, contentType: blobActual.type })
                          if (errBackup && errBackup.message?.includes('already exists') === false) throw errBackup
                        }
                      }

                      // 3. Determinar destino activo (optimizada)
                      const base = CONFIGURACIONES_PREDEFINIDAS[presetCompresion] || CONFIGURACIONES_PREDEFINIDAS.web
                      const config = typeof calidadManual === 'number' ? { ...base, quality: calidadManual, convertSize: 0 } : base
                      let archivoFinal = blobActual
                      if (actualizarActiva) {
                        const { archivoComprimido } = await comprimirImagen(blobActual, config)
                        archivoFinal = archivoComprimido || blobActual
                      }
                      const extFinal = (archivoFinal.type.split('/')[1] || 'webp')
                      const originalKey = archivoSeleccionado.key || `${archivoSeleccionado.path}${archivoSeleccionado.name}`
                      const pathFinal = (() => {
                        const nombreBaseDest = nombreDestino?.trim()
                        if (!conservarOriginal) {
                          if (nombreBaseDest) {
                            const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreBaseDest)
                            const nuevoNombre = tieneExt ? nombreBaseDest : `${nombreBaseDest}.${extFinal}`
                            // Mantener la carpeta original del archivo
                            return `${archivoSeleccionado.path}${nuevoNombre}`
                          }
                          return originalKey
                        }
                        const nombreBase = (nombreBaseDest || `${campoSeleccionado}`)
                        if (nombreBaseDest) {
                          const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreBase)
                          const nombreConExt = tieneExt ? nombreBase : `${nombreBase}.${extFinal}`
                          return `productos/${productoSeleccionadoId}/${campoSeleccionado}/${nombreConExt}`
                        }
                        return `productos/${productoSeleccionadoId}/${campoSeleccionado}.${extFinal}`
                      })()

                      // 4. Subir optimizada activa
                      const { error: errUpload } = await clienteSupabase.storage
                        .from(bucketSeleccionado)
                        .upload(pathFinal, archivoFinal, { upsert: true, contentType: archivoFinal.type })
                      if (errUpload) throw errUpload

                      // 5. Verificar disponibilidad y actualizar BD
                      const { data: pubFinal } = clienteSupabase.storage.from(bucketSeleccionado).getPublicUrl(pathFinal)
                      if (!pubFinal?.publicUrl) throw new Error('No se pudo obtener URL pública del destino')
                      const okFinal = await (async () => { try { const r = await fetch(pubFinal.publicUrl); if (!r.ok) return false; const b = await r.blob(); return b.size > 0 } catch { return false } })()
                      if (!okFinal) throw new Error('El archivo optimizado no está disponible aún')

                      // 6. Escribir en producto_imagenes
                      const { data: row, error: errRow } = await clienteSupabase
                        .from('producto_imagenes')
                        .select('producto_id')
                        .eq('producto_id', productoSeleccionadoId)
                        .single()
                      if (!errRow && row) {
                        await clienteSupabase
                          .from('producto_imagenes')
                          .update({ [campoSeleccionado]: pubFinal.publicUrl, actualizado_el: new Date().toISOString() })
                          .eq('producto_id', productoSeleccionadoId)
                      } else {
                        await clienteSupabase
                          .from('producto_imagenes')
                          .insert({ producto_id: productoSeleccionadoId, [campoSeleccionado]: pubFinal.publicUrl, estado: 'pendiente' })
                      }

                      // 7. Si se renombró sin conservar original, eliminar la anterior clave
                      if (!conservarOriginal && originalKey && originalKey !== pathFinal) {
                        await clienteSupabase.storage.from(bucketSeleccionado).remove([originalKey])
                      }

                      // 8. Refresco visual y feedback
                      setImagenModal(`${pubFinal.publicUrl}?v=${Date.now()}`)
                      await listarArchivos()
                      setModalAbierto(false)
                      setMensajeOk('Cambios aplicados correctamente')
                      setProductoSeleccionadoId(null)
                      setCampoSeleccionado('')
                      setNombreDestino('')
                    } catch (e) {
                      setError(e.message)
                    } finally {
                      setGuardandoCampo(false)
                    }
                  }}>Aplicar cambios</button>
                  {guardandoCampo && <div className="modal-guardando">Guardando…</div>}
                </div>
                <div className="seleccion-guardado">
                  <div className="checks">
                    <label className="check">
                      <input type="checkbox" checked={actualizarActiva} onChange={e => setActualizarActiva(e.target.checked)} />
                      Actualizar imagen (optimizar)
                    </label>
                    <label className="check">
                      <input type="checkbox" checked={conservarOriginal} onChange={e => setConservarOriginal(e.target.checked)} />
                      Conservar original (backup)
                    </label>
                  </div>
                  <div className="grupo">
                    <label>Producto</label>
                    <input type="text" placeholder="Buscar producto (min 2 letras)" value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)} />
                    <select value={productoSeleccionadoId || ''} onChange={e => setProductoSeleccionadoId(e.target.value || null)}>
                      <option value="">Selecciona…</option>
                      {productosSelector.map(p => (
                        <option key={`opt-${p.id}`} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    {cargandoProductos && <small>Cargando productos…</small>}
                  </div>
                  <div className="grupo">
                    <label>Campo</label>
                    <select value={campoSeleccionado} onChange={e => setCampoSeleccionado(e.target.value)}>
                      <option value="">Selecciona campo…</option>
                      <option value="imagen_principal">imagen_principal</option>
                      <option value="imagen_secundaria_1">imagen_secundaria_1</option>
                      <option value="imagen_secundaria_2">imagen_secundaria_2</option>
                      <option value="imagen_secundaria_3">imagen_secundaria_3</option>
                      <option value="imagen_secundaria_4">imagen_secundaria_4</option>
                      <option value="imagen_punto_dolor_1">imagen_punto_dolor_1</option>
                      <option value="imagen_punto_dolor_2">imagen_punto_dolor_2</option>
                      <option value="imagen_solucion_1">imagen_solucion_1</option>
                      <option value="imagen_solucion_2">imagen_solucion_2</option>
                      <option value="imagen_testimonio_persona_1">imagen_testimonio_persona_1</option>
                      <option value="imagen_testimonio_persona_2">imagen_testimonio_persona_2</option>
                      <option value="imagen_testimonio_persona_3">imagen_testimonio_persona_3</option>
                      <option value="imagen_testimonio_producto_1">imagen_testimonio_producto_1</option>
                      <option value="imagen_testimonio_producto_2">imagen_testimonio_producto_2</option>
                      <option value="imagen_testimonio_producto_3">imagen_testimonio_producto_3</option>
                      <option value="imagen_caracteristicas">imagen_caracteristicas</option>
                      <option value="imagen_garantias">imagen_garantias</option>
                      <option value="imagen_cta_final">imagen_cta_final</option>
                    </select>
                  </div>
                  <div className="grupo">
                    <label>Nombre de archivo destino</label>
                    <input type="text" placeholder={archivoSeleccionado?.name || ''} value={nombreDestino} onChange={e => setNombreDestino(e.target.value)} />
                  </div>
                  <div className="grupo acciones">
                    <small className="nota">El botón “Aplicar cambios” optimiza (si está activo), guarda backup original (si está activo) y actualiza el campo seleccionado.</small>
                  </div>
                </div>
                <div className="modal-usos-ia">
                  <h3>Usos detectados</h3>
                  {usos.length === 0 ? (
                    <div className="no-usos">No hay usos registrados.</div>
                  ) : (
                    <ul className="lista-usos">
                      {usos.map(u => (
                        <li key={`m-${u.producto_id}-${u.campo}`} className="item-uso">
                          <div>
                            <div className="uso-id">Producto ID: {u.producto_id}</div>
                            <div className="uso-detalle">{u.producto?.nombre}</div>
                            <div className="uso-detalle">Campo: {u.campo}</div>
                          </div>
                          {u.producto?.slug && (
                            <div className="links-producto">
                              <a href={`/producto/${u.producto.slug}`} className="link-producto">Ver producto</a>
                              <a href={`/landing/${u.producto.slug}`} className="link-producto">Ver landing</a>
                              <button className="btn btn-secundario" onClick={() => { setProductoSeleccionadoId(u.producto_id); setCampoSeleccionado(u.campo) }}>Seleccionar</button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
            {previewsProductos.length > 0 && (
              <div className="previews-productos">
                <h3>Productos asociados</h3>
                <div className="grid-previews">
                  {previewsProductos.map((p) => (
                    <div key={`pv-${p.producto?.id}`} className="preview-card">
                      <div className="preview-imagen">
                        {p.imagenes?.imagen_principal ? (
                          <img src={p.imagenes.imagen_principal} alt={p.producto?.nombre} />
                        ) : (
                          <div className="preview-placeholder">Sin imagen</div>
                        )}
                      </div>
                      <div className="preview-info">
                        <div className="preview-titulo">{p.producto?.nombre}</div>
                        {typeof p.producto?.precio === 'number' && (
                          <div className="preview-precio">${p.producto.precio.toLocaleString('es-CO')}</div>
                        )}
                        {p.producto?.slug && (
                          <div className="links-producto">
                            <a href={`/producto/${p.producto.slug}`} className="link-producto">Ver producto</a>
                            <a href={`/landing/${p.producto.slug}`} className="link-producto">Ver landing</a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}