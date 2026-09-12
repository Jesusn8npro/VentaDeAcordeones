// /acordeones — hub de la familia principal (ver src/paginas/accesorios/rutaHub.tsx)
//
// Es el 60 % del catálogo y era la única familia sin página madre: quien buscaba
// "acordeón hohner precio colombia" no tenía dónde aterrizar salvo /tienda genérico.
import { crearRutaHub } from '@/paginas/accesorios/rutaHub'

const ruta = crearRutaHub('acordeones')
export const metadata = ruta.metadata
export default ruta.Pagina
