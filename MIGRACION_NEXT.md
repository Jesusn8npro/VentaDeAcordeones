# MIGRACION_NEXT.md — Contrato de migración Vite → Next.js 16 (App Router)

Estado: **Fase 0 completa y verificada** (build verde, rutas 200, patrón canónico
`/producto/[slug]` con SEO server-side funcionando). Este documento es el contrato
que siguen los agentes de **Fase 1** (paralelos). Léelo COMPLETO antes de tocar nada.

---

## 0. Reglas innegociables

1. **NO romper nada.** El build (`npm run build`) debe quedar verde.
2. **NO** ejecutar `npm`, `next build`, `next dev`, `git`, ni arrancar servers. Solo
   crear/editar archivos. La verificación la hace el coordinador (yo).
3. **Quirúrgico.** Solo tu grupo de rutas. NO toques `app/layout.tsx`,
   `app/providers.tsx`, `app/ArmazonGlobal.tsx`, `app/_shell/**`, `app/[...slug]/**`,
   `app/page.tsx`, `app/(sitio)/layout.tsx`, `src/compat/**`, `next.config.mjs`,
   `tsconfig.json`, `src/configuracion/supabase*.ts`, ni carpetas de otros agentes.
4. **CSS / idioma / estructura de carpetas: IDÉNTICOS.** No reformatear, no renombrar,
   no "mejorar" estilos ni textos. Archivos más cortos solo si es trivial y seguro.
5. Pendientes transversales o dudas → escribir en `MIGRACION_PENDIENTES.md`
   (append, no borrar lo de otros). No improvises fuera de tu propiedad.

---

## 1. Arquitectura ya montada (NO la rehagas)

```
app/
  layout.tsx              ← root: <html lang=es>, SEO global (Metadata API), CSS global, scripts ePayco/anti-fraude
  page.tsx                ← home '/'  → monta ClientShell (SPA, react-router vivo)
  [...slug]/page.tsx      ← catch-all NO-opcional → ClientShell (rutas aún no migradas). CEDE ante rutas específicas.
  _shell/ClientShell.tsx  ← dynamic(ssr:false) de AppShell
  _shell/AppShell.tsx     ← réplica de src/main.tsx (BrowserRouter+ProveedorTema+ProveedorAutenticacion+App)
  providers.tsx           ← árbol global de providers (gate `montado`), 'use client'
  ArmazonGlobal.tsx       ← Header/Footer/flotantes con lógica de rutas (usePathname), 'use client'
  (sitio)/
    layout.tsx            ← envuelve TODA ruta migrada con <Providers> (= providers + armazón)
    producto/[slug]/      ← PATRÓN CANÓNICO DE REFERENCIA (ya hecho, cópialo)
      page.tsx            ← server: generateMetadata + JSON-LD
      ProductoCliente.tsx ← 'use client': dynamic(ssr:false) del body
src/compat/router.tsx     ← shim react-router-dom → next/navigation (MISMA API)
src/configuracion/supabaseServidor.ts ← cliente Supabase SOLO server (generateMetadata)
```

**Clave de routing:** el catch-all es `[...slug]` (NO `[[...slug]]`: el opcional
eclipsaba toda ruta específica). La home necesita `app/page.tsx` propio. Cada ruta
que crees en `app/(sitio)/<ruta>/page.tsx` automáticamente gana al catch-all y
recibe providers+armazón vía `app/(sitio)/layout.tsx` (no lo toques).

---

## 2. Patrón canónico (copia EXACTA de `app/(sitio)/producto/[slug]/`)

### 2a. Página pública con SEO real (producto, categoría, tienda, blog, landing)

`app/(sitio)/<ruta>/page.tsx` — **Server Component**:

```tsx
import { cache } from 'react'
import type { Metadata } from 'next'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import XCliente from './XCliente'

const SITIO = 'https://ventadeacordeones.com'

const getDato = cache(async (slug: string) => {
  const { data, error } = await supabaseServidor.from('TABLA')
    .select('campos_minimos_para_seo').eq('slug', slug).eq('activo', true).maybeSingle()
  if (error) console.error('[<ruta> SEO] Supabase:', error.message)
  return data
})

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params            // ← Next 16: params es Promise, await SIEMPRE
  const d = await getDato(slug)
  if (!d) return { title: 'No encontrado — VentaDeAcordeones.com', robots: { index: false, follow: true } }
  const canonical = `${SITIO}/<ruta>/${d.slug}`
  return {
    title: d.meta_title || `${d.nombre} — VentaDeAcordeones.com`,
    description: (d.meta_description || d.descripcion || '').slice(0, 160),
    alternates: { canonical },
    openGraph: { type:'website', url:canonical, title:..., description:..., images:[img], siteName:'VentaDeAcordeones.com', locale:'es_CO' },
    twitter: { card:'summary_large_image', title:..., description:..., images:[img] },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const d = await getDato(slug)
  const jsonLd = d ? { '@context':'https://schema.org/', '@type':'Product', /* o Article/BreadcrumbList */ } : null
  return (<>
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    <XCliente />
  </>)
}
```

