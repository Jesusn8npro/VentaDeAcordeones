// Preguntas y respuestas de /preguntas-frecuentes. Viven aquí (y no dentro del componente) porque
// también alimentan el JSON-LD FAQPage que se renderiza en el servidor desde app/(sitio)/preguntas-frecuentes/page.tsx:
// si el texto se duplicara, el schema y lo que ve el usuario se desincronizarían y Google lo marcaría como contenido oculto.

export interface PreguntaFrecuente {
  categoria: string
  pregunta: string
  respuesta: string
  /** Icono lucide propio. Si falta se usa el de la categoría. */
  icono?: 'Trash2'
}

export const CATEGORIAS_FAQ = ['Compras', 'Pagos', 'Envíos', 'Devoluciones', 'Seguridad', 'Cuenta'] as const

export const PREGUNTAS_FAQ: PreguntaFrecuente[] = [
  { categoria: 'Compras', pregunta: '¿Cómo comprar en VentaDeAcordeones.com?', respuesta: 'Busca el instrumento, pulsa “Comprar ahora”, completa tus datos y elige tu método de pago. Te confirmamos por WhatsApp y correo con todos los detalles del pedido.' },
  { categoria: 'Compras', pregunta: '¿Qué productos venden?', respuesta: 'Acordeones diatónicos y cromáticos (Hohner, Rey Vallenato, Bravo, Corona), armónicas, guitarras, bajos, pianos, amplificadores, micrófonos y accesorios para músicos colombianos.' },
  { categoria: 'Compras', pregunta: '¿Los precios incluyen impuestos?', respuesta: 'Sí. Todos los precios incluyen IVA. Sin costos ocultos al pagar.' },
  { categoria: 'Compras', pregunta: '¿Puedo personalizar un acordeón?', respuesta: 'Sí. Diseñamos acordeones a tu gusto: elige colores de tapas, fuelles y parrillas. Paga solo el 30% de anticipo y el resto al recibir. Escríbenos por WhatsApp para más detalles.' },
  { categoria: 'Pagos', pregunta: '¿Qué métodos de pago aceptan?', respuesta: 'Tarjetas débito/crédito (Visa, Mastercard), transferencias bancarias, PSE y consignaciones. Procesamos los pagos de forma segura con ePayco.' },
  { categoria: 'Pagos', pregunta: '¿Es seguro pagar con tarjeta?', respuesta: 'Sí. Usamos ePayco con encriptación de nivel bancario. Nunca almacenamos datos de tarjetas en nuestros servidores.' },
  { categoria: 'Pagos', pregunta: '¿Puedo pagar en cuotas?', respuesta: 'Sí, con tarjetas de crédito puedes diferir el pago según las opciones de tu banco. Consúltanos también por convenios de financiación.' },
  { categoria: 'Envíos', pregunta: '¿Cuánto tarda el envío?', respuesta: 'Despachamos con SERVIENTREGA. Bogotá y ciudades principales: 1–2 días hábiles. Otras ciudades y municipios: 2–5 días hábiles. Recibes número de guía para rastrear.' },
  { categoria: 'Envíos', pregunta: '¿Cuánto cuesta el envío?', respuesta: 'El costo depende del destino y el peso del instrumento. Los acordeones tienen empaque especial reforzado. Consúltanos por WhatsApp para cotizar tu envío específico.' },
  { categoria: 'Envíos', pregunta: '¿Cómo empacan los acordeones?', respuesta: 'Con protección especial: espuma de alta densidad, plástico burbuja y caja reforzada. Garantizamos que tu instrumento llegue en perfectas condiciones.' },
  { categoria: 'Devoluciones', pregunta: '¿Cómo pedir una devolución?', respuesta: 'Escríbenos por WhatsApp al +57 314 486 5310 dentro de los 15 días de recibido. Verificamos el estado, coordinamos la devolución y procesamos el reembolso en 5–10 días hábiles.' },
  { categoria: 'Devoluciones', pregunta: '¿Qué garantía tienen los acordeones?', respuesta: '6 meses de garantía en acordeones nuevos contra defectos de fábrica. No aplica para daños por mal uso, caídas o humedad. Respaldamos cada instrumento que vendemos.' },
  { categoria: 'Devoluciones', pregunta: '¿Cuánto tarda el reembolso?', respuesta: 'Tras recibir y verificar el producto, procesamos en 5–10 días hábiles. El abono en tu cuenta puede tomar 1–2 días adicionales del banco.' },
  { categoria: 'Seguridad', pregunta: '¿Es seguro comprar aquí?', respuesta: 'Sí. Llevamos más de 10 años vendiendo acordeones en Colombia. Cientos de clientes satisfechos, pagos seguros con ePayco y respaldo post-venta real por WhatsApp.' },
  { categoria: 'Seguridad', pregunta: '¿Los instrumentos son originales?', respuesta: 'Sí. Todos nuestros acordeones Hohner son originales con número de serie verificable. Trabajamos directamente con distribuidores autorizados.' },
  { categoria: 'Cuenta', pregunta: '¿Cómo creo una cuenta?', respuesta: 'Pulsa “Registrarse”, completa tu nombre, correo y contraseña. También puedes comprar sin cuenta como invitado.' },
  { categoria: 'Cuenta', pregunta: '¿Puedo ver el historial de mis pedidos?', respuesta: 'Sí, desde tu perfil en la sección “Mis Pedidos” puedes ver el estado de todos tus pedidos y el tracking del envío.' },
  { categoria: 'Cuenta', pregunta: '¿Cómo borro mi cuenta?', respuesta: 'Solicítalo por WhatsApp o correo a acordeon91@gmail.com. Eliminamos tus datos en máximo 30 días según la ley 1581 de 2012.', icono: 'Trash2' },
]
