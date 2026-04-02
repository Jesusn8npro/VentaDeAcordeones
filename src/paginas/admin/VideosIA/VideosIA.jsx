import React, { useEffect, useMemo, useState, useCallback } from 'react'
import './VideosIA.css'
import { clienteSupabase } from '../../../configuracion/supabase'

export default function VideosIA() {
  const [archivos, setArchivos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recientes')
  const [cargando, setCargando] = useState(false)
  const [tamanos, setTamanos] = useState({})
  const [modalUsos, setModalUsos] = useState(null)
  const [productos, setProductos] = useState([])
  const [productoSel, setProductoSel] = useState('')
  const [tipoSel, setTipoSel] = useState('producto')
  const [modalOptimizar, setModalOptimizar] = useState(null)
  const [optimizacionCalidad, setOptimizacionCalidad] = useState(80)
  const [optimizacionPreset, setOptimizacionPreset] = useState('web')
  const [conservarOriginal, setConservarOriginal] = useState(true)
  const [nombreOptimizado, setNombreOptimizado] = useState('')
  const [tamanioOptimizado, setTamanioOptimizado] = useState(null)
  const [optimizacionCargando, setOptimizacionCargando] = useState(false)
  const [actualizarVideo, setActualizarVideo] = useState(false)
  const [tamOriginalModalKB, setTamOriginalModalKB] = useState(null)
  const urlOpt = import.meta.env.VITE_N8N_VIDEO_OPTIMIZE_URL || ''
  const apiKey = import.meta.env.VITE_N8N_API_KEY || ''

  const listar = useCallback(async () => {
    setCargando(true)
    try {
      const { data, error } = await clienteSupabase.storage.from('videos').list('', { limit: 1000 })
      if (error) throw error
      const arr = (data||[]).filter(i => /\.(mp4|mov|webm|mkv)$/i.test(i.name)).map(i => ({ key: i.name, name: i.name, url: clienteSupabase.storage.from('videos').getPublicUrl(i.name).data.publicUrl }))
      setArchivos(arr)
    } catch(e){ setArchivos([]) } finally { setCargando(false) }
  }, [])

  useEffect(() => { listar() }, [listar])

  useEffect(() => {
    const calc = async () => {
      const vis = archivos.map(a=>a.url).filter(u => !(tamanos[u]))
      const limit = 2
      let i=0
      const worker = async () => {
        while (i<vis.length) {
          const u = vis[i++]
          try { const r=await fetch(u,{method:'HEAD'}); if(r.ok){ const cl=r.headers.get('content-length'); if(cl) setTamanos(prev=>({...prev,[u]:parseInt(cl,10)})) } } catch {}
        }
      }
      await Promise.allSettled(Array.from({length:Math.min(limit,vis.length)},()=>worker()))
    }
    if (archivos.length) calc()
  }, [archivos])

  // Calcular tamaño optimizado en tiempo real
  useEffect(() => {
    if (!modalOptimizar) return
    
    // Fallback para tamaño original al abrir el modal
    const calcOriginal = async () => {
      try {
        const r = await fetch(modalOptimizar.url, { method: 'HEAD' })
        if (r.ok) {
          const cl = r.headers.get('content-length')
          if (cl) setTamOriginalModalKB(Math.round(parseInt(cl, 10) / 1024))
        }
      } catch {}
    }
    calcOriginal()

    const calcular = async () => {
      if (!urlOpt || !apiKey) return
      
      try {
        const resp = await fetch(urlOpt, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey
          },
          body: JSON.stringify({
            url: modalOptimizar.url,
            preset: optimizacionPreset,
            calidad: optimizacionCalidad,
            calcular_solo: true
          })
        })
        
        if (resp.ok) {
          const { tamanio_optimizado } = await resp.json()
          setTamanioOptimizado(tamanio_optimizado)
        }
      } catch (e) {
        console.error('Error calculando tamaño:', e)
      }
    }
    
    // Debounce para evitar muchas llamadas
    const timeout = setTimeout(calcular, 500)
    return () => clearTimeout(timeout)
  }, [modalOptimizar, urlOpt, apiKey, optimizacionPreset, optimizacionCalidad])

  const filtrados = useMemo(() => {
    let l=[...archivos]
    if (busqueda.trim()) { const q=busqueda.trim().toLowerCase(); l=l.filter(a=>a.name.toLowerCase().includes(q)) }
    if (orden==='recientes') l.sort((a,b)=>a.name.localeCompare(b.name))
    return l
  }, [archivos,busqueda,orden])

  const verUsos = useCallback(async (a) => {
    try {
      const { data } = await clienteSupabase.from('producto_videos').select('id, producto_id, tipo, url_publica, productos(nombre, slug)').or(`ruta_storage.eq.${a.key},url_publica.eq.${a.url}`)
      setModalUsos({ archivo:a, usos:data||[] })
      const { data: prods } = await clienteSupabase.from('productos').select('id,nombre,slug').eq('activo',true).order('nombre',{ascending:true}).limit(200)
      setProductos(prods||[])
    } catch { setModalUsos({ archivo:a, usos:[] }) }
  }, [])

  const asignar = useCallback(async () => {
    if (!productoSel) return
    try {
      const { data: pub } = clienteSupabase.storage.from('videos').getPublicUrl(modalUsos.archivo.key)
      const campo = {
        producto: 'video_producto',
        beneficios: 'video_beneficios',
        anuncio_1: 'video_anuncio_1',
        anuncio_2: 'video_anuncio_2',
        anuncio_3: 'video_anuncio_3',
        testimonio: 'video_testimonio_1',
        extra: 'video_extra'
      }[tipoSel] || 'video_producto'
      const { data: fila } = await clienteSupabase.from('producto_videos').select('producto_id').eq('producto_id', productoSel).single()
      if (fila && fila.producto_id) {
        const { error } = await clienteSupabase.from('producto_videos').update({ [campo]: pub.publicUrl, estado: 'completado' }).eq('producto_id', productoSel)
        if (error) throw error
      } else {
        const { error } = await clienteSupabase.from('producto_videos').insert({ producto_id: productoSel, [campo]: pub.publicUrl, estado: 'completado' })
        if (error) throw error
      }
      setModalUsos(null)
    } catch(e){}
  }, [modalUsos, productoSel, tipoSel])

  const optimizar = useCallback(async (a) => {
    if (!urlOpt || !apiKey) {
      alert('Error: Configura VITE_N8N_VIDEO_OPTIMIZE_URL y VITE_N8N_API_KEY')
      return
    }
    setModalOptimizar(a)
    setNombreOptimizado(a.name.replace(/\.[a-zA-Z0-9]+$/, '_optimizado'))
    setTamanioOptimizado(null)
    setActualizarVideo(false)
  }, [urlOpt, apiKey])

  const aplicarOptimizacion = useCallback(async () => {
    if (!modalOptimizar) return
    
    // Validar configuración
    if (!urlOpt || !apiKey) {
      alert('Error: Falta configuración del servidor de optimización')
      return
    }
    
    try {
      setOptimizacionCargando(true)
      
      // Llamar al servidor N8N para optimizar
      const resp = await fetch(urlOpt, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify({
          url: modalOptimizar.url,
          preset: optimizacionPreset,
          calidad: optimizacionCalidad
        })
      })
      
      if (!resp.ok) {
        throw new Error(`Error del servidor: ${resp.status}`)
      }
      
      const { base64, mime } = await resp.json()
      const bin = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const blob = new Blob([bin], { type: mime || 'video/mp4' })
      const ext = (mime || 'video/mp4').split('/')[1] || 'mp4'
      
      let nombreFinal
      if (actualizarVideo) {
        // Actualizar el mismo archivo
        nombreFinal = modalOptimizar.name
        await clienteSupabase.storage.from('videos').upload(nombreFinal, blob, {
          upsert: true,
          contentType: blob.type
        })
      } else {
        // Crear nuevo archivo
        nombreFinal = `${nombreOptimizado}.${ext}`
        await clienteSupabase.storage.from('videos').upload(nombreFinal, blob, {
          upsert: true,
          contentType: blob.type
        })
        
        // Eliminar original si no se conserva
        if (!conservarOriginal) {
          await clienteSupabase.storage.from('videos').remove([modalOptimizar.name])
        }
      }
      
      setModalOptimizar(null)
      await listar()
      alert(`Video ${actualizarVideo ? 'actualizado' : 'optimizado'} exitosamente`)
      
    } catch (e) {
      console.error('Error aplicando optimización:', e)
      alert(`Error al optimizar el video: ${e.message}`)
    } finally {
      setOptimizacionCargando(false)
    }
  }, [modalOptimizar, urlOpt, apiKey, optimizacionPreset, optimizacionCalidad, nombreOptimizado, conservarOriginal, listar, actualizarVideo])

  return (
    <div className="videos-ia">
      <div className="barra-herramientas">
        <label>Buscar</label>
        <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Nombre..." />
        <label>Orden</label>
        <select value={orden} onChange={e=>setOrden(e.target.value)}>
          <option value="recientes">Más recientes</option>
        </select>
      </div>
      <div className="grid-archivos">
        {filtrados.map(a => (
          <div key={a.key} className="tarjeta-archivo">
            <div className="vista-cuadrada">
              <video src={a.url} className="video-preview" controls muted preload="metadata" />
            </div>
            <div className="contenido-tarjeta">
              <div className="nombre-archivo">{a.name}</div>
              <div className="detalle-archivo">{tamanos[a.url] ? `${Math.round(tamanos[a.url]/1024)} KB` : '— KB'}</div>
              <div className="acciones">
                <button className="btn btn-primario" onClick={()=>verUsos(a)}>Ver usos</button>
                <button className="btn" onClick={()=>optimizar(a)}>Optimizar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalUsos && (
        <div className="modal-subida-ia" onClick={()=>setModalUsos(null)}>
          <div className="modal-subida-contenido" onClick={e=>e.stopPropagation()}>
            <h2 className="modal-subida-titulo">Usos del video</h2>
            <div className="modal-subida-form">
              <video src={modalUsos.archivo.url} className="video-preview" controls muted preload="metadata" />
              <div>
                <label>Producto</label>
                <select value={productoSel} onChange={e=>setProductoSel(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {productos.map(p=>(<option key={p.id} value={p.id}>{p.nombre}</option>))}
                </select>
                <label>Tipo</label>
                <select value={tipoSel} onChange={e=>setTipoSel(e.target.value)}>
                  <option value="producto">producto</option>
                  <option value="beneficios">beneficios</option>
                  <option value="anuncio_1">anuncio_1</option>
                  <option value="anuncio_2">anuncio_2</option>
                  <option value="anuncio_3">anuncio_3</option>
                  <option value="testimonio">testimonio</option>
                  <option value="extra">extra</option>
                </select>
              </div>
            </div>
            <div className="modal-subida-acciones">
              <button className="btn" onClick={()=>setModalUsos(null)}>Cerrar</button>
              <button className="btn btn-primario" onClick={asignar}>Asignar a producto</button>
            </div>
          </div>
        </div>
      )}

      {modalOptimizar && (
        <div className="modal-subida-ia" onClick={()=>setModalOptimizar(null)}>
          <div className="modal-subida-contenido modal-optimizacion" onClick={e=>e.stopPropagation()}>
            <h2 className="modal-subida-titulo">Optimizar video del producto</h2>
            <div className="modal-optimizacion-body">
              <div className="video-preview-container">
                <video src={modalOptimizar.url} className="video-preview" controls muted preload="metadata" />
              </div>
              <div className="optimizacion-config">
                <label>Preset de optimización</label>
                <select value={optimizacionPreset} onChange={e=>setOptimizacionPreset(e.target.value)}>
                  <option value="web">Web (80%)</option>
                  <option value="mobile">Móvil (60%)</option>
                  <option value="high">Alta calidad (90%)</option>
                  <option value="low">Baja calidad (40%)</option>
                </select>
                
                <label>Calidad manual</label>
                <div className="slider-container">
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={optimizacionCalidad} 
                    onChange={e=>setOptimizacionCalidad(parseInt(e.target.value))}
                    onMouseUp={e=>e.stopPropagation()}
                    onTouchEnd={e=>e.stopPropagation()}
                    disabled={optimizacionPreset !== 'web'}
                  />
                  <span className="slider-valor">{optimizacionCalidad}%</span>
                </div>
                
                <div className="info-tamanio">
                  <div>Tamaño original: {tamOriginalModalKB ? `${tamOriginalModalKB} KB` : (tamanos[modalOptimizar.url] ? `${Math.round(tamanos[modalOptimizar.url]/1024)} KB` : '—')}</div>
                  <div>Tamaño optimizado: {tamanioOptimizado ? `${Math.round(tamanioOptimizado/1024)} KB` : 'Calculando...'}</div>
                  {tamanioOptimizado && tamanos[modalOptimizar.url] && (
                    <div className="ahorro-info">
                      Ahorro: {Math.round((1 - tamanioOptimizado / tamanos[modalOptimizar.url]) * 100)}%
                    </div>
                  )}
                </div>
                
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={conservarOriginal} 
                    onChange={e=>setConservarOriginal(e.target.checked)}
                    onClick={e=>e.stopPropagation()}
                  />
                  Conservar original (backup)
                </label>
                
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={actualizarVideo} 
                    onChange={e=>setActualizarVideo(e.target.checked)}
                    onClick={e=>e.stopPropagation()}
                  />
                  Actualizar este video (sobrescribir)
                </label>
                
                {!actualizarVideo && (
                  <>
                    <label>Nombre de archivo destino (opcional)</label>
                    <input 
                      type="text" 
                      value={nombreOptimizado} 
                      onChange={e=>setNombreOptimizado(e.target.value)}
                      placeholder="nombre_del_archivo"
                    />
                  </>
                )}
              </div>
            </div>
            <div className="modal-subida-acciones">
              <button className="btn" onClick={()=>setModalOptimizar(null)}>Cancelar</button>
              <button 
                className="btn btn-primario" 
                onClick={aplicarOptimizacion}
                disabled={optimizacionCargando}
              >
                {optimizacionCargando ? 'Optimizando...' : actualizarVideo ? 'Actualizar video' : 'Aplicar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}