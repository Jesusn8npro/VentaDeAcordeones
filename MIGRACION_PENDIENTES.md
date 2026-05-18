# MIGRACION_PENDIENTES.md

Pendientes / dudas transversales de Fase 1. Append-only. No borrar lo de otros.

---

## A1 — E-commerce núcleo

- **Dependencia de runtime con A10 (esperada por contrato, no bloqueante para mi entrega):**
  `PaginaTienda` importa los componentes compartidos `LayoutTienda`,
  `SidebarFiltros`, `GridProductosVendedor` (de `src/componentes/tienda` y
  `src/componentes/producto`) y `PaginaCategoria` importa `TarjetaProductoLujo`
  más el hook `src/hooks/usarProductos`. Esos archivos siguen importando
  `react-router-dom` y son propiedad EXCLUSIVA de A10. Hasta que A10 los migre a
  `@/compat/router`, las rutas `/tienda`, `/tienda/categoria/[slug]` y
  `/categoria/[slug]` fallarán en runtime fuera del catch-all (sin BrowserRouter).
  No requiere acción mía; queda como nota de coordinación.

- **Tabla `categorias` no tiene columnas SEO dedicadas** (`meta_title` /
  `meta_description` no existen; columnas reales:
  `id, nombre, slug, descripcion, icono, imagen_url, destacado, orden, activo,
  creado_el, actualizado_el, total_productos`). El `generateMetadata` de
  categoría usa `nombre` + `descripcion` + `imagen_url`, con fallback de
  descripción genérico. Si en el futuro se añaden columnas meta_*, actualizar el
  `select` de `app/(sitio)/tienda/categoria/[slug]/page.tsx` y
  `app/(sitio)/categoria/[slug]/page.tsx`.

- **Filtro `activo=true` en fetch SEO de categoría:** `PaginaCategoria` (cliente)
  ya filtra `.eq('activo', true)`; `PaginaTienda` (cliente) NO filtra por activo
  al cargar la categoría. Para coherencia SEO de páginas públicas, ambos fetch
  server usan `.eq('activo', true)` → categoría inactiva/inexistente devuelve
  `robots noindex`. El body cliente conserva su lógica original intacta.

---

## A3 — Carrito / Checkout / ePayco

- **Archivos ePayco legacy NO ruteados por App.tsx (candidatos a muerto):**
  `src/paginas/ecommerce/RespuestaEpayco.tsx` y
  `src/paginas/ecommerce/PaginaConfirmacionEpayco/PaginaConfirmacionEpayco.tsx`
  (con su `.css`) NO aparecen en `App.tsx` (las rutas activas usan
  `PaginaRespuestaEpayco/PaginaRespuestaEpayco.tsx` y
  `ecommerce/ConfirmacionEpayco.tsx`). Migré su import rrd→compat solo por
  consistencia. Verificar si tienen otros consumidores; si no, son borrables en
  Fase 2 (limpieza). No los borro yo por contrato (quirúrgico).

- **Dependencia de runtime con A10 (esperada, no bloqueante para mi entrega):**
  `PaginaCarrito` importa componentes compartidos (`ItemCarrito`,
  `FormularioEnvio`, `PasoPago` de `src/componentes/**`) y `PaginaFavoritos`
  importa `TarjetaProductoLujo`; estos siguen con `react-router-dom` hasta que
  A10 los migre. Fuera del catch-all (sin BrowserRouter) las rutas `/carrito` y
  `/favoritos` fallarán en runtime hasta entonces. Nota de coordinación.

- **Suspense alrededor de useSearchParams:** `RespuestaEpaycoCliente.tsx` y
  `ConfirmacionEpaycoCliente.tsx` envuelven el componente dinámico en
  `<Suspense>` porque los componentes ePayco usan `useSearchParams` (leen
  `x_ref_payco`, etc.); Next lo exige en prerender. El componente real solo
  cambió el import rrd→compat (la API `useSearchParams` del compat es la tupla
  rrd v6, sin cambios de lógica).
