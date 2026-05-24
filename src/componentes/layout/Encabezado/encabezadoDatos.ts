export const CATS = [
  { id:'acordeones', label:'Acordeones', icon:'Accordion', badge:'HOT' as const,
    mega: {
      columns: [
        { title:'Por marca', items:['Hohner','Corona III','Anacleto','Excelsior','Gabbanelli','Sonola'] },
        { title:'Por tonalidad', items:['Sol / Do / Fa','Mi / La / Re','Fa / Sib / Mib','Do / Fa / Sib','La / Re / Sol'] },
        { title:'Por estilo', items:['Vallenato','Norteño','Tex-Mex','Conjunto','Forró','Cumbia'] }
      ],
      feature: { title:'Hohner Corona III · Sol Do Fa', price:'$ 7.890.000', tag:'Recién llegado' },
      ctaLabel:'Ver todos los acordeones', ctaHref:'/tienda?categorias=acordeones'
    }
  },
  { id:'personalizados', label:'Personalizados', icon:'Sparkle', badge:'NEW' as const,
    mega: {
      columns: [
        { title:'Acabados', items:['Mother of Pearl','Madera natural','Negro mate','Cromado','Bicolor'] },
        { title:'Grabados', items:['Iniciales','Bandera','Escudo familiar','Diseño libre','Filete dorado'] },
        { title:'Servicios', items:['Diseño 3D previo','Ajuste de afinación','Cambio de fuelles'] }
      ],
      feature: { title:'Edición Maestro · Personalizado', price:'desde $ 11.200.000', tag:'Hecho a la medida' },
      ctaLabel:'Empezar mi diseño', ctaHref:'/acordeones-personalizados'
    }
  },
  { id:'accesorios', label:'Accesorios', icon:'Box', badge:null,
    mega: {
      columns: [
        { title:'Esenciales', items:['Correas','Estuches rígidos','Fundas blandas','Bandoleras de cuero'] },
        { title:'Audio', items:['Micrófonos internos','Pickups','Pre-amplificadores','Cables XLR'] },
        { title:'Mantenimiento', items:['Aceite para fuelles','Pulidor cromado','Kit de afinación'] }
      ],
      feature: { title:'Estuche rígido Pro · Negro', price:'$ 520.000', tag:'Top ventas' },
      ctaLabel:'Ver accesorios', ctaHref:'/tienda?categorias=accesorios'
    }
  },
  { id:'repuestos', label:'Repuestos', icon:'Cog', badge:null,
    mega: {
      columns: [
        { title:'Mecánica', items:['Voces','Fuelles','Teclas','Botones','Resortes'] },
        { title:'Estructura', items:['Tornillería','Esquinas','Goznes','Cinta de fuelle'] },
        { title:'Por marca', items:['Hohner OEM','Anacleto','Excelsior','Gabbanelli'] }
      ],
      feature: { title:'Juego de voces afinadas a mano', price:'$ 1.450.000', tag:'Italianas' },
      ctaLabel:'Ver repuestos', ctaHref:'/tienda?categorias=repuestos'
    }
  },
  { id:'taller', label:'Taller', icon:'Tool', badge:null,
    mega: {
      columns: [
        { title:'Servicios', items:['Afinación profesional','Cambio de fuelles','Restauración integral','Limpieza profunda'] },
        { title:'Diagnóstico', items:['Revisión gratuita','Cotización al instante','Recogida a domicilio'] },
        { title:'Garantía', items:['90 días en mano de obra','30 días en repuestos'] }
      ],
      feature: { title:'Afinación Premium · 4 voces', price:'$ 980.000', tag:'Maestro afinador' },
      ctaLabel:'Agendar mi cita', ctaHref:'/tienda?categorias=taller'
    }
  },
]

export type Cat = typeof CATS[number]
