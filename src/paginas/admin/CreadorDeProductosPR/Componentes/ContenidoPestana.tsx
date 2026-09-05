import React from 'react'
import FormularioProducto from './FormularioProducto'
import ImagenesLanding from './ImagenesLanding'
import CrearProductoIA from './CrearProductoIA'
import VideosProducto from './VideosProducto'
import ChatImagenesIAInline from './ChatImagenesIAInline'

interface ContenidoPestanaProps {
  pestanaActiva: string
  datosProducto: Record<string, any>
  modo: string
  cargando: boolean
  categorias: any[]
  productoId: string | null
  setCargando: (v: boolean) => void
  actualizarDatosProducto: (datos: Record<string, any>) => void
  guardarProducto: () => void
  manejarExito: (msg: string) => void
  manejarError: (msg: string) => void
  manejarProductoCreado: (producto: Record<string, any>) => void
}

const ContenidoPestana: React.FC<ContenidoPestanaProps> = ({
  pestanaActiva,
  datosProducto,
  modo,
  cargando,
  categorias,
  productoId,
  setCargando,
  actualizarDatosProducto,
  guardarProducto,
  manejarExito,
  manejarError,
  manejarProductoCreado,
}) => {
  switch (pestanaActiva) {
    case 'formulario':
      return (
        <FormularioProducto
          datosProducto={datosProducto}
          actualizarDatosProducto={actualizarDatosProducto}
          modo={modo}
          onGuardar={guardarProducto}
          onError={manejarError}
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
          onCerrar={() => {}}
          onProductoCreado={manejarProductoCreado}
          categorias={categorias}
          modo="embed"
          productoParaEditar={modo === 'editar' ? datosProducto : null}
        />
      )

    case 'imagenesIA':
      return (
        <ChatImagenesIAInline
          producto={datosProducto}
          onImagenesGeneradas={(imagenes: string[]) => {
            actualizarDatosProducto({ imagenes: [...(datosProducto.imagenes || []), ...imagenes] })
            manejarExito('Imágenes generadas correctamente')
          }}
        />
      )

    case 'vistaPrevia': {
      // Vista previa REAL: la ficha pública del producto (/producto/<slug>) dentro de un iframe, con
      // botón para abrirla en pestaña nueva. Antes era una tarjeta simulada que no reflejaba la tienda.
      const slugPrevia = (datosProducto.slug || '').trim()
      const urlPrevia = slugPrevia ? `/producto/${slugPrevia}` : ''
      return (
        <div className="contenido-pestana">
          <div className="seccion-informacion">
            <div className="icono-seccion">👁️</div>
            <h3>Vista Previa</h3>
            <p>Así se ve la ficha del producto en la tienda, con los datos guardados.</p>
          </div>
          {urlPrevia ? (
            <div className="vista-previa-real">
              <div className="vista-previa-barra">
                <span className="ruta">{urlPrevia}</span>
                <div className="vista-previa-acciones">
                  <button type="button" onClick={() => { const f = document.getElementById('iframe-vista-previa') as HTMLIFrameElement | null; if (f) f.src = urlPrevia + '?t=' + Date.now() }}>↻ Recargar</button>
                  <a className="primario" href={urlPrevia} target="_blank" rel="noopener noreferrer">Abrir en pestaña nueva ↗</a>
                </div>
              </div>
              <iframe id="iframe-vista-previa" className="vista-previa-marco" src={urlPrevia} title={`Vista previa de ${datosProducto.nombre || 'producto'}`} loading="lazy" />
              {modo === 'editar' && <p className="vista-previa-aviso" style={{ padding: 12 }}>Si acabas de editar, guarda (Ctrl+Enter) y pulsa Recargar para ver los cambios.</p>}
            </div>
          ) : (
            <div className="vista-previa-aviso">
              <p>Guarda el producto (necesita un slug) para ver la ficha real aquí.</p>
            </div>
          )}
        </div>
      )
    }

    default:
      return (
        <div className="contenido-pestana">
          <p>Selecciona una pestaña para comenzar</p>
        </div>
      )
  }
}

export default ContenidoPestana
