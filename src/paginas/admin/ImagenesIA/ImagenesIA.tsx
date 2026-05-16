import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import Compressor from 'compressorjs'
import ModalSubirImagen from './ModalSubirImagen'
import ModalImagenIA from './ModalImagenIA'
import BarraHerramientasImagenes from './BarraHerramientasImagenes'
import { useConsultarUsos } from './useConsultarUsos'
import { useAplicarCambios } from './useAplicarCambios'
import { useSubirImagen } from './useSubirImagen'
import './ImagenesIA.css'

export default function ImagenesIA() {
  const BUCKETS = ['imagenes', 'imagenes_tienda', 'imagenes_categorias', 'imagenes_articulos']

  const [bucketSeleccionado, setBucketSeleccionado] = useState(BUCKETS[0])
  const [archivos, setArchivos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recientes')
  const [tamMinKB, setTamMinKB] = useState('')
  const [tamMaxKB, setTamMaxKB] = useState('')
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [tamanosPorKey, setTamanosPorKey] = useState({})
  const [mostrandoUsos, setMostrandoUsos] = useState(null)
  const [reemplazarOriginal, setReemplazarOriginal] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [imagenModal, setImagenModal] = useState(null)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(12)
  const [bucketDestino, setBucketDestino] = useState('imagenes')
  const [modalSubirAbierto, setModalSubirAbierto] = useState(false)
  const [carpetasDisponibles, setCarpetasDisponibles] = useState(['imagenes'])
  const [mensajeOk, setMensajeOk] = useState('')

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
    if (q) lista = lista.filter(a => a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q))
    const min = parseFloat(tamMinKB)
    const max = parseFloat(tamMaxKB)
    const sizeOf = (a) => (a.size ?? tamanosPorKey[a.key] ?? 0)
    if (!isNaN(min)) lista = lista.filter(a => sizeOf(a) / 1024 >= min)
    if (!isNaN(max)) lista = lista.filter(a => sizeOf(a) / 1024 <= max)
    switch (orden) {
      case 'recientes': lista.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()); break
      case 'antiguas': lista.sort((a, b) => new Date(a.updated_at || a.created_at || 0).getTime() - new Date(b.updated_at || b.created_at || 0).getTime()); break
      case 'tamano_mayor': lista.sort((a, b) => sizeOf(b) - sizeOf(a)); break
      case 'tamano_menor': lista.sort((a, b) => sizeOf(a) - sizeOf(b)); break
      case 'nombre': lista.sort((a, b) => a.name.localeCompare(b.name)); break
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

  const toggleSeleccion = useCallback((file) => {
    const key = file.key || `${file.path}${file.name}`
    setSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

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

  const eliminarSeleccionadas = useCallback(async () => {
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
  }, [seleccionados, bucketSeleccionado, listarArchivos])

  const optimizarArchivo = useCallback(async (file) => {
    try {
      setCargando(true)
      setError(null)
      const key = file.key || `${file.path}${file.name}`
      const url = obtenerUrlPublica(key)
      const respuesta = await fetch(url)
      const blobOriginal = await respuesta.blob()
      const blobOptimizado = await new Promise((resolve, reject) => {
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
                if (cl) setTamanosPorKey(prev => ({ ...prev, [a.key]: parseInt(cl, 10) }))
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

  const aplicarState = useAplicarCambios(
    imagenModal, archivoSeleccionado, bucketSeleccionado,
    obtenerUrlPublica, listarArchivos,
    setImagenModal, setModalAbierto,
    (msg) => setMensajeOk(msg),
    (err) => setError(err)
  )

  const {
    usos, previewsProductos, busquedaProducto, setBusquedaProducto,
    cargandoProductos, productosSelector, consultarUsos
  } = useConsultarUsos(
    obtenerUrlPublica, setModalAbierto, setImagenModal, setArchivoSeleccionado,
    aplicarState.setProductoSeleccionadoId,
    aplicarState.setCampoSeleccionado,
    modalAbierto
  )

  const subirState = useSubirImagen(
    bucketDestino, listarArchivos,
    (msg) => setMensajeOk(msg),
    (err) => setError(err)
  )

  return (
    <div className="imagenes-ia">
      <h1 className="titulo-pagina">Gestión de Imágenes IA</h1>

      <BarraHerramientasImagenes
        bucketSeleccionado={bucketSeleccionado}
        busqueda={busqueda}
        orden={orden}
        tamMinKB={tamMinKB}
        tamMaxKB={tamMaxKB}
        seleccionadosSize={seleccionados.size}
        onSetBucket={setBucketSeleccionado}
        onSetBusqueda={setBusqueda}
        onSetOrden={setOrden}
        onSetTamMinKB={setTamMinKB}
        onSetTamMaxKB={setTamMaxKB}
        onAbrirSubir={() => setModalSubirAbierto(true)}
        onEliminarSeleccionadas={eliminarSeleccionadas}
      />

      {error && <div className="mensaje-error">{error}</div>}
      {mensajeOk && <div className="mensaje-exito">{mensajeOk}</div>}
      {cargando && <div className="cargando">Cargando...</div>}

      <div className="grid-archivos">
        {archivosPaginados.map(file => (
          <div key={file.key} className={`tarjeta-archivo ${seleccionados.has(file.key) ? 'seleccionada' : ''}`}>
            <label className="seleccion-checkbox" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={seleccionados.has(file.key)} onChange={() => toggleSeleccion(file)} aria-label={`Seleccionar ${file.name}`} />
            </label>
            <div className="vista-cuadrada" onClick={() => consultarUsos(file)}>
              <img src={obtenerUrlPublica(`${file.path}${file.name}`)} alt={file.name} className="imagen-preview" onError={(e) => { e.currentTarget.style.display = 'none' }} />
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
        <ModalSubirImagen
          archivoNuevo={subirState.archivoNuevo}
          nombreNuevo={subirState.nombreNuevo}
          bucketDestino={bucketDestino}
          optimizarNuevo={subirState.optimizarNuevo}
          presetNuevo={subirState.presetNuevo}
          calidadNueva={subirState.calidadNueva}
          conservarOriginalNuevo={subirState.conservarOriginalNuevo}
          subiendoNuevo={subirState.subiendoNuevo}
          urlPreviewNuevo={subirState.urlPreviewNuevo}
          tamOriginalNuevoKB={subirState.tamOriginalNuevoKB}
          tamEstimadoNuevoKB={subirState.tamEstimadoNuevoKB}
          calculandoTamanoNuevo={subirState.calculandoTamanoNuevo}
          onSetArchivoNuevo={subirState.setArchivoNuevo}
          onSetNombreNuevo={subirState.setNombreNuevo}
          onSetBucketDestino={setBucketDestino}
          onSetOptimizarNuevo={subirState.setOptimizarNuevo}
          onSetPresetNuevo={subirState.setPresetNuevo}
          onSetCalidadNueva={subirState.setCalidadNueva}
          onSetConservarOriginalNuevo={subirState.setConservarOriginalNuevo}
          onSubir={subirState.subirNuevaImagen}
          onCerrar={() => setModalSubirAbierto(false)}
        />
      )}

      {modalAbierto && imagenModal && (
        <ModalImagenIA
          imagenModal={imagenModal}
          archivoSeleccionado={archivoSeleccionado}
          usos={usos}
          previewsProductos={previewsProductos}
          presetCompresion={aplicarState.presetCompresion}
          calidadManual={aplicarState.calidadManual}
          tamOriginalKB={aplicarState.tamOriginalKB}
          tamEstimadoKB={aplicarState.tamEstimadoKB}
          calculandoTamano={aplicarState.calculandoTamano}
          actualizarActiva={aplicarState.actualizarActiva}
          conservarOriginal={aplicarState.conservarOriginal}
          productoSeleccionadoId={aplicarState.productoSeleccionadoId}
          campoSeleccionado={aplicarState.campoSeleccionado}
          nombreDestino={aplicarState.nombreDestino}
          guardandoCampo={aplicarState.guardandoCampo}
          busquedaProducto={busquedaProducto}
          productosSelector={productosSelector}
          cargandoProductos={cargandoProductos}
          onSetPresetCompresion={aplicarState.setPresetCompresion}
          onSetCalidadManual={aplicarState.setCalidadManual}
          onSetActualizarActiva={aplicarState.setActualizarActiva}
          onSetConservarOriginal={aplicarState.setConservarOriginal}
          onSetProductoSeleccionadoId={aplicarState.setProductoSeleccionadoId}
          onSetCampoSeleccionado={aplicarState.setCampoSeleccionado}
          onSetNombreDestino={aplicarState.setNombreDestino}
          onSetBusquedaProducto={setBusquedaProducto}
          onAplicarCambios={aplicarState.aplicarCambios}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  )
}
