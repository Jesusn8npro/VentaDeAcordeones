// Datos de /guia-tonalidades. Viven aparte porque page.tsx (server) los necesita para el
// JSON-LD de FAQPage y el componente (client) para pintarlos: una sola fuente de verdad.
//
// REGLA DE CONTENIDO: aquí no se inventan datos históricos ni se le atribuye una tonalidad a
// ningún artista. Sólo entra lo que se puede sostener: teoría del acordeón diatónico
// (las filas van en cuartas, el instrumento es bisonoro) y lo que la tienda sí sabe de su
// inventario — GCF y ADG de fábrica, FBbEb y Do/Fa/Sib por encargo (ver encabezadoDatos.ts).

export interface Tonalidad {
  id: string
  sigla: string          // como se escribe en el catálogo (GCF, ADG…)
  apodo?: string         // como se dice en la tienda
  notas: string          // en cifrado latino
  // /tienda?q=… con el mismo query param del mega menú (leerFiltrosDeURL lee `q`).
  // Ojo: hoy sólo GCF y ADG devuelven productos; las de encargo no están publicadas, así que
  // la página manda esas a WhatsApp en vez de a una búsqueda vacía (ver accionDe en el componente).
  href: string
  disponibilidad: 'De fábrica' | 'Por encargo'
  resumen: string
  relacion: string       // relación honesta con GCF, que es la referencia del vallenato
  paraQuien: string[]
  destacada?: boolean
}

// Las cuatro que maneja la tienda, en el orden en que conviene leerlas: primero lo que hay.
export const TONALIDADES: Tonalidad[] = [
  {
    id: 'gcf',
    sigla: 'GCF',
    apodo: '5 letras',
    notas: 'Sol · Do · Fa',
    href: '/tienda?q=GCF',
    disponibilidad: 'De fábrica',
    resumen:
      'Es la tonalidad estándar del vallenato y la que casi todo el mundo tiene en la mano. Los métodos, los tutoriales y las academias trabajan en ella, así que todo lo que aprendas va a estar escrito para este acordeón.',
    relacion: 'Es la referencia. Las otras tres se explican en relación con ella.',
    paraQuien: [
      'Tu primer acordeón',
      'Estudiar con maestro o por YouTube',
      'Tocar con otros acordeoneros sin preguntar nada',
    ],
    destacada: true,
  },
  {
    id: 'adg',
    sigla: 'ADG',
    notas: 'La · Re · Sol',
    href: '/tienda?q=ADG',
    disponibilidad: 'De fábrica',
    resumen:
      'La misma digitación del GCF, pero todo suena un tono más arriba. Comparte la escala de Sol con el GCF, así que hay repertorio que se pasa de una a otra sin pelear.',
    relacion: 'Un tono por encima del GCF (Sol→La, Do→Re, Fa→Sol). Comparte la fila de Sol.',
    paraQuien: [
      'Cantantes a los que el GCF les queda bajo',
      'Segundo acordeón del conjunto',
      'Quien ya sabe tocar y quiere otro registro',
    ],
  },
  {
    id: 'fbbeb',
    sigla: 'FBbEb',
    notas: 'Fa · Sib · Mib',
    href: '/tienda?q=FBbEb',
    disponibilidad: 'Por encargo',
    resumen:
      'Un tono por debajo del GCF. Comparte con él la escala de Fa. Es la salida natural cuando las canciones en GCF le quedan altas al que canta y toca forzado el agudo.',
    relacion: 'Un tono por debajo del GCF (Sol→Fa, Do→Sib, Fa→Mib). Comparte la fila de Fa.',
    paraQuien: [
      'Acompañar voces que no alcanzan el agudo',
      'Repertorio específico que ya viene en esas escalas',
      'Acordeonero con criterio que sabe por qué la pide',
    ],
  },
  {
    id: 'cfbb',
    sigla: 'Do/Fa/Sib',
    apodo: 'CFBb',
    notas: 'Do · Fa · Sib',
    href: '/tienda?q=Do%20Fa%20Sib',
    disponibilidad: 'Por encargo',
    resumen:
      'Comparte dos de sus tres escalas con el GCF (Do y Fa) y cambia la tercera por Sib. Para quien viene del GCF es la que menos desorienta: dos filas de cada tres le suenan conocidas.',
    relacion: 'Comparte dos escalas con el GCF (Do y Fa). Sólo cambia Sol por Sib.',
    paraQuien: [
      'Tocar con vientos y metales (Sib y Mib son su terreno)',
      'Quien ya tiene GCF y quiere ampliar sin empezar de cero',
      'Encargos y proyectos con arreglos escritos',
    ],
  },
]

