import React, { useState, useEffect, useRef, useCallback } from 'react'
import './ConvertidorAJson.css'
import {
  EditorBannerAnimado,
  EditorPuntosDolor,
  EditorCaracteristicas,
  EditorTestimonios,
  EditorListaItems,
  EditorFAQ,
  EditorGarantias,
  EditorCTAFinal,
  EditorPromociones,
} from './EditoresSecciones'

// ─── Factories ─────────────────────────────────────────────────────────────────

const crearTimelineVacio = () => ({
  id: Date.now(), icono: '💔', nombre: '', posicion: 'izquierda',
  descripcion: '', solucion: '', textoBoton: 'NUESTRA SOLUCIÓN'
})
const crearDetalleVacio = () => ({ id: Date.now(), icono: '⚡', titulo: '', descripcion: '' })
const crearBeneficioVacio = () => ({ id: Date.now(), icono: '🛡️', titulo: '', descripcion: '' })
const crearTestimonioVacio = () => ({
  id: Date.now(), fecha: 'Hace 1 día', likes: 0, nombre: '', rating: 5,
  ubicacion: '', comentario: '', verificado: true, compraVerificada: true
})
const crearPreguntaVacia = () => ({ id: Date.now(), pregunta: '', respuesta: '' })
const crearGarantiaVacia = () => ({ id: Date.now(), icono: '🛡️', titulo: '', descripcion: '' })
const crearPromocionVacia = () => ({
  id: Date.now(), cantidadMinima: 2, descuentoPorcentaje: 10,
  descripcion: 'Descuento por compra múltiple', activa: true
})

// ─── Datos vacíos por tipo ─────────────────────────────────────────────────────

const DATOS_VACIOS: Record<string, any> = {
  banner_animado: { mensajes: [''] },
  puntos_dolor: {
    titulo: 'Puntos de Dolor',
    subtitulo: 'Problemas que resuelve tu producto',
    timeline: [crearTimelineVacio()]
  },
  caracteristicas: {
    titulo: 'Características del Producto',
    subtitulo: 'Descubre las características exclusivas que marcan la diferencia',
    detalles: [crearDetalleVacio()],
    beneficios: [crearBeneficioVacio()],
    cta: { texto: '¡QUIERO APROVECHAR ESTA OFERTA!', subtexto: '🔥 Stock limitado, no dejes pasar esta oportunidad' }
  },
  testimonios: {
    titulo: '¡+15.847 CLIENTES YA TRANSFORMARON SU NEGOCIO!',
    subtitulo: 'Lee lo que dicen nuestros clientes satisfechos',
    testimonios: [crearTestimonioVacio()],
    estadisticas: { recomiendan: 98, satisfaccion: 4.9, totalClientes: 15847 }
  },
  faq: {
    titulo: 'Preguntas Frecuentes',
    subtitulo: 'Resolvemos todas tus dudas para que compres con total confianza',
    preguntas: [crearPreguntaVacia()]
  },
  ventajas: { titulo: '¿Por qué elegirnos?', subtitulo: 'Ventajas que nos diferencian', items: [crearBeneficioVacio()] },
  beneficios: { titulo: 'Beneficios Exclusivos', subtitulo: 'Todo lo que obtienes al elegirnos', items: [crearBeneficioVacio()] },
  garantias: {
    titulo: 'Compra con Total Confianza',
    subtitulo: 'Tu satisfacción y seguridad son nuestra prioridad #1',
    garantias: [crearGarantiaVacia()]
  },
  cta_final: {
    titulo: '¡ÚLTIMA OPORTUNIDAD!',
    subtitulo: 'No dejes pasar esta oferta única.',
    botonTexto: '¡QUIERO MI TRANSFORMACIÓN AHORA!',
    urgencia: '⚡ Oferta válida solo por hoy',
    descuento: '70% OFF',
    envio: '🚚 Envío GRATIS en 24-48 horas',
    garantia: '🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero',
    precioActual: '4950325',
    precioAnterior: '16501083'
  },
  promociones: {
    titulo: 'Promociones por Cantidad',
    subtitulo: 'Configura descuentos automáticos por cantidad de productos',
    promociones: [crearPromocionVacia()]
  }
}

