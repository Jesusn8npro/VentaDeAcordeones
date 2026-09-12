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

## 1. Base de datos (Supabase) — obligatorio

Abre **Supabase → SQL Editor**, pega el contenido de
[`SQL_Para_SUPABASE/2026-09-11_blindaje_lanzamiento.sql`](SQL_Para_SUPABASE/2026-09-11_blindaje_lanzamiento.sql)
y pulsa *Run*. Se puede ejecutar varias veces sin problema.

Qué arregla:

| Problema | Efecto si no se corrige |
|---|---|
| La política de `usuarios` dejaba cambiar la columna `rol` | Cualquier persona registrada se hacía administrador |
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

Añade estas dos, que hoy **no existen**:

| Variable | Valor | Para qué |
|---|---|---|
| `EPAYCO_CUST_ID` | Tu `p_cust_id_cliente` del panel de ePayco | Validar la firma de cada confirmación de pago |
| `ADMIN_API_KEY` | Una cadena larga y aleatoria | Cierra `/api/meta/actualizar-feed`, que hoy queda abierto si falta |

Comprueba que estas ya están (son las que mueven el dinero):

- `SUPABASE_SERVICE_ROLE_KEY` — sin ella no se pueden crear pedidos ni confirmar pagos.
- `EPAYCO_P_KEY` (o `EPAYCO_PRIVATE_KEY`) — sin ella no se valida ninguna firma.
- `RESEND_API_KEY` — correos de confirmación.

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
