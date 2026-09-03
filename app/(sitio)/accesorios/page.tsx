// /accesorios — hub de clusters de accesorios (ver src/paginas/accesorios/rutaHub.tsx)
import { crearRutaHub } from '@/paginas/accesorios/rutaHub'

const ruta = crearRutaHub('accesorios')
export const metadata = ruta.metadata
export default ruta.Pagina
