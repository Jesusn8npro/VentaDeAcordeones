import React, { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../../configuracion/supabase'
import { obtenerInfoImagen } from '../../../../utilidades/compresionImagenes'
import { InfoImagenWidget } from '../../../../utilidades/infoImagenes'
import TarjetaImagenCard from './TarjetaImagenCard'
import { manejarSubidaImagenAsync, reoptimizarImagenAsync, aplicarCambiosCampoAsync, CATEGORIAS_IMAGENES, IMAGEN_INICIAL } from './imagenesLandingStorage'
import ModalOptimizacion from './ModalOptimizacion'
import {
  Image, Upload, Save, Loader, Camera, AlertCircle, Eye, Trash2,
  RefreshCw, Grid, List, Search, X, Zap
} from 'lucide-react'
import './ImagenesLanding.css'

const ImagenesLanding = ({ datosProducto, cargando, setCargando, manejarExito, manejarError, productoId }) => {
  const [imagenesLanding, setImagenesLanding] = useState(IMAGEN_INICIAL)
  const [subiendoImagenLanding, setSubiendoImagenLanding] = useState(false)
  const [vistaActual, setVistaActual] = useState('grid')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null)

  const [optimizandoImagen, setOptimizandoImagen] = useState(false)
  const [estadisticasOptimizacion, setEstadisticasOptimizacion] = useState(null)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null)
  const [presetCompresion, setPresetCompresion] = useState('web')
  const [presetsPorImagen, setPresetsPorImagen] = useState({})
  const [calidadPorImagen, setCalidadPorImagen] = useState({})
  const [statsPorImagen, setStatsPorImagen] = useState({})
  const [archivoSeleccionadoPorKey, setArchivoSeleccionadoPorKey] = useState({})
  const [optimizandoPorKey, setOptimizandoPorKey] = useState({})
  const [actualizarPorImagen, setActualizarPorImagen] = useState({})
  const [conservarOriginalPorImagen, setConservarOriginalPorImagen] = useState({})
  const [nombreDestinoPorImagen, setNombreDestinoPorImagen] = useState({})
  const [mensajeOk, setMensajeOk] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [campoModalKey, setCampoModalKey] = useState(null)
  const [imagenModal, setImagenModal] = useState(null)
  const [guardandoCampo, setGuardandoCampo] = useState(false)

  useEffect(() => {
    if (productoId) cargarImagenesLanding()
  }, [productoId])

  const cargarImagenesLanding = async () => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase
        .from('producto_imagenes')
        .select('*')
        .eq('producto_id', productoId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setImagenesLanding(data)
        manejarExito('Imágenes cargadas correctamente')
      } else {
        const { error: errorCrear } = await clienteSupabase
          .from('producto_imagenes')
          .insert({ producto_id: productoId, estado: 'pendiente' })
        if (errorCrear) throw errorCrear
        setImagenesLanding(prev => ({ ...prev, producto_id: productoId, estado: 'pendiente' }))
      }
    } catch {
      manejarError('Error al cargar las imágenes existentes')
    } finally {
      setCargando(false)
    }
  }

  const storageCb = {
    setSubiendoImagenLanding,
    setOptimizandoImagen,
    setEstadisticasOptimizacion,
    setStatsPorImagen,
    setImagenesLanding,
    setArchivoSeleccionadoPorKey,
    setNombreDestinoPorImagen,
    manejarExito,
    manejarError
  }

  const manejarSubidaImagen = async (event, tipoImagen) => {
    const archivo = event.target.files[0]
    if (!archivo) return
    setArchivoSeleccionado(archivo)
    await obtenerInfoImagen(archivo) // keep for InfoImagenWidget
    await manejarSubidaImagenAsync(
      archivo, tipoImagen, productoId,
      presetsPorImagen, presetCompresion, calidadPorImagen,
      conservarOriginalPorImagen, nombreDestinoPorImagen,
      imagenesLanding, storageCb
    )
  }

  const reoptimizarImagenDesdeURL = async (tipoImagen) => {
    await reoptimizarImagenAsync(
      tipoImagen, productoId, imagenesLanding,
      optimizandoPorKey, presetsPorImagen, presetCompresion, calidadPorImagen,
      conservarOriginalPorImagen, nombreDestinoPorImagen,
      { ...storageCb, setOptimizandoPorKey }
    )
    setMensajeOk('Cambios aplicados correctamente')
  }

  const abrirModalCampo = (tipoImagen) => {
    const url = imagenesLanding[tipoImagen]
    if (!url) return
    setCampoModalKey(tipoImagen)
    setImagenModal(url)
    setModalAbierto(true)
  }

  const cerrarModalCampo = () => {
    setModalAbierto(false)
    setCampoModalKey(null)
    setImagenModal(null)
    setGuardandoCampo(false)
  }

  const aplicarCambiosCampo = async () => {
    await aplicarCambiosCampoAsync(
      campoModalKey, imagenModal, productoId,
      presetsPorImagen, presetCompresion, calidadPorImagen,
      actualizarPorImagen, conservarOriginalPorImagen, nombreDestinoPorImagen,
      { setGuardandoCampo, setImagenesLanding, setNombreDestinoPorImagen, cerrarModalCampo, manejarError }
    )
    setMensajeOk('Cambios aplicados correctamente')
  }

  const eliminarImagen = async (tipoImagen) => {
    if (!imagenesLanding[tipoImagen]) return
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return
    try {
      const u = imagenesLanding[tipoImagen]
      try {
        const url = new URL(u)
        const m = url.pathname.match(/\/object\/public\/([^/]+)\/(.+)/)
        if (m) await clienteSupabase.storage.from(m[1]).remove([m[2]])
      } catch {}
      setImagenesLanding(prev => ({ ...prev, [tipoImagen]: null }))
      manejarExito('Imagen eliminada correctamente')
    } catch {
      manejarError('Error al eliminar la imagen')
    }
  }

  const guardarImagenesLanding = async () => {
    if (!productoId) { manejarError('Debes crear el producto primero'); return }
    setCargando(true)
    try {
      const { error } = await clienteSupabase.from('producto_imagenes').upsert({ ...imagenesLanding, producto_id: productoId })
      if (error) throw error
      manejarExito('Imágenes guardadas correctamente')
    } catch {
      manejarError('Error al guardar las imágenes')
    } finally {
      setCargando(false)
    }
  }

  const contarImagenesGeneradas = () =>
    Object.values(imagenesLanding).filter(v => v && typeof v === 'string' && v.startsWith('http')).length

  const obtenerImagenesFiltradas = () => {
    let todas: any[] = []
    Object.entries(CATEGORIAS_IMAGENES).forEach(([key, cat]) => {
      if (filtroCategoria === 'todas' || filtroCategoria === key) {
        cat.campos.forEach(campo => todas.push({ ...campo, categoria: key, categoriaLabel: cat.titulo, valor: imagenesLanding[campo.key] }))
      }
    })
    if (busqueda) {
      todas = todas.filter(img => img.label.toLowerCase().includes(busqueda.toLowerCase()) || img.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    }
    return todas
  }

  const renderizarTarjetaImagen = (imagen) => (
    <TarjetaImagenCard
      key={imagen.key}
      imagen={imagen}
      subiendoImagenLanding={subiendoImagenLanding}
      productoId={productoId}
      optimizandoPorKey={optimizandoPorKey}
      presetsPorImagen={presetsPorImagen}
      presetCompresion={presetCompresion}
      calidadPorImagen={calidadPorImagen}
      statsPorImagen={statsPorImagen}
      onAbrirModal={abrirModalCampo}
      onEliminarImagen={eliminarImagen}
      onSubirImagen={manejarSubidaImagen}
      onCambiarPreset={(key, preset) => setPresetsPorImagen(prev => ({ ...prev, [key]: preset }))}
      onCambiarCalidad={(key, calidad) => setCalidadPorImagen(prev => ({ ...prev, [key]: calidad }))}
    />
  )

  const renderizarFilaImagen = (imagen) => (
    <div key={imagen.key} className="fila-imagen">
      <div className="fila-imagen-info">
        <div className="fila-imagen-miniatura">
          {imagen.valor ? (
            <img src={imagen.valor} alt={imagen.label} className="miniatura" onClick={() => setImagenSeleccionada(imagen.valor)} />
          ) : (
            <div className="miniatura-vacia"><Image className="icono" /></div>
          )}
        </div>
        <div className="fila-imagen-detalles">
          <h4 className="fila-imagen-titulo">{imagen.label}</h4>
          <p className="fila-imagen-descripcion">{imagen.descripcion}</p>
          <span className="fila-imagen-categoria">{imagen.categoriaLabel}</span>
        </div>
      </div>
      <div className="fila-imagen-acciones">
        {imagen.valor ? (
          <>
            <button type="button" className="boton-accion-pequeno ver" onClick={() => setImagenSeleccionada(imagen.valor)} title="Ver imagen"><Eye className="icono" /></button>
            <button type="button" className="boton-accion-pequeno eliminar" onClick={() => eliminarImagen(imagen.key)} title="Eliminar"><Trash2 className="icono" /></button>
          </>
        ) : (
          <label className="boton-subir-pequeno">
            <Upload className="icono" />
            Subir
            <input type="file" accept="image/*" onChange={(e) => manejarSubidaImagen(e, imagen.key)} style={{ display: 'none' }} disabled={subiendoImagenLanding || !productoId} />
          </label>
        )}
      </div>
    </div>
  )

  if (!datosProducto && !productoId) {
    return (
      <div className="alerta-producto">
        <AlertCircle className="icono" />
        <div className="alerta-texto">
          <h4>Producto requerido</h4>
          <p>Debes crear y guardar el producto primero antes de gestionar las imágenes.</p>
        </div>
      </div>
    )
  }

  const imagenesFiltradas = obtenerImagenesFiltradas()

  return (
    <>
      {mensajeOk && <div className="mensaje-exito">{mensajeOk}</div>}

      <ModalOptimizacion
        imagenModal={imagenModal}
        campoModalKey={campoModalKey}
        guardandoCampo={guardandoCampo}
        productoId={productoId}
        presetsPorImagen={presetsPorImagen}
        presetCompresion={presetCompresion}
        calidadPorImagen={calidadPorImagen}
        statsPorImagen={statsPorImagen}
        actualizarPorImagen={actualizarPorImagen}
        conservarOriginalPorImagen={conservarOriginalPorImagen}
        nombreDestinoPorImagen={nombreDestinoPorImagen}
        setPresetsPorImagen={setPresetsPorImagen}
        setCalidadPorImagen={setCalidadPorImagen}
        setActualizarPorImagen={setActualizarPorImagen}
        setConservarOriginalPorImagen={setConservarOriginalPorImagen}
        setNombreDestinoPorImagen={setNombreDestinoPorImagen}
        cerrarModalCampo={cerrarModalCampo}
        aplicarCambiosCampo={aplicarCambiosCampo}
      />

      {imagenSeleccionada && (
        <div className="modal-imagen" onClick={() => setImagenSeleccionada(null)}>
          <div className="modal-imagen-contenido" onClick={e => e.stopPropagation()}>
            <button className="modal-imagen-cerrar" onClick={() => setImagenSeleccionada(null)}><X className="icono" /></button>
            <img src={imagenSeleccionada} alt="Imagen ampliada" className="imagen-ampliada" />
          </div>
        </div>
      )}

      <div className="imagenes-header-moderno">
        <div className="estadisticas-principales">
          <div className="estadistica-card">
            <div className="estadistica-numero">{contarImagenesGeneradas()}</div>
            <div className="estadistica-label">Imágenes subidas</div>
          </div>
          <div className="estadistica-card">
            <div className="estadistica-numero">{Object.keys(CATEGORIAS_IMAGENES).reduce((t, cat) => t + CATEGORIAS_IMAGENES[cat].campos.length, 0)}</div>
            <div className="estadistica-label">Total disponibles</div>
          </div>
          <div className="estadistica-card">
            <div className="estadistica-numero">{imagenesLanding.estado === 'validado' ? '✅' : imagenesLanding.estado === 'generado' ? '🔄' : '📋'}</div>
            <div className="estadistica-label">Estado</div>
          </div>
          {estadisticasOptimizacion && (
            <div className="estadistica-card optimizacion-activa">
              <div className="estadistica-numero"><Zap className="icono-optimizacion" />-{estadisticasOptimizacion?.porcentajes?.reduccion ?? 0}%</div>
              <div className="estadistica-label">Última optimización</div>
            </div>
          )}
          {optimizandoImagen && (
            <div className="estadistica-card optimizando">
              <div className="estadistica-numero"><Loader className="icono-girando" />🚀</div>
              <div className="estadistica-label">Optimizando...</div>
            </div>
          )}
        </div>

        <div className="controles-vista">
          <div className="grupo-controles">
            <div className="busqueda-container">
              <Search className="icono-busqueda" />
              <input type="text" placeholder="Buscar imágenes..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="input-busqueda" />
            </div>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="select-filtro">
              <option value="todas">Todas las categorías</option>
              {Object.entries(CATEGORIAS_IMAGENES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.titulo}</option>
              ))}
            </select>
          </div>
          <div className="botones-vista">
            <button type="button" className={`boton-vista ${vistaActual === 'grid' ? 'activo' : ''}`} onClick={() => setVistaActual('grid')}><Grid className="icono" /></button>
            <button type="button" className={`boton-vista ${vistaActual === 'list' ? 'activo' : ''}`} onClick={() => setVistaActual('list')}><List className="icono" /></button>
          </div>
        </div>
      </div>

      <div className="seccion-estado">
        <div className="estado-header"><Camera className="icono" /><h3>Estado de las Imágenes</h3></div>
        <div className="estado-contenido">
          <select className="select-estado" value={imagenesLanding.estado} onChange={(e) => setImagenesLanding(prev => ({ ...prev, estado: e.target.value }))} disabled={!productoId}>
            <option value="pendiente">📋 Pendiente</option>
            <option value="generado">🔄 En proceso</option>
            <option value="validado">✅ Completado</option>
          </select>
          <button type="button" className="boton-recargar" onClick={cargarImagenesLanding} disabled={cargando}>
            <RefreshCw className={`icono ${cargando ? 'girando' : ''}`} />
            Recargar
          </button>
        </div>
      </div>

      <div className={`imagenes-contenedor ${vistaActual}`}>
        {vistaActual === 'grid' ? (
          <div className="imagenes-grid-moderno">{imagenesFiltradas.map(renderizarTarjetaImagen)}</div>
        ) : (
          <div className="imagenes-lista-moderno">{imagenesFiltradas.map(renderizarFilaImagen)}</div>
        )}
      </div>

      {imagenesFiltradas.length === 0 && (
        <div className="sin-resultados">
          <Search className="icono" />
          <h3>No se encontraron imágenes</h3>
          <p>Intenta cambiar los filtros o la búsqueda</p>
        </div>
      )}

      {archivoSeleccionado && (
        <div className="widget-info-imagen">
          <h4>📊 Información de la imagen seleccionada</h4>
          <InfoImagenWidget fuente={archivoSeleccionado} />
          <div className="selector-compresion">
            <label>Calidad de compresión:</label>
            <select value={presetCompresion} onChange={(e) => setPresetCompresion(e.target.value)}>
              <option value="producto">Máxima calidad (90%)</option>
              <option value="web">Alta calidad (80%)</option>
              <option value="movil">Balance móvil (75%)</option>
              <option value="thumbnail">Ahorro/thumbnail (70%)</option>
            </select>
            <small>Se aplicará al próximo archivo que subas.</small>
          </div>
          {estadisticasOptimizacion && (
            <div className="estadisticas-optimizacion">
              <h5>🚀 Resultados de la optimización:</h5>
              <div className="metricas-optimizacion">
                <div className="metrica"><span className="label">Tamaño original:</span><span className="valor">{((estadisticasOptimizacion?.tamaño?.original || 0) / 1024).toFixed(1)} KB</span></div>
                <div className="metrica"><span className="label">Tamaño optimizado:</span><span className="valor">{((estadisticasOptimizacion?.tamaño?.comprimido || 0) / 1024).toFixed(1)} KB</span></div>
                <div className="metrica destacada"><span className="label">Reducción:</span><span className="valor">-{estadisticasOptimizacion?.porcentajes?.reduccion ?? 0}%</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="acciones-principales">
        <button type="button" className="boton-guardar-principal" onClick={guardarImagenesLanding} disabled={cargando || subiendoImagenLanding || !productoId}>
          {cargando ? <><Loader className="icono spinner" />Guardando...</> : <><Save className="icono" />Guardar Todas las Imágenes</>}
        </button>
      </div>
    </>
  )
}

export default ImagenesLanding
