# Puesta en producción — VentaDeAcordeones.com

Todo lo que hay que hacer **fuera del código** para que la tienda quede publicada y cobrando.
Orden recomendado: 0 → 1 → 2 → 3 → 4. Los pasos 0, 1 y 2 son obligatorios antes de recibir el primer pago.

---

## 0. Desplegar en EasyPanel — obligatorio y es lo primero

**El sitio publicado está varios meses por detrás del repositorio.** A fecha de hoy,
`https://ventadeacordeones.com` sirve una versión anterior al relanzamiento comercial: se ve la
pantalla "Estamos renovando tu tienda de acordeones" y el título viejo. Todos los cambios están
subidos a GitHub, pero **EasyPanel no está desplegando solo**: hay que entrar y pulsar *Deploy*.

Comprueba que funcionó: el título de la pestaña debe decir *"Acordeones Hohner en Colombia"*, no
*"Acordeones y Accesorios en Colombia"*.

Sobre la pantalla de mantenimiento: la variable que la activaba (`NEXT_PUBLIC_MODO_MANTENIMIENTO`)
se quedó en `"true"` en el panel de EasyPanel, y ese valor gana al del repositorio porque las
variables `NEXT_PUBLIC_` se fijan durante la compilación. Por eso el gate ahora lee
**`NEXT_PUBLIC_MANTENIMIENTO_ACTIVO`**, un nombre que no existe en el panel: el valor antiguo ya
no puede volver a cerrar la tienda. Puedes borrar la variable vieja del panel cuando quieras.

---

## 1. Base de datos (Supabase) — ✅ HECHO el 12 de septiembre de 2026

Los dos archivos ya se ejecutaron contra tu proyecto. Verificado en la misma sesión:
trigger que protege el rol activo, 3 políticas nuevas en el carrito, 2 en pedidos, 2 en
productos, 6 en reseñas, los 4 buckets con límite de tamaño, y **tu usuario sigue siendo
administrador**. Si algún día necesitas repetirlo, es idempotente.

### Detalle original

Abre **Supabase → SQL Editor** y ejecuta **dos archivos**, en este orden. Los dos se
pueden ejecutar varias veces sin problema.

1. [`SQL_Para_SUPABASE/2026-09-11_blindaje_lanzamiento.sql`](SQL_Para_SUPABASE/2026-09-11_blindaje_lanzamiento.sql) — el blindaje.
2. [`SQL_Para_SUPABASE/2026-09-11_resenas_verificadas.sql`](SQL_Para_SUPABASE/2026-09-11_resenas_verificadas.sql) — las reseñas de clientes.
   Crea la tabla, comprueba sola que quien opina compró de verdad, y deja cada reseña
   pendiente de que tú la apruebes. Sin este archivo, la sección de reseñas simplemente
   no aparece y el resto del sitio funciona igual.

Qué arregla:

| Problema | Efecto si no se corrige |
|---|---|
| La política de `usuarios` dejaba cambiar la columna `rol` | Cualquier persona registrada se hacía administrador |
| La política de `carrito` no filtraba por sesión | Un visitante anónimo podía leer y vaciar el carrito de los demás |
| `pedidos` y `productos` abiertos a escritura | Un cliente podía editar precios o marcar su pedido como pagado |
| `leadschat` legible por cualquier autenticado | Los datos de contacto de tus clientes quedaban expuestos |
| Sin políticas de Storage | Cualquiera podía subir archivos a tus buckets |

Al final del script hay consultas de verificación. **Revisa la última**: tiene que devolver
al menos un usuario con `rol = 'admin'` (el tuyo). Si sale vacía, ejecútalo:

```sql
update public.usuarios set rol = 'admin' where email = 'acordeon91@gmail.com';
```

---

## 2. Variables de entorno en EasyPanel — obligatorio

Pega **las 21 variables** del `.env` local (ya están todas puestas y verificadas el
12 de septiembre de 2026). Las que antes faltaban y hoy ya están:

| Variable | Valor | Para qué |
|---|---|---|
| `EPAYCO_CUST_ID` | `37257` | Validar la firma de cada confirmación de pago |
| `ADMIN_API_KEY` | (ya generada en el `.env`) | Cierra `/api/meta/actualizar-feed`, que si falta queda abierto |
| `RESEND_API_KEY` | (cuenta nueva `jesusgonzalezoficial2@gmail.com`) | Correos |

Comprueba que estas ya están (son las que mueven el dinero):

- `SUPABASE_SERVICE_ROLE_KEY` — sin ella no se pueden crear pedidos ni confirmar pagos.
- `EPAYCO_PRIVATE_KEY` — abre la sesión de pago.
- `RESEND_API_KEY` — correos de confirmación.

### `EPAYCO_P_KEY` — la única que falta, y no bloquea las ventas

