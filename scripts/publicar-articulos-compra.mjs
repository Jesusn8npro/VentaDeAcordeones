/**
 * Publica los artículos de blog con intención de compra y arregla las portadas rotas.
 *
 * Se ejecuta a mano (`node scripts/publicar-articulos-compra.mjs`) y es idempotente:
 * si el slug ya existe lo actualiza en vez de duplicarlo.
 *
 * Los precios que aparecen en los textos salen del catálogo real (consultados el
 * 2026-09-12). Si cambian, hay que revisarlos: un artículo que promete un precio que
 * ya no existe hace perder más ventas de las que trae.
 */

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const AUTOR_ID = '4a86ad08-a1bd-4893-8e81-9f03e805decd'
const SITIO = 'https://ventadeacordeones.com'
const WA = (t) => `https://wa.me/573144865310?text=${encodeURIComponent(t)}`

const h2 = (contenido) => ({ tipo: 'encabezado', nivel: 2, contenido })
const p = (contenido) => ({ tipo: 'parrafo', contenido })
const ul = (items) => ({ tipo: 'lista', items, ordenada: false })
const ol = (items) => ({ tipo: 'lista', items, ordenada: true })

/**
 * Bloque de preguntas frecuentes.
 *
 * No es relleno: el renderizador del artículo convierte este bloque en schema FAQPage,
 * que es lo que hace que Google muestre las preguntas desplegables debajo del
 * resultado. Cada pregunta va redactada tal y como la escribe la gente en el buscador
 * ("¿cuánto cuesta…?", "¿cuál me sirve para…?"), porque el que coincide con la
 * búsqueda es el que aparece.
 */
const faq = (pares) => ({
  tipo: 'faq',
  preguntas: pares.map(([pregunta, respuesta]) => ({ pregunta, respuesta })),
})

const ctaTienda = (textoWa) => ({
  items: [
    { href: '/tienda', texto: 'Ver acordeones disponibles' },
    { href: WA(textoWa), texto: 'Pedir asesoría por WhatsApp', estilo: 'whatsapp' },
  ],
})

