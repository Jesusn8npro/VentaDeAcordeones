// /acordeones/[cluster] — ver src/paginas/accesorios/rutaCluster.tsx
//
// Los acordeones son el 60 % del catálogo y hasta ahora eran la única familia SIN
// página pilar: accesorios, instrumentos y audio sí la tenían. Quien buscaba
// "acordeón hohner precio colombia" aterrizaba en /tienda genérico o en una categoría
// suelta, sin una página que explicara la diferencia entre modelos.
import { crearRutaCluster } from '@/paginas/accesorios/rutaCluster'

export const revalidate = 1800
const ruta = crearRutaCluster('acordeones')
export const generateStaticParams = ruta.generateStaticParams
export const generateMetadata = ruta.generateMetadata
export default ruta.Pagina