// ─── Parsers por tipo ──────────────────────────────────────────────────────────

const parsearDatos = (tipo: string, raw: any): any => {
  if (tipo === 'banner_animado') {
    if (raw?.mensajes?.length) return { mensajes: raw.mensajes }
    return { mensajes: [''] }
  }
  if (tipo === 'puntos_dolor') {
    if (Array.isArray(raw)) {
      return {
        titulo: 'Puntos de Dolor',
        subtitulo: 'Problemas que resuelve tu producto',
        timeline: raw.map((p: any, i: number) => ({
          id: Date.now() + i, icono: '💔',
          nombre: p.titulo || p.problema || '',
          posicion: i % 2 === 0 ? 'izquierda' : 'derecha',
          descripcion: p.descripcion || p.detalle || '',
          solucion: p.solucion || '',
          textoBoton: p.textoBoton || 'NUESTRA SOLUCIÓN'
        }))
      }
    }
    if (raw?.titulo) {
      return {
        titulo: raw.titulo,
        subtitulo: raw.subtitulo || '',
        timeline: Array.isArray(raw.timeline)
          ? raw.timeline.map((item: any) => ({ ...item, textoBoton: item.textoBoton || 'NUESTRA SOLUCIÓN' }))
          : [crearTimelineVacio()]
      }
    }
    return DATOS_VACIOS.puntos_dolor
  }
  if (tipo === 'caracteristicas') {
    if (raw?.titulo) {
      return {
        titulo: raw.titulo,
        subtitulo: raw.subtitulo || '',
        detalles: Array.isArray(raw.detalles) ? raw.detalles : [crearDetalleVacio()],
        beneficios: Array.isArray(raw.beneficios) ? raw.beneficios : [crearBeneficioVacio()],
        cta: raw.cta || DATOS_VACIOS.caracteristicas.cta
      }
    }
    return DATOS_VACIOS.caracteristicas
  }
  if (tipo === 'testimonios') {
    if (raw?.titulo) {
      return {
        titulo: raw.titulo,
        subtitulo: raw.subtitulo || '',
        testimonios: Array.isArray(raw.testimonios) ? raw.testimonios : [crearTestimonioVacio()],
        estadisticas: raw.estadisticas || DATOS_VACIOS.testimonios.estadisticas
      }
    }
    return DATOS_VACIOS.testimonios
  }
  if (tipo === 'faq') {
    if (raw?.titulo) {
      return {
        titulo: raw.titulo,
        subtitulo: raw.subtitulo || '',
        preguntas: Array.isArray(raw.preguntas) ? raw.preguntas : [crearPreguntaVacia()]
      }
    }
    return DATOS_VACIOS.faq
  }
  if (tipo === 'ventajas' || tipo === 'beneficios') {
    if (raw?.titulo) {
      return {
        titulo: raw.titulo,
        subtitulo: raw.subtitulo || '',
        items: Array.isArray(raw.items) ? raw.items : [crearBeneficioVacio()]
      }
    }
    return DATOS_VACIOS[tipo]
  }
  if (tipo === 'garantias') {
    if (raw?.titulo) {
      return {
        titulo: raw.titulo,
        subtitulo: raw.subtitulo || '',
        garantias: Array.isArray(raw.garantias) ? raw.garantias : [crearGarantiaVacia()]
      }
    }
    return DATOS_VACIOS.garantias
  }
  if (tipo === 'cta_final') {
    if (raw?.titulo) {
      return { ...DATOS_VACIOS.cta_final, ...raw }
    }
    return DATOS_VACIOS.cta_final
  }
  if (tipo === 'promociones') {
    if (Array.isArray(raw) && raw.length > 0) {
      return { ...DATOS_VACIOS.promociones, promociones: raw }
    }
    if (raw?.promociones) {
      return {
        titulo: raw.titulo || DATOS_VACIOS.promociones.titulo,
        subtitulo: raw.subtitulo || DATOS_VACIOS.promociones.subtitulo,
        promociones: Array.isArray(raw.promociones) ? raw.promociones : [crearPromocionVacia()]
      }
    }
    return DATOS_VACIOS.promociones
  }
  return null
}

