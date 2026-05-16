import React from 'react'
import ConvertidorAJson from './ConvertidorAJson'
import SeccionesProductoJSON from './SeccionesProductoJSON'

interface Categoria {
  id: string
  nombre: string
}

interface FormularioProductoUIProps {
  datosProducto: Record<string, any>
  cargando: boolean
  modo: string
  categorias: Categoria[]
  errores: Record<string, string>
  manejarCambio: (campo: string, valor: any) => void
  manejarCambioArray: (campo: string, valor: string) => void
  manejarCambioNumerico: (campo: string, valor: string) => void
  manejarCambioEntero: (campo: string, valor: string) => void
  manejarEnvio: (e: React.FormEvent) => void
  descargarJSON: () => void
}

const FormularioProductoUI: React.FC<FormularioProductoUIProps> = ({
  datosProducto,
  cargando,
  modo,
  categorias,
  errores,
  manejarCambio,
  manejarCambioArray,
  manejarCambioNumerico,
  manejarCambioEntero,
  manejarEnvio,
  descargarJSON,
}) => {
  return (
    <div className="formulario-producto">
      <form onSubmit={manejarEnvio} className="formulario">

        {/* Información Básica */}
        <section className="seccion">
          <h3>📝 Información Básica</h3>

          <div className="campo">
            <label>Nombre del Producto *</label>
            <input
              type="text"
              value={datosProducto.nombre || ''}
              onChange={(e) => manejarCambio('nombre', e.target.value)}
              className={errores.nombre ? 'error' : ''}
              placeholder="Ej: CarroExpress VIP"
            />
            {errores.nombre && <span className="error-texto">{errores.nombre}</span>}
          </div>

          <div className="campo">
            <label>Slug (URL)</label>
            <input
              type="text"
              value={datosProducto.slug || ''}
              onChange={(e) => manejarCambio('slug', e.target.value)}
              placeholder="carroexpress-vip"
            />
          </div>

          <div className="campo">
            <label>Título de la sección (Descripción)</label>
            <input
              type="text"
              value={datosProducto.descripcion_titulo || ''}
              onChange={(e) => manejarCambio('descripcion_titulo', e.target.value)}
              placeholder="Ej: 🚀 Descubre Todo lo que Necesitas Saber"
            />
          </div>

          <div className="campo">
            <label>Contenido de la Descripción *</label>
            <textarea
              value={datosProducto.descripcion_contenido || ''}
              onChange={(e) => manejarCambio('descripcion_contenido', e.target.value)}
              className={errores.descripcion_contenido ? 'error' : ''}
              rows={4}
              placeholder="Texto completo y persuasivo de la descripción..."
            />
            {errores.descripcion_contenido && <span className="error-texto">{errores.descripcion_contenido}</span>}
          </div>

          <div className="campo">
            <label>Descripción Corta</label>
            <textarea
              value={datosProducto.descripcion_corta || ''}
              onChange={(e) => manejarCambio('descripcion_corta', e.target.value)}
              rows={2}
              placeholder="Descripción breve para listados..."
            />
          </div>
        </section>

        {/* Precios y Stock */}
        <section className="seccion">
          <h3>💰 Precios y Stock</h3>

          <div className="fila">
            <div className="campo">
              <label>Precio *</label>
              <input
                type="number"
                step="0.01"
                value={datosProducto.precio || ''}
                onChange={(e) => manejarCambioNumerico('precio', e.target.value)}
                className={errores.precio ? 'error' : ''}
                placeholder="0.00"
              />
              {errores.precio && <span className="error-texto">{errores.precio}</span>}
            </div>

            <div className="campo">
              <label>Precio Original</label>
              <input
                type="number"
                step="0.01"
                value={datosProducto.precio_original || ''}
                onChange={(e) => manejarCambioNumerico('precio_original', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Stock *</label>
              <input
                type="number"
                value={datosProducto.stock || ''}
                onChange={(e) => manejarCambioEntero('stock', e.target.value)}
                className={errores.stock ? 'error' : ''}
                placeholder="0"
              />
              {errores.stock && <span className="error-texto">{errores.stock}</span>}
            </div>

            <div className="campo">
              <label>Stock Mínimo</label>
              <input
                type="number"
                value={datosProducto.stock_minimo || ''}
                onChange={(e) => manejarCambioEntero('stock_minimo', e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Descuento (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={datosProducto.descuento || ''}
                onChange={(e) => manejarCambioNumerico('descuento', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="campo">
              <label>Peso (kg)</label>
              <input
                type="number"
                step="0.01"
                value={datosProducto.peso || ''}
                onChange={(e) => manejarCambioNumerico('peso', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        {/* Categorización */}
        <section className="seccion">
          <h3>📂 Categorización</h3>

          <div className="campo">
            <label>Categoría *</label>
            <select
              value={datosProducto.categoria_id || ''}
              onChange={(e) => manejarCambio('categoria_id', e.target.value)}
              className={errores.categoria_id ? 'error' : ''}
            >
              <option value="">Seleccionar categoría...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errores.categoria_id && <span className="error-texto">{errores.categoria_id}</span>}
          </div>

          <div className="campo">
            <label>Etiquetas</label>
            <textarea
              value={Array.isArray(datosProducto.etiquetas) ? datosProducto.etiquetas.join('\n') : ''}
              onChange={(e) => manejarCambioArray('etiquetas', e.target.value)}
              rows={3}
              placeholder="Una etiqueta por línea..."
            />
          </div>

          <div className="campo">
            <label>Palabras Clave</label>
            <textarea
              value={Array.isArray(datosProducto.palabras_clave) ? datosProducto.palabras_clave.join('\n') : ''}
              onChange={(e) => manejarCambioArray('palabras_clave', e.target.value)}
              rows={3}
              placeholder="Una palabra clave por línea..."
            />
          </div>
        </section>

        {/* Marketing */}
        <section className="seccion">
          <h3>🎯 Marketing</h3>

          <div className="campo">
            <label>Ganchos de Venta</label>
            <textarea
              value={Array.isArray(datosProducto.ganchos) ? datosProducto.ganchos.join('\n') : ''}
              onChange={(e) => manejarCambioArray('ganchos', e.target.value)}
              rows={4}
              placeholder="Un gancho por línea..."
            />
          </div>

          <div className="campo">
            <label>Beneficios</label>
            <ConvertidorAJson
              valor={datosProducto.beneficios}
              onChange={(valor: any) => manejarCambio('beneficios', valor)}
              tipo="beneficios"
            />
          </div>

          <div className="campo">
            <label>Ventajas Competitivas</label>
            <ConvertidorAJson
              valor={datosProducto.ventajas}
              onChange={(valor: any) => manejarCambio('ventajas', valor)}
              tipo="ventajas"
            />
          </div>
        </section>

        {/* SEO */}
        <section className="seccion">
          <h3>🔍 SEO</h3>

          <div className="campo">
            <label>Meta Title</label>
            <input
              type="text"
              value={datosProducto.meta_title || ''}
              onChange={(e) => manejarCambio('meta_title', e.target.value)}
              placeholder="Título para SEO..."
              maxLength={60}
            />
          </div>

          <div className="campo">
            <label>Meta Description</label>
            <textarea
              value={datosProducto.meta_description || ''}
              onChange={(e) => manejarCambio('meta_description', e.target.value)}
              rows={2}
              placeholder="Descripción para SEO..."
              maxLength={160}
            />
          </div>
        </section>

        {/* Configuración */}
        <section className="seccion">
          <h3>⚙️ Configuración</h3>

          <div className="fila">
            <div className="campo">
              <label>Tipo de Landing</label>
              <select
                value={datosProducto.landing_tipo || 'temu'}
                onChange={(e) => manejarCambio('landing_tipo', e.target.value)}
              >
                <option value="temu">Temu</option>
                <option value="amazon">Amazon</option>
                <option value="clasico">Clásico</option>
              </select>
            </div>

            <div className="campo">
              <label>Estado del Producto</label>
              <select
                value={datosProducto.estado || 'nuevo'}
                onChange={(e) => manejarCambio('estado', e.target.value)}
              >
                <option value="nuevo">🆕 Nuevo</option>
                <option value="usado">♻️ Usado</option>
                <option value="vendido">✅ Vendido</option>
                <option value="agotado">📦 Agotado</option>
                <option value="descontinuado">❌ Descontinuado</option>
              </select>
            </div>

            <div className="campo">
              <label>Activo</label>
              <select
                value={datosProducto.activo !== false ? 'true' : 'false'}
                onChange={(e) => manejarCambio('activo', e.target.value === 'true')}
              >
                <option value="true">✅ Activo</option>
                <option value="false">❌ Inactivo</option>
              </select>
            </div>
          </div>

          <div className="fila">
            <div className="campo-checkbox">
              <input
                type="checkbox"
                id="destacado"
                checked={datosProducto.destacado || false}
                onChange={(e) => manejarCambio('destacado', e.target.checked)}
              />
              <label htmlFor="destacado">Producto Destacado</label>
            </div>

            <div className="campo-checkbox">
              <input
                type="checkbox"
                id="envio_gratis"
                checked={datosProducto.envio_gratis || false}
                onChange={(e) => manejarCambio('envio_gratis', e.target.checked)}
              />
              <label htmlFor="envio_gratis">Envío Gratis</label>
            </div>
          </div>
        </section>

        <SeccionesProductoJSON datosProducto={datosProducto} manejarCambio={manejarCambio} />

        {/* Botones */}
        <div className="botones">
          <button
            type="button"
            className="btn-debug"
            onClick={descargarJSON}
            style={{
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px',
              fontSize: '14px'
            }}
          >
            📥 Descargar JSON Debug
          </button>

          <button
            type="submit"
            className="btn-guardar"
            disabled={cargando}
          >
            {cargando ? '⏳ Guardando...' : `💾 ${modo === 'crear' ? 'Crear' : 'Actualizar'} Producto`}
          </button>
        </div>

        {/* Indicador de atajo de teclado */}
        <div className="atajo-teclado">
          Ctrl + Enter para guardar
        </div>
      </form>
    </div>
  )
}

export default FormularioProductoUI
