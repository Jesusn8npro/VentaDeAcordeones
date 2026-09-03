// /accesorios/[cluster] — ver src/paginas/accesorios/rutaCluster.tsx
import { crearRutaCluster } from '@/paginas/accesorios/rutaCluster'

export const revalidate = 1800
const ruta = crearRutaCluster('accesorios')
export const generateStaticParams = ruta.generateStaticParams
export const generateMetadata = ruta.generateMetadata
export default ruta.Pagina