// ─── Componente principal ──────────────────────────────────────────────────────

const ConvertidorAJson = ({ valor, onChange, tipo = 'banner_animado' }) => {
  const [datos, setDatos] = useState<any>(null)
  const valorAnteriorRef = useRef<any>(null)
  const tipoAnteriorRef = useRef<string | null>(null)

  const sonValoresIguales = useCallback((val1: any, val2: any): boolean => {
    if (val1 === val2) return true
    if (val1 === null || val2 === null) return val1 === val2
    if (typeof val1 !== typeof val2) return false
    if (typeof val1 === 'object') return JSON.stringify(val1) === JSON.stringify(val2)
    return false
  }, [])

  useEffect(() => {
    const valorCambio = !sonValoresIguales(valor, valorAnteriorRef.current)
    const tipoCambio = tipo !== tipoAnteriorRef.current
    if (!valorCambio && !tipoCambio) return

    valorAnteriorRef.current = valor
    tipoAnteriorRef.current = tipo

    if (valor != null) {
      try {
        const raw = typeof valor === 'string' ? JSON.parse(valor) : valor
        setDatos(parsearDatos(tipo, raw))
      } catch {
        setDatos(DATOS_VACIOS[tipo] ?? null)
      }
    } else {
      setDatos(DATOS_VACIOS[tipo] ?? null)
    }
  }, [valor, tipo, sonValoresIguales])

  const actualizar = (nuevosDatos: any) => {
    setDatos(nuevosDatos)
    onChange?.(nuevosDatos)
  }

  // ─── Helpers de mutación genéricos ──────────────────────────────────────────

  const setField = (campo: string, valor: any) => actualizar({ ...datos, [campo]: valor })

  const mutarArray = (clave: string, fn: (arr: any[]) => any[]) =>
    actualizar({ ...datos, [clave]: fn(datos[clave] || []) })

  const agregarEn = (clave: string, factory: () => any) =>
    mutarArray(clave, arr => [...arr, factory()])

  const eliminarDe = (clave: string, index: number) =>
    mutarArray(clave, arr => arr.length > 1 ? arr.filter((_: any, i: number) => i !== index) : arr)

  const actualizarEn = (clave: string, index: number, campo: string, valor: any) =>
    mutarArray(clave, arr => arr.map((item: any, i: number) => i === index ? { ...item, [campo]: valor } : item))

  // ─── Renderizado ─────────────────────────────────────────────────────────────

  if (!datos) return <div>Cargando...</div>

  if (tipo === 'banner_animado') return (
    <EditorBannerAnimado
      datos={datos}
      onAgregarMensaje={() => actualizar({ ...datos, mensajes: [...datos.mensajes, ''] })}
      onEliminarMensaje={(i) => eliminarDe('mensajes', i)}
      onActualizarMensaje={(i, v) => {
        const nuevos = [...datos.mensajes]
        nuevos[i] = v
        actualizar({ ...datos, mensajes: nuevos })
      }}
    />
  )

  if (tipo === 'puntos_dolor') return (
    <EditorPuntosDolor
      datos={datos}
      onActualizarTitulo={(v) => setField('titulo', v)}
      onActualizarSubtitulo={(v) => setField('subtitulo', v)}
      onAgregarItem={() => agregarEn('timeline', crearTimelineVacio)}
      onEliminarItem={(i) => eliminarDe('timeline', i)}
      onActualizarItem={(i, campo, v) => actualizarEn('timeline', i, campo, v)}
    />
  )

  if (tipo === 'caracteristicas') return (
    <EditorCaracteristicas
      datos={datos}
      onActualizarTitulo={(v) => setField('titulo', v)}
      onActualizarSubtitulo={(v) => setField('subtitulo', v)}
      onAgregarDetalle={() => agregarEn('detalles', crearDetalleVacio)}
      onEliminarDetalle={(i) => eliminarDe('detalles', i)}
      onActualizarDetalle={(i, campo, v) => actualizarEn('detalles', i, campo, v)}
      onAgregarBeneficio={() => agregarEn('beneficios', crearBeneficioVacio)}
      onEliminarBeneficio={(i) => eliminarDe('beneficios', i)}
      onActualizarBeneficio={(i, campo, v) => actualizarEn('beneficios', i, campo, v)}
      onActualizarCTA={(campo, v) => actualizar({ ...datos, cta: { ...datos.cta, [campo]: v } })}
    />
  )

  if (tipo === 'testimonios') return (
    <EditorTestimonios
      datos={datos}
      onActualizarTitulo={(v) => setField('titulo', v)}
      onActualizarSubtitulo={(v) => setField('subtitulo', v)}
      onActualizarEstadisticas={(campo, v) => actualizar({ ...datos, estadisticas: { ...datos.estadisticas, [campo]: v } })}
      onAgregarTestimonio={() => agregarEn('testimonios', crearTestimonioVacio)}
      onEliminarTestimonio={(i) => eliminarDe('testimonios', i)}
      onActualizarTestimonio={(i, campo, v) => actualizarEn('testimonios', i, campo, v)}
    />
  )

  if (tipo === 'ventajas' || tipo === 'beneficios') return (
    <EditorListaItems
      datos={datos}
      tipo={tipo}
      onActualizarTitulo={(v) => setField('titulo', v)}
      onActualizarSubtitulo={(v) => setField('subtitulo', v)}
      onAgregarItem={() => agregarEn('items', crearBeneficioVacio)}
      onEliminarItem={(i) => eliminarDe('items', i)}
      onActualizarItem={(i, campo, v) => actualizarEn('items', i, campo, v)}
    />
  )

  if (tipo === 'faq') {
    return (
      <EditorFAQ
        datos={datos}
        onActualizarTitulo={(v) => setField('titulo', v)}
        onActualizarSubtitulo={(v) => setField('subtitulo', v)}
        onAgregarPregunta={() => agregarEn('preguntas', crearPreguntaVacia)}
        onEliminarPregunta={(i) => eliminarDe('preguntas', i)}
        onActualizarPregunta={(i, campo, v) => actualizarEn('preguntas', i, campo, v)}
      />
    )
  }

  if (tipo === 'garantias') {
    return (
      <EditorGarantias
        datos={datos}
        onActualizarTitulo={(v) => setField('titulo', v)}
        onActualizarSubtitulo={(v) => setField('subtitulo', v)}
        onAgregarGarantia={() => agregarEn('garantias', crearGarantiaVacia)}
        onEliminarGarantia={(i) => eliminarDe('garantias', i)}
        onActualizarGarantia={(i, campo, v) => actualizarEn('garantias', i, campo, v)}
      />
    )
  }

  if (tipo === 'cta_final') {
    return (
      <EditorCTAFinal
        datos={datos}
        onActualizarCampo={(campo, v) => setField(campo, v)}
      />
    )
  }

  if (tipo === 'promociones') {
    return (
      <EditorPromociones
        datos={datos}
        onActualizarTitulo={(v) => setField('titulo', v)}
        onActualizarSubtitulo={(v) => setField('subtitulo', v)}
        onAgregarPromocion={() => agregarEn('promociones', crearPromocionVacia)}
        onEliminarPromocion={(i) => eliminarDe('promociones', i)}
        onActualizarPromocion={(i, campo, v) => actualizarEn('promociones', i, campo, v)}
      />
    )
  }

  return <div>Tipo de sección no soportado: {tipo}</div>
}

export default ConvertidorAJson