`app/(sitio)/<ruta>/XCliente.tsx` — **'use client'**:

```tsx
'use client'
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'
const X = dynamic(() => import('@/paginas/<dominio>/<Pagina>/<Pagina>'),
  { ssr: false, loading: () => <CargandoPagina /> })
export default function XCliente() { return <X /> }
```

- El componente real (`src/paginas/...`) NO se reescribe: solo se le cambia el
  import de `react-router-dom` → `@/compat/router` (ver §3). Lee params vía
  `useParams()` del compat (la clave del param = el nombre de la carpeta `[slug]`).
- JSON-LD: **Product+Offer** en producto (price, priceCurrency:'COP',
  availability InStock/OutOfStock); **BreadcrumbList** en categoría/tienda;
  **Article** en blog/[slug]. Render server (rastreable). El `<head>` lo da
  `generateMetadata`. ESTO es el salto de SEO; el body sigue client-side (= SPA).

### 2b. Página tras login / sin SEO (carrito, checkout, perfil, admin, dashboards)

Igual estructura pero `generateMetadata` mínima y normalmente
`robots: { index:false, follow:false }`. Sin fetch Supabase, sin JSON-LD.
Body en `XCliente` con `dynamic(ssr:false)` igual.

---

## 3. Conversión react-router-dom → @/compat/router

En CADA archivo de tu propiedad que importe de `react-router-dom`, cambia SOLO el
import (la API es idéntica):

```diff
- import { useNavigate, useParams, useLocation, useSearchParams, Link, Navigate } from 'react-router-dom'
+ import { useNavigate, useParams, useLocation, useSearchParams, Link, Navigate } from '@/compat/router'
```

- `useNavigate()` → `navigate(to, {replace})` / `navigate(-1)` (igual).
- `useParams()` → params de la ruta Next (`app/(sitio)/x/[slug]` ⇒ `{ slug }`).
- `useSearchParams()` → `[URLSearchParams, setSearchParams]` (tupla, igual que rrd).
- `Link to=...` / `Navigate to=... replace`. `NavLink`, `Outlet` disponibles.
- **NO existen en compat:** `Routes`, `Route`, `BrowserRouter`. Desaparecen: cada
  `<Route>` se convierte en `app/(sitio)/<ruta>/page.tsx`. `<Outlet/>` → `{children}`.
- Rutas anidadas/splat (`/perfil/*`): crear `app/(sitio)/perfil/[[...sub]]/page.tsx`
  (aquí SÍ opcional catch-all interno, no choca con el de root) y dejar que el
  componente maneje sub-vistas como hoy.
- Rutas protegidas (admin): el body cliente sigue usando el guard `RutaAdmin`
  (ya importa el contexto auth). NO muevas auth a servidor. `noindex`.
- Redirects (ej. `/checkout` → `/carrito`): `app/(sitio)/checkout/page.tsx` server
  con `import { redirect } from 'next/navigation'; redirect('/carrito')`.

---

## 4. Trampas (ya resueltas en Fase 0; respétalas)

- `import.meta.env.X` → `process.env.NEXT_PUBLIC_X` (ya migrado globalmente; si
  creas código nuevo usa `process.env.NEXT_PUBLIC_*`, nunca `import.meta`).
- Specifiers de import con `.js`/`.jsx` apuntando a `.ts/.tsx` → quita la extensión.
- CSS: `prop: a !important, b !important;` es inválido (Lightning CSS lo rechaza).
  El `!important` solo va UNA vez al final. NO toques CSS salvo este caso si te lo topas.
- `window`/`localStorage`/`document` en render → SSR crash. Por eso el body va
  `ssr:false`. NO metas acceso a `window` en el `page.tsx` server.
- Imagen import estático: en Next es objeto. Si ves `import x from '...png'`
  usado como string: `const x = ((ximg as any)?.src ?? ximg) as string`.

---

## 5. MAPA DE PROPIEDAD — Fase 1 (sin solape)

Cada agente: crea SOLO sus `app/(sitio)/<ruta>/{page,XCliente}.tsx` y cambia el
import rrd→compat SOLO en sus `src/paginas/<dominio>/**`. NO toca `src/componentes/**`
ni `src/contextos/**` (los posee A10). `producto/[slug]` ya está hecho (referencia).