const ARTICULOS = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'acordeon-para-principiantes-cual-comprar',
    titulo: 'Acordeón para principiantes: cuál comprar si apenas vas a empezar',
    portada_url: '/images/hero/rey-vallenato-negro.webp',
    lectura_min: 7,
    resumen_breve:
      'Si nunca has tocado, no necesitas el acordeón más caro ni el más barato. Te explicamos qué modelo sirve de verdad para arrancar, cuánto cuesta y qué errores hacen que mucha gente abandone a los dos meses.',
    meta_titulo: 'Acordeón para Principiantes en Colombia: Cuál Comprar y Cuánto Cuesta',
    meta_descripcion:
      'Guía honesta para comprar tu primer acordeón en Colombia: qué modelo elegir, precios reales desde $3.610.000, qué tonalidad escoger y los errores que hacen abandonar a los principiantes.',
    meta_keywords: 'acordeón para principiantes, primer acordeón, comprar acordeón colombia, acordeón barato, acordeón hohner principiantes, qué acordeón comprar',
    secciones: [
      p('La pregunta llega casi todos los días por WhatsApp: *"¿cuál me recomienda para empezar?"*. Y la respuesta honesta incomoda un poco, porque no es el más barato que encuentres.'),
      h2('El error más caro: comprar el más barato'),
      p('Un acordeón de juguete o de marca desconocida por $400.000 parece la decisión prudente: *"primero pruebo, y si me gusta compro uno bueno"*. En la práctica pasa lo contrario. Esos instrumentos se desafinan solos, tienen botones que se traban y un fuelle que pide más fuerza de la que debería. El principiante cree que el problema es él, se frustra y deja el acordeón en un rincón.'),
      p('Lo hemos visto muchas veces en el taller: llegan instrumentos de dos meses de uso que ya no tienen arreglo rentable. Esa plata no se recupera y, peor, se pierden las ganas.'),
      h2('Lo que sí sirve para empezar'),
      p('Para arrancar en vallenato, el punto de entrada real es un **Hohner Rey Vallenato**, que hoy está en **$3.610.000**. No es un acordeón "de principiante": es el que usan músicos que ya tocan en grupo. Eso importa porque no lo vas a tener que cambiar en un año.'),
      ul([
        '[Hohner Rey Vallenato ADG negro](/producto/hohner-rey-vallenato-adg-negro) — $3.610.000',
        '[Hohner Rey Vallenato BEsAs negro](/producto/hohner-rey-vallenato-besas-negro) — $3.610.000',
        '[Hohner Corona II GCF](/producto/acorde-n-hohner-corona-ii-gcf) — $2.850.000, la opción más económica de la familia Corona',
      ]),
      p('Si tu presupuesto no llega ahí todavía, es mejor esperar y ahorrar que comprar algo que te va a estorbar. Mientras tanto puedes practicar en el acordeón de un amigo o de la escuela.'),
      h2('¿Y para un niño?'),
      p('Distinto caso. Si es para un niño de menos de 8 años y todavía no sabes si le va a gustar, sí tiene sentido un instrumento pequeño y liviano. Tenemos [acordeones para niños desde $119.000](/tienda/categoria/acordeones-para-ninos): sirven para que agarre el gusto y el movimiento del fuelle sin cargar un instrumento de 5 kilos.'),
      h2('La tonalidad: esto es lo que más se equivoca'),
      p('Un acordeón diatónico no toca en todos los tonos. Viene afinado en tres tonalidades fijas y eso define con quién vas a poder tocar. Las tres comunes en Colombia:'),
      ul([
        '**ADG** — la más usada en el vallenato tradicional. Si vas a tocar con grupos o en parrandas, esta es la apuesta segura.',
        '**BEsAs (SiMibLab)** — muy usada por acordeoneros modernos y para acompañar voces femeninas.',
        '**GCF (SolDoFa)** — más común en música norteña y en algunos temas de la costa.',
      ]),
      p('Regla práctica: **pregúntale a la gente con la que vas a tocar en qué tonalidad andan** y compra esa. Si vas a tocar solo y no sabes, ADG. Tenemos una [guía de tonalidades](/guia-tonalidades) con el detalle completo.'),
      h2('Lo que hay que sumarle al presupuesto'),
      p('El acordeón no viene solo. Cuenta estos desde el principio para que no te tomen por sorpresa:'),
      ul([
        '[Estuche](/tienda/categoria/accesorios-acordeon) — desde $180.000. No es opcional: la mayoría de los daños que vemos en el taller vienen de transportar el acordeón sin estuche.',
        '[Correas](/accesorios/correas) — desde $120.000. Las que vienen de fábrica sirven, pero si vas a tocar de pie más de una hora, unas buenas te salvan la espalda.',
        'Afinación anual — se la explicamos en [mantenimiento de acordeón](/blog/mantenimiento-de-acordeon-guia-completa).',
      ]),
      h2('Nuevo o usado'),
      p('Un usado bien cuidado puede ser una gran compra, pero hay que saber qué revisar. Lo desarrollamos aparte en [¿acordeón nuevo o usado?](/blog/acordeon-nuevo-o-usado-que-conviene).'),
      h2('En resumen'),
      ol([
        'Si es para ti y vas en serio: Rey Vallenato $3.610.000 en la tonalidad de tu grupo.',
        'Si es para un niño pequeño que está probando: uno de $119.000 está bien.',
        'Súmale estuche desde el día uno.',
        'No compres marcas desconocidas por ahorrar: sale más caro.',
      ]),
      p('Si tienes dudas, escríbenos por WhatsApp al **+57 314 486 5310** y te decimos el modelo exacto según lo que toques, tu nivel y tu presupuesto. La asesoría no cuesta nada y no compromete a nada.'),
      faq([
        ['¿Cuánto cuesta un acordeón para principiantes en Colombia?', 'El punto de entrada real es el Hohner Rey Vallenato a $3.610.000, y la Corona II GCF queda en $2.850.000. Por debajo de eso solo hay instrumentos de marca desconocida que se desafinan solos y terminan desanimando al que empieza.'],
        ['¿Qué tonalidad de acordeón debo comprar si estoy empezando?', 'ADG si vas a tocar vallenato tradicional o si todavía no sabes. BEsAs si tocas estilo moderno o acompañas voces agudas. La regla práctica: pregunta en qué tonalidad andan los músicos con los que vas a tocar y compra esa.'],
        ['¿Sirve un acordeón barato de $400.000 para aprender?', 'No lo recomendamos. Se desafinan solos, los botones se traban y el fuelle pide más fuerza de la debida. El principiante cree que el problema es él, se frustra y abandona. En el taller vemos instrumentos así con dos meses de uso y sin arreglo rentable.'],
        ['¿Qué le tengo que comprar además del acordeón?', 'El estuche desde el primer día (desde $180.000): la mayoría de los daños que llegan al taller vienen de transportar el acordeón sin él. Las correas de fábrica sirven para empezar; si vas a tocar de pie más de una hora, unas buenas te salvan la espalda.'],
        ['¿Qué acordeón le compro a un niño?', 'Si tiene menos de 8 años y todavía no sabes si le va a gustar, un acordeón pequeño desde $119.000 está bien: sirve para que agarre el gusto y el movimiento del fuelle sin cargar un instrumento de cinco kilos.'],
      ]),
    ],
    cta: ctaTienda('Hola, quiero asesoría para comprar mi primer acordeón'),
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'acordeon-nuevo-o-usado-que-conviene',
    titulo: '¿Acordeón nuevo o usado? Lo que hay que revisar antes de pagar',
    portada_url: '/images/hero/rojo-xtreme.webp',
    lectura_min: 6,
    resumen_breve:
      'Un acordeón usado puede ser el mejor negocio de tu vida o un hueco sin fondo. La diferencia está en seis cosas que se revisan en diez minutos, y que casi nadie revisa.',
    meta_titulo: 'Acordeón Nuevo o Usado en Colombia: Qué Revisar Antes de Comprar',
    meta_descripcion:
      'Los 6 puntos que debes revisar en un acordeón usado antes de pagar, cuánto cuesta repararlo si sale malo, y cuándo sí conviene comprar nuevo. Con precios reales de Colombia.',
    meta_keywords: 'acordeón usado, comprar acordeón usado colombia, acordeón nuevo o usado, revisar acordeón usado, precio acordeón usado',
    secciones: [
      p('Un Hohner usado en buen estado puede costar la mitad que uno nuevo y sonar igual de bien. También puede ser un instrumento al que le faltan tres meses de taller y $1.500.000 en repuestos. Lo que separa una cosa de la otra se revisa en diez minutos.'),
      h2('Los 6 puntos que sí importan'),
      ol([
        '**El fuelle.** Ciérralo del todo y aprieta suave con el acordeón en silencio, sin tocar botones. Si se hunde solo o se oye aire escapando, el fuelle está vencido. Cambiarlo cuesta [desde $350.000](/producto/fuelle-de-acordeon) y es de lo más común que llega al taller.',
        '**Afinación.** Toca la misma nota abriendo y cerrando. Si suenan distinto, las lengüetas están desafinadas. Una afinación completa es trabajo de taller, no de casa.',
        '**Botones trabados o mudos.** Pásalos todos, uno por uno, de ida y de vuelta. Un botón que no suena puede ser una válvula suelta (barato) o una lengüeta partida (caro).',
        '**Óxido en las lengüetas.** Pide abrirlo. Si las láminas metálicas están con puntos naranjas, ese acordeón vivió en humedad. El óxido no se quita: se cambia la lengüeta.',
        '**Los bajos.** La gente prueba solo la mano derecha. Toca todos los bajos: es donde más aparecen fugas de aire que no se oyen tocando melodías.',
        '**La cera.** Las lengüetas van pegadas con cera. Si ves goterones, grietas o la cera despegada, el instrumento estuvo al sol o en un carro cerrado.',
      ]),
      h2('La cuenta que casi nadie hace'),
      p('Un Rey Vallenato usado a $2.200.000 parece ganga frente a los **$3.610.000** del nuevo. Pero si necesita fuelle ($350.000), afinación completa y un par de lengüetas, te vas a $3.000.000 o más — y con un instrumento que ya tiene años encima y sin garantía.'),
      p('La regla que usamos: **si la reparación estimada pasa del 30 % del precio de uno nuevo, no vale la pena.**'),
      h2('Cuándo sí conviene el usado'),
      ul([
        'Cuando lo puedes revisar en persona, con los seis puntos de arriba.',
        'Cuando conoces al dueño y sabes cómo lo trató.',
        'Cuando es un modelo descontinuado que ya no se consigue nuevo.',
        'Cuando el precio deja margen real para una afinación de entrada, que casi siempre hace falta.',
      ]),
      h2('Cuándo conviene el nuevo'),
      p('Si es tu primer acordeón, casi siempre. Sin experiencia es muy difícil detectar una lengüeta cansada o un fuelle que está por irse, y un vendedor apurado no te lo va a decir. Un acordeón nuevo trae garantía, afinación de fábrica y la tranquilidad de que lo que suena mal es tu mano, no el instrumento.'),
      p('En la tienda todos los acordeones son nuevos, con garantía y afinados antes de despachar. Puedes verlos en [acordeones Rey Vallenato](/tienda/categoria/acordeones-rey-vallenato) y [Hohner Premium](/tienda/categoria/acordeones-hohner-premium).'),
      h2('¿Ya compraste uno usado?'),
      p('Tráelo. En el [taller de Bogotá](/blog/donde-reparar-acordeon-en-bogota) lo revisamos y te decimos qué tiene, qué cuesta y si vale la pena arreglarlo antes de que te gastes más. Es mejor saberlo ahora que cuando falle en una presentación.'),
      faq([
        ['¿Qué hay que revisar en un acordeón usado antes de comprarlo?', 'Seis cosas: que el fuelle no se hunda solo ni deje escapar aire, que la misma nota suene igual abriendo y cerrando, que todos los botones respondan (incluidos los bajos), que las lengüetas no tengan óxido, y que la cera no esté agrietada ni despegada.'],
        ['¿Cuándo NO vale la pena comprar un acordeón usado?', 'Cuando la reparación estimada pasa del 30 % del precio de uno nuevo. Un usado a $2.200.000 que necesita fuelle ($350.000), afinación y un par de lengüetas te deja cerca de los $3.000.000 con un instrumento viejo y sin garantía.'],
        ['¿Cuánto cuesta arreglar un acordeón usado?', 'Depende de lo que tenga. El cambio de fuelle arranca en $350.000 y es de lo más común. La afinación completa y el cambio de lengüetas son trabajo de taller y se cotizan al revisarlo.'],
        ['¿Es mejor comprar nuevo si es mi primer acordeón?', 'Casi siempre sí. Sin experiencia es muy difícil detectar una lengüeta cansada o un fuelle a punto de irse, y un vendedor apurado no te lo va a decir. Un acordeón nuevo trae garantía y afinación de fábrica.'],
        ['¿Revisan acordeones usados que compré en otro lado?', 'Sí. Tráelo al taller de Bogotá y te decimos qué tiene, qué cuesta y si vale la pena arreglarlo, antes de que gastes más.'],
      ]),
    ],
    cta: {
      items: [
        { href: '/tienda/categoria/acordeones-rey-vallenato', texto: 'Ver acordeones nuevos' },
        { href: WA('Hola, compré un acordeón usado y quiero que lo revisen'), texto: 'Que revisen mi acordeón', estilo: 'whatsapp' },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'acordeon-personalizado-cuanto-cuesta-colombia',
    titulo: 'Acordeón personalizado: cuánto cuesta y cómo se manda a hacer',
    portada_url: '/images/personalizados/acordeon-hohner-morado-edicion-unica-1.webp',
    lectura_min: 6,
    resumen_breve:
      'Diapasón nacarado, botones a juego, fuelle con tu nombre, parrilla tallada. Qué se puede personalizar de verdad en un Hohner, cuánto suma cada cosa y cuánto tarda.',
    meta_titulo: 'Acordeón Personalizado en Colombia: Precios y Cómo Encargarlo',
    meta_descripcion:
      'Acordeones Hohner personalizados desde $5.290.000: diapasón nacarado, botones, fuelle con tu nombre y parrilla a medida. Qué se puede cambiar, cuánto cuesta y cuánto tarda.',
    meta_keywords: 'acordeón personalizado, acordeón hohner personalizado, acordeón con mi nombre, parrilla personalizada acordeón, fuelle personalizado, acordeón nacarado',
    secciones: [
      p('Un acordeón personalizado no es pintarle algo encima. Es desarmar un Hohner de fábrica y reemplazar piezas por otras hechas a medida, sin tocar lo que hace que suene: lengüetas, cera y mecánica quedan intactas.'),
      h2('Qué se puede personalizar'),
      ul([
        '**Diapasón nacarado** — el frente del acordeón en nácar, en el color que elijas. Es lo que más se nota a distancia y en fotos.',
        '**Botones nacarados** — a juego con el diapasón o en contraste. Cambian por completo el carácter del instrumento.',
        '**Fuelle personalizado** — colores, tricolor de Colombia, tu nombre o el de tu grupo bordado en las esquinas.',
        '**Parrilla personalizada** — la rejilla metálica del frente, tallada o calada con tu diseño, iniciales, una corona o una imagen religiosa.',
        '**Correas bordadas** — a juego con el resto, con tu nombre.',
      ]),
      p('Entre más elementos combines, más cambia el instrumento. Un Hohner con los cuatro no se parece a ningún otro.'),
      h2('Cuánto cuesta'),
      p('Los acordeones personalizados que tenemos listos van de **$5.290.000 a $6.500.000**, según cuántos elementos lleven y qué tan elaborada sea la parrilla:'),
      ul([
        '[Hohner Premium Nácar con botones nacarados](/producto/acordeon-hohner-premium-nacar-botones-nacarados) — $6.500.000',
        '[Hohner Morado Edición Única](/producto/acordeon-hohner-morado-edicion-unica) — $6.200.000',
        '[Hohner Azul Tricolor Trueno Kolombiano](/producto/acordeon-hohner-azul-tricolor-trueno-kolombiano) — $6.200.000',
        '[Hohner Negro Xtreme Virgen con fuelle y corona](/producto/acordeon-hohner-negro-xtreme-virgen-fuelle-corona) — $6.200.000',
        '[Hohner Verde Esmeralda](/producto/acordeon-hohner-verde-esmeralda) — $5.400.000',
      ]),
      p('Puedes ver todos en [acordeones personalizados](/tienda/categoria/acordeones-hohner-personalizados).'),
      h2('¿Y si ya tengo mi acordeón?'),
      p('También se personaliza pieza por pieza sobre el instrumento que ya tienes. Los precios de referencia:'),
      ul([
        '[Parrillas personalizadas](/producto/parrillas-de-acordeon-personalizadas) — desde $280.000',
        '[Fuelles](/producto/fuelles-para-acordeon) — desde $350.000',
        '[Correas bordadas](/producto/correas-acordeon-personalizadas-bordadas) — desde $180.000',
      ]),
      p('Esta vía tiene una ventaja: repartes el gasto y conservas el instrumento al que ya te acostumbraste.'),
      h2('Cuánto tarda'),
      p('Depende de lo que pidas. Un cambio de fuelle o de parrilla estándar se hace en días. Un diseño tallado a medida, con bordado y botones a juego, toma más tiempo porque las piezas se fabrican para ti. Cuando nos escribas te damos una fecha concreta antes de que pagues nada, no un "más o menos".'),
      h2('Cómo se encarga'),
      ol([
        'Escríbenos por WhatsApp con la idea: colores, si quieres nombre o escudo, y el modelo de acordeón.',
        'Te mandamos referencias de trabajos parecidos y el precio cerrado.',
        'Confirmas el diseño y la fecha de entrega.',
        'Te mandamos fotos del avance mientras se arma.',
      ]),
      p('Si quieres ver el detalle de los acabados de cerca, tenemos una [página dedicada a los personalizados](/acordeones-personalizados) con fotos en grande.'),
      faq([
        ['¿Cuánto cuesta un acordeón Hohner personalizado?', 'Los que tenemos listos van de $5.290.000 a $6.500.000, según cuántos elementos lleve y qué tan elaborada sea la parrilla.'],
        ['¿Personalizar el acordeón le cambia el sonido?', 'No. Se reemplazan piezas exteriores: diapasón, botones, fuelle y parrilla. Lengüetas, cera y mecánica quedan exactamente como salieron de fábrica.'],
        ['¿Puedo personalizar el acordeón que ya tengo?', 'Sí, pieza por pieza y sin comprar uno nuevo. Parrillas desde $280.000, fuelles desde $350.000 y correas bordadas desde $180.000. Así repartes el gasto y conservas el instrumento al que ya estás acostumbrado.'],
        ['¿Cuánto tarda un acordeón personalizado?', 'Un cambio de fuelle o una parrilla estándar se hacen en días. Un diseño tallado a medida, con bordado y botones a juego, toma más porque las piezas se fabrican para ti. Te damos fecha concreta antes de que pagues nada.'],
        ['¿Le pueden poner mi nombre al acordeón?', 'Sí: bordado en el fuelle, tallado o calado en la parrilla, o pintado. También iniciales, el nombre del grupo, una corona o una imagen religiosa.'],
      ]),
    ],
    cta: {
      items: [
        { href: '/tienda/categoria/acordeones-hohner-personalizados', texto: 'Ver personalizados listos' },
        { href: WA('Hola, quiero mandar a hacer un acordeón personalizado'), texto: 'Diseñar el mío', estilo: 'whatsapp' },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'comprar-acordeon-desde-tu-ciudad-envios-colombia',
    titulo: 'Comprar un acordeón sin estar en Bogotá: cómo lo enviamos y qué pasa si llega mal',
    portada_url: '/images/hero/azul-tricolor.webp',
    lectura_min: 5,
    resumen_breve:
      'Comprar un instrumento de varios millones sin tenerlo en la mano da miedo, y con razón. Esto es exactamente cómo lo empacamos, cuánto tarda según tu ciudad y qué hacemos si llega con un golpe.',
    meta_titulo: 'Envío de Acordeones a Toda Colombia: Tiempos, Empaque y Garantía',
    meta_descripcion:
      'Enviamos acordeones a toda Colombia: 48-72 horas a ciudades principales, 5-8 días a municipios. Cómo los empacamos, qué pasa si llega con daño y cómo seguir tu pedido.',
    meta_keywords: 'envío acordeón colombia, comprar acordeón por internet, acordeón envío nacional, acordeones a domicilio colombia',
    secciones: [
      p('La duda es legítima: vas a pagar entre tres y seis millones por algo que no has tocado, a gente que no conoces, que te lo va a mandar por transportadora. Aquí está todo lo que pasa entre que pagas y lo abres.'),
      h2('Antes de que salga del taller'),
      p('Ningún acordeón se despacha como llega de fábrica. Antes de empacarlo:'),
      ol([
        'Se revisa botón por botón, abriendo y cerrando.',
        'Se afina si hace falta. Los instrumentos se mueven con el viaje desde Alemania y con el clima.',
        'Se fotografía como queda, para que haya registro de en qué estado salió.',
        'Se empaca en su estuche, y el estuche se protege por fuera para el transporte.',
      ]),
      p('Ese proceso toma alrededor de **24 horas hábiles** desde que se confirma el pago.'),
      h2('Cuánto tarda hasta tu casa'),
      ul([
        '**Ciudades principales** (Barranquilla, Medellín, Cali, Cartagena, Bucaramanga, Valledupar…) — 48 a 72 horas hábiles.',
        '**Ciudades intermedias** — 3 a 5 días hábiles.',
        '**Municipios** — 5 a 8 días hábiles.',
        '**Zonas rurales** — 8 a 10 días hábiles.',
      ]),
      p('Los tiempos empiezan a contar desde el despacho, no desde la compra. El detalle completo está en [política de envíos](/politica-envio).'),
      h2('Cómo sigues tu pedido'),
      p('Al comprar recibes un número de pedido con el formato `VDA-…`. Con ese número:'),
      ul([
        'Consultas el estado en la página a la que vuelves después de pagar.',
        'Te llega un correo cuando registramos el pedido y otro cuando el pago queda aprobado.',
        'Nos escribes al WhatsApp **+57 314 486 5310** con ese número y sabemos de inmediato de qué compra hablas.',
      ]),
      h2('Si llega con un golpe'),
      p('Pasa poco, pero pasa. Qué hacer:'),
      ol([
        '**Grábalo mientras lo abres.** Un video del paquete cerrado y de la apertura resuelve cualquier reclamo en minutos.',
        'Escríbenos el mismo día con el número de pedido y el video o las fotos.',
        'Nosotros gestionamos con la transportadora. Tú no tienes que pelear con ellos.',
      ]),
      p('Si el daño es de transporte, se repone. No te quedas con un instrumento golpeado por algo que no hiciste.'),
      h2('¿Y si el acordeón no era el que esperaba?'),
      p('Por eso insistimos tanto en la asesoría antes de comprar. Si nos dices qué tocas, con quién y en qué tonalidad andan tus compañeros, la probabilidad de que te llegue el equivocado baja casi a cero. Las condiciones de cambio están en [términos y condiciones](/terminos-condiciones).'),
      h2('¿Prefieres verlo en persona?'),
      p('Si estás en Bogotá o vas a pasar, puedes venir al taller y probarlo antes de decidir. Escríbenos y coordinamos.'),
      faq([
        ['¿Cuánto tarda en llegar un acordeón a mi ciudad?', 'A ciudades principales, de 48 a 72 horas hábiles. A ciudades intermedias, de 3 a 5 días. A municipios, de 5 a 8 días. A zonas rurales, de 8 a 10 días. Los tiempos cuentan desde el despacho, que es unas 24 horas hábiles después de confirmar el pago.'],
        ['¿Envían acordeones a toda Colombia?', 'Sí, a todo el país, en su estuche y protegido por fuera para el transporte. Antes de empacarlo lo revisamos botón por botón, lo afinamos si hace falta y lo fotografiamos para dejar registro de cómo salió.'],
        ['¿Qué hago si el acordeón llega golpeado?', 'Grábate abriendo el paquete: un video de la caja cerrada y de la apertura resuelve el reclamo en minutos. Escríbenos el mismo día con el número de pedido y nosotros gestionamos con la transportadora. Si el daño es del transporte, se repone.'],
        ['¿Cómo sigo mi pedido?', 'Al comprar recibes un número con formato VDA-… Con ese número consultas el estado en la página a la que vuelves después de pagar, te llegan correos al registrarse el pedido y al aprobarse el pago, y te atendemos por WhatsApp de inmediato.'],
        ['¿Puedo ir a probar el acordeón antes de comprarlo?', 'Sí, si estás en Bogotá o vas a pasar. Escríbenos y coordinamos la visita al taller.'],
      ]),
    ],
    cta: {
      items: [
        { href: '/tienda', texto: 'Ver acordeones disponibles' },
        { href: WA('Hola, estoy fuera de Bogotá y quiero comprar un acordeón'), texto: 'Preguntar por mi ciudad', estilo: 'whatsapp' },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'formas-de-pago-acordeon-colombia',
    titulo: 'Cómo pagar tu acordeón: tarjeta, PSE, contra entrega y pagos por partes',
    portada_url: '/images/hero/blanco-tricolor.webp',
    lectura_min: 5,
    resumen_breve:
      'Todas las formas de pagar un acordeón en la tienda, qué conviene según el monto, y por qué los instrumentos más caros se cierran hablando con un asesor y no con un botón.',
    meta_titulo: 'Formas de Pago para Comprar un Acordeón en Colombia',
    meta_descripcion:
      'Paga tu acordeón con tarjeta, PSE, contra entrega o por partes. Qué conviene según el monto, cómo funciona el pago seguro y por qué los acordeones de más de 5 millones se cierran con asesor.',
    meta_keywords: 'pagar acordeón, formas de pago acordeón, acordeón a cuotas colombia, pse acordeón, contra entrega acordeón',
    secciones: [
      p('Comprar un acordeón es una compra grande. Estas son todas las formas de pagarlo y cuándo conviene cada una.'),
      h2('Tarjeta de crédito o débito'),
      p('El pago va por una pasarela certificada. Los datos de tu tarjeta **no pasan por nuestra tienda ni se guardan aquí**: los recibe directamente la pasarela, que es quien está autorizada para procesarlos.'),
      p('Con tarjeta de crédito puedes diferir a cuotas con tu propio banco. Las cuotas y los intereses los define tu banco, no nosotros, y los ves antes de confirmar.'),
      h2('PSE (débito desde tu banco)'),
      p('Si prefieres no usar tarjeta, PSE te lleva a la página de tu banco y el dinero sale de tu cuenta. Es la opción más común para montos altos.'),
      p('Una advertencia útil: **PSE a veces tarda en confirmar**. Si tu pedido queda "en verificación" un rato, no lo pagues otra vez. Espera y escríbenos con tu número de pedido.'),
      h2('Contra entrega'),
      p('Disponible para algunos productos y ciudades. Pagas cuando lo recibes. Escríbenos antes de comprar para confirmar si aplica a tu caso y a tu dirección.'),
      h2('Acordeones de alto valor: se cierran con asesor'),
      p('La pasarela de pagos tiene un tope por transacción de **$5.000.000**. Varios de nuestros acordeones lo superan — los personalizados y los Premium están entre $5.290.000 y $6.690.000.'),
      p('Eso **no significa que no los puedas comprar**. Significa que el pago se coordina de otra forma:'),
      ul([
        'Haces el pedido normal en la tienda y queda registrado con su número.',
        'La tienda te lleva a WhatsApp con ese número por delante.',
        'Ahí coordinamos transferencia, pago dividido en dos partes o el medio que te sirva.',
      ]),
      p('En la ficha de esos acordeones verás el botón verde de **Comprar por WhatsApp**: no es un "escríbenos si tienes dudas", es la vía de compra de ese instrumento.'),
      h2('Pagar por partes'),
      p('Para acordeones personalizados que se fabrican a medida, lo normal es dividir: una parte al confirmar el diseño y el resto antes del despacho. Se acuerda por WhatsApp antes de empezar, con fechas y montos claros.'),
      h2('Cómo saber que tu pago entró'),
      ul([
        'Te llega un correo cuando registramos el pedido, y otro cuando el pago queda aprobado.',
        'Al volver de pagar ves el estado real de tu pedido en pantalla.',
        'Con tu número `VDA-…` te atendemos por WhatsApp en cualquier momento.',
      ]),
      p('Si pagaste y algo no cuadra, escríbenos con el número de pedido. Nunca pierdas tiempo volviendo a pagar: el pedido ya quedó guardado.'),
      faq([
        ['¿Cómo puedo pagar un acordeón?', 'Con tarjeta de crédito o débito, por PSE desde tu banco, contra entrega en algunos productos y ciudades, o por transferencia coordinada con un asesor para los instrumentos de mayor valor.'],
        ['¿Puedo pagar el acordeón a cuotas?', 'Sí, con tarjeta de crédito puedes diferir a cuotas con tu propio banco. Las cuotas y los intereses los define tu banco, no nosotros, y los ves antes de confirmar el pago.'],
        ['¿Por qué algunos acordeones se compran por WhatsApp?', 'Porque la pasarela de pagos tiene un tope de $5.000.000 por transacción y varios acordeones lo superan. El pedido queda registrado igual en la tienda y el pago se coordina por WhatsApp con ese número por delante: transferencia, pago en dos partes o el medio que te sirva.'],
        ['¿Son seguros los datos de mi tarjeta?', 'Los datos de la tarjeta no pasan por nuestra tienda ni se guardan aquí. Los recibe directamente la pasarela de pagos, que es la entidad autorizada para procesarlos.'],
        ['Pagué por PSE y mi pedido sigue en verificación, ¿qué hago?', 'PSE a veces tarda en confirmar. No vuelvas a pagar: el pedido ya quedó guardado. Escríbenos con tu número VDA-… y lo revisamos.'],
      ]),
    ],
    cta: {
      items: [
        { href: '/tienda', texto: 'Ir a la tienda' },
        { href: WA('Hola, quiero saber cómo pagar un acordeón'), texto: 'Preguntar por formas de pago', estilo: 'whatsapp' },
      ],
    },
  },
]

// ── Portadas rotas: apuntaban a un proyecto de Supabase que ya no sirve (HTTP 400) ──
const PORTADAS_A_CORREGIR = {
  'la-crisis-del-acordeon-por-que-los-jovenes-ya-no-quieren-estudiarlo': '/images/personalizados/acordeon-hohner-verde-esmeralda-1.webp',
  'el-precio-de-la-pasion-desentraniando-el-valor-y-el-alma-de-los-acordeones-hohner': '/images/personalizados/acordeon-hohner-premium-nacar-botones-nacarados-1.webp',
}

async function main() {
  const ahora = new Date().toISOString()

  for (const a of ARTICULOS) {
    const fila = {
      slug: a.slug,
      titulo: a.titulo,
      autor: 'Jesús González',
      autor_id: AUTOR_ID,
      autor_iniciales: 'JG',
      fecha_publicacion: ahora,
      lectura_min: a.lectura_min,
      calificacion: 0,
      portada_url: a.portada_url,
      resumen_breve: a.resumen_breve,
      resumen_completo: a.resumen_breve,
      secciones: a.secciones,
      cta: a.cta,
      estado_publicacion: 'publicado',
      actualizado_en: ahora,
      meta_titulo: a.meta_titulo,
      meta_descripcion: a.meta_descripcion,
      meta_keywords: a.meta_keywords,
      canonical_url: `${SITIO}/blog/${a.slug}`,
      og_titulo: a.titulo,
      og_descripcion: a.resumen_breve,
      og_imagen_url: `${SITIO}${a.portada_url}`,
      twitter_card: 'summary_large_image',
    }

    const { data: existe } = await db.from('articulos_web').select('id').eq('slug', a.slug).maybeSingle()

    if (existe) {
      const { error } = await db.from('articulos_web').update(fila).eq('id', existe.id)
      console.log(error ? `✗ ${a.slug}: ${error.message}` : `↻ actualizado  ${a.slug}`)
    } else {
      const { error } = await db.from('articulos_web').insert([{ ...fila, creado_en: ahora }])
      console.log(error ? `✗ ${a.slug}: ${error.message}` : `✓ publicado    ${a.slug}`)
    }
  }

  for (const [slug, portada] of Object.entries(PORTADAS_A_CORREGIR)) {
    const { error } = await db
      .from('articulos_web')
      .update({ portada_url: portada, og_imagen_url: `${SITIO}${portada}`, actualizado_en: ahora })
      .eq('slug', slug)
    console.log(error ? `✗ portada ${slug}: ${error.message}` : `🖼  portada corregida  ${slug.slice(0, 45)}…`)
  }

  const { count } = await db.from('articulos_web').select('*', { count: 'exact', head: true }).eq('estado_publicacion', 'publicado')
  console.log(`\nArtículos publicados en total: ${count}`)
}

main()
