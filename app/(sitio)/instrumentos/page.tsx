// /instrumentos — hub: cajas vallenatas, baterías, percusión (ver src/paginas/accesorios/rutaHub.tsx)
import { crearRutaHub } from '@/paginas/accesorios/rutaHub'

const ruta = crearRutaHub('instrumentos')
export const metadata = ruta.metadata
export default ruta.Pagina