export const FAQ_TONALIDADES: { p: string; r: string }[] = [
  {
    p: '¿Qué tonalidad de acordeón debo comprar si estoy empezando?',
    r: 'GCF (Sol, Do, Fa). Es la tonalidad estándar del vallenato: los métodos, los tutoriales y las clases están hechos para ella, la consigues de fábrica sin esperar un encargo y es la que más fácil se revende el día que quieras cambiar de instrumento. La única razón para no comprar GCF de entrada es que tu maestro toque en otra tonalidad: en ese caso cómprate la de él, porque van a tocar juntos todos los días.',
  },
  {
    p: '¿Cuál es la diferencia entre un acordeón GCF y uno ADG?',
    r: 'La digitación es exactamente la misma; lo que cambia es la altura. El ADG (La, Re, Sol) suena un tono por encima del GCF (Sol, Do, Fa): tocas igual y la canción sale un tono más arriba. Comparten la escala de Sol, así que parte del repertorio se pasa de uno a otro sin volver a aprenderlo. Ambos los tenemos de fábrica.',
  },
  {
    p: '¿Puedo tocar cualquier canción con un acordeón GCF?',
    r: 'No, y eso no es un defecto: es cómo funciona el acordeón diatónico. Cada acordeón está amarrado a las tres escalas de sus filas (en el GCF: Sol, Do y Fa), más sus relativas menores y algunos semitonos que se sacan cruzando filas. Si una canción está en una tonalidad que el acordeón no tiene, no se transporta con un botón: se cambia de acordeón o se cambia la canción de tono.',
  },
  {
    p: '¿Qué tonalidad me sirve para acompañar a un cantante?',
    r: 'La que le quede cómoda a su voz, no la que esté de moda. Que el cantante te haga el coro de tres canciones del repertorio sin acompañamiento y fíjate dónde se le va el aire. Si en GCF se ahoga en las notas altas, prueba un tono abajo (FBbEb). Si suena flojo y sin cuerpo porque le queda bajo, prueba un tono arriba (ADG). Si quieres, lo probamos contigo por WhatsApp antes de que compres nada.',
  },
  {
    p: '¿Se le puede cambiar la tonalidad a un acordeón que ya tengo?',
    r: 'Técnicamente sí: se cambian los pitos (las voces) y se reafina todo el instrumento. Es un trabajo mayor de taller, no un ajuste, y hay que revisar el acordeón antes de decir si vale la pena frente a comprarlo ya en la tonalidad correcta. Escríbenos con el modelo y unas fotos y te decimos con franqueza qué conviene.',
  },
  {
    p: '¿Qué tonalidades tienen disponibles y cuáles son por encargo?',
    r: 'GCF (Sol, Do, Fa) y ADG (La, Re, Sol) las manejamos de fábrica, así que salen del inventario. FBbEb (Fa, Sib, Mib) y Do/Fa/Sib se consiguen por encargo: escríbenos por WhatsApp con el modelo que quieres y te confirmamos el tiempo real antes de que pagues nada.',
  },
  {
    p: '¿La tonalidad cambia el precio o la calidad del acordeón?',
    r: 'No. Un Hohner Corona III en GCF y el mismo modelo en ADG son el mismo instrumento con otro juego de voces: misma construcción, mismos materiales, misma garantía. Lo que sí puede cambiar el precio es la disponibilidad, porque una tonalidad por encargo implica traerla.',
  },
]
