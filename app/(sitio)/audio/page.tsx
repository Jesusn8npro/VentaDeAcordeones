// /audio — hub: grabación, micrófonos, audífonos (ver src/paginas/accesorios/rutaHub.tsx)
import { crearRutaHub } from '@/paginas/accesorios/rutaHub'

const ruta = crearRutaHub('audio')
export const metadata = ruta.metadata
export default ruta.Pagina
