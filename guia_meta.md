# Guía de Integración del Feed de Productos para Meta/Facebook

## Resumen
- Objetivo: generar y publicar un feed XML (RSS 2.0) con productos activos para Facebook Commerce Manager.
- URL pública del feed: `https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/feeds-meta/feed-productos.xml`
- Actualización: automática cada hora y en horarios programados, con webhook ante cambios en `productos`.

## Arquitectura
- Servidor Node (Express) expone endpoints REST bajo `/api/meta/*`.
- Servicio backend consulta Supabase (con Service Role) y genera XML.
- Archivo XML se sube al bucket público `feeds-meta` en Supabase Storage.
- Panel admin permite generar, ver y descargar el feed.

## Archivos clave
- `server.js`
  - Servidor Express, carga `.env` con `dotenv`.
  - Endpoints:
    - `GET /api/meta/feed-productos`: entrega XML generado.
    - `GET /api/meta/estado-servicio`: estado y estadísticas del feed.
    - `POST /api/meta/actualizar-feed`: fuerza generación y subida del XML.
  - Asegura existencia del bucket y arranca servicios de actualización y webhook.

- `api/meta/feed-productos.js`
  - Conecta a Supabase usando `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
  - Consulta `productos` con relaciones `categorias`, `producto_imagenes`, `producto_videos` filtrando `activo` y `stock > 0`.
  - Genera XML RSS 2.0 con namespace `g` de Google.
  - Mapeos principales:
    - `g:id`, `g:title`, `g:description`, `g:link`.
    - `g:image_link` y múltiples `g:additional_image_link`.
    - `g:price`, `g:sale_price` (si aplica), `g:availability`, `g:condition`.
    - `g:brand`, `g:mpn`, `g:product_type`.
    - `g:shipping_weight` y dimensiones si están disponibles.
    - `g:video_link` si existe video.
  - Maneja casos de arrays en relaciones y sanitiza texto para XML.

- `api/meta/actualizacion-automatica.js`
  - Configuración del servicio (frecuencia y horarios).
  - `actualizarFeed()`: genera XML y lo sube a `feeds-meta/feed-productos.xml` con `upsert`.
  - `obtenerEstadisticasFeed()`: lista archivo, obtiene URL pública y cuenta productos activos.
  - `configurarWebhookProductos()`: suscribe cambios en `productos` y actualiza tras 5s.
  - `asegurarBucketFeedsMeta()`: crea el bucket si no existe, como público.

- `src/paginas/admin/FeedMeta/PanelFeedMeta.jsx`
  - Interfaz administrativa: estado, generación manual, ver/descargar feed, instrucciones.

- `src/componentes/admin/BarraLateralAdmin/BarraLateralAdmin.jsx`
  - Añade “Feed Meta” bajo menú “Tienda”.

- `src/App.jsx`
  - Ruta protegida `/admin/feed-meta` renderiza `PanelFeedMeta` dentro de `DisposicionAdmin`.

- `package.json`
  - Scripts: `start` y `preview` usan `node server.js`.

- `nixpacks.toml`
  - `phases.start.cmd = "node server.js"`.

## Variables de entorno
Colocar en `.env` de la raíz:
```
SUPABASE_URL=https://rrmafdbxvimmvcerwguy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=... (Service Role)
VITE_SUPABASE_URL=https://rrmafdbxvimmvcerwguy.supabase.co
VITE_SUPABASE_ANON_KEY=... (Anon)
```
Más variables del proyecto (ePayco, N8N, etc.) se mantienen si son requeridas por el frontend.

## Dependencias
- `express`, `cors`, `dotenv`
Instalación:
```
npm install express cors dotenv
```

## Ejecución y pruebas
- Iniciar servidor:
```
npm start
```
- Endpoints:
```
GET  /api/meta/estado-servicio
POST /api/meta/actualizar-feed
GET  /api/meta/feed-productos
```

## Flujo automático
- Al iniciar: asegura bucket y ejecuta actualización inicial.
- Cada hora y en horarios configurados: genera y sube XML.
- Ante cambios en `productos`: el webhook dispara una actualización con pequeña espera.

## Configuración en Facebook Commerce Manager
1. Ir a “Orígenes de datos” → “Lista de datos”.
2. Elegir “Usar URL”.
3. Pegar: `https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/feeds-meta/feed-productos.xml`
4. Configurar actualización automática.

## Mapeo de datos relevante
- `productos`: `id`, `nombre`, `slug`, `descripcion`, `precio`, `precio_original`, `descuento`, `stock`, `marca`, `modelo`, `color`, `talla`, `material`, `peso`, `dimensiones`, `garantia_meses`.
- `categorias`: `nombre`.
- `producto_imagenes`: `imagen_principal`, secundarias y secciones.
- `producto_videos`: `video_producto`.

## Consideraciones y seguridad
- Service Role Key solo en backend y entornos seguros.
- Bucket `feeds-meta` público para lectura del feed; escritura desde backend con Service Role.
- Sanitización XML para caracteres especiales.

## Errores comunes (y soluciones)
- “Supabase no configurado”: faltan variables en `.env` o no se recargó el servidor.
- “column created_at does not exist”: quitar orden por `created_at` si no existe la columna.
- Alias de columnas inexistentes en relaciones: usar nombres reales (`categorias.slug` y `categorias.nombre`).

## Mantenimiento
- Ajustar frecuencia y horarios en `CONFIG` dentro de `api/meta/actualizacion-automatica.js`.
- Expandir mapeos si se agregan nuevos campos en tablas.
