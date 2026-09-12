// Clusters de accesorios: una landing SEO por familia de producto (/accesorios/<slug>).
// Cada cluster define copy, palabras para filtrar productos de Supabase por nombre, FAQ (FAQPage
// schema) y enlaces cruzados. Las imágenes son recortes transparentes generados con
// scripts/procesar-imagenes-productos.mjs (public/images/productos/<slug>.webp).

export type BaseCluster = 'accesorios' | 'instrumentos' | 'audio' | 'acordeones'

export const BASES: Record<BaseCluster, { nombre: string; titulo: string; descripcion: string; h1: [string, string]; intro: string; wa: string }> = {
  acordeones: {
    nombre: 'Acordeones',
    titulo: 'Acordeones Hohner en Colombia: Rey Vallenato, Corona y Personalizados',
    descripcion: 'Acordeones Hohner nuevos con garantia: Rey Vallenato desde $3.610.000, Corona II y III, Bravo y personalizados con diapason nacarado. Taller propio en Bogota, envio a toda Colombia.',
    h1: ['Acordeones Hohner', 'afinados antes de salir del taller'],
    intro: 'Rey Vallenato, Corona II, Corona III, Bravo, Compadre y personalizados con diapason nacarado, botones a juego, fuelle y parrilla a medida. Todos nuevos, revisados botton por boton y afinados aqui en Bogota antes de despachar. Te asesoramos por WhatsApp para acertar con la tonalidad.',
    wa: 'Hola, quiero asesoria para elegir un acordeon',
  },
  accesorios: {
    nombre: 'Accesorios',
    titulo: 'Accesorios para Acordeón: Parrillas, Fuelles y Correas',
    descripcion: 'Accesorios y repuestos para acordeón Hohner Corona, Rey Vallenato y Compadre: parrillas, fuelles, correas, estuches y broches. Originales y personalizados. Envío a toda Colombia.',
    h1: ['Todo lo que tu acordeón', 'necesita para sonar y lucir'],
    intro: 'Parrillas, fuelles, correas, estuches y broches para Hohner Corona II, Corona III, Rey Vallenato y Compadre. Originales, económicos y personalizados con tu nombre, fabricados o instalados en nuestro taller de Bogotá.',
    wa: 'Hola, busco accesorios para mi acordeón',
  },
  instrumentos: {
    nombre: 'Instrumentos',
    titulo: 'Cajas Vallenatas, Baterías y Percusión en Bogotá',
    descripcion: 'Cajas vallenatas profesionales y económicas Miche, estuches, baterías MPRO y Ludwig y percusión para tu conjunto. Tienda en Bogotá, envío a toda Colombia y el mundo.',
    h1: ['El conjunto completo', 'caja, guacharaca y batería'],
    intro: 'Cajas vallenatas profesionales (la línea de los cajeros de Silvestre, Peter Manjarrés y Elder Dayán), cajas económicas Miche, estuches, baterías junior y profesionales y percusión menor. Tienda en Bogotá con precio de mayorista y envío asegurado a Colombia y al mundo.',
    wa: 'Hola, busco instrumentos de percusión',
  },
  audio: {
    nombre: 'Audio y grabación',
    titulo: 'Equipos de Grabación, Micrófonos y Audífonos para Músicos',
    descripcion: 'Interfaces de audio, monitores, mezcladores, micrófonos Shure y Takstar y audífonos KZ para grabar y monitorear tu acordeón y tu voz. Distribuidor autorizado en Colombia.',
    h1: ['Graba y suena', 'como en el disco'],
    intro: 'Todo para tu home studio y tu tarima: interfaces de audio, monitores de estudio, mezcladores, micrófonos alámbricos e inalámbricos y audífonos in-ear KZ. Te armamos el combo según tu presupuesto.',
    wa: 'Hola, quiero armar mi equipo de grabación',
  },
}

export interface Cluster {
  slug: string
  base: BaseCluster        // ruta: /<base>/<slug>
  categoriaSlug?: string   // si existe, los productos se filtran por categoría (no por palabras)
  nombre: string           // nombre corto (menú, breadcrumbs)
  h1: [string, string]     // [línea normal, línea en oro]
  titulo: string           // <title>
  descripcion: string      // meta description (≤160)
  eyebrow: string
  intro: string            // párrafo del hero
  imagen: string           // recorte transparente
  icono: string            // nombre en <Icono>
  palabras: string[]       // nombre ILIKE %palabra%
  chips: string[]
  beneficios: { titulo: string; texto: string }[]
  guia: { titulo: string; parrafos: string[]; lista?: string[] }
  faq: { p: string; r: string }[]
  waTexto: string
}

export const NUMERO_WA = '573144865310'
export const SITIO = 'https://ventadeacordeones.com'

