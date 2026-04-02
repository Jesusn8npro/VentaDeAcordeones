import React, { useState, useEffect, useRef, useCallback } from 'react'
import './ConvertidorAJson.css'

const ConvertidorAJson = ({ valor, onChange, tipo = 'banner_animado' }) => {
  const [datos, setDatos] = useState(null)
  const valorAnteriorRef = useRef(null)
  const tipoAnteriorRef = useRef(null)

  // Función para comparar valores de manera profunda
  const sonValoresIguales = useCallback((val1, val2) => {
    if (val1 === val2) return true
    if (val1 === null || val2 === null) return val1 === val2
    if (typeof val1 !== typeof val2) return false
    
    if (typeof val1 === 'object') {
      return JSON.stringify(val1) === JSON.stringify(val2)
    }
    
    return val1 === val2
  }, [])

  // Inicializar datos desde el valor recibido
  useEffect(() => {
    const valorCambio = !sonValoresIguales(valor, valorAnteriorRef.current)
    const tipoCambio = tipo !== tipoAnteriorRef.current
    
    // Solo procesar si el valor o tipo realmente cambió
    if (valorCambio || tipoCambio) {
      console.log('ConvertidorAJson - valor recibido:', valor)
      console.log('ConvertidorAJson - tipo:', tipo)
      console.log('ConvertidorAJson - valor cambió:', valorCambio)
      console.log('ConvertidorAJson - tipo cambió:', tipoCambio)
      
      // Actualizar referencias
      valorAnteriorRef.current = valor
      tipoAnteriorRef.current = tipo
      
      if (valor && valor !== null) {
        try {
          const datosParseados = typeof valor === 'string' ? JSON.parse(valor) : valor
          console.log('ConvertidorAJson - datos procesados:', datosParseados)
          
          if (tipo === 'banner_animado') {
            inicializarBannerAnimado(datosParseados)
          } else if (tipo === 'puntos_dolor') {
            inicializarPuntosDolor(datosParseados)
          } else if (tipo === 'caracteristicas') {
            inicializarCaracteristicas(datosParseados)
          } else if (tipo === 'testimonios') {
            inicializarTestimonios(datosParseados)
          } else if (tipo === 'faq') {
            inicializarFAQ(datosParseados)
          } else if (tipo === 'ventajas') {
            inicializarVentajas(datosParseados)
          } else if (tipo === 'beneficios') {
            inicializarBeneficios(datosParseados)
          } else if (tipo === 'garantias') {
            inicializarGarantias(datosParseados)
          } else if (tipo === 'cta_final') {
            inicializarCTAFinal(datosParseados)
          } else if (tipo === 'promociones') {
            inicializarPromociones(datosParseados)
          }
        } catch (error) {
          console.log('ConvertidorAJson - error al parsear:', error)
          inicializarDatosVacios()
        }
      } else {
        console.log('ConvertidorAJson - valor es null, usando datos vacíos')
        inicializarDatosVacios()
      }
    }
  }, [valor, tipo])

  const inicializarBannerAnimado = (datosParseados) => {
    if (datosParseados && Array.isArray(datosParseados.mensajes) && datosParseados.mensajes.length > 0) {
      setDatos({ mensajes: datosParseados.mensajes })
    } else {
      setDatos({ mensajes: [''] })
    }
  }

  const inicializarPuntosDolor = (datosParseados) => {
    if (datosParseados && Array.isArray(datosParseados)) {
      // Si es un array directo de puntos de dolor
      setDatos({
        titulo: 'Puntos de Dolor',
        subtitulo: 'Problemas que resuelve tu producto',
        timeline: datosParseados.map((punto, index) => ({
          id: Date.now() + index,
          icono: '💔',
          nombre: punto.titulo || punto.problema || '',
          posicion: index % 2 === 0 ? 'izquierda' : 'derecha',
          descripcion: punto.descripcion || punto.detalle || '',
          impacto: punto.impacto || '',
          timeline: punto.timeline || '',
          textoBoton: punto.textoBoton || 'NUESTRA SOLUCIÓN'
        }))
      })
    } else if (datosParseados && datosParseados.titulo) {
      // Si tiene estructura con título
      setDatos({
        titulo: datosParseados.titulo || '',
        subtitulo: datosParseados.subtitulo || '',
        timeline: Array.isArray(datosParseados.timeline) ? datosParseados.timeline.map(item => ({
          ...item,
          textoBoton: item.textoBoton || 'NUESTRA SOLUCIÓN'
        })) : [crearTimelineVacio()]
      })
    } else {
      setDatos({
        titulo: 'Puntos de Dolor',
        subtitulo: 'Problemas que resuelve tu producto',
        timeline: [crearTimelineVacio()]
      })
    }
  }

  const inicializarDatosVacios = () => {
    if (tipo === 'banner_animado') {
      setDatos({ mensajes: [''] })
    } else if (tipo === 'puntos_dolor') {
      setDatos({
        titulo: 'Puntos de Dolor',
        subtitulo: 'Problemas que resuelve tu producto',
        timeline: [crearTimelineVacio()]
      })
    } else if (tipo === 'caracteristicas') {
      setDatos({
        titulo: 'Características del Producto',
        subtitulo: 'Descubre las características exclusivas que marcan la diferencia',
        detalles: [crearDetalleVacio()],
        beneficios: [crearBeneficioVacio()],
        cta: {
          texto: '¡QUIERO APROVECHAR ESTA OFERTA!',
          subtexto: '🔥 Stock limitado, no dejes pasar esta oportunidad'
        }
      })
    } else if (tipo === 'testimonios') {
      setDatos({
        titulo: '¡+15.847 CLIENTES YA TRANSFORMARON SU NEGOCIO CON CARROEXPRESS VIP!',
        subtitulo: 'Lee lo que dicen nuestros emprendedores colombianos satisfechos',
        testimonios: [crearTestimonioVacio()],
        estadisticas: {
          recomiendan: 98,
          satisfaccion: 4.9,
          totalClientes: 15847
        }
      })
    } else if (tipo === 'faq') {
      setDatos({
        titulo: 'Preguntas Frecuentes',
        subtitulo: 'Resolvemos todas tus dudas para que compres con total confianza',
        preguntas: [crearPreguntaVacia()]
      })
    } else if (tipo === 'ventajas') {
      setDatos({
        titulo: '¿Por qué elegirnos?',
        subtitulo: 'Ventajas que nos diferencian',
        items: [crearBeneficioVacio()]
      })
    } else if (tipo === 'beneficios') {
      setDatos({
        titulo: 'Beneficios Exclusivos',
        subtitulo: 'Todo lo que obtienes al elegirnos',
        items: [crearBeneficioVacio()]
      })
    } else if (tipo === 'garantias') {
      setDatos({
        titulo: 'Compra con Total Confianza',
        subtitulo: 'Tu satisfacción y seguridad son nuestra prioridad #1',
        garantias: [crearGarantiaVacia()]
      })
    } else if (tipo === 'cta_final') {
      setDatos({
        titulo: '¡ÚLTIMA OPORTUNIDAD!',
        subtitulo: 'No dejes pasar esta oferta única. Miles ya han transformado su negocio con CarroExpress VIP.',
        botonTexto: '¡QUIERO MI TRANSFORMACIÓN AHORA!',
        urgencia: '⚡ Oferta válida solo por hoy',
        descuento: '70% OFF',
        envio: '🚚 Envío GRATIS en 24-48 horas',
        garantia: '🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero',
        precioActual: '4950325',
        precioAnterior: '16501083'
      })
    } else if (tipo === 'promociones') {
      setDatos({
        titulo: 'Promociones por Cantidad',
        subtitulo: 'Configura descuentos automáticos por cantidad de productos',
        promociones: [crearPromocionVacia()]
      })
    }
  }

  const crearTimelineVacio = () => ({
    id: Date.now(),
    icono: '💔',
    nombre: '',
    posicion: 'izquierda',
    descripcion: '',
    solucion: '',
    textoBoton: 'NUESTRA SOLUCIÓN'
  })

  const crearDetalleVacio = () => ({
    id: Date.now(),
    icono: '⚡',
    titulo: '',
    descripcion: ''
  })

  const crearBeneficioVacio = () => ({
    id: Date.now(),
    icono: '🛡️',
    titulo: '',
    descripcion: ''
  })

  const crearTestimonioVacio = () => ({
    id: Date.now(),
    fecha: 'Hace 1 día',
    likes: 0,
    nombre: '',
    rating: 5,
    ubicacion: '',
    comentario: '',
    verificado: true,
    compraVerificada: true
  })

  const crearPreguntaVacia = () => ({
    id: Date.now(),
    pregunta: '',
    respuesta: ''
  })

  const crearGarantiaVacia = () => ({
    id: Date.now(),
    icono: '🛡️',
    titulo: '',
    descripcion: ''
  })

  const crearPromocionVacia = () => ({
    id: Date.now(),
    cantidadMinima: 2,
    descuentoPorcentaje: 10,
    descripcion: 'Descuento por compra múltiple',
    activa: true
  })

  // Función para inicializar características
  const inicializarCaracteristicas = (datosParseados) => {
    if (datosParseados && datosParseados.titulo) {
      setDatos({
        titulo: datosParseados.titulo || 'Características del Producto',
        subtitulo: datosParseados.subtitulo || 'Descubre las características exclusivas que marcan la diferencia',
        detalles: Array.isArray(datosParseados.detalles) ? datosParseados.detalles : [crearDetalleVacio()],
        beneficios: Array.isArray(datosParseados.beneficios) ? datosParseados.beneficios : [crearBeneficioVacio()],
        cta: datosParseados.cta || {
          texto: '¡QUIERO APROVECHAR ESTA OFERTA!',
          subtexto: '🔥 Stock limitado, no dejes pasar esta oportunidad'
        }
      })
    } else {
      setDatos({
        titulo: 'Características del Producto',
        subtitulo: 'Descubre las características exclusivas que marcan la diferencia',
        detalles: [crearDetalleVacio()],
        beneficios: [crearBeneficioVacio()],
        cta: {
          texto: '¡QUIERO APROVECHAR ESTA OFERTA!',
          subtexto: '🔥 Stock limitado, no dejes pasar esta oportunidad'
        }
      })
    }
  }

  // Función para inicializar testimonios
  const inicializarTestimonios = (datosParseados) => {
    if (datosParseados && datosParseados.titulo) {
      setDatos({
        titulo: datosParseados.titulo || '¡+15.847 CLIENTES YA TRANSFORMARON SU NEGOCIO CON CARROEXPRESS VIP!',
        subtitulo: datosParseados.subtitulo || 'Lee lo que dicen nuestros emprendedores colombianos satisfechos',
        testimonios: Array.isArray(datosParseados.testimonios) ? datosParseados.testimonios : [crearTestimonioVacio()],
        estadisticas: datosParseados.estadisticas || {
          recomiendan: 98,
          satisfaccion: 4.9,
          totalClientes: 15847
        }
      })
    } else {
      setDatos({
        titulo: '¡+15.847 CLIENTES YA TRANSFORMARON SU NEGOCIO CON CARROEXPRESS VIP!',
        subtitulo: 'Lee lo que dicen nuestros emprendedores colombianos satisfechos',
        testimonios: [crearTestimonioVacio()],
        estadisticas: {
          recomiendan: 98,
          satisfaccion: 4.9,
          totalClientes: 15847
        }
      })
    }
  }

  // Función para inicializar FAQ
  const inicializarFAQ = (datosParseados) => {
    if (datosParseados && datosParseados.titulo) {
      setDatos({
        titulo: datosParseados.titulo || 'Preguntas Frecuentes',
        subtitulo: datosParseados.subtitulo || 'Resolvemos todas tus dudas para que compres con total confianza',
        preguntas: Array.isArray(datosParseados.preguntas) ? datosParseados.preguntas : [crearPreguntaVacia()]
      })
    } else {
      setDatos({
        titulo: 'Preguntas Frecuentes',
        subtitulo: 'Resolvemos todas tus dudas para que compres con total confianza',
        preguntas: [crearPreguntaVacia()]
      })
    }
  }

  // Función para inicializar Ventajas (JSONB con items)
  const inicializarVentajas = (datosParseados) => {
    if (datosParseados && datosParseados.titulo) {
      setDatos({
        titulo: datosParseados.titulo || '¿Por qué elegirnos?',
        subtitulo: datosParseados.subtitulo || 'Ventajas que nos diferencian',
        items: Array.isArray(datosParseados.items) ? datosParseados.items : [crearBeneficioVacio()]
      })
    } else {
      setDatos({
        titulo: '¿Por qué elegirnos?',
        subtitulo: 'Ventajas que nos diferencian',
        items: [crearBeneficioVacio()]
      })
    }
  }

  // Función para inicializar Beneficios (JSONB con items)
  const inicializarBeneficios = (datosParseados) => {
    if (datosParseados && datosParseados.titulo) {
      setDatos({
        titulo: datosParseados.titulo || 'Beneficios Exclusivos',
        subtitulo: datosParseados.subtitulo || 'Todo lo que obtienes al elegirnos',
        items: Array.isArray(datosParseados.items) ? datosParseados.items : [crearBeneficioVacio()]
      })
    } else {
      setDatos({
        titulo: 'Beneficios Exclusivos',
        subtitulo: 'Todo lo que obtienes al elegirnos',
        items: [crearBeneficioVacio()]
      })
    }
  }

  // Función para inicializar garantías
  const inicializarGarantias = (datosParseados) => {
    if (datosParseados && datosParseados.titulo) {
      setDatos({
        titulo: datosParseados.titulo || 'Compra con Total Confianza',
        subtitulo: datosParseados.subtitulo || 'Tu satisfacción y seguridad son nuestra prioridad #1',
        garantias: Array.isArray(datosParseados.garantias) ? datosParseados.garantias : [crearGarantiaVacia()]
      })
    } else {
      setDatos({
        titulo: 'Compra con Total Confianza',
        subtitulo: 'Tu satisfacción y seguridad son nuestra prioridad #1',
        garantias: [crearGarantiaVacia()]
      })
    }
  }

  // Función para inicializar CTA Final
  const inicializarCTAFinal = (datosParseados) => {
    if (datosParseados && datosParseados.titulo) {
      setDatos({
        titulo: datosParseados.titulo || '¡ÚLTIMA OPORTUNIDAD!',
        subtitulo: datosParseados.subtitulo || 'No dejes pasar esta oferta única. Miles ya han transformado su negocio con CarroExpress VIP.',
        botonTexto: datosParseados.botonTexto || '¡QUIERO MI TRANSFORMACIÓN AHORA!',
        urgencia: datosParseados.urgencia || '⚡ Oferta válida solo por hoy',
        descuento: datosParseados.descuento || '70% OFF',
        envio: datosParseados.envio || '🚚 Envío GRATIS en 24-48 horas',
        garantia: datosParseados.garantia || '🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero',
        precioActual: datosParseados.precioActual || '4950325',
        precioAnterior: datosParseados.precioAnterior || '16501083'
      })
    } else {
      setDatos({
        titulo: '¡ÚLTIMA OPORTUNIDAD!',
        subtitulo: 'No dejes pasar esta oferta única. Miles ya han transformado su negocio con CarroExpress VIP.',
        botonTexto: '¡QUIERO MI TRANSFORMACIÓN AHORA!',
        urgencia: '⚡ Oferta válida solo por hoy',
        descuento: '70% OFF',
        envio: '🚚 Envío GRATIS en 24-48 horas',
        garantia: '🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero',
        precioActual: '4950325',
        precioAnterior: '16501083'
      })
    }
  }

  // Función para inicializar promociones
  const inicializarPromociones = (datosParseados) => {
    if (Array.isArray(datosParseados) && datosParseados.length > 0) {
      setDatos({
        titulo: 'Promociones por Cantidad',
        subtitulo: 'Configura descuentos automáticos por cantidad de productos',
        promociones: datosParseados
      })
    } else if (datosParseados && datosParseados.promociones) {
      setDatos({
        titulo: datosParseados.titulo || 'Promociones por Cantidad',
        subtitulo: datosParseados.subtitulo || 'Configura descuentos automáticos por cantidad de productos',
        promociones: Array.isArray(datosParseados.promociones) ? datosParseados.promociones : [crearPromocionVacia()]
      })
    } else {
      setDatos({
        titulo: 'Promociones por Cantidad',
        subtitulo: 'Configura descuentos automáticos por cantidad de productos',
        promociones: [crearPromocionVacia()]
      })
    }
  }

  // Función para notificar cambios al padre
  const notificarCambio = (nuevosDatos) => {
    if (onChange) {
      onChange(nuevosDatos)
    }
  }

  // ===== FUNCIONES BANNER ANIMADO =====
  const agregarMensaje = () => {
    const nuevosMensajes = [...datos.mensajes, '']
    const nuevosDatos = { ...datos, mensajes: nuevosMensajes }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const eliminarMensaje = (index) => {
    if (datos.mensajes.length > 1) {
      const nuevosMensajes = datos.mensajes.filter((_, i) => i !== index)
      const nuevosDatos = { ...datos, mensajes: nuevosMensajes }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }
  }

  const actualizarMensaje = (index, nuevoMensaje) => {
    const nuevosMensajes = [...datos.mensajes]
    nuevosMensajes[index] = nuevoMensaje
    const nuevosDatos = { ...datos, mensajes: nuevosMensajes }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  // ===== FUNCIONES PUNTOS DE DOLOR =====
  const actualizarTitulo = (nuevoTitulo) => {
    const nuevosDatos = { ...datos, titulo: nuevoTitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarSubtitulo = (nuevoSubtitulo) => {
    const nuevosDatos = { ...datos, subtitulo: nuevoSubtitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  // ===== FUNCIONES LISTAS GENERALES (items para ventajas/beneficios) =====
  const actualizarTituloLista = (nuevoTitulo) => {
    const nuevosDatos = { ...datos, titulo: nuevoTitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarSubtituloLista = (nuevoSubtitulo) => {
    const nuevosDatos = { ...datos, subtitulo: nuevoSubtitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const agregarItemLista = () => {
    const nuevosItems = [...(datos.items || []), crearBeneficioVacio()]
    const nuevosDatos = { ...datos, items: nuevosItems }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const eliminarItemLista = (index) => {
    const lista = datos.items || []
    if (lista.length > 1) {
      const nuevosItems = lista.filter((_, i) => i !== index)
      const nuevosDatos = { ...datos, items: nuevosItems }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }
  }

  const actualizarItemLista = (index, campo, valor) => {
    const nuevosItems = [...(datos.items || [])]
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor }
    const nuevosDatos = { ...datos, items: nuevosItems }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const agregarTimelineItem = () => {
    const nuevoTimeline = [...datos.timeline, crearTimelineVacio()]
    const nuevosDatos = { ...datos, timeline: nuevoTimeline }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const eliminarTimelineItem = (index) => {
    if (datos.timeline.length > 1) {
      const nuevoTimeline = datos.timeline.filter((_, i) => i !== index)
      const nuevosDatos = { ...datos, timeline: nuevoTimeline }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }
  }

  const actualizarTimelineItem = (index, campo, valor) => {
    const nuevoTimeline = [...datos.timeline]
    nuevoTimeline[index] = { ...nuevoTimeline[index], [campo]: valor }
    const nuevosDatos = { ...datos, timeline: nuevoTimeline }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  // ===== FUNCIONES CARACTERÍSTICAS =====
  const actualizarTituloCaracteristicas = (nuevoTitulo) => {
    const nuevosDatos = { ...datos, titulo: nuevoTitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarSubtituloCaracteristicas = (nuevoSubtitulo) => {
    const nuevosDatos = { ...datos, subtitulo: nuevoSubtitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const agregarDetalle = () => {
    const nuevosDetalles = [...datos.detalles, crearDetalleVacio()]
    const nuevosDatos = { ...datos, detalles: nuevosDetalles }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const eliminarDetalle = (index) => {
    if (datos.detalles.length > 1) {
      const nuevosDetalles = datos.detalles.filter((_, i) => i !== index)
      const nuevosDatos = { ...datos, detalles: nuevosDetalles }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }
  }

  const actualizarDetalle = (index, campo, valor) => {
    const nuevosDetalles = [...datos.detalles]
    nuevosDetalles[index] = { ...nuevosDetalles[index], [campo]: valor }
    const nuevosDatos = { ...datos, detalles: nuevosDetalles }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const agregarBeneficio = () => {
    const nuevosBeneficios = [...datos.beneficios, crearBeneficioVacio()]
    const nuevosDatos = { ...datos, beneficios: nuevosBeneficios }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const eliminarBeneficio = (index) => {
    if (datos.beneficios.length > 1) {
      const nuevosBeneficios = datos.beneficios.filter((_, i) => i !== index)
      const nuevosDatos = { ...datos, beneficios: nuevosBeneficios }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }
  }

  const actualizarBeneficio = (index, campo, valor) => {
    const nuevosBeneficios = [...datos.beneficios]
    nuevosBeneficios[index] = { ...nuevosBeneficios[index], [campo]: valor }
    const nuevosDatos = { ...datos, beneficios: nuevosBeneficios }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarCTA = (campo, valor) => {
    const nuevoCTA = { ...datos.cta, [campo]: valor }
    const nuevosDatos = { ...datos, cta: nuevoCTA }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  // ===== FUNCIONES TESTIMONIOS =====
  const actualizarTituloTestimonios = (nuevoTitulo) => {
    const nuevosDatos = { ...datos, titulo: nuevoTitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarSubtituloTestimonios = (nuevoSubtitulo) => {
    const nuevosDatos = { ...datos, subtitulo: nuevoSubtitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const agregarTestimonio = () => {
    const nuevosTestimonios = [...datos.testimonios, crearTestimonioVacio()]
    const nuevosDatos = { ...datos, testimonios: nuevosTestimonios }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const eliminarTestimonio = (index) => {
    if (datos.testimonios.length > 1) {
      const nuevosTestimonios = datos.testimonios.filter((_, i) => i !== index)
      const nuevosDatos = { ...datos, testimonios: nuevosTestimonios }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }
  }

  const actualizarTestimonio = (index, campo, valor) => {
    const nuevosTestimonios = [...datos.testimonios]
    nuevosTestimonios[index] = { ...nuevosTestimonios[index], [campo]: valor }
    const nuevosDatos = { ...datos, testimonios: nuevosTestimonios }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarEstadisticas = (campo, valor) => {
    const nuevasEstadisticas = { ...datos.estadisticas, [campo]: valor }
    const nuevosDatos = { ...datos, estadisticas: nuevasEstadisticas }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  // ===== RENDERIZADO =====
  if (!datos) {
    return <div>Cargando...</div>
  }

  if (tipo === 'banner_animado') {
    return (
      <div className="banner-animado-editor">
        <div className="mensajes-lista">
          {datos.mensajes.map((mensaje, index) => (
            <div key={`mensaje-${index}-${mensaje.slice(0,10)}`} className="mensaje-item">
              <div className="mensaje-numero">#{index + 1}</div>
              <input
                type="text"
                value={mensaje}
                onChange={(e) => actualizarMensaje(index, e.target.value)}
                placeholder={`Mensaje ${index + 1} (ej: "¡Oferta especial!", "Envío gratis")`}
                className="mensaje-input"
              />
              {datos.mensajes.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarMensaje(index)}
                  className="btn-eliminar"
                  title="Eliminar mensaje"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={agregarMensaje}
          className="btn-agregar-mensaje"
        >
          ➕ Agregar Mensaje
        </button>
        
        <div className="preview-banner">
          <strong>Vista previa:</strong>
          <div className="mensajes-preview">
            {datos.mensajes.filter(msg => msg && msg.trim()).map((mensaje, index) => (
              <span key={`preview-${index}-${mensaje.slice(0,10)}`} className="mensaje-preview">
                "{mensaje}"
                {index < datos.mensajes.filter(msg => msg && msg.trim()).length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (tipo === 'puntos_dolor') {
    return (
      <div className="puntos-dolor-editor">
        <div className="puntos-dolor-header">
          <input
            type="text"
            value={datos.titulo}
            onChange={(e) => actualizarTitulo(e.target.value)}
            placeholder="Título de la sección (ej: ¿Cansado de perder clientes por falta de movilidad y servicio?)"
            className="puntos-dolor-titulo"
          />
          <input
            type="text"
            value={datos.subtitulo}
            onChange={(e) => actualizarSubtitulo(e.target.value)}
            placeholder="Subtítulo explicativo (ej: El CarroExpress VIP resuelve estos problemas clave...)"
            className="puntos-dolor-subtitulo"
          />
        </div>

        <div className="timeline-lista">
          {datos.timeline.map((item, index) => (
            <div key={item.id || index} className="timeline-item">
              <div className="timeline-item-header">
                <div className="timeline-numero">#{index + 1}</div>
                <input
                  type="text"
                  value={item.icono}
                  onChange={(e) => actualizarTimelineItem(index, 'icono', e.target.value)}
                  placeholder="🔥"
                  className="timeline-icono timeline-input"
                  style={{ width: '50px' }}
                />
                <input
                  type="text"
                  value={item.nombre}
                  onChange={(e) => actualizarTimelineItem(index, 'nombre', e.target.value)}
                  placeholder="Nombre del problema (ej: Dificultad para ofrecer comida gourmet...)"
                  className="timeline-input"
                />
                {datos.timeline.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarTimelineItem(index)}
                    className="btn-eliminar"
                    title="Eliminar punto de dolor"
                  >
                    ❌
                  </button>
                )}
              </div>
              
              <div className="timeline-campos">
                <div className="timeline-campo">
                  <label className="timeline-label">Posición:</label>
                  <select
                    value={item.posicion}
                    onChange={(e) => actualizarTimelineItem(index, 'posicion', e.target.value)}
                    className="timeline-select"
                  >
                    <option value="izquierda">Izquierda</option>
                    <option value="derecha">Derecha</option>
                  </select>
                </div>
                <div className="timeline-campo">
                  <label className="timeline-label">Descripción del problema:</label>
                  <textarea
                    value={item.descripcion}
                    onChange={(e) => actualizarTimelineItem(index, 'descripcion', e.target.value)}
                    placeholder="Describe el problema que enfrentan los clientes..."
                    className="timeline-textarea"
                  />
                </div>
              </div>
              
              <div className="timeline-campo">
                <label className="timeline-label">Solución que ofreces:</label>
                <textarea
                  value={item.solucion}
                  onChange={(e) => actualizarTimelineItem(index, 'solucion', e.target.value)}
                  placeholder="Explica cómo tu producto resuelve este problema..."
                  className="timeline-textarea"
                />
              </div>
              
              <div className="timeline-campo">
                <label className="timeline-label">Texto del botón:</label>
                <input
                  type="text"
                  value={item.textoBoton}
                  onChange={(e) => actualizarTimelineItem(index, 'textoBoton', e.target.value)}
                  placeholder="NUESTRA SOLUCIÓN"
                  className="timeline-input"
                />
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={agregarTimelineItem}
          className="btn-agregar-timeline"
        >
          ➕ Agregar Punto de Dolor
        </button>
        
        <div className="preview-puntos-dolor">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <h4>{datos.titulo}</h4>
            <p>{datos.subtitulo}</p>
            <div className="preview-timeline">
              {datos.timeline.filter(item => item.nombre && item.nombre.trim()).map((item, index) => (
                <div key={`timeline-preview-${item.id || index}`} className="preview-timeline-item">
                  <div className="preview-timeline-nombre">
                    {item.icono} {item.nombre} ({item.posicion})
                  </div>
                  <div className="preview-timeline-descripcion">
                    Problema: {item.descripcion}
                  </div>
                  <div className="preview-timeline-solucion">
                    Solución: {item.solucion}
                  </div>
                  <div className="preview-timeline-boton">
                    <button className="preview-boton-solucion">
                      {item.textoBoton || 'NUESTRA SOLUCIÓN'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tipo === 'caracteristicas') {
    return (
      <div className="caracteristicas-editor">
        <div className="caracteristicas-header">
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Título principal:</label>
            <input
              type="text"
              value={datos.titulo}
              onChange={(e) => actualizarTituloCaracteristicas(e.target.value)}
              placeholder="Título de las características"
              className="caracteristicas-input"
            />
          </div>
          
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Subtítulo:</label>
            <input
              type="text"
              value={datos.subtitulo}
              onChange={(e) => actualizarSubtituloCaracteristicas(e.target.value)}
              placeholder="Subtítulo descriptivo"
              className="caracteristicas-input"
            />
          </div>
        </div>

        <div className="caracteristicas-seccion">
          <h4>Detalles del Producto</h4>
          {datos.detalles.map((detalle, index) => (
            <div key={detalle.id} className="caracteristicas-item">
              <div className="caracteristicas-item-header">
                <span className="caracteristicas-numero">Detalle #{index + 1}</span>
                {datos.detalles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarDetalle(index)}
                    className="btn-eliminar-caracteristicas"
                  >
                    ❌
                  </button>
                )}
              </div>
              
              <div className="caracteristicas-campos">
                <div className="caracteristicas-campo">
                  <label className="caracteristicas-label">Icono:</label>
                  <input
                    type="text"
                    value={detalle.icono}
                    onChange={(e) => actualizarDetalle(index, 'icono', e.target.value)}
                    placeholder="⚡"
                    className="caracteristicas-input-small"
                  />
                </div>
                <div className="caracteristicas-campo">
                  <label className="caracteristicas-label">Título:</label>
                  <input
                    type="text"
                    value={detalle.titulo}
                    onChange={(e) => actualizarDetalle(index, 'titulo', e.target.value)}
                    placeholder="Título del detalle"
                    className="caracteristicas-input"
                  />
                </div>
              </div>
              
              <div className="caracteristicas-campo">
                <label className="caracteristicas-label">Descripción:</label>
                <textarea
                  value={detalle.descripcion}
                  onChange={(e) => actualizarDetalle(index, 'descripcion', e.target.value)}
                  placeholder="Descripción detallada de la característica..."
                  className="caracteristicas-textarea"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={agregarDetalle}
            className="btn-agregar-caracteristicas"
          >
            ➕ Agregar Detalle
          </button>
        </div>

        <div className="caracteristicas-seccion">
          <h4>Beneficios del Producto</h4>
          {datos.beneficios.map((beneficio, index) => (
            <div key={beneficio.id} className="caracteristicas-item">
              <div className="caracteristicas-item-header">
                <span className="caracteristicas-numero">Beneficio #{index + 1}</span>
                {datos.beneficios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarBeneficio(index)}
                    className="btn-eliminar-caracteristicas"
                  >
                    ❌
                  </button>
                )}
              </div>
              
              <div className="caracteristicas-campos">
                <div className="caracteristicas-campo">
                  <label className="caracteristicas-label">Icono:</label>
                  <input
                    type="text"
                    value={beneficio.icono}
                    onChange={(e) => actualizarBeneficio(index, 'icono', e.target.value)}
                    placeholder="🛡️"
                    className="caracteristicas-input-small"
                  />
                </div>
                <div className="caracteristicas-campo">
                  <label className="caracteristicas-label">Título:</label>
                  <input
                    type="text"
                    value={beneficio.titulo}
                    onChange={(e) => actualizarBeneficio(index, 'titulo', e.target.value)}
                    placeholder="Título del beneficio"
                    className="caracteristicas-input"
                  />
                </div>
              </div>
              
              <div className="caracteristicas-campo">
                <label className="caracteristicas-label">Descripción:</label>
                <textarea
                  value={beneficio.descripcion}
                  onChange={(e) => actualizarBeneficio(index, 'descripcion', e.target.value)}
                  placeholder="Descripción detallada del beneficio..."
                  className="caracteristicas-textarea"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={agregarBeneficio}
            className="btn-agregar-caracteristicas"
          >
            ➕ Agregar Beneficio
          </button>
        </div>

        <div className="caracteristicas-seccion">
          <h4>Call to Action (CTA)</h4>
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Texto del botón:</label>
            <input
              type="text"
              value={datos.cta.texto}
              onChange={(e) => actualizarCTA('texto', e.target.value)}
              placeholder="¡QUIERO APROVECHAR ESTA OFERTA!"
              className="caracteristicas-input"
            />
          </div>
          
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Subtexto:</label>
            <input
              type="text"
              value={datos.cta.subtexto}
              onChange={(e) => actualizarCTA('subtexto', e.target.value)}
              placeholder="🔥 Stock limitado, no dejes pasar esta oportunidad"
              className="caracteristicas-input"
            />
          </div>
        </div>

        <div className="preview-caracteristicas">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <h3>{datos.titulo}</h3>
            <p>{datos.subtitulo}</p>
            
            <div className="preview-detalles">
              <h4>Detalles:</h4>
              {datos.detalles.filter(detalle => detalle.titulo && detalle.titulo.trim()).map((detalle, index) => (
                <div key={`detalle-preview-${detalle.id || index}`} className="preview-caracteristica-item">
                  <div className="preview-caracteristica-header">
                    <span className="preview-icono">{detalle.icono}</span>
                    <span className="preview-titulo">{detalle.titulo}</span>
                  </div>
                  <div className="preview-descripcion">{detalle.descripcion}</div>
                </div>
              ))}
            </div>
            
            <div className="preview-beneficios">
              <h4>Beneficios:</h4>
              {datos.beneficios.filter(beneficio => beneficio.titulo && beneficio.titulo.trim()).map((beneficio, index) => (
                <div key={`beneficio-preview-${beneficio.id || index}`} className="preview-caracteristica-item">
                  <div className="preview-caracteristica-header">
                    <span className="preview-icono">{beneficio.icono}</span>
                    <span className="preview-titulo">{beneficio.titulo}</span>
                  </div>
                  <div className="preview-descripcion">{beneficio.descripcion}</div>
                </div>
              ))}
            </div>
            
            <div className="preview-cta">
              <button className="preview-boton-cta">
                {datos.cta.texto}
              </button>
              <div className="preview-subtexto">{datos.cta.subtexto}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tipo === 'testimonios') {
    return (
      <div className="testimonios-editor">
        <div className="testimonios-header">
          <input
            type="text"
            value={datos.titulo}
            onChange={(e) => actualizarTituloTestimonios(e.target.value)}
            placeholder="Título principal (ej: ¡+15.847 CLIENTES YA TRANSFORMARON SU NEGOCIO!)"
            className="testimonios-titulo"
          />
          <input
            type="text"
            value={datos.subtitulo}
            onChange={(e) => actualizarSubtituloTestimonios(e.target.value)}
            placeholder="Subtítulo explicativo (ej: Lee lo que dicen nuestros emprendedores...)"
            className="testimonios-subtitulo"
          />
        </div>

        <div className="estadisticas-seccion">
          <h4>Estadísticas</h4>
          <div className="estadisticas-campos">
            <div className="estadisticas-campo">
              <label>% Recomiendan:</label>
              <input
                type="number"
                value={datos.estadisticas.recomiendan}
                onChange={(e) => actualizarEstadisticas('recomiendan', parseInt(e.target.value) || 0)}
                placeholder="98"
                className="estadisticas-input"
                min="0"
                max="100"
              />
            </div>
            <div className="estadisticas-campo">
              <label>Satisfacción:</label>
              <input
                type="number"
                step="0.1"
                value={datos.estadisticas.satisfaccion}
                onChange={(e) => actualizarEstadisticas('satisfaccion', parseFloat(e.target.value) || 0)}
                placeholder="4.9"
                className="estadisticas-input"
                min="0"
                max="5"
              />
            </div>
            <div className="estadisticas-campo">
              <label>Total Clientes:</label>
              <input
                type="number"
                value={datos.estadisticas.totalClientes}
                onChange={(e) => actualizarEstadisticas('totalClientes', parseInt(e.target.value) || 0)}
                placeholder="15847"
                className="estadisticas-input"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="testimonios-lista">
          {datos.testimonios.map((testimonio, index) => (
            <div key={testimonio.id || index} className="testimonio-item">
              <div className="testimonio-item-header">
                <div className="testimonio-numero">#{index + 1}</div>
                <button
                  type="button"
                  onClick={() => eliminarTestimonio(index)}
                  className="btn-eliminar-testimonio"
                  disabled={datos.testimonios.length <= 1}
                >
                  🗑️
                </button>
              </div>
              
              <div className="testimonio-campos">
                <div className="testimonio-campo">
                  <label className="testimonio-label">Nombre:</label>
                  <input
                    type="text"
                    value={testimonio.nombre}
                    onChange={(e) => actualizarTestimonio(index, 'nombre', e.target.value)}
                    placeholder="María González"
                    className="testimonio-input"
                  />
                </div>
                
                <div className="testimonio-campo">
                  <label className="testimonio-label">Ubicación:</label>
                  <input
                    type="text"
                    value={testimonio.ubicacion}
                    onChange={(e) => actualizarTestimonio(index, 'ubicacion', e.target.value)}
                    placeholder="Bogotá, Colombia"
                    className="testimonio-input"
                  />
                </div>
                
                <div className="testimonio-campo">
                  <label className="testimonio-label">Fecha:</label>
                  <input
                    type="text"
                    value={testimonio.fecha}
                    onChange={(e) => actualizarTestimonio(index, 'fecha', e.target.value)}
                    placeholder="Hace 2 días"
                    className="testimonio-input"
                  />
                </div>
                
                <div className="testimonio-campo">
                  <label className="testimonio-label">Likes:</label>
                  <input
                    type="number"
                    value={testimonio.likes}
                    onChange={(e) => actualizarTestimonio(index, 'likes', parseInt(e.target.value) || 0)}
                    placeholder="234"
                    className="testimonio-input"
                    min="0"
                  />
                </div>
                
                <div className="testimonio-campo">
                  <label className="testimonio-label">Rating:</label>
                  <select
                    value={testimonio.rating}
                    onChange={(e) => actualizarTestimonio(index, 'rating', parseInt(e.target.value))}
                    className="testimonio-select"
                  >
                    <option value={1}>⭐ (1)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                  </select>
                </div>
                
                <div className="testimonio-campo-completo">
                  <label className="testimonio-label">Comentario:</label>
                  <textarea
                    value={testimonio.comentario}
                    onChange={(e) => actualizarTestimonio(index, 'comentario', e.target.value)}
                    placeholder="¡El CarroExpress VIP revolucionó mi emprendimiento! Ahora ofrezco comida gourmet..."
                    className="testimonio-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="testimonio-checkboxes">
                  <label className="testimonio-checkbox">
                    <input
                      type="checkbox"
                      checked={testimonio.verificado}
                      onChange={(e) => actualizarTestimonio(index, 'verificado', e.target.checked)}
                    />
                    Verificado
                  </label>
                  <label className="testimonio-checkbox">
                    <input
                      type="checkbox"
                      checked={testimonio.compraVerificada}
                      onChange={(e) => actualizarTestimonio(index, 'compraVerificada', e.target.checked)}
                    />
                    Compra Verificada
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={agregarTestimonio}
          className="btn-agregar-testimonio"
        >
          ➕ Agregar Testimonio
        </button>
        
        <div className="preview-testimonios">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <h3>{datos.titulo}</h3>
            <p>{datos.subtitulo}</p>
            
            <div className="preview-estadisticas">
              <div className="estadistica-item">
                <span className="estadistica-numero">{datos.estadisticas.recomiendan}%</span>
                <span className="estadistica-texto">Lo recomiendan</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-numero">{datos.estadisticas.satisfaccion}</span>
                <span className="estadistica-texto">Satisfacción</span>
              </div>
              <div className="estadistica-item">
                <span className="estadistica-numero">{datos.estadisticas.totalClientes.toLocaleString()}</span>
                <span className="estadistica-texto">Clientes</span>
              </div>
            </div>
            
            <div className="preview-testimonios-lista">
              {datos.testimonios.filter(testimonio => testimonio.nombre && testimonio.nombre.trim() && testimonio.comentario && testimonio.comentario.trim()).map((testimonio, index) => (
                <div key={`testimonio-preview-${testimonio.id || index}`} className="preview-testimonio-item">
                  <div className="preview-testimonio-header">
                    <div className="preview-testimonio-info">
                      <span className="preview-testimonio-nombre">{testimonio.nombre}</span>
                      <span className="preview-testimonio-ubicacion">{testimonio.ubicacion}</span>
                      <span className="preview-testimonio-fecha">{testimonio.fecha}</span>
                    </div>
                    <div className="preview-testimonio-rating">
                      {'⭐'.repeat(testimonio.rating)}
                    </div>
                  </div>
                  <div className="preview-testimonio-comentario">
                    {testimonio.comentario}
                  </div>
                  <div className="preview-testimonio-footer">
                    <span className="preview-testimonio-likes">👍 {testimonio.likes}</span>
                    {testimonio.verificado && <span className="preview-verificado">✅ Verificado</span>}
                    {testimonio.compraVerificada && <span className="preview-compra-verificada">🛒 Compra Verificada</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tipo === 'ventajas' || tipo === 'beneficios') {
    const tituloSeccion = tipo === 'ventajas' ? 'Ventajas Competitivas' : 'Beneficios del Producto'
    return (
      <div className="caracteristicas-editor">
        <div className="caracteristicas-header">
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Título principal:</label>
            <input
              type="text"
              value={datos.titulo}
              onChange={(e) => actualizarTituloLista(e.target.value)}
              placeholder={tituloSeccion}
              className="caracteristicas-input"
            />
          </div>
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Subtítulo:</label>
            <input
              type="text"
              value={datos.subtitulo}
              onChange={(e) => actualizarSubtituloLista(e.target.value)}
              placeholder="Subtítulo descriptivo"
              className="caracteristicas-input"
            />
          </div>
        </div>

        <div className="caracteristicas-seccion">
          <h4>{tituloSeccion}</h4>
          {(datos.items || []).map((item, index) => (
            <div key={item.id || index} className="caracteristicas-item">
              <div className="caracteristicas-item-header">
                <span className="caracteristicas-numero">Ítem #{index + 1}</span>
                {(datos.items || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarItemLista(index)}
                    className="btn-eliminar-caracteristicas"
                  >
                    ❌
                  </button>
                )}
              </div>
              <div className="caracteristicas-campos">
                <div className="caracteristicas-campo">
                  <label className="caracteristicas-label">Icono:</label>
                  <input
                    type="text"
                    value={item.icono || ''}
                    onChange={(e) => actualizarItemLista(index, 'icono', e.target.value)}
                    placeholder="🛡️"
                    className="caracteristicas-input-small"
                  />
                </div>
                <div className="caracteristicas-campo">
                  <label className="caracteristicas-label">Título:</label>
                  <input
                    type="text"
                    value={item.titulo || ''}
                    onChange={(e) => actualizarItemLista(index, 'titulo', e.target.value)}
                    placeholder="Título del ítem"
                    className="caracteristicas-input"
                  />
                </div>
              </div>
              <div className="caracteristicas-campo">
                <label className="caracteristicas-label">Descripción:</label>
                <textarea
                  value={item.descripcion || ''}
                  onChange={(e) => actualizarItemLista(index, 'descripcion', e.target.value)}
                  placeholder="Descripción del ítem..."
                  className="caracteristicas-textarea"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarItemLista}
            className="btn-agregar-caracteristicas"
          >
            ➕ Agregar Ítem
          </button>
        </div>

        <div className="preview-beneficios">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <h3>{datos.titulo}</h3>
            <p>{datos.subtitulo}</p>
            {(datos.items || []).filter(i => i.titulo && i.titulo.trim()).map((i, index) => (
              <div key={`item-preview-${i.id || index}`} className="preview-caracteristica-item">
                <div className="preview-caracteristica-header">
                  <span className="preview-icono">{i.icono}</span>
                  <span className="preview-titulo">{i.titulo}</span>
                </div>
                <div className="preview-descripcion">{i.descripcion}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Renderizar editor de FAQ
  if (tipo === 'faq') {
    const actualizarTitulo = (valor) => {
      const nuevosDatos = { ...datos, titulo: valor }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const actualizarSubtitulo = (valor) => {
      const nuevosDatos = { ...datos, subtitulo: valor }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const actualizarPregunta = (index, campo, valor) => {
      const nuevasPreguntas = [...datos.preguntas]
      nuevasPreguntas[index] = { ...nuevasPreguntas[index], [campo]: valor }
      const nuevosDatos = { ...datos, preguntas: nuevasPreguntas }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const agregarPregunta = () => {
      const nuevasPreguntas = [...datos.preguntas, crearPreguntaVacia()]
      const nuevosDatos = { ...datos, preguntas: nuevasPreguntas }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const eliminarPregunta = (index) => {
      if (datos.preguntas.length > 1) {
        const nuevasPreguntas = datos.preguntas.filter((_, i) => i !== index)
        const nuevosDatos = { ...datos, preguntas: nuevasPreguntas }
        setDatos(nuevosDatos)
        notificarCambio(nuevosDatos)
      }
    }

    return (
      <div className="convertidor-json">
        <h3>Editor de FAQ (Preguntas Frecuentes)</h3>
        
        <div className="faq-seccion">
          <h4>Información General</h4>
          <div className="faq-campo">
            <label className="faq-label">Título:</label>
            <input
              type="text"
              value={datos.titulo}
              onChange={(e) => actualizarTitulo(e.target.value)}
              placeholder="Preguntas Frecuentes"
              className="faq-input"
            />
          </div>
          
          <div className="faq-campo">
            <label className="faq-label">Subtítulo:</label>
            <input
              type="text"
              value={datos.subtitulo}
              onChange={(e) => actualizarSubtitulo(e.target.value)}
              placeholder="Resolvemos todas tus dudas para que compres con total confianza"
              className="faq-input"
            />
          </div>
        </div>

        <div className="faq-seccion">
          <h4>Preguntas y Respuestas</h4>
          {datos.preguntas.map((pregunta, index) => (
            <div key={pregunta.id} className="faq-item">
              <div className="faq-item-header">
                <h5>Pregunta {index + 1}</h5>
                {datos.preguntas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarPregunta(index)}
                    className="btn-eliminar-faq"
                  >
                    ❌
                  </button>
                )}
              </div>
              
              <div className="faq-campo">
                <label className="faq-label">Pregunta:</label>
                <input
                  type="text"
                  value={pregunta.pregunta}
                  onChange={(e) => actualizarPregunta(index, 'pregunta', e.target.value)}
                  placeholder="¿Realmente funciona como prometen?"
                  className="faq-input"
                />
              </div>
              
              <div className="faq-campo">
                <label className="faq-label">Respuesta:</label>
                <textarea
                  value={pregunta.respuesta}
                  onChange={(e) => actualizarPregunta(index, 'respuesta', e.target.value)}
                  placeholder="Sí, el producto está diseñado con tecnología premium..."
                  className="faq-textarea"
                  rows="4"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={agregarPregunta}
            className="btn-agregar-faq"
          >
            ➕ Agregar Pregunta
          </button>
        </div>

        <div className="preview-faq">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <h3>{datos.titulo}</h3>
            <p>{datos.subtitulo}</p>
            
            <div className="preview-faq-lista">
              {datos.preguntas.filter(pregunta => pregunta.pregunta && pregunta.pregunta.trim() && pregunta.respuesta && pregunta.respuesta.trim()).map((pregunta, index) => (
                <div key={`pregunta-preview-${pregunta.id || index}`} className="preview-faq-item">
                  <div className="preview-faq-pregunta">
                    <strong>❓ {pregunta.pregunta}</strong>
                  </div>
                  <div className="preview-faq-respuesta">
                    {pregunta.respuesta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar editor de Garantías
  if (tipo === 'garantias') {
    const actualizarTitulo = (valor) => {
      const nuevosDatos = { ...datos, titulo: valor }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const actualizarSubtitulo = (valor) => {
      const nuevosDatos = { ...datos, subtitulo: valor }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const actualizarGarantia = (index, campo, valor) => {
      const nuevasGarantias = [...datos.garantias]
      nuevasGarantias[index] = { ...nuevasGarantias[index], [campo]: valor }
      const nuevosDatos = { ...datos, garantias: nuevasGarantias }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const agregarGarantia = () => {
      const nuevasGarantias = [...datos.garantias, crearGarantiaVacia()]
      const nuevosDatos = { ...datos, garantias: nuevasGarantias }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const eliminarGarantia = (index) => {
      if (datos.garantias.length > 1) {
        const nuevasGarantias = datos.garantias.filter((_, i) => i !== index)
        const nuevosDatos = { ...datos, garantias: nuevasGarantias }
        setDatos(nuevosDatos)
        notificarCambio(nuevosDatos)
      }
    }

    return (
      <div className="convertidor-json">
        <h3>Editor de Garantías</h3>
        
        <div className="garantias-seccion">
          <h4>Información General</h4>
          <div className="garantias-campo">
            <label className="garantias-label">Título:</label>
            <input
              type="text"
              value={datos.titulo}
              onChange={(e) => actualizarTitulo(e.target.value)}
              placeholder="Compra con Total Confianza"
              className="garantias-input"
            />
          </div>
          
          <div className="garantias-campo">
            <label className="garantias-label">Subtítulo:</label>
            <input
              type="text"
              value={datos.subtitulo}
              onChange={(e) => actualizarSubtitulo(e.target.value)}
              placeholder="Tu satisfacción y seguridad son nuestra prioridad #1"
              className="garantias-input"
            />
          </div>
        </div>

        <div className="garantias-seccion">
          <h4>Garantías</h4>
          {datos.garantias.map((garantia, index) => (
            <div key={garantia.id} className="garantias-item">
              <div className="garantias-item-header">
                <h5>Garantía {index + 1}</h5>
                {datos.garantias.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarGarantia(index)}
                    className="btn-eliminar-garantias"
                  >
                    ❌
                  </button>
                )}
              </div>
              
              <div className="garantias-fila">
                <div className="garantias-campo">
                  <label className="garantias-label">Icono:</label>
                  <input
                    type="text"
                    value={garantia.icono}
                    onChange={(e) => actualizarGarantia(index, 'icono', e.target.value)}
                    placeholder="🛡️"
                    className="garantias-input-small"
                  />
                </div>
                <div className="garantias-campo">
                  <label className="garantias-label">Título:</label>
                  <input
                    type="text"
                    value={garantia.titulo}
                    onChange={(e) => actualizarGarantia(index, 'titulo', e.target.value)}
                    placeholder="Garantía 2 Años"
                    className="garantias-input"
                  />
                </div>
              </div>
              
              <div className="garantias-campo">
                <label className="garantias-label">Descripción:</label>
                <textarea
                  value={garantia.descripcion}
                  onChange={(e) => actualizarGarantia(index, 'descripcion', e.target.value)}
                  placeholder="Si no funciona como prometemos, te devolvemos el 100% de tu dinero"
                  className="garantias-textarea"
                  rows="3"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={agregarGarantia}
            className="btn-agregar-garantias"
          >
            ➕ Agregar Garantía
          </button>
        </div>

        <div className="preview-garantias">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <h3>{datos.titulo}</h3>
            <p>{datos.subtitulo}</p>
            
            <div className="preview-garantias-lista">
              {datos.garantias.filter(garantia => garantia.titulo && garantia.titulo.trim() && garantia.descripcion && garantia.descripcion.trim()).map((garantia, index) => (
                <div key={`garantia-preview-${garantia.id || index}`} className="preview-garantias-item">
                  <div className="preview-garantias-header">
                    <span className="preview-garantias-icono">{garantia.icono}</span>
                    <span className="preview-garantias-titulo">{garantia.titulo}</span>
                  </div>
                  <div className="preview-garantias-descripcion">
                    {garantia.descripcion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar editor de CTA Final
  if (tipo === 'cta_final') {
    const actualizarCampo = (campo, valor) => {
      const nuevosDatos = { ...datos, [campo]: valor }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }

    const formatearPrecio = (precio) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(precio)
    }

    return (
      <div className="convertidor-json">
        <h3>Editor de CTA Final</h3>
        
        <div className="cta-final-seccion">
          <h4>Información Principal</h4>
          <div className="cta-final-campo">
            <label className="cta-final-label">Título:</label>
            <input
              type="text"
              value={datos.titulo}
              onChange={(e) => actualizarCampo('titulo', e.target.value)}
              placeholder="¡ÚLTIMA OPORTUNIDAD!"
              className="cta-final-input"
            />
          </div>
          
          <div className="cta-final-campo">
            <label className="cta-final-label">Subtítulo:</label>
            <textarea
              value={datos.subtitulo}
              onChange={(e) => actualizarCampo('subtitulo', e.target.value)}
              placeholder="No dejes pasar esta oferta única. Miles ya han transformado su negocio..."
              className="cta-final-textarea"
              rows="3"
            />
          </div>
          
          <div className="cta-final-campo">
            <label className="cta-final-label">Texto del botón:</label>
            <input
              type="text"
              value={datos.botonTexto}
              onChange={(e) => actualizarCampo('botonTexto', e.target.value)}
              placeholder="¡QUIERO MI TRANSFORMACIÓN AHORA!"
              className="cta-final-input"
            />
          </div>
        </div>

        <div className="cta-final-seccion">
          <h4>Elementos de Urgencia</h4>
          <div className="cta-final-campo">
            <label className="cta-final-label">Urgencia:</label>
            <input
              type="text"
              value={datos.urgencia}
              onChange={(e) => actualizarCampo('urgencia', e.target.value)}
              placeholder="⚡ Oferta válida solo por hoy"
              className="cta-final-input"
            />
          </div>
          
          <div className="cta-final-campo">
            <label className="cta-final-label">Descuento:</label>
            <input
              type="text"
              value={datos.descuento}
              onChange={(e) => actualizarCampo('descuento', e.target.value)}
              placeholder="70% OFF"
              className="cta-final-input"
            />
          </div>
        </div>

        <div className="cta-final-seccion">
          <h4>Garantías y Envío</h4>
          <div className="cta-final-campo">
            <label className="cta-final-label">Envío:</label>
            <input
              type="text"
              value={datos.envio}
              onChange={(e) => actualizarCampo('envio', e.target.value)}
              placeholder="🚚 Envío GRATIS en 24-48 horas"
              className="cta-final-input"
            />
          </div>
          
          <div className="cta-final-campo">
            <label className="cta-final-label">Garantía:</label>
            <input
              type="text"
              value={datos.garantia}
              onChange={(e) => actualizarCampo('garantia', e.target.value)}
              placeholder="🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero"
              className="cta-final-input"
            />
          </div>
        </div>

        <div className="cta-final-seccion">
          <h4>Precios</h4>
          <div className="cta-final-fila">
            <div className="cta-final-campo">
              <label className="cta-final-label">Precio Actual:</label>
              <input
                type="number"
                value={datos.precioActual}
                onChange={(e) => actualizarCampo('precioActual', e.target.value)}
                placeholder="4950325"
                className="cta-final-input"
              />
            </div>
            <div className="cta-final-campo">
              <label className="cta-final-label">Precio Anterior:</label>
              <input
                type="number"
                value={datos.precioAnterior}
                onChange={(e) => actualizarCampo('precioAnterior', e.target.value)}
                placeholder="16501083"
                className="cta-final-input"
              />
            </div>
          </div>
        </div>

        <div className="preview-cta-final">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <div className="preview-cta-final-container">
              <div className="preview-cta-final-urgencia">{datos.urgencia}</div>
              <div className="preview-cta-final-descuento">{datos.descuento}</div>
              <h3 className="preview-cta-final-titulo">{datos.titulo}</h3>
              <p className="preview-cta-final-subtitulo">{datos.subtitulo}</p>
              
              <div className="preview-cta-final-precios">
                <span className="preview-precio-anterior">{formatearPrecio(datos.precioAnterior)}</span>
                <span className="preview-precio-actual">{formatearPrecio(datos.precioActual)}</span>
              </div>
              
              <button className="preview-cta-final-boton">
                {datos.botonTexto}
              </button>
              
              <div className="preview-cta-final-garantias">
                <div className="preview-garantia-item">{datos.envio}</div>
                <div className="preview-garantia-item">{datos.garantia}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== FUNCIONES PROMOCIONES =====
  const actualizarTituloPromociones = (nuevoTitulo) => {
    const nuevosDatos = { ...datos, titulo: nuevoTitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarSubtituloPromociones = (nuevoSubtitulo) => {
    const nuevosDatos = { ...datos, subtitulo: nuevoSubtitulo }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const actualizarPromocion = (index, campo, valor) => {
    const nuevasPromociones = [...datos.promociones]
    nuevasPromociones[index] = { ...nuevasPromociones[index], [campo]: valor }
    const nuevosDatos = { ...datos, promociones: nuevasPromociones }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const agregarPromocion = () => {
    const nuevasPromociones = [...datos.promociones, crearPromocionVacia()]
    const nuevosDatos = { ...datos, promociones: nuevasPromociones }
    setDatos(nuevosDatos)
    notificarCambio(nuevosDatos)
  }

  const eliminarPromocion = (index) => {
    if (datos.promociones.length > 1) {
      const nuevasPromociones = datos.promociones.filter((_, i) => i !== index)
      const nuevosDatos = { ...datos, promociones: nuevasPromociones }
      setDatos(nuevosDatos)
      notificarCambio(nuevosDatos)
    }
  }

  // Renderizar editor de promociones
  if (tipo === 'promociones') {
    return (
      <div className="convertidor-json">
        <h3>Editor de Promociones por Cantidad</h3>
        
        <div className="promociones-seccion">
          <h4>Información General</h4>
          <div className="promociones-campo">
            <label className="promociones-label">Título:</label>
            <input
              type="text"
              value={datos.titulo}
              onChange={(e) => actualizarTituloPromociones(e.target.value)}
              placeholder="Promociones por Cantidad"
              className="promociones-input"
            />
          </div>
          
          <div className="promociones-campo">
            <label className="promociones-label">Subtítulo:</label>
            <input
              type="text"
              value={datos.subtitulo}
              onChange={(e) => actualizarSubtituloPromociones(e.target.value)}
              placeholder="Configura descuentos automáticos por cantidad de productos"
              className="promociones-input"
            />
          </div>
        </div>

        <div className="promociones-seccion">
          <h4>Promociones</h4>
          {datos.promociones.map((promocion, index) => (
            <div key={promocion.id} className="promociones-item">
              <div className="promociones-item-header">
                <span className="promociones-numero">Promoción #{index + 1}</span>
                {datos.promociones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarPromocion(index)}
                    className="btn-eliminar-promociones"
                  >
                    ❌
                  </button>
                )}
              </div>
              
              <div className="promociones-campos">
                <div className="promociones-campo">
                  <label className="promociones-label">Cantidad Mínima:</label>
                  <input
                    type="number"
                    min="2"
                    value={promocion.cantidadMinima}
                    onChange={(e) => actualizarPromocion(index, 'cantidadMinima', parseInt(e.target.value))}
                    placeholder="2"
                    className="promociones-input-small"
                  />
                </div>
                <div className="promociones-campo">
                  <label className="promociones-label">Descuento (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={promocion.descuentoPorcentaje}
                    onChange={(e) => actualizarPromocion(index, 'descuentoPorcentaje', parseInt(e.target.value))}
                    placeholder="10"
                    className="promociones-input-small"
                  />
                </div>
              </div>
              
              <div className="promociones-campo">
                <label className="promociones-label">Descripción:</label>
                <input
                  type="text"
                  value={promocion.descripcion}
                  onChange={(e) => actualizarPromocion(index, 'descripcion', e.target.value)}
                  placeholder="Descuento por compra múltiple"
                  className="promociones-input"
                />
              </div>
              
              <div className="promociones-campo">
                <label className="promociones-checkbox">
                  <input
                    type="checkbox"
                    checked={promocion.activa}
                    onChange={(e) => actualizarPromocion(index, 'activa', e.target.checked)}
                  />
                  Promoción activa
                </label>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={agregarPromocion}
          className="btn-agregar-promociones"
        >
          ➕ Agregar Promoción
        </button>
        
        <div className="preview-promociones">
          <strong>Vista previa:</strong>
          <div style={{ marginTop: '8px' }}>
            <h3>{datos.titulo}</h3>
            <p>{datos.subtitulo}</p>
            
            <div className="preview-promociones-lista">
              {datos.promociones.filter(promocion => promocion.activa && promocion.cantidadMinima >= 2).map((promocion, index) => (
                <div key={`promocion-preview-${promocion.id || index}`} className="preview-promociones-item">
                  <div className="preview-promociones-cantidad">
                    Compra {promocion.cantidadMinima}+ unidades
                  </div>
                  <div className="preview-promociones-descuento">
                    {promocion.descuentoPorcentaje}% OFF
                  </div>
                  <div className="preview-promociones-descripcion">
                    {promocion.descripcion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <div>Tipo de sección no soportado: {tipo}</div>
}

export default ConvertidorAJson