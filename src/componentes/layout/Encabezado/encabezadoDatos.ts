export const ENLACES_NAV = [
  { id: 'acordeones',      etiqueta: 'Acordeones',     insignia: 'PRINCIPAL' },
  { id: 'personalizados',  etiqueta: 'Personalizados', insignia: 'HOT' },
  { id: 'accesorios',      etiqueta: 'Accesorios',     insignia: null },
  { id: 'repuestos',       etiqueta: 'Repuestos',       insignia: null },
  { id: 'taller',          etiqueta: 'Taller',          insignia: null },
  { id: 'otros',           etiqueta: 'Otros',            insignia: null },
  { id: 'cursos',          etiqueta: 'Cursos',           insignia: 'NEW' },
]

export const CATEGORIAS_DD = [
  { id: 'todos',           etiqueta: 'Todas las categorías', conteo: '500+', grupo: 'todos' },
  { id: 'acordeones',      etiqueta: 'Acordeones Nuevos',     conteo: '34',   grupo: 'acc' },
  { id: 'personalizados',  etiqueta: 'Personalizados',        conteo: '12',   grupo: 'acc' },
  { id: 'parrillas',       etiqueta: 'Parrillas',             conteo: '24',   grupo: 'accesorio' },
  { id: 'correas',         etiqueta: 'Correas',               conteo: '38',   grupo: 'accesorio' },
  { id: 'fuelles',         etiqueta: 'Fuelles',               conteo: '12',   grupo: 'accesorio' },
  { id: 'estuches',        etiqueta: 'Estuches',              conteo: '18',   grupo: 'accesorio' },
  { id: 'broches',         etiqueta: 'Broches',               conteo: '15',   grupo: 'accesorio' },
  { id: 'lenguetas',       etiqueta: 'Lengüetas',             conteo: '48',   grupo: 'tecnico' },
  { id: 'resortes',        etiqueta: 'Resortes',              conteo: '32',   grupo: 'tecnico' },
  { id: 'celuloide',       etiqueta: 'Celuloide',             conteo: '22',   grupo: 'tecnico' },
  { id: 'herramientas',    etiqueta: 'Herramientas',          conteo: '28',   grupo: 'tecnico' },
  { id: 'pianos',          etiqueta: 'Pianos y Teclados',     conteo: '32',   grupo: 'otros' },
  { id: 'guitarras',       etiqueta: 'Guitarras',             conteo: '48',   grupo: 'otros' },
  { id: 'bajos',           etiqueta: 'Bajos Eléctricos',      conteo: '24',   grupo: 'otros' },
  { id: 'baterias',        etiqueta: 'Baterías',              conteo: '18',   grupo: 'otros' },
  { id: 'electronica',     etiqueta: 'Sonido y Electrónica',  conteo: '120+', grupo: 'otros' },
  { id: 'cursos',          etiqueta: 'Cursos Online',         conteo: '12',   grupo: 'extra' },
]

export const TENDENCIAS_BUSQUEDA = [
  { texto: 'Hohner Rey Vallenato',          meta: '2.3k búsquedas', ruta: '/tienda' },
  { texto: 'Acordeón nácar personalizado',  meta: 'En tendencia',   ruta: '/acordeones-personalizados' },
  { texto: 'Guitarra eléctrica',            meta: 'Más vendido',    ruta: '/tienda' },
  { texto: 'Correa de cuero vallenato',     meta: 'Recomendado',    ruta: '/tienda' },
  { texto: 'Estuche rígido acordeón',       meta: 'Disponible',     ruta: '/tienda' },
]

export const ENLACES_UTIL = [
  { id: 'mayoristas', etiqueta: 'Mayoristas',     ruta: '/contacto' },
  { id: 'sobre',      etiqueta: 'Sobre Nosotros', ruta: '/quienes-somos' },
  { id: 'soporte',    etiqueta: 'Soporte 24/7',   ruta: '/preguntas-frecuentes' },
  { id: 'promos',     etiqueta: 'Promociones',    ruta: '/tienda' },
]

export function mapearRuta(id: string): string {
  const mapa: Record<string, string> = {
    acordeones:     '/tienda',
    personalizados: '/acordeones-personalizados',
    accesorios:     '/tienda',
    repuestos:      '/tienda',
    taller:         '/quienes-somos',
    otros:          '/tienda',
    cursos:         '/tienda',
    todos:          '/tienda',
    parrillas:      '/tienda',
    correas:        '/tienda',
    fuelles:        '/tienda',
    estuches:       '/tienda',
    broches:        '/tienda',
    lenguetas:      '/tienda',
    resortes:       '/tienda',
    celuloide:      '/tienda',
    herramientas:   '/tienda',
    pianos:         '/tienda',
    guitarras:      '/tienda',
    bajos:          '/tienda',
    baterias:       '/tienda',
    electronica:    '/tienda',
  }
  return mapa[id] ?? '/tienda'
}
