import React, { useState, useEffect, useCallback, useRef } from 'react'
import './FormularioProducto.css'
import ConvertidorAJson from './ConvertidorAJson'
import { usarCategorias } from '../../../../hooks/usarCategorias'

const FormularioProducto = ({ 
  datosProducto = {}, 
  actualizarDatosProducto, 
  modo = 'crear',
  onGuardar,
  cargando = false 
}) => {
  const [errores, setErrores] = useState({})
  const [camposJSON, setCamposJSON] = useState({})
  const slugGeneradoRef = useRef(false)
  
  // Hook para cargar categorías desde Supabase
  const { categorias, cargando: cargandoCategorias, error: errorCategorias } = usarCategorias()

  // Generar slug automáticamente - SOLO UEZ
  useEffect(() => {
    if (datosProducto.nombre && modo === 'crear' && !slugGeneradoRef.current && !datosProducto.slug) {
      const slug = datosProducto.nombre
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      slugGeneradoRef.current = true
      actualizarDatosProducto({ slug })
    }
  }, [datosProducto.nombre, modo]) // Removido actualizarDatosProducto de las dependencias

  // Manejar atajo de teclado Ctrl+Enter - Memoizado para evitar re-renders
  const manejarAtajo = useCallback((e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      if (onGuardar && !cargando) {
        onGuardar()
      }
    }
  }, [onGuardar, cargando])

  useEffect(() => {
    document.addEventListener('keydown', manejarAtajo)
    return () => document.removeEventListener('keydown', manejarAtajo)
  }, [manejarAtajo])

  // Memoizar las funciones para evitar re-renders innecesarios
  const manejarCambio = useCallback((campo, valor) => {
    actualizarDatosProducto({ [campo]: valor })
    
    // Limpiar error si existe
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }))
    }
  }, [errores]) // Solo depende de errores, no de actualizarDatosProducto

  const manejarCambioArray = useCallback((campo, valor) => {
    const array = valor.split('\n').filter(item => item.trim())
    actualizarDatosProducto({ [campo]: array })
  }, []) // Sin dependencias porque actualizarDatosProducto es estable

  const manejarCambioJSON = useCallback((campo, valor) => {
    // Actualizar el estado local para mostrar el texto sin procesar
    setCamposJSON(prev => ({ ...prev, [campo]: valor }))
    
    try {
      const objetoJSON = JSON.parse(valor)
      actualizarDatosProducto({ [campo]: objetoJSON })
    } catch (error) {
      // Si no es JSON válido, guardar como string
      actualizarDatosProducto({ [campo]: valor })
    }
  }, []) // Sin dependencias porque actualizarDatosProducto es estable

  const obtenerValorJSON = useCallback((campo) => {
    // Si hay un valor en el estado local, usarlo (para mostrar lo que está escribiendo)
    if (camposJSON[campo] !== undefined) {
      return camposJSON[campo]
    }
    
    // Si no, mostrar el valor formateado del producto
    const valor = datosProducto[campo]
    if (typeof valor === 'object' && valor !== null) {
      return JSON.stringify(valor, null, 2)
    }
    return valor || ''
  }, [camposJSON, datosProducto])

  const obtenerPlaceholderJSON = useCallback((campo) => {
    const placeholders = {
      banner_animado: '{\n  "mensajes": [\n    "¡Oferta especial!",\n    "Envío gratis"\n  ]\n}',
      puntos_dolor: '{\n  "titulo": "¿Te sientes identificado?",\n  "timeline": [\n    {\n      "id": 1,\n      "icono": "😰",\n      "nombre": "Problema 1",\n      "posicion": "left",\n      "solucion": "Nuestra solución",\n      "descripcion": "Descripción del problema"\n    }\n  ]\n}',
      caracteristicas: '{\n  "titulo": "Características principales",\n  "detalles": ["Detalle 1", "Detalle 2"],\n  "beneficios": ["Beneficio 1", "Beneficio 2"]\n}',
      testimonios: '{\n  "titulo": "Lo que dicen nuestros clientes",\n  "testimonios": [\n    [\n      {\n      "id": 1,\n      "nombre": "Juan Pérez",\n      "comentario": "Excelente producto",\n      "rating": 5\n    }\n  ]\n}',
      faq: '{\n  "titulo": "Preguntas Frecuentes",\n  "preguntas": [\n    {\n      "pregunta": "¿Cómo funciona?",\n      "respuesta": "Es muy fácil de usar..."\n    }\n  ]\n}',
      garantias: '{\n  "titulo": "Nuestras Garantías",\n  "garantias": [\n    "Garantía de satisfacción",\n    "Devolución gratuita"\n  ]\n}',
      cta_final: '{\n  "titulo": "¡No esperes más!",\n  "botonTexto": "Comprar Ahora",\n  "urgencia": "Oferta limitada",\n  "descuento": "50% OFF"\n}',
      promociones: '[\n  {\n    "tipo": "descuento",\n    "valor": 20,\n    "descripcion": "20% de descuento"\n  }\n]',
      dimensiones: '{\n  "largo": 10,\n  "ancho": 5,\n  "alto": 3,\n  "unidad": "cm"\n}'
    }
    return placeholders[campo] || '{}'
  }, [])

  // Función para manejar cambios en campos numéricos (decimales)
  const manejarCambioNumerico = useCallback((campo, valor) => {
    // Permitir valores vacíos
    if (valor === '') {
      actualizarDatosProducto({ [campo]: '' })
      return
    }
    
    // Convertir a número y validar
    const numero = parseFloat(valor)
    if (!isNaN(numero)) {
      actualizarDatosProducto({ [campo]: numero })
    }
    
    // Limpiar error si existe
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }))
    }
  }, [errores])

  // Función para manejar cambios en campos enteros
  const manejarCambioEntero = useCallback((campo, valor) => {
    // Permitir valores vacíos
    if (valor === '') {
      actualizarDatosProducto({ [campo]: '' })
      return
    }
    
    // Convertir a entero y validar
    const entero = parseInt(valor, 10)
    if (!isNaN(entero)) {
      actualizarDatosProducto({ [campo]: entero })
    }
    
    // Limpiar error si existe
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }))
    }
  }, [errores])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}
    
    if (!datosProducto.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }
    
    if (!datosProducto.descripcion?.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria'
    }
    
    if (!datosProducto.precio || datosProducto.precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0'
    }
    
    if (!datosProducto.categoria_id) {
      nuevosErrores.categoria_id = 'Selecciona una categoría'
    }

    // Validaciones para campos numéricos específicos
    if (datosProducto.descuento && (datosProducto.descuento < 0 || datosProducto.descuento > 100)) {
      nuevosErrores.descuento = 'El descuento debe estar entre 0 y 100'
    }

    if (datosProducto.stock && datosProducto.stock < 0) {
      nuevosErrores.stock = 'El stock no puede ser negativo'
    }

    if (datosProducto.stock_minimo && datosProducto.stock_minimo < 0) {
      nuevosErrores.stock_minimo = 'El stock mínimo no puede ser negativo'
    }

    if (datosProducto.garantia_meses && datosProducto.garantia_meses < 0) {
      nuevosErrores.garantia_meses = 'Los meses de garantía no pueden ser negativos'
    }

    if (datosProducto.calificacion_promedio && (datosProducto.calificacion_promedio < 0 || datosProducto.calificacion_promedio > 5)) {
      nuevosErrores.calificacion_promedio = 'La calificación debe estar entre 0 y 5'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [datosProducto.nombre, datosProducto.descripcion, datosProducto.precio, datosProducto.categoria_id, datosProducto.descuento, datosProducto.stock, datosProducto.stock_minimo, datosProducto.garantia_meses, datosProducto.calificacion_promedio])

  // Función para descargar JSON con toda la información
  const descargarJSON = () => {
    console.log('🔍 DEBUG - Datos completos del producto:', datosProducto)
    
    const datosCompletos = {
      ...datosProducto,
      timestamp: new Date().toISOString(),
      modo: modo,
      errores: errores
    }
    
    const dataStr = JSON.stringify(datosCompletos, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `producto-debug-${new Date().toISOString().slice(0,10)}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    console.log('📥 JSON descargado con éxito')
  }

  const manejarEnvio = useCallback((e) => {
    e.preventDefault()
    
    // LOGS DETALLADOS PARA DEBUG
    console.log('🚀 INICIANDO CREACIÓN DE PRODUCTO')
    console.log('📊 Datos del producto completos:', datosProducto)
    console.log('🔧 Modo:', modo)
    console.log('⚠️ Errores actuales:', errores)
    console.log('✅ Formulario válido:', validarFormulario())
    
    // Verificar campos específicos que pueden causar problemas
    console.log('💰 Precio:', datosProducto.precio, typeof datosProducto.precio)
    console.log('💰 Precio original:', datosProducto.precio_original, typeof datosProducto.precio_original)
    console.log('📦 Stock:', datosProducto.stock, typeof datosProducto.stock)
    console.log('⚖️ Peso:', datosProducto.peso, typeof datosProducto.peso)
    console.log('🏷️ Descuento:', datosProducto.descuento, typeof datosProducto.descuento)
    console.log('📂 Categoría:', datosProducto.categoria_id, typeof datosProducto.categoria_id)
    
    // Verificar si hay valores NaN o undefined
    const camposNumericos = ['precio', 'precio_original', 'stock', 'stock_minimo', 'peso', 'descuento']
    camposNumericos.forEach(campo => {
      const valor = datosProducto[campo]
      if (valor !== null && valor !== undefined && isNaN(valor)) {
        console.error(`❌ PROBLEMA DETECTADO: ${campo} contiene NaN:`, valor)
      }
    })
    
    if (validarFormulario() && onGuardar) {
      console.log('✅ Validación exitosa, llamando onGuardar...')
      onGuardar()
    } else {
      console.error('❌ Validación falló o onGuardar no está disponible')
      console.error('❌ onGuardar:', onGuardar)
    }
  }, [validarFormulario, onGuardar, datosProducto, modo, errores])

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
              rows="4"
              placeholder="Texto completo y persuasivo de la descripción..."
            />
            {errores.descripcion_contenido && <span className="error-texto">{errores.descripcion_contenido}</span>}
          </div>

          <div className="campo">
            <label>Descripción Corta</label>
            <textarea
              value={datosProducto.descripcion_corta || ''}
              onChange={(e) => manejarCambio('descripcion_corta', e.target.value)}
              rows="2"
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
              value={Array.isArray(datosProducto.etiquetas) 
                ? datosProducto.etiquetas.join('\n') 
                : ''}
              onChange={(e) => manejarCambioArray('etiquetas', e.target.value)}
              rows="3"
              placeholder="Una etiqueta por línea..."
            />
          </div>

          <div className="campo">
            <label>Palabras Clave</label>
            <textarea
              value={Array.isArray(datosProducto.palabras_clave) 
                ? datosProducto.palabras_clave.join('\n') 
                : ''}
              onChange={(e) => manejarCambioArray('palabras_clave', e.target.value)}
              rows="3"
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
              value={Array.isArray(datosProducto.ganchos) 
                ? datosProducto.ganchos.join('\n') 
                : ''}
              onChange={(e) => manejarCambioArray('ganchos', e.target.value)}
              rows="4"
              placeholder="Un gancho por línea..."
            />
          </div>

          <div className="campo">
            <label>Beneficios</label>
            <ConvertidorAJson
              valor={datosProducto.beneficios}
              onChange={(valor) => manejarCambio('beneficios', valor)}
              tipo="beneficios"
            />
          </div>

          <div className="campo">
            <label>Ventajas Competitivas</label>
            <ConvertidorAJson
              valor={datosProducto.ventajas}
              onChange={(valor) => manejarCambio('ventajas', valor)}
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
              maxLength="60"
            />
          </div>

          <div className="campo">
            <label>Meta Description</label>
            <textarea
              value={datosProducto.meta_description || ''}
              onChange={(e) => manejarCambio('meta_description', e.target.value)}
              rows="2"
              placeholder="Descripción para SEO..."
              maxLength="160"
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

        {/* Características (JSONB) */}
        <section className="seccion">
          <h3>⚙️ Características</h3>
          <p className="descripcion-json">Características técnicas del producto</p>
          
          <div className="campo">
            <label>Características</label>
            <ConvertidorAJson
              valor={datosProducto.caracteristicas}
              onChange={(valor) => manejarCambio('caracteristicas', valor)}
              tipo="caracteristicas"
            />
          </div>
        </section>

        <section className="seccion">
          <h3>🎨 Banner Animado</h3>
          <p className="descripcion-json">Mensajes rotativos para el banner principal</p>
          
          <div className="campo">
            <label>Banner Animado</label>
            <ConvertidorAJson
              valor={datosProducto.banner_animado}
              onChange={(valor) => manejarCambio('banner_animado', valor)}
              tipo="banner_animado"
            />
          </div>
        </section>

        {/* Puntos de Dolor */}
        <section className="seccion">
          <h3>🩹 Puntos de Dolor</h3>
          <p className="descripcion-json">Problemas que enfrenta tu cliente y cómo los resuelves</p>

          <div className="campo">
            <label>Puntos de Dolor</label>
            <ConvertidorAJson
              valor={datosProducto.puntos_dolor}
              onChange={(valor) => manejarCambio('puntos_dolor', valor)}
              tipo="puntos_dolor"
            />
          </div>
        </section>

        {/* Testimonios */}
        <section className="seccion">
          <h3>👥 Testimonios</h3>
          <p className="descripcion-json">Reseñas y opiniones de clientes</p>
          
          <div className="campo">
            <label>Testimonios</label>
            <ConvertidorAJson
              valor={datosProducto.testimonios}
              onChange={(valor) => manejarCambio('testimonios', valor)}
              tipo="testimonios"
            />
          </div>
        </section>

        <section className="seccion">
          <h3>❓ FAQ</h3>
          <p className="descripcion-json">Preguntas frecuentes sobre el producto</p>
          
          <div className="campo">
            <label>FAQ</label>
            <ConvertidorAJson
              valor={datosProducto.faq}
              onChange={(valor) => manejarCambio('faq', valor)}
              tipo="faq"
            />
          </div>
        </section>

        <section className="seccion">
          <h3>🛡️ Garantías</h3>
          <p className="descripcion-json">Garantías y políticas de devolución</p>
          
          <div className="campo">
            <label>Garantías</label>
            <ConvertidorAJson
              valor={datosProducto.garantias}
              onChange={(valor) => manejarCambio('garantias', valor)}
              tipo="garantias"
            />
          </div>
        </section>

        <section className="seccion">
          <h3>🚀 Call to Action Final</h3>
          <p className="descripcion-json">Sección final para impulsar la compra</p>
          
          <div className="campo">
            <label>CTA Final</label>
            <ConvertidorAJson
              valor={datosProducto.cta_final}
              onChange={(valor) => manejarCambio('cta_final', valor)}
              tipo="cta_final"
            />
          </div>
        </section>

        <section className="seccion">
          <h3>🎁 Promociones por Cantidad</h3>
          <p className="descripcion-json">Configura descuentos automáticos por cantidad de productos</p>
          
          <div className="campo">
            <label>Promociones</label>
            <ConvertidorAJson
              valor={datosProducto.promociones}
              onChange={(valor) => manejarCambio('promociones', valor)}
              tipo="promociones"
            />
          </div>
        </section>

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

export default FormularioProducto