| # | Agente | Rutas (crea app/(sitio)/...) | src/paginas que migra (import rrd→compat) | SEO |
|---|--------|------------------------------|-------------------------------------------|-----|
| A1 | E-commerce núcleo | `/tienda`, `/tienda/categoria/[slug]`, `/categoria/[slug]` | `ecommerce/PaginaTienda`, `ecommerce/PaginaCategoria` | generateMetadata + BreadcrumbList/ItemList |
| A2 | Home & Landing | (home `/` ya existe vía app/page.tsx — A2 crea `app/(sitio)`? NO: home se queda en shell) `/landing/[slug]`, `/acordeones-personalizados` | `LandingProducto`, `AcordeonesPersonalizados/*` | Product/landing JSON-LD donde aplique |
| A3 | Carrito/Checkout/ePayco | `/carrito`, `/favoritos`, `/checkout`(redirect), `/respuesta-epayco`, `/confirmacion-epayco` | `ecommerce/PaginaCarrito`, `PaginaFavoritos`, `PaginaRespuestaEpayco`, `ConfirmacionEpayco` | metadata mínima, noindex |
| A4 | Autenticación | `/login`, `/registro`, `/perfil/[[...sub]]`, `/restablecer-contrasena`, `/sesion-cerrada` | `autenticacion/**` | login/registro indexables; perfil noindex |
| A5 | Empresa | `/contacto`, `/quienes-somos`, `/trabaja-con-nosotros`, `/sobre-la-tienda` | `empresa/**` | metadata estática SEO |
| A6 | Legal | `/terminos-condiciones`, `/politica-privacidad`, `/preguntas-frecuentes`, `/politica-envio`, `/cambios-devoluciones` | `legal/**` | metadata estática |
| A7 | Blog | `/blog`, `/blog/[slug]`, `/ayuda` | `blog/**`, `ayuda/**` | generateMetadata + Article JSON-LD en blog/[slug] |
| A8 | Admin productos/blog | `/admin`, `/admin/productos`, `/admin/gestion-productos`, `/admin/productos/agregar`, `/admin/productos/creador-pr`, `/admin/productos/editar/[slug]`, `/admin/blog`, `/admin/blog/crear`, `/admin/blog/editar/[slug]`, `/admin/categorias` | `admin/{DashboardAdmin,productos,GestionProductos,CreadorDeProductosPR,PaginaEditarProducto,Blog,Categorias}` | noindex |
| A9 | Admin operaciones | `/admin/cupones`, `/admin/pedidos`, `/admin/inventario`, `/admin/usuarios`, `/admin/imagenes-ia`, `/admin/videos`, `/admin/feed-meta`, `/admin/chats`, `/admin/calendario-tareas`, `/admin/tablero-tareas` | `admin/{ManejoCupones,Pedidos,Inventario,Usuarios,ImagenesIA,VideosIA,FeedMeta,ManejoDeChats,calendario_tareas}` | noindex |
| A10 | Compartidos + 404 | `app/not-found.tsx` (PaginaNoEncontrada) | **EXCLUSIVO**: import rrd→compat en TODO `src/componentes/**`, `src/contextos/**`, `src/hooks/**`, `src/paginas/sistema/**`. NO crea rutas (salvo not-found). | — |

> A10 es prerequisito de runtime de todos: los bodies cliente de A1–A9 usan
> componentes compartidos que aún importan `react-router-dom` y, fuera del
> catch-all (sin BrowserRouter), eso crashea. A10 toca archivos DISJUNTOS de
> A1–A9 (componentes/contextos/hooks), así que corre en paralelo sin conflicto.
> `src/paginas/ecommerce/PaginaProducto` y `…/PlantillaCatalogo` YA migrados.

---

## 6. Checklist por archivo (antes de "terminé")

- [ ] `app/(sitio)/<ruta>/page.tsx` server: `generateMetadata` con `await params`.
- [ ] Públicas SEO: fetch `supabaseServidor` + JSON-LD server. Tras login: noindex.
- [ ] `XCliente.tsx` `'use client'` con `dynamic(ssr:false, loading: CargandoPagina)`.
- [ ] El `src/paginas/...` real: solo cambió el import `react-router-dom`→`@/compat/router`. Cero cambios de lógica/CSS/texto.
- [ ] No tocaste fundación, compat, supabase*, ni carpetas ajenas.
- [ ] Nombre del param de carpeta `[slug]` = el que el componente lee con `useParams()`.
- [ ] Dudas/transversal → `MIGRACION_PENDIENTES.md`.

---

## 7. Pendiente fuera de Fase 1 (lo hace el coordinador)

- **Fase 1.5**: portar `server.js` + `api/meta/**` → Route Handlers
  `app/api/epayco/confirmar`, `app/api/epayco/validar-firma`, `app/api/meta/**`
  (paths y HMAC-SHA256 IDÉNTICOS — ePayco llama por URL registrada) +
  `instrumentation.ts` para el feed Meta cada 60 min. Commit aislado + prueba sandbox.
- **Fase 2**: borrar `App.tsx`, `main.tsx`, `index.html`, `vite.config.js`,
  `app/_shell`, `app/[...slug]`, `app/page.tsx`-shell; mover providers a layout
  raíz si procede; desinstalar Vite/react-router-dom/deps muertas
  (react-helmet-async, vite-plugin-*); `app/sitemap.ts` + `app/robots.ts`
  dinámicos; reactivar `images` optimizadas + `next/font`; nixpacks/EasyPanel.

⚠️ **No desplegar a producción hasta Fase 2** (o mínimo 1.5): `npm run build` ya
es `next build` (no genera `dist/`), y el webhook ePayco/feed Meta viven en
`server.js` hasta que se porten. `build:vite` y `start:legacy` siguen disponibles
como red de seguridad temporal.
