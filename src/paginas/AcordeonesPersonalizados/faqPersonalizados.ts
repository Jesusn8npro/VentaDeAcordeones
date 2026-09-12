// FAQ de /acordeones-personalizados. Módulo aparte (sin 'use client') para que el server component
// app/(sitio)/acordeones-personalizados/page.tsx pueda leer el array real y generar el JSON-LD FAQPage:
// si se importara desde el componente cliente, Next entregaría una referencia y no el array.

export const FAQ_PERSONALIZADOS: { p: string; r: string }[] = [
  { p: '¿Cuánto cuesta un acordeón personalizado?', r: 'Depende del acordeón base (Corona II, Corona III, Rey Vallenato) y del nivel de personalización. Te cotizamos en minutos por WhatsApp con el diseño exacto que quieres.' },
  { p: '¿Cuánto tarda?', r: 'Entre 6 y 8 semanas desde la aprobación del diseño. Los trabajos sencillos (parrilla + fuelle) pueden estar en 2 semanas.' },
  { p: '¿Puedo personalizar mi propio acordeón?', r: 'Sí. Recibimos tu acordeón en Bogotá (o por envío desde cualquier ciudad), lo transformamos y lo devolvemos afinado. Muchos clientes renuevan su Hohner de años.' },
  { p: '¿Envían fuera de Colombia?', r: 'Sí. Hemos entregado en Estados Unidos, México, Chile, Ecuador, Panamá, Canadá y España, con embalaje rígido y seguro de tránsito.' },
  { p: '¿Cómo se paga?', r: 'Abono para iniciar el trabajo y saldo contra entrega o antes del despacho. Pagos por PSE, Nequi, tarjeta o transferencia.' },
]
