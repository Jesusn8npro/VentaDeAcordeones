import React from 'react'
import { CheckCircle, AlertCircle, Eye, Download, Trash2, Upload } from 'lucide-react'

interface ImagenItem {
  key: string
  label: string
  descripcion: string
  categoriaLabel: string
  valor: string | null
}

interface TarjetaImagenCardProps {
  imagen: ImagenItem
  subiendoImagenLanding: boolean
  productoId: string | null
  optimizandoPorKey: Record<string, boolean>
  presetsPorImagen: Record<string, string>
  presetCompresion: string
  calidadPorImagen: Record<string, number>
  statsPorImagen: Record<string, any>
  onAbrirModal: (key: string) => void
  onEliminarImagen: (key: string) => void
  onSubirImagen: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void
  onCambiarPreset: (key: string, preset: string) => void
  onCambiarCalidad: (key: string, calidad: number) => void
}

const TarjetaImagenCard: React.FC<TarjetaImagenCardProps> = ({
  imagen,
  subiendoImagenLanding, productoId,
  optimizandoPorKey, presetsPorImagen, presetCompresion, calidadPorImagen, statsPorImagen,
  onAbrirModal, onEliminarImagen, onSubirImagen, onCambiarPreset, onCambiarCalidad
}) => {
  const calidadActual = typeof calidadPorImagen[imagen.key] === 'number' ? calidadPorImagen[imagen.key] : 0.8

  return (
    <div className="tarjeta-imagen">
      <div className="tarjeta-imagen-header">
        <div className="tarjeta-imagen-info">
          <h4 className="tarjeta-imagen-titulo">{imagen.label}</h4>
          <p className="tarjeta-imagen-descripcion">{imagen.descripcion}</p>
          <span className="tarjeta-imagen-categoria">{imagen.categoriaLabel}</span>
        </div>
        <div className="tarjeta-imagen-estado">
          {imagen.valor ? (
            <CheckCircle className="icono-estado activo" />
          ) : (
            <AlertCircle className="icono-estado inactivo" />
          )}
        </div>
      </div>

      <div className="tarjeta-imagen-contenido">
        {imagen.valor ? (
          <div className="imagen-existente">
            <img
              src={imagen.valor}
              alt={imagen.label}
              className="imagen-preview-grande"
              onClick={() => onAbrirModal(imagen.key)}
            />
            <div className="imagen-acciones">
              <button type="button" className="boton-accion ver" onClick={() => onAbrirModal(imagen.key)} title="Ver imagen completa">
                <Eye className="icono" />
              </button>
              <button type="button" className="boton-accion descargar" onClick={() => window.open(imagen.valor!, '_blank')} title="Abrir en nueva pestaña">
                <Download className="icono" />
              </button>
              <button type="button" className="boton-accion eliminar" onClick={() => onEliminarImagen(imagen.key)} title="Eliminar imagen">
                <Trash2 className="icono" />
              </button>
            </div>
          </div>
        ) : (
          <div className="zona-subida">
            <div className="zona-subida-contenido">
              <Upload className="icono-subida" />
              <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onSubirImagen(e, imagen.key)}
                className="input-file-oculto"
                disabled={subiendoImagenLanding || !productoId}
              />
            </div>
          </div>
        )}
      </div>

      <div className="panel-compresion">
        <div className="controles">
          <label className="control">
            <span>Preset</span>
            <select
              value={presetsPorImagen[imagen.key] || presetCompresion}
              onChange={(e) => onCambiarPreset(imagen.key, e.target.value)}
            >
              <option value="producto">Producto (90%)</option>
              <option value="web">Web (80%)</option>
              <option value="movil">Móvil (75%)</option>
              <option value="thumbnail">Thumbnail (70%)</option>
              <option value="ultra">Ultra (60%, WebP)</option>
              <option value="extremo">Extremo (35%, WebP, 800×600)</option>
            </select>
          </label>

          <label className="control">
            <span>Calidad</span>
            <input
              type="range"
              min={0.1}
              max={0.95}
              step={0.05}
              value={calidadActual}
              onChange={(e) => onCambiarCalidad(imagen.key, parseFloat(e.target.value))}
            />
            <span className="valor">{Math.round(100 * calidadActual)}%</span>
          </label>

          {imagen.valor && (
            <button
              type="button"
              className="boton-optimizar"
              onClick={() => onAbrirModal(imagen.key)}
              disabled={subiendoImagenLanding || !productoId || optimizandoPorKey[imagen.key]}
            >
              {optimizandoPorKey[imagen.key] ? 'Optimizando…' : 'Editar / Optimizar'}
            </button>
          )}
        </div>

        {statsPorImagen[imagen.key] && (
          <div className="info-compresion">
            <div className="bloque">
              <span className="etiqueta">Tamaño original</span>
              <span className="valor">{statsPorImagen[imagen.key].tamaño?.originalFormateado}</span>
            </div>
            <div className="bloque">
              <span className="etiqueta">Tamaño optimizado</span>
              <span className="valor">{statsPorImagen[imagen.key].tamaño?.comprimidoFormateado}</span>
            </div>
            <div className="bloque reduccion">
              <span className="etiqueta">Reducción</span>
              <span className="valor">-{statsPorImagen[imagen.key].porcentajes?.reduccion ?? 0}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TarjetaImagenCard
