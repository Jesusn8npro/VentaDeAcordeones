// Datos del mega menú del header. Todo ítem lleva un href real.
// Accesorios/instrumentos/audio apuntan a sus landings SEO (/<base>/<cluster>), ver src/datos/clusters.ts.
// Las tonalidades usan ?q= porque es el query param que lee la tienda (leerFiltrosDeURL en filtrosTienda.ts).

export interface ItemMega { label: string; href: string }
export interface ColumnaMega { title: string; items: ItemMega[] }
export interface FeatureMega { title: string; price: string; tag: string; image: string; alt: string; href: string }
export interface Mega { columns: ColumnaMega[]; feature: FeatureMega; ctaLabel: string; ctaHref: string }
export interface Cat {
  id: string
  label: string
  icon: string
  badge: 'HOT' | 'NEW' | 'SEO' | null
  href: string
  mega: Mega
}

const PERSONALIZADOS = '/acordeones-personalizados'
const TALLER = '/taller'

export const CATS: Cat[] = [
  { id:'acordeones', label:'Acordeones', icon:'Accordion', badge:'HOT', href:'/tienda/categoria/acordeones-rey-vallenato',
    mega: {
      columns: [
        { title:'Por línea', items:[
          { label:'Rey Vallenato',              href:'/tienda/categoria/acordeones-rey-vallenato' },
          { label:'Hohner Corona III / Premium', href:'/tienda/categoria/acordeones-hohner-premium' },
          { label:'Personalizados',             href:'/tienda/categoria/acordeones-hohner-personalizados' },
          { label:'Para niños',                 href:'/tienda/categoria/acordeones-para-ninos' },
          { label:'Nuevos',                     href:'/tienda/categoria/acordeones-nuevos' },
        ] },
        // Solo GCF y ADG llevan a la tienda: son las que hay en catálogo. FBbEb y Do/Fa/Sib
        // se hacen por encargo y su búsqueda devolvía CERO productos, así que el menú
        // mandaba a una página vacía. Ahora llevan a la guía, que explica cada tonalidad y
        // remata en WhatsApp para encargarla.
        { title:'Tonalidades', items:[
          { label:'GCF · 5 letras · de fábrica',   href:'/tienda?q=GCF' },
          { label:'ADG · de fábrica',   href:'/tienda?q=ADG' },
          { label:'FBbEb · por encargo', href:'/guia-tonalidades#fbbeb' },
          { label:'Do/Fa/Sib · por encargo',         href:'/guia-tonalidades#cfbb' },
          { label:'¿Cuál me conviene? · Guía', href:'/guia-tonalidades' },
        ] },
        { title:'Servicios', items:[
          { label:'Personalizar mi acordeón', href: PERSONALIZADOS },
          { label:'Taller y reparación',      href: TALLER },
          { label:'Blog',                     href:'/blog' },
          { label:'Testimonios',              href:'/testimonios' },
        ] },
      ],
      feature: {
        title:'Hohner Rey Vallenato', price:'desde $4.890.000', tag:'El más vendido',
        image:'/images/hero/rey-vallenato-negro.webp', alt:'Acordeón Hohner Rey Vallenato negro',
        href:'/tienda/categoria/acordeones-rey-vallenato',
      },
      ctaLabel:'Ver todos los acordeones', ctaHref:'/tienda',
    },
  },
  { id:'personalizados', label:'Personalizados', icon:'Sparkle', badge:'NEW', href: PERSONALIZADOS,
    mega: {
      columns: [
        { title:'Acabados', items:[
          { label:'Nácar (Mother of Pearl)', href:`${PERSONALIZADOS}#galeria` },
          { label:'Madera natural',          href:`${PERSONALIZADOS}#galeria` },
          { label:'Negro mate',              href:`${PERSONALIZADOS}#galeria` },
          { label:'Cromado y bicolor',       href:`${PERSONALIZADOS}#galeria` },
        ] },
        { title:'Grabados', items:[
          { label:'Iniciales y nombres', href: PERSONALIZADOS },
          { label:'Bandera y escudo',    href: PERSONALIZADOS },
          { label:'Diseño libre',        href: PERSONALIZADOS },
          { label:'Parrilla grabada',    href:'/accesorios/parrillas-de-acordeon' },
        ] },
        { title:'Servicios', items:[
          { label:'Diseño 3D previo',     href: PERSONALIZADOS },
          { label:'Galería de trabajos',  href:`${PERSONALIZADOS}#galeria` },
          { label:'Preguntas frecuentes', href:`${PERSONALIZADOS}#preguntas` },
        ] },
      ],
      feature: {
        title:'Acordeón personalizado', price:'desde $5.400.000', tag:'Hecho a la medida',
        image:'/images/personalizados/premium-nacar.webp', alt:'Acordeón personalizado con acabado nácar',
        href: PERSONALIZADOS,
      },
      ctaLabel:'Empezar mi diseño', ctaHref: PERSONALIZADOS,
    },
  },
  { id:'accesorios', label:'Accesorios', icon:'Box', badge:null, href:'/accesorios',
    mega: {
      columns: [
        { title:'Para tocar', items:[
          { label:'Correas de acordeón', href:'/accesorios/correas-de-acordeon' },
          { label:'Broches de acordeón', href:'/accesorios/broches-de-acordeon' },
        ] },
        { title:'Para proteger', items:[
          { label:'Estuches de acordeón', href:'/accesorios/estuches-de-acordeon' },
        ] },
        { title:'Repuestos', items:[
          { label:'Fuelles de acordeón',  href:'/accesorios/fuelles-de-acordeon' },
          { label:'Cinta para fuelles',   href:'/accesorios/fuelles-de-acordeon' },
          { label:'Parrillas de acordeón', href:'/accesorios/parrillas-de-acordeon' },
        ] },
      ],
      feature: {
        title:'Parrilla personalizada · corte láser', price:'$280.000', tag:'Top ventas',
        image:'/images/productos/parrillas-de-acordeon-personalizadas.webp', alt:'Parrilla de acordeón personalizada',
        href:'/accesorios/parrillas-de-acordeon',
      },
      ctaLabel:'Ver todos los accesorios', ctaHref:'/accesorios',
    },
  },
  { id:'audio', label:'Audio y Percusión', icon:'Speaker', badge:null, href:'/audio',
    mega: {
      columns: [
        { title:'Percusión', items:[
          { label:'Cajas vallenatas',       href:'/instrumentos/cajas-vallenatas' },
          { label:'Baterías',               href:'/instrumentos/baterias' },
          { label:'Todos los instrumentos', href:'/instrumentos' },
        ] },
        { title:'Audio', items:[
          { label:'Audífonos KZ',         href:'/audio/audifonos' },
          { label:'Micrófonos',           href:'/audio/microfonos' },
          { label:'Equipos de grabación', href:'/audio/equipos-de-grabacion' },
        ] },
        { title:'Amplificación', items:[
          { label:'Amplificadores', href:'/tienda/categoria/amplificadores' },
        ] },
      ],
      feature: {
        title:'Audífonos KZ', price:'desde $13.900', tag:'Monitoreo pro',
        image:'/images/clusters/audifonos.webp', alt:'Audífonos KZ in-ear',
        href:'/audio/audifonos',
      },
      ctaLabel:'Ver audio y percusión', ctaHref:'/audio',
    },
  },
  { id:'taller', label:'Taller', icon:'Tool', badge:null, href: TALLER,
    mega: {
      columns: [
        { title:'Servicios', items:[
          { label:'Afinación',        href:`${TALLER}#servicios` },
          { label:'Cambio de pitos',  href:`${TALLER}#servicios` },
          { label:'Cambio de fuelle', href:`${TALLER}#servicios` },
          { label:'Restauración',     href:`${TALLER}#servicios` },
        ] },
        { title:'Cómo funciona', items:[
          { label:'Proceso paso a paso', href:`${TALLER}#proceso` },
          { label:'Diagnóstico y cotización', href:`${TALLER}#proceso` },
        ] },
        { title:'Envíos', items:[
          { label:'Envía tu acordeón', href:`${TALLER}#envio` },
          { label:'Repuestos', href:'/accesorios/fuelles-de-acordeon' },
        ] },
      ],
      feature: {
        title:'Diagnóstico y cotización en minutos', price:'Sin costo', tag:'Maestro afinador',
        image:'/images/hero/rojo-xtreme.webp', alt:'Acordeón rojo en el taller',
        href: TALLER,
      },
      ctaLabel:'Ir al taller', ctaHref: TALLER,
    },
  },
]
