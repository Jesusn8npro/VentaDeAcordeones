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

export default ContenidoPestana
