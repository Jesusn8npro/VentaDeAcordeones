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