El **P_KEY** del panel de ePayco es **distinto** del PRIVATE_KEY y es el que se usa para
firmar cada confirmación. Hasta ahora no estaba puesto en ningún sitio (el `.env` tenía un
texto de relleno), así que ninguna firma cuadraba y **ningún pedido llegaba a marcarse como
pagado**. Eso ya está resuelto sin el P_KEY: cuando la firma no cuadra, el servidor le
pregunta a la API pública de validación de ePayco qué pasó de verdad con esa transacción, y
además el cliente dispara esa misma verificación al volver de pagar (`/api/epayco/verificar`).

Aun así, **ponlo cuando puedas** (Panel ePayco → Configuración → Llaves → P_KEY) como
`EPAYCO_P_KEY` en EasyPanel: es una comprobación más y evita una llamada extra a ePayco en
cada cobro.

`nixpacks.toml` ya trae `NEXT_PUBLIC_MANTENIMIENTO_ACTIVO = "false"`: al desplegar, el sitio
queda abierto al público. Si quieres volver a cerrarlo, cámbialo a `"true"` y vuelve a desplegar.

---

## 3. Panel de ePayco — obligatorio

En la configuración del comercio, la **URL de confirmación** debe quedar así:

```
https://ventadeacordeones.com/api/epayco/confirmar
```

Antes apuntaba a `/confirmacion-epayco`, que es una página del sitio, no un servicio: ePayco
enviaba ahí la confirmación desde sus servidores y **no se ejecutaba nada**, así que ningún
pedido llegaba a marcarse como pagado.

La **URL de respuesta** (a donde vuelve el cliente) se queda igual:
`https://ventadeacordeones.com/respuesta-epayco`.

Cómo comprobarlo: haz una compra real barata. El pedido debe quedar en `pagado` en la tabla
`pedidos` y aparecer una fila en `transacciones_epayco_logs`. Si el monto no coincidiera con
el del pedido, el sistema lo deja en estado `revision` en vez de darlo por bueno.

---

## 4. Google — cuando el sitio ya esté publicado

1. **Search Console**: añade la propiedad y envía `https://ventadeacordeones.com/sitemap.xml`.
   El sitemap ya no contiene URLs rotas.
2. **Prueba de resultados enriquecidos** (`search.google.com/test/rich-results`): comprueba una
   ficha de producto, `/preguntas-frecuentes` y `/taller`. Deben salir Product, FAQPage y Service.
3. **Perfil de Empresa en Google**: créalo para el taller de Bogotá. Es lo que más mueve la aguja
   para "taller de acordeones Bogotá", y el sitio ya declara la ficha de negocio con teléfono,
   dirección y horario que debe coincidir con la del perfil.
4. Pide reseñas reales a clientes. La ficha de producto ya no muestra valoraciones hasta que
   existan de verdad, así que cada reseña que entre se verá de inmediato.

---

## Comprobación rápida tras desplegar

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://ventadeacordeones.com/
curl -s -o /dev/null -w "%{http_code}\n" https://ventadeacordeones.com/producto/no-existe
curl -s https://ventadeacordeones.com/robots.txt
```

La primera debe dar `200`, la segunda `404` (no `200`), y la tercera debe listar el sitemap.

---

## Qué quedó pendiente y depende de ti

- **Precios**: revisar los productos importados de Miche y la cinta para fuelles ($60.000 es orientativo).
- **Fechas del negocio**: la portada dice "oficio desde 1998" y la página de quiénes somos "tienda
  online desde 2014". La franja de cifras anuncia 27 años de oficio, 3.400 instrumentos entregados
  y 42 países atendidos. Dime cuáles son ciertos.
- **Descuento automático**: el carrito rebaja un 10% en compras sobre $100.000. Ya aparece con su
  nombre en el resumen, pero no se anuncia en ninguna parte del sitio. O se promociona, o se quita.
- **Testimonios**: sustituir los textos genéricos por frases reales de clientes y poner el enlace
  real de Google Maps.
- **Un producto sin foto**: `acorde-n-hohner-corona-ii-gcf` (Corona II GCF).

---

## Lo que descubrimos vendiendo (12 sep 2026)

**ePayco no cobra más de $5.000.000 por transacción.** Lo dice su propia respuesta al
intentarlo. Tienes **25 productos activos por encima de ese límite**, incluidos casi todos
los acordeones Hohner. Mientras no te suban el límite, esos pedidos quedan reservados con
su número y el cliente pasa a WhatsApp para cerrarlos: la tienda ya lo hace sola. Pídele
a ePayco que amplíe el límite del comercio.

**Tus fotos de catálogo son pequeñas.** Miden entre 149 y 341 píxeles de ancho en
Supabase, y en un teléfono moderno se muestran a 145 puntos con doble o triple densidad:
se ven borrosas y no hay forma de arreglarlo desde el código, porque ampliar una foto
pequeña no añade detalle. Vale la pena volver a subir los recortes a unos 700 píxeles
desde los originales que tienes en el disco.

**El descuento automático del 10%** en compras sobre $100.000 regala $598.390 en un
carrito de $5.983.900 y no se anuncia en ninguna parte. Ya aparece con su nombre en el
resumen, pero sigue siendo dinero que sale sin promocionarlo. O se promociona, o se quita.