export const CLUSTERS: Cluster[] = [
  {
    slug: 'rey-vallenato',
    base: 'acordeones',
    categoriaSlug: 'acordeones-rey-vallenato',
    nombre: 'Rey Vallenato',
    h1: ['Acordeón Hohner Rey Vallenato', 'el que usan los que ya tocan'],
    titulo: 'Acordeón Hohner Rey Vallenato: Precio y Tonalidades en Colombia',
    descripcion:
      'Acordeón Hohner Rey Vallenato nuevo desde $3.610.000 en ADG y BEsAs, negro, rojo y naranja. Afinado en nuestro taller de Bogotá antes de despachar. Envío a toda Colombia.',
    eyebrow: 'Acordeones · Rey Vallenato',
    intro:
      'Es el punto de entrada real al acordeón vallenato: tres hileras, 31 teclas, 12 bajos y el sonido con el que se graba y se toca en tarima. No es un acordeón «de principiante» con el que te quedas corto en un año: es el que usan músicos que ya tocan en grupo. Disponible en ADG y BEsAs.',
    imagen: '/images/hero/rey-vallenato-negro.webp',
    icono: 'cat-acordeon',
    palabras: ['rey vallenato'],
    chips: ['Desde $3.610.000', 'ADG y BEsAs', 'Afinado antes de enviar', 'Garantía incluida'],
    beneficios: [
      { titulo: 'Afinado aquí, no de caja', texto: 'Llega de Alemania y se mueve con el viaje y el clima. Lo revisamos botón por botón y lo afinamos en Bogotá antes de despacharlo.' },
      { titulo: 'La tonalidad correcta', texto: 'ADG para vallenato tradicional, BEsAs para acordeoneros modernos y para acompañar voces. Te ayudamos a elegir según con quién tocas.' },
      { titulo: 'Taller propio', texto: 'Si algo pasa, no te mandamos a otro lado: el mismo taller que lo afinó te lo atiende.' },
      { titulo: 'Envío asegurado', texto: '48 a 72 horas hábiles a ciudades principales, en su estuche y protegido para el transporte.' },
    ],
    guia: {
      titulo: 'ADG o BEsAs: cómo decidir',
      parrafos: [
        'Un acordeón diatónico trae tres tonalidades fijas, y eso define con quién vas a poder tocar. La regla práctica es simple: pregunta en qué tonalidad andan los músicos con los que vas a tocar y compra esa. Si vas a tocar solo y no sabes, ADG es la apuesta segura del vallenato colombiano.',
        'BEsAs (SiMibLab) se ha vuelto muy común entre acordeoneros modernos y funciona mejor para acompañar voces femeninas. Si dudas, escríbenos: preguntamos qué tocas, tu nivel y tu grupo, y te decimos cuál pedir.',
      ],
      lista: ['ADG: vallenato tradicional y parrandas', 'BEsAs: estilo moderno y voces agudas', 'Colores: negro, rojo y naranja', 'Suma el estuche desde el primer día'],
    },
    faq: [
      { p: '¿Cuánto cuesta un Hohner Rey Vallenato?', r: 'Hoy está en $3.610.000 nuevo, con garantía y afinado antes de despachar. El precio final siempre se ve en la ficha del producto.' },
      { p: '¿Sirve para empezar desde cero?', r: 'Sí, y es lo que recomendamos. Comprar algo más barato de marca desconocida suele terminar en frustración: se desafinan solos y los botones se traban.' },
      { p: '¿Qué tonalidad me conviene?', r: 'ADG si tocas vallenato tradicional o no sabes todavía. BEsAs si tocas estilo moderno o acompañas voces agudas. Pregunta a tu grupo en cuál andan.' },
      { p: '¿Viene con estuche?', r: 'Consúltanos por el modelo exacto. Si no lo incluye, tenemos estuches desde $180.000 y te lo mandamos en el mismo envío.' },
    ],
    waTexto: 'Hola, quiero un acordeón Hohner Rey Vallenato',
  },
  {
    slug: 'hohner-premium',
    base: 'acordeones',
    categoriaSlug: 'acordeones-hohner-premium',
    nombre: 'Hohner Premium',
    h1: ['Hohner Corona, Bravo y Compadre', 'la gama alta de la marca'],
    titulo: 'Acordeón Hohner Corona II, Corona III y Bravo: Precios en Colombia',
    descripcion:
      'Acordeones Hohner Corona II desde $2.850.000, Corona III desde $5.590.000, Bravo II y III y Compadre. Nuevos, con garantía y afinados en Bogotá. Envío a toda Colombia.',
    eyebrow: 'Acordeones · Gama Premium',
    intro:
      'Corona II, Corona III, Bravo II y III, Compadre y Arrieta. Son los acordeones con los que se graba disco y se hace gira: más registros, mejor respuesta del fuelle y acabados que aguantan años de tarima. Todos nuevos, con garantía y afinados aquí antes de salir.',
    imagen: '/images/hero/rojo-xtreme.webp',
    icono: 'cat-acordeon',
    palabras: ['corona', 'bravo', 'compadre'],
    chips: ['Corona II y III', 'Bravo 48 y 72 bajos', 'Compadre ADG', 'Garantía y taller propio'],
    beneficios: [
      { titulo: 'Más registros', texto: 'La Corona III y los Bravo suman registros que abren el sonido: sirven para grabar y para tocar géneros distintos sin cambiar de instrumento.' },
      { titulo: 'Fuelle que responde', texto: 'La gama alta pide menos fuerza para el mismo volumen. Se nota en presentaciones largas.' },
      { titulo: 'Revisión antes de enviar', texto: 'Botón por botón, abriendo y cerrando, y afinación si hace falta. Registro fotográfico de cómo sale.' },
      { titulo: 'Repuestos a la mano', texto: 'Parrillas, fuelles, correas y estuches originales del mismo taller si algún día hacen falta.' },
    ],
    guia: {
      titulo: 'Corona II, Corona III o Bravo',
      parrafos: [
        'La Corona II ($2.850.000) es la puerta de entrada a la familia Corona: el sonido Hohner clásico a un precio contenido. La Corona III (desde $5.590.000) suma registros y cuerpo, y es la que se busca para grabar.',
        'Los Bravo (48 y 72 bajos) van por otro camino: más bajos y más posibilidades armónicas, pensados para quien acompaña o toca más allá del vallenato. El Compadre ADG ($3.634.900) queda en medio, con muy buena relación entre precio y respuesta.',
      ],
      lista: ['Corona II: entrada a la familia Corona', 'Corona III: para grabar y para tarima', 'Bravo: más bajos, más armonía', 'Compadre: equilibrio precio-respuesta'],
    },
    faq: [
      { p: '¿Cuál es la diferencia entre Corona II y Corona III?', r: 'La III trae más registros y más cuerpo de sonido. Si vas a grabar o tocas varios géneros, la III lo justifica. Si arrancas en vallenato, la II cumple de sobra.' },
      { p: '¿Qué significa 48 o 72 bajos?', r: 'Es cuántos botones tiene la mano izquierda. Más bajos dan más acordes disponibles; hacen falta si acompañas o tocas fuera del vallenato tradicional.' },
      { p: '¿Son nuevos?', r: 'Todos los acordeones de la tienda son nuevos, con garantía y afinados en nuestro taller de Bogotá antes de despachar.' },
      { p: '¿Puedo pagarlo si cuesta más de 5 millones?', r: 'Sí. La pasarela tiene un tope de $5.000.000 por transacción, así que esos se cierran por WhatsApp con el pedido ya registrado. Mira las formas de pago en el blog.' },
    ],
    waTexto: 'Hola, quiero un acordeón Hohner Corona o Bravo',
  },
  {
    slug: 'personalizados',
    base: 'acordeones',
    categoriaSlug: 'acordeones-hohner-personalizados',
    nombre: 'Personalizados',
    h1: ['Acordeones personalizados', 'que no se parecen a ningún otro'],
    titulo: 'Acordeón Hohner Personalizado: Nacarado, Fuelle y Parrilla a Medida',
    descripcion:
      'Acordeones Hohner personalizados desde $5.290.000: diapasón nacarado, botones a juego, fuelle con tu nombre y parrilla tallada. Hechos en nuestro taller de Bogotá.',
    eyebrow: 'Acordeones · Personalizados',
    intro:
      'Un Hohner de fábrica desarmado pieza por pieza y armado con diapasón nacarado, botones a juego, fuelle en tus colores o con tu nombre y parrilla tallada a medida. Lo que suena no se toca: lengüetas, cera y mecánica quedan intactas. Lo que cambia es todo lo que se ve.',
    imagen: '/images/personalizados/premium-nacar.webp',
    icono: 'cat-acordeon',
    palabras: ['personalizado', 'nácar', 'xtreme', 'tricolor'],
    chips: ['Desde $5.290.000', 'Diapasón nacarado', 'Fuelle con tu nombre', 'Parrilla tallada'],
    beneficios: [
      { titulo: 'El sonido no se toca', texto: 'Se cambian diapasón, botones, fuelle y parrilla. Lengüetas, cera y mecánica siguen siendo las de fábrica.' },
      { titulo: 'Tu nombre o tu escudo', texto: 'Bordado en el fuelle, tallado en la parrilla o pintado. Iniciales, nombre del grupo, una corona o una imagen religiosa.' },
      { titulo: 'Fotos del avance', texto: 'Te mandamos cómo va mientras se arma, para que no compres a ciegas algo que se fabrica para ti.' },
      { titulo: 'Fecha cerrada', texto: 'Antes de que pagues nada te damos una fecha concreta de entrega, no un «más o menos».' },
    ],
    guia: {
      titulo: 'Entre más elementos, más cambia',
      parrafos: [
        'Puedes personalizar cuatro cosas: diapasón nacarado (el frente, lo que más se nota en tarima y en video), botones a juego o en contraste, fuelle en colores o con bordado, y parrilla tallada con tu diseño. Con los cuatro, el instrumento no se parece a ninguno.',
        'Si ya tienes tu acordeón, también se hace pieza por pieza: parrillas desde $280.000, fuelles desde $350.000 y correas bordadas desde $180.000. Repartes el gasto y conservas el instrumento al que ya te acostumbraste.',
      ],
      lista: ['Diapasón nacarado en el color que elijas', 'Botones a juego o en contraste', 'Fuelle con tu nombre o tricolor', 'Parrilla tallada a medida'],
    },
    faq: [
      { p: '¿Cuánto cuesta un acordeón personalizado?', r: 'Los que tenemos listos van de $5.290.000 a $6.500.000 según cuántos elementos lleven y qué tan elaborada sea la parrilla.' },
      { p: '¿Cambia el sonido al personalizarlo?', r: 'No. Se reemplazan piezas exteriores; lengüetas, cera y mecánica quedan como salieron de fábrica.' },
      { p: '¿Puedo personalizar el acordeón que ya tengo?', r: 'Sí, pieza por pieza. Parrillas desde $280.000, fuelles desde $350.000, correas bordadas desde $180.000.' },
      { p: '¿Cuánto tarda?', r: 'Un fuelle o parrilla estándar, días. Un diseño tallado a medida con bordado toma más, porque las piezas se fabrican para ti. Te damos fecha concreta antes de cobrar.' },
    ],
    waTexto: 'Hola, quiero un acordeón personalizado',
  },
  {
    slug: 'amplificadores',
    base: 'audio',
    categoriaSlug: 'amplificadores',
    nombre: 'Amplificadores',
    h1: ['Amplificadores', 'para ensayo, tarima y estudio'],
    titulo: 'Amplificadores Fender para Bajo y Guitarra en Colombia',
    descripcion:
      'Amplificadores Fender desde $439.000 para ensayo, tarima y estudio. Distribuidor en Bogotá con envío a toda Colombia y asesoría para elegir la potencia.',
    eyebrow: 'Audio · Amplificadores',
    intro:
      'De los combos de ensayo a los que aguantan tarima. Te ayudamos a no pagar de más ni quedarte corto: la potencia que necesitas depende de dónde vas a tocar, no de cuánto quieras gastar.',
    imagen: '/images/clusters/grabacion.webp',
    icono: 'cat-audio',
    palabras: ['amplificador', 'rumble', 'champion'],
    chips: ['Desde $439.000', 'Ensayo y tarima', 'Fender', 'Envío a toda Colombia'],
    beneficios: [
      { titulo: 'La potencia justa', texto: 'Un combo de ensayo no sirve en tarima y uno de tarima es un desperdicio en casa. Te decimos cuál según dónde tocas.' },
      { titulo: 'Marca con respaldo', texto: 'Fender: repuestos y servicio disponibles, no una marca que desaparece al año.' },
      { titulo: 'Combo con lo demás', texto: 'Si también necesitas micrófono, cables o monitores, te armamos el paquete con mejor precio.' },
      { titulo: 'Envío asegurado', texto: 'Embalado para transporte y con seguimiento, a toda Colombia.' },
    ],
    guia: {
      titulo: 'Cuánta potencia necesitas',
      parrafos: [
        'Para practicar en casa o ensayar en un cuarto, entre 15 y 40 vatios sobra. Para ensayar con batería acústica ya hacen falta 40 a 100. Para tarima sin refuerzo de PA, de 100 para arriba.',
        'Ojo con el bajo: pide bastante más potencia que la guitarra para el mismo volumen percibido. Un amplificador de guitarra de 40 vatios y uno de bajo de 40 no se oyen igual.',
      ],
      lista: ['Casa y práctica: 15-40 vatios', 'Ensayo con batería: 40-100', 'Tarima: 100 o más', 'El bajo pide más potencia que la guitarra'],
    },
    faq: [
      { p: '¿Cuál me sirve para ensayar con batería?', r: 'A partir de 40 vatios para guitarra. Si es bajo, apunta a 100 o más: el bajo necesita más potencia para el mismo volumen percibido.' },
      { p: '¿Sirve para amplificar mi acordeón?', r: 'Para acordeón conviene más un sistema de PA o un monitor activo que un combo de guitarra. Escríbenos y te decimos qué combinación usar.' },
      { p: '¿Tienen garantía?', r: 'Sí, garantía del fabricante y respaldo nuestro. Consúltanos por el modelo exacto.' },
      { p: '¿Hacen envíos?', r: 'A toda Colombia, embalado para transporte y con seguimiento.' },
    ],
    waTexto: 'Hola, busco un amplificador',
  },
  {
    slug: 'parrillas-de-acordeon',
    base: 'accesorios',
    nombre: 'Parrillas',
    h1: ['Parrillas de acordeón', 'originales, económicas y personalizadas'],
    titulo: 'Parrillas de Acordeón Hohner Originales y Personalizadas',
    descripcion:
      'Parrillas (rejillas) para acordeón Hohner Corona, Rey Vallenato y Compadre. Originales, en acero inoxidable económicas y personalizadas con tu nombre. Envío a toda Colombia.',
    eyebrow: 'Accesorios · Parrillas',
    intro:
      'La parrilla es la cara de tu acordeón. Tenemos rejillas originales Hohner, versiones en acero inoxidable a precio de taller y parrillas personalizadas cortadas a láser con tu nombre, escudo o diseño.',
    imagen: '/images/productos/parrillas-de-acordeon-personalizadas.webp',
    icono: 'acc-parrilla',
    palabras: ['parrilla', 'rejilla'],
    chips: ['Compatible Corona II y III', 'Rey Vallenato · Compadre', 'Corte láser en Bogotá'],
    beneficios: [
      { titulo: 'Encaje exacto', texto: 'Medidas tomadas de acordeones Hohner reales: tornillería alineada y sin holguras.' },
      { titulo: 'Acero que no se opaca', texto: 'Inoxidable pulido espejo o cromado. Resiste sudor, humedad y giras.' },
      { titulo: 'Diseño a tu medida', texto: 'Nombre, iniciales, escudo, virgen, bandera. Te enviamos el boceto antes de cortar.' },
      { titulo: 'Instalación guiada', texto: 'Video de instalación y soporte por WhatsApp. O la instalamos en nuestro taller.' },
    ],
    guia: {
      titulo: '¿Cómo elegir la parrilla correcta?',
      parrafos: [
        'Lo primero es el modelo: las parrillas de Hohner Corona II, Corona III, Rey Vallenato y Compadre comparten proporciones, pero cambian la distancia entre tornillos y el radio de las esquinas. Si nos escribes el modelo y una foto de la parrilla actual, confirmamos compatibilidad en minutos.',
        'La parrilla original Hohner es la elección segura si quieres mantener el instrumento 100% de fábrica. La versión económica en acero inoxidable ofrece el mismo encaje a menor precio y es la favorita para acordeones de trabajo. La personalizada convierte tu acordeón en una pieza única: perfecta para artistas y regalos.',
      ],
      lista: ['Mide la distancia entre los tornillos superiores', 'Cuenta los tornillos (4 o 6 según el modelo)', 'Elige acabado: cromado brillante, inoxidable o dorado', 'Para personalizadas: envíanos el nombre o logo en alta resolución'],
    },
    faq: [
      { p: '¿Sirve para mi acordeón Hohner Corona III?', r: 'Sí. Todas nuestras parrillas se fabrican sobre plantillas de Corona II, Corona III, Rey Vallenato y Compadre. Indícanos el modelo al comprar.' },
      { p: '¿Cuánto tarda una parrilla personalizada?', r: 'Entre 5 y 8 días hábiles: diseño, aprobación por WhatsApp, corte láser y pulido. Luego el envío, que en Colombia tarda 1 a 3 días.' },
      { p: '¿Puedo instalarla yo mismo?', r: 'Sí, sólo necesitas un destornillador de estrella. Te enviamos el video paso a paso. Si prefieres, la instalamos sin costo en Bogotá.' },
      { p: '¿Hacen envíos internacionales?', r: 'Sí, enviamos a Estados Unidos, México, Chile, Ecuador, Panamá y España con DHL o Servientrega internacional.' },
    ],
    waTexto: 'Hola, quiero una parrilla para mi acordeón',
  },
  {
    slug: 'fuelles-de-acordeon',
    base: 'accesorios',
    nombre: 'Fuelles',
    h1: ['Fuelles para acordeón', 'nuevos, de colores y a medida'],
    titulo: 'Fuelles para Acordeón Hohner: Nuevos, de Colores y a Medida',
    descripcion:
      'Fuelles de acordeón nuevos para Hohner Corona, Rey Vallenato y Compadre. Cartón prensado, esquineros metálicos y cinta de colores. Cambio de fuelle en taller. Envío a Colombia.',
    eyebrow: 'Accesorios · Fuelles',
    intro:
      'Un fuelle nuevo devuelve el aire y la respuesta al acordeón. Fabricados en cartón prensado de alta densidad, con esquineros metálicos y cinta en el color que quieras: negro clásico, tricolor, dorado o combinaciones personalizadas.',
    imagen: '/images/productos/fuelle-de-acordeon.webp',
    icono: 'acc-fuelle',
    palabras: ['fuelle'],
    chips: ['Hermético · sin fugas', '18 y 19 pliegues', 'Cambio en taller Bogotá'],
    beneficios: [
      { titulo: 'Aire completo', texto: 'Cartón de alta densidad y sellado interior: cero fugas, más presión con menos esfuerzo.' },
      { titulo: 'Esquineros metálicos', texto: 'Protegen los pliegues en cada apertura. Disponibles cromados y dorados.' },
      { titulo: 'Colores a tu gusto', texto: 'Negro, blanco, rojo, tricolor Colombia, dorado o el diseño que nos envíes.' },
      { titulo: 'Instalación profesional', texto: 'Nuestros técnicos lo cambian y revisan válvulas en el mismo servicio.' },
    ],
    guia: {
      titulo: '¿Cuándo cambiar el fuelle?',
      parrafos: [
        'Si el acordeón pierde aire al abrir, suena "lento" o las notas tardan en responder, casi siempre es el fuelle. También conviene cambiarlo cuando el cartón está blando, los pliegues se doblan o la cinta está despegada.',
        'Elige el número de pliegues según tu modelo (Corona III y Rey Vallenato usan fuelles de 18 y 19 pliegues) y decide si quieres mantener el color original o personalizarlo. Si no estás seguro, envíanos una foto del fuelle actual y te decimos exactamente cuál necesitas.',
      ],
      lista: ['Verifica el número de pliegues del fuelle actual', 'Mide el marco (largo y ancho) por dentro', 'Elige cinta y esquineros', 'Programa el cambio en taller o pide el kit para tu técnico'],
    },
    faq: [
      { p: '¿El fuelle viene listo para instalar?', r: 'Sí, viene armado con marcos, esquineros y cinta. Sólo se ajusta con los clavos o pasadores originales.' },
      { p: '¿Hacen fuelles de colores personalizados?', r: 'Sí. Tricolor, dorado, bicolor o con el color de tu acordeón. Te enviamos una muestra digital antes de fabricarlo.' },
      { p: '¿Cuánto cuesta el cambio de fuelle en el taller?', r: 'La mano de obra está incluida si compras el fuelle con nosotros y traes el acordeón a nuestro taller en Bogotá. Para envíos, te guiamos a tu técnico local.' },
    ],
    waTexto: 'Hola, necesito un fuelle para mi acordeón',
  },
  {
    slug: 'correas-de-acordeon',
    base: 'accesorios',
    nombre: 'Correas',
    h1: ['Correas de acordeón', 'acolchadas, Hohner y bordadas con tu nombre'],
    titulo: 'Correas de Acordeón Acolchadas y Personalizadas con Nombre',
    descripcion:
      'Correas para acordeón acolchadas en cuero sintético, juegos Hohner con broches y correas bordadas con tu nombre. Ajustables, cómodas para tocar horas. Envío a toda Colombia.',
    eyebrow: 'Accesorios · Correas',
    intro:
      'Toca horas sin dolor de hombros. Correas anchas y acolchadas, juegos oficiales Hohner en rojo, azul, amarillo y negro con sus broches, y correas bordadas a máquina con tu nombre o el de tu agrupación.',
    imagen: '/images/accesorios/combo-correas-hohner-rojo.webp',
    icono: 'cat-correa',
    palabras: ['correa'],
    chips: ['Acolchado de alta densidad', 'Herrajes metálicos', 'Bordado con tu nombre'],
    beneficios: [
      { titulo: 'Comodidad real', texto: 'Espuma de alta densidad y 7 cm de ancho: reparte el peso del acordeón en el hombro.' },
      { titulo: 'Herrajes que aguantan', texto: 'Hebillas y ganchos metálicos, costura reforzada. Pensadas para giras y parrandas.' },
      { titulo: 'Con tu nombre', texto: 'Bordado en hilo de alta resistencia: tu nombre, banda o iniciales en el color que elijas.' },
      { titulo: 'Juegos completos', texto: 'Par de correas + correa de bajo + broches a juego en el color de tu acordeón.' },
    ],
    guia: {
      titulo: '¿Qué correa necesito?',
      parrafos: [
        'Para acordeones de tres hileras (Corona III, Rey Vallenato) recomendamos correas anchas acolchadas de largo ajustable entre 80 y 110 cm. Si tocas de pie durante horas, el acolchado de alta densidad marca la diferencia.',
        'Los juegos Hohner incluyen las dos correas de hombro y los broches para fijarlas al cuerpo, en colores que combinan con la carcasa. Las correas bordadas son el regalo favorito: envíanos el nombre y el color de hilo y te mostramos el diseño antes de producir.',
      ],
      lista: ['Mide tu correa actual de extremo a extremo', 'Elige el color a juego con el acordeón', 'Si quieres bordado, indícanos texto y color de hilo', 'Añade broches si los tuyos están oxidados o flojos'],
    },
    faq: [
      { p: '¿Sirven para cualquier acordeón de botones?', r: 'Sí. Son ajustables y se fijan con los broches estándar de Hohner y marcas similares.' },
      { p: '¿Cuánto tarda una correa bordada?', r: 'De 3 a 5 días hábiles más el envío. Te enviamos foto del bordado antes de despachar.' },
      { p: '¿Venden los broches por separado?', r: 'Sí, tenemos broches de acordeón en cromado y dorado, sueltos o en combo con las correas.' },
    ],
    waTexto: 'Hola, quiero correas para mi acordeón',
  },
  {
    slug: 'estuches-de-acordeon',
    base: 'accesorios',
    nombre: 'Estuches',
    h1: ['Estuches para acordeón', 'rígidos, acolchados y tipo morral'],
    titulo: 'Estuches para Acordeón Hohner: Rígidos y Tipo Morral',
    descripcion:
      'Estuches y morrales para acordeón Hohner Corona, Rey Vallenato y Compadre. Rígidos, semirrígidos acolchados y personalizados con tu nombre. Protección real para viajar. Envío a Colombia.',
    eyebrow: 'Accesorios · Estuches',
    intro:
      'Tu acordeón vale millones: protégelo. Estuches rígidos para viajes en avión, morrales acolchados para el día a día y estuches personalizados con tu nombre o el logo de tu agrupación.',
    imagen: '/images/productos/estuches-de-acordeon.webp',
    icono: 'cat-estuche',
    palabras: ['estuche', 'morral', 'funda'],
    chips: ['Interior acolchado', 'Correas de morral', 'Bolsillo para accesorios'],
    beneficios: [
      { titulo: 'Protección total', texto: 'Espuma de alta densidad y estructura reforzada contra golpes, humedad y polvo.' },
      { titulo: 'Cómodo de cargar', texto: 'Correas de morral acolchadas y asa superior. Perfecto para bus, moto o avión.' },
      { titulo: 'Medida exacta', texto: 'Diseñados para Corona II, Corona III, Rey Vallenato y Compadre: el acordeón no baila.' },
      { titulo: 'Con tu marca', texto: 'Bordado o estampado de tu nombre, banda o logo en el frente.' },
    ],
    guia: {
      titulo: '¿Rígido o morral acolchado?',
      parrafos: [
        'Si viajas en avión o transportas el acordeón en bodega, elige un estuche rígido: estructura de madera o ABS con interior de espuma. Para el uso diario, ensayos y parrandas, el morral semirrígido acolchado es más ligero y se carga en la espalda.',
        'Todos nuestros estuches tienen medidas internas para acordeones Hohner de tres hileras. Si tu acordeón es de otra marca o de piano, escríbenos con las medidas y te confirmamos cuál sirve.',
      ],
      lista: ['Mide alto, ancho y fondo del acordeón cerrado', 'Decide: rígido (viajes) o morral (diario)', 'Elige color y si quieres bordado', 'Revisa que tenga bolsillo para correas y afinador'],
    },
    faq: [
      { p: '¿El estuche sirve para un Hohner Corona III?', r: 'Sí, nuestros estuches están hechos para Corona II, Corona III, Rey Vallenato y Compadre. Para otros modelos consúltanos.' },
      { p: '¿Puedo llevarlo como equipaje de mano?', r: 'El morral acolchado cumple medidas de cabina en la mayoría de aerolíneas. El rígido va mejor en bodega, bien protegido.' },
      { p: '¿Se puede personalizar?', r: 'Sí, bordamos o estampamos tu nombre o logo. Tarda 3 a 5 días hábiles adicionales.' },
    ],
    waTexto: 'Hola, quiero un estuche para mi acordeón',
  },
  {
    slug: 'broches-de-acordeon',
    base: 'accesorios',
    nombre: 'Broches',
    h1: ['Broches de acordeón', 'cromados y dorados para tus correas'],
    titulo: 'Broches de Acordeón Cromados y Dorados para Correas',
    descripcion:
      'Broches de acordeón metálicos cromados y dorados para fijar correas en Hohner Corona, Rey Vallenato y Compadre. Elegantes, firmes y fáciles de instalar. Envío a toda Colombia.',
    eyebrow: 'Accesorios · Broches',
    intro:
      'Pequeños pero decisivos: los broches sostienen todo el peso del acordeón en cada movimiento. Cromados o dorados, con tornillería incluida y listos para reemplazar los que ya se aflojaron.',
    imagen: '/images/productos/broches-para-acordeon.webp',
    icono: 'acc-broche',
    palabras: ['broche'],
    chips: ['Metal macizo', 'Cromado o dorado', 'Tornillería incluida'],
    beneficios: [
      { titulo: 'Agarre firme', texto: 'Cierre metálico que no se abre solo. Adiós a la correa que se suelta en pleno toque.' },
      { titulo: 'Acabado elegante', texto: 'Cromado espejo o dorado para combinar con parrilla y herrajes.' },
      { titulo: 'Instalación en minutos', texto: 'Mismos agujeros que los broches originales Hohner. Sólo destornillador.' },
    ],
    guia: {
      titulo: '¿Cuándo cambiar los broches?',
      parrafos: [
        'Cámbialos si están oxidados, si la correa se libera sola o si el resorte perdió fuerza. También son la forma más económica de renovar la imagen del acordeón: combínalos con la parrilla y los esquineros del fuelle.',
      ],
      lista: ['Revisa que el tipo de gancho coincida con tus correas', 'Elige cromado o dorado según tus herrajes', 'Aprovecha el combo con correas para ahorrar'],
    },
    faq: [
      { p: '¿Vienen en par?', r: 'Sí, se venden por juego completo para las dos correas, con tornillos.' },
      { p: '¿Sirven en acordeones que no son Hohner?', r: 'En la mayoría sí, porque el sistema de gancho es estándar. Envíanos una foto y te confirmamos.' },
    ],
    waTexto: 'Hola, quiero broches para mi acordeón',
  },

  // ── INSTRUMENTOS (distribuidor Miche / MPRO / Ludwig) ──
  {
    slug: 'cajas-vallenatas',
    base: 'instrumentos',
    categoriaSlug: 'cajas-vallenatas',
    nombre: 'Cajas vallenatas',
    h1: ['Cajas vallenatas', 'profesionales, económicas y con estuche'],
    titulo: 'Cajas Vallenatas Profesionales y Miche: Envío a Colombia',
    descripcion:
      'Cajas vallenatas profesionales desde $750.000 (la línea de los cajeros de Silvestre y Peter Manjarrés), cajas Miche económicas y estuche acolchado. Tienda en Bogotá, envío a toda Colombia y el mundo.',
    eyebrow: 'Instrumentos · Cajas vallenatas',
    intro:
      'La caja marca el paso del paseo, el merengue, la puya y el son. Tenemos la línea profesional que usan los cajeros de Silvestre Dangond, Peter Manjarrés y Elder Dayán, en verde, dorado, tricolor, degradados y personalizada con tu nombre; cajas Miche económicas en madera y acrílico; y el estuche acolchado para llevarla segura.',
    imagen: '/images/cajas/caja-vallenata-profesional-sandro-tricolor-colombia-1.webp',
    icono: 'cat-bateria',
    palabras: ['caja vallenata'],
    chips: ['Línea profesional', 'Económicas Miche', 'Estuche acolchado', 'Tienda en Bogotá'],
    beneficios: [
      { titulo: 'Sonido seco y con cuerpo', texto: 'Cascos torneados y parche acrílico tensado a punto: el golpe que necesita el conjunto vallenato.' },
      { titulo: 'Acrílico de colores', texto: 'Naranja, azul, rojo, transparente: la caja que se ve en tarima y en video.' },
      { titulo: 'Herrajes cromados', texto: 'Aros, tensores y soportes que aguantan parrandas y giras.' },
      { titulo: 'La caja de los grandes', texto: 'Nuestra línea profesional es la que suena en las tarimas de Silvestre, Peter Manjarrés y Elder Dayán. Casco torneado, lacado a mano y herrajes de gira.' },
    ],
    guia: {
      titulo: '¿Profesional o económica?',
      parrafos: [
        'Si vives de la caja, la caja profesional ($750.000) es la inversión: casco de madera torneado, lacado a espejo en el color que quieras (verde, dorado, tricolor, degradados) o con tu nombre pintado, aros y tensores cromados y un golpe seco con cuerpo que se escucha en la tarima sin micrófono. Es la que usan los cajeros de los grandes.',
        'Para empezar o para la parranda, las cajas Miche en madera o acrílico (desde $169.900) cumplen con creces. Todas usan parche acrílico afinable con llave. Añade el estuche acolchado ($150.000) para viajar y, si compras caja + guacharaca, te armamos el combo con descuento.',
      ],
      lista: ['Profesional (tarima) o económica Miche (inicio)', 'Escoge color, degradado o tu nombre pintado', 'Añade el estuche acolchado y la guacharaca', 'Pide el combo por WhatsApp y te cotizamos con envío'],
    },
    faq: [
      { p: '¿La caja viene afinada?', r: 'Viene tensada de fábrica; te enviamos un video de cómo afinarla con la llave incluida a tu gusto.' },
      { p: '¿Qué diferencia hay entre la profesional y la económica?', r: 'La profesional es artesanal: casco torneado y lacado a mano, herrajes de gira y el sonido que buscan los cajeros de los grandes artistas. La Miche es industrial y económica, ideal para empezar.' },
      { p: '¿Tienen estuche y guacharacas?', r: 'Sí: estuche acolchado con correas de morral ($150.000, con tu nombre bordado si quieres) y guacharacas en madera con trinche. Pídelos en combo con la caja.' },
      { p: '¿Venden a tiendas y escuelas?', r: 'Sí, manejamos precio mayorista por volumen. Escríbenos con la cantidad.' },
    ],
    waTexto: 'Hola, quiero una caja vallenata',
  },
  {
    slug: 'baterias',
    base: 'instrumentos',
    categoriaSlug: 'baterias',
    nombre: 'Baterías',
    h1: ['Baterías acústicas y electrónicas', 'junior, intermedias y profesionales'],
    titulo: 'Baterías Acústicas y Electrónicas MPRO, Ludwig y Carlsbro',
    descripcion:
      'Baterías MPRO Junior de 3 y 5 piezas, Ludwig Accent y Vistalite, baterías electrónicas Carlsbro y Steren. Distribuidor autorizado en Colombia con envío nacional.',
    eyebrow: 'Instrumentos · Baterías',
    intro:
      'Desde la primera batería junior para el niño de la casa hasta una Ludwig americana para el estudio. También baterías electrónicas para practicar sin molestar a los vecinos.',
    imagen: '/images/clusters/bateria.webp',
    icono: 'cat-bateria',
    palabras: ['bateria', 'batería'],
    chips: ['MPRO · Ludwig · Carlsbro', 'Acústicas y electrónicas', 'Envío armado o en caja'],
    beneficios: [
      { titulo: 'Para cada nivel', texto: 'Junior de 3 piezas, intermedias de 5 piezas y profesionales con herrajes de gira.' },
      { titulo: 'Electrónicas silenciosas', texto: 'Pads sensibles, sonidos de estudio y salida de audífonos: practica a cualquier hora.' },
      { titulo: 'Marcas con respaldo', texto: 'MPRO, Ludwig, Carlsbro y Steren con garantía oficial en Colombia.' },
      { titulo: 'Asesoría real', texto: 'Te ayudamos a elegir tamaño, platillos y accesorios según el músico y el espacio.' },
    ],
    guia: {
      titulo: '¿Qué batería comprar?',
      parrafos: [
        'Para niños de 4 a 9 años, una junior de 3 piezas es suficiente y cabe en cualquier cuarto. Para adolescentes y adultos que empiezan, una de 5 piezas con platillos incluidos. Si el ruido es problema, la electrónica es la respuesta: se toca con audífonos y ocupa la mitad del espacio.',
        'Las Ludwig son instrumentos de por vida: cascos de arce o acrílico, herrajes de gira y el sonido de los discos clásicos.',
      ],
      lista: ['Define quién la va a tocar y dónde', 'Acústica (sonido real) o electrónica (silencio)', 'Revisa si incluye platillos, silla y baquetas', 'Pregunta por el envío armado en tu ciudad'],
    },
    faq: [
      { p: '¿Incluye platillos y silla?', r: 'Depende del modelo: las junior traen todo para empezar; en las profesionales los platillos se eligen aparte. Te lo confirmamos en la cotización.' },
      { p: '¿Cómo llega el envío?', r: 'En cajas selladas de fábrica con instrucciones de armado; en Bogotá podemos entregarla armada.' },
      { p: '¿Tienen repuestos y parches?', r: 'Sí: parches Remo y Evans, baquetas Vic Firth y herrajes.' },
    ],
    waTexto: 'Hola, busco una batería',
  },

  // ── AUDIO Y GRABACIÓN ──
  {
    slug: 'audifonos',
    base: 'audio',
    categoriaSlug: 'audifonos',
    nombre: 'Audífonos',
    h1: ['Audífonos in-ear KZ', 'para monitoreo, estudio y escenario'],
    titulo: 'Audífonos In-Ear KZ para Músicos: Monitoreo y Estudio',
    descripcion:
      'Audífonos KZ ZS10 Pro, ZSN Pro, ZST X, EDX y adaptadores Bluetooth. Sonido de alta fidelidad para monitoreo en tarima, práctica y grabación. Distribuidor autorizado en Colombia.',
    eyebrow: 'Audio · Audífonos',
    intro:
      'Los KZ son los in-ear favoritos de músicos y productores por su relación calidad-precio: drivers híbridos, cable desmontable y aislamiento real para escucharte en tarima o grabar sin ruido.',
    imagen: '/images/clusters/audifonos.webp',
    icono: 'cat-sonido',
    palabras: ['auricular', 'audifono', 'audífono', 'kz'],
    chips: ['Drivers híbridos', 'Cable desmontable', 'Bluetooth opcional'],
    beneficios: [
      { titulo: 'Escúchate en tarima', texto: 'Aislamiento pasivo que deja fuera la caja y la guacharaca para oír tu acordeón limpio.' },
      { titulo: 'Detalle de estudio', texto: 'Drivers dinámicos + balanced armature: graves con cuerpo y agudos definidos.' },
      { titulo: 'Cable que se cambia', texto: 'Conector 2 pines: si el cable falla, se reemplaza. Y con el adaptador AZ10/AZ15 quedan inalámbricos.' },
      { titulo: 'Desde $14.000', texto: 'Modelos para empezar (EDX, Dawn) y tope de gama (ZS10 Pro, ZSN Pro 2).' },
    ],
    guia: {
      titulo: '¿Qué KZ me conviene?',
      parrafos: [
        'Para practicar y escuchar música, los EDX Lite o EDC Pro son imbatibles por precio. Para monitoreo en tarima recomendamos ZSN Pro 2 o ZST X: más aislamiento y graves. Para grabar y mezclar, los ZS10 Pro con sus 5 drivers por lado.',
        'Si quieres libertad de cables, añade el adaptador Bluetooth AZ10 o AZ15: se enganchan a la oreja y convierten cualquier KZ en inalámbrico.',
      ],
      lista: ['Práctica: EDX / EDC Pro', 'Tarima: ZSN Pro 2 / ZST X', 'Estudio: ZS10 Pro', 'Inalámbrico: + adaptador AZ10 / AZ15'],
    },
    faq: [
      { p: '¿Sirven para monitoreo in-ear en vivo?', r: 'Sí. Con un sistema de monitoreo o directo desde la consola, los KZ aíslan lo suficiente para escucharte con claridad.' },
      { p: '¿Traen micrófono?', r: 'Los que dicen "sin micrófono" son la versión para músicos. Consúltanos si necesitas versión con micrófono para llamadas.' },
      { p: '¿Tienen garantía?', r: 'Sí, 6 meses por defectos de fábrica como distribuidor autorizado.' },
    ],
    waTexto: 'Hola, busco audífonos in-ear para monitoreo',
  },
  {
    slug: 'equipos-de-grabacion',
    base: 'audio',
    categoriaSlug: 'equipos-de-grabacion',
    nombre: 'Grabación',
    h1: ['Equipos de grabación', 'interfaces, monitores y mezcladores'],
    titulo: 'Equipos de Grabación: Interfaces, Monitores y Mezcladores',
    descripcion:
      'Arma tu home studio: interfaces de audio USB, monitores de estudio y mezcladores para grabar acordeón, voz y guacharaca con calidad profesional. Asesoría y envío a toda Colombia.',
    eyebrow: 'Audio · Grabación',
    intro:
      'Graba tus canciones y tus videos con sonido de disco. Te armamos el combo de interfaz, micrófono, monitores y audífonos según tu presupuesto, y te explicamos cómo conectarlo todo.',
    imagen: '/images/clusters/grabacion.webp',
    icono: 'cat-sonido',
    palabras: ['interfaz', 'interface', 'monitor', 'mixer', 'mezclador', 'consola'],
    chips: ['Combos home studio', 'Compatible PC, Mac y celular', 'Asesoría de conexión'],
    beneficios: [
      { titulo: 'Combos listos', texto: 'Interfaz + micrófono + audífonos desde el presupuesto básico hasta el estudio completo.' },
      { titulo: 'Graba el acordeón bien', texto: 'Te decimos qué micrófonos y a qué distancia para capturar fuelle y voz sin saturar.' },
      { titulo: 'Monitores que no mienten', texto: 'Monitores de estudio de respuesta plana para mezclar con criterio.' },
      { titulo: 'Soporte después de la compra', texto: 'Te acompañamos en la instalación de drivers y la primera grabación por WhatsApp.' },
    ],
    guia: {
      titulo: '¿Qué necesito para grabar en casa?',
      parrafos: [
        'Lo mínimo: una interfaz de audio de 2 canales (una para el micrófono del acordeón, otra para la voz), un micrófono de condensador y unos audífonos cerrados. Con eso ya grabas en tu computador o celular con calidad profesional.',
        'El siguiente paso son los monitores de estudio y, si vas a grabar el conjunto completo, un mezclador con más entradas. Escríbenos qué quieres grabar y te armamos la lista exacta.',
      ],
      lista: ['Interfaz de 2 canales', 'Micrófono de condensador', 'Audífonos cerrados', 'Monitores (cuando vayas a mezclar)'],
    },
    faq: [
      { p: '¿Funciona con celular?', r: 'La mayoría de interfaces USB funcionan con iPhone y Android con el adaptador correspondiente. Te indicamos cuál.' },
      { p: '¿Qué programa uso para grabar?', r: 'Hay opciones gratuitas (Audacity, GarageBand, Cakewalk) y profesionales (Reaper, Logic, Pro Tools). La interfaz funciona con todos.' },
      { p: '¿Hacen combos con descuento?', r: 'Sí, interfaz + micrófono + audífonos o el estudio completo con monitores. Pide tu combo por WhatsApp.' },
    ],
    waTexto: 'Hola, quiero armar mi equipo de grabación',
  },
  {
    slug: 'microfonos',
    base: 'audio',
    categoriaSlug: 'microfonos-y-audio',
    nombre: 'Micrófonos',
    h1: ['Micrófonos', 'alámbricos, inalámbricos, diadema y solapa'],
    titulo: 'Micrófonos Shure, Takstar y Miche: Inalámbricos y Diadema',
    descripcion:
      'Micrófonos para acordeoneros y cantantes: Shure, Takstar y Miche. Alámbricos, inalámbricos, de diadema, solapa y condensador para grabación. Distribuidor autorizado en Colombia.',
    eyebrow: 'Audio · Micrófonos',
    intro:
      'El micrófono correcto para cada uso: dinámicos para la voz en tarima, inalámbricos para moverte, diademas para cantar y tocar a la vez, y condensadores para el estudio.',
    imagen: '/images/clusters/microfono.webp',
    icono: 'cat-sonido',
    palabras: ['microfono', 'micrófono'],
    chips: ['Shure · Takstar · Miche', 'Alámbricos e inalámbricos', 'Diadema y solapa'],
    beneficios: [
      { titulo: 'Para la tarima', texto: 'Dinámicos tipo SM58 que aguantan golpes y rechazan la retroalimentación.' },
      { titulo: 'Sin cables', texto: 'Sistemas inalámbricos UHF de mano y de diadema con alcance real.' },
      { titulo: 'Para el estudio', texto: 'Condensadores de diafragma grande para voz y acordeón con detalle.' },
      { titulo: 'Para el acordeón', texto: 'Te asesoramos con micrófonos internos y de pinza para amplificar el acordeón sin acoples.' },
    ],
    guia: {
      titulo: '¿Qué micrófono para qué?',
      parrafos: [
        'En vivo, un dinámico de mano es la elección segura para el cantante; si el acordeonero también canta, la diadema le deja las manos libres. Los sistemas inalámbricos son ideales para presentaciones y eventos.',
        'Para grabar en casa, un condensador de diafragma grande conectado a una interfaz da el sonido de disco. Para amplificar el acordeón en tarima, pregúntanos por micrófonos internos y de pinza.',
      ],
      lista: ['Voz en vivo: dinámico de mano', 'Cantar y tocar: diadema', 'Moverse en tarima: inalámbrico', 'Grabar: condensador + interfaz'],
    },
    faq: [
      { p: '¿Cuál es el mejor micrófono para acordeón?', r: 'Para tarima, micrófonos internos o de pinza que van dentro o sobre la parrilla; para estudio, un par de condensadores. Escríbenos y te recomendamos según tu acordeón y tu equipo.' },
      { p: '¿Los inalámbricos se acoplan?', r: 'Con la frecuencia bien elegida y a la distancia correcta de los parlantes, no. Te explicamos cómo configurarlos.' },
      { p: '¿Traen cable?', r: 'Los alámbricos incluyen su cable XLR en la mayoría de modelos; lo indicamos en cada producto.' },
    ],
    waTexto: 'Hola, busco un micrófono',
  },
]

export const buscarCluster = (slug: string) => CLUSTERS.find((c) => c.slug === slug)

/** Productos que no son accesorios pero cuyo nombre menciona uno ("Acordeón … con Estuche y Correa"). */
export const esAccesorio = (nombre: string) => !/^\s*(acorde[oó]n|hohner)\b/i.test(nombre)
