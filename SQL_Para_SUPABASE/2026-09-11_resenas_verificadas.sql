-- ============================================================================
-- RESEÑAS VERIFICADAS DE PRODUCTO — VentaDeAcordeones.com · 11 sep 2026
--
-- Cómo ejecutarlo: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: se puede correr varias veces sin romper nada.
-- Al final hay un bloque de VERIFICACIÓN que muestra cómo quedó todo.
--
-- POR QUÉ existe este archivo:
--   La ficha de producto mostraba "4.9 ★ · 247 reseñas" firmadas por gente que
--   no existe. Eso es publicidad engañosa, y Google lo trata como spam de datos
--   estructurados (reseñas autogeneradas → pérdida de las estrellas en los
--   resultados, y en casos graves acción manual sobre el dominio).
--   Se borraron todas. Esta tabla es el reemplazo honesto: SOLO puede opinar
--   quien realmente compró, y la reseña no se publica hasta que el admin la
--   aprueba. Con eso las estrellas del JSON-LD vuelven a ser legítimas.
--
-- REGLA DE ORO: nada de lo que escriba el navegador decide si una reseña es
-- "verificada" o "aprobada". Lo decide la base de datos (trigger) mirando los
-- pedidos PAGADOS de esa persona.
-- ============================================================================

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLA
--    `nombre_autor` / `ciudad` van desnormalizados a propósito: la lista de
--    reseñas es PÚBLICA y no queremos que leerla obligue a exponer la tabla
--    `usuarios` (email, teléfono, rol) ni a inventarse una política de lectura
--    sobre datos personales. Se guarda solo lo que se va a pintar.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.resenas_productos (
  id             uuid primary key default gen_random_uuid(),
  producto_id    uuid not null references public.productos(id) on delete cascade,
  usuario_id     uuid not null references auth.users(id) on delete cascade,
  -- Pedido que da derecho a opinar. `on delete set null` para no perder la
  -- reseña si algún día se depura el histórico de pedidos.
  pedido_id      uuid,
  calificacion   smallint not null check (calificacion between 1 and 5),
  titulo         text,
  comentario     text not null,
  nombre_autor   text not null,
  ciudad         text,
  -- verificada = hay un pedido pagado con ese producto a nombre de quien opina.
  verificada     boolean not null default false,
  -- aprobada = el admin la revisó y la publicó. Mientras sea false NO se ve.
  aprobada       boolean not null default false,
  -- Respuesta pública de la tienda a una reseña (opcional, la escribe el admin).
  respuesta_tienda text,
  creado_el      timestamptz not null default now(),
  actualizado_el timestamptz not null default now(),
  moderado_el    timestamptz
);

-- Longitudes: el endpoint ya recorta, pero si alguien escribe directo contra
-- PostgREST con la anon key, el límite lo pone igualmente la BD.
do $$
begin
  alter table public.resenas_productos
    add constraint resenas_comentario_largo check (char_length(comentario) between 10 and 1500);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.resenas_productos
    add constraint resenas_titulo_largo check (titulo is null or char_length(titulo) <= 120);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.resenas_productos
    add constraint resenas_nombre_largo check (char_length(nombre_autor) between 2 and 60);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.resenas_productos
    add constraint resenas_ciudad_largo check (ciudad is null or char_length(ciudad) <= 80);
exception when duplicate_object then null;
end $$;

-- Una reseña por persona y producto: evita que la misma compra genere diez
-- opiniones de cinco estrellas.
create unique index if not exists idx_resenas_unica_por_usuario
  on public.resenas_productos (producto_id, usuario_id);

-- La consulta que corre en cada ficha: aprobadas de un producto, recientes primero.
create index if not exists idx_resenas_producto_aprobada
  on public.resenas_productos (producto_id, aprobada, creado_el desc);

-- Cola de moderación del admin.
create index if not exists idx_resenas_pendientes
  on public.resenas_productos (creado_el desc) where aprobada = false;

create index if not exists idx_resenas_usuario
  on public.resenas_productos (usuario_id);

-- FK hacia pedidos solo si `pedidos.id` es uuid (lo es hoy). Va en un bloque
-- aparte para que un tipo distinto no tumbe todo el script.
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'pedidos'
       and column_name = 'id' and data_type = 'uuid'
  ) and not exists (
    select 1 from pg_constraint where conname = 'resenas_pedido_fk'
  ) then
    alter table public.resenas_productos
      add constraint resenas_pedido_fk
      foreign key (pedido_id) references public.pedidos(id) on delete set null;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ¿ESTA PERSONA COMPRÓ ESTE PRODUCTO?
--    `pedidos.productos` es un jsonb con las líneas del pedido
--    ([{producto_id, nombre, cantidad, precio…}]). Se recorre el array en vez
--    de usar `@>` porque las líneas antiguas traen la clave `id` y las nuevas
--    `producto_id`: así valen las dos.
--
--    security definer porque `pedidos` tiene RLS y el cliente no puede leer
--    otros pedidos; esta función solo devuelve true/false, nunca datos.
--    También cuenta el pedido hecho como invitado con el mismo email
--    verificado de la cuenta: es la misma persona y la misma compra real.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.usuario_compro_producto(p_usuario uuid, p_producto uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.pedidos pe
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(to_jsonb(pe.productos)) = 'array'
             then to_jsonb(pe.productos)
             else '[]'::jsonb end
      ) as linea
     where lower(coalesce(pe.estado, '')) = 'pagado'
       and (
         pe.usuario_id = p_usuario
         or lower(coalesce(pe.email_cliente, '')) = (
              select lower(coalesce(u.email, '')) from auth.users u where u.id = p_usuario
            )
       )
       and coalesce(linea ->> 'producto_id', linea ->> 'id') = p_producto::text
  );
$$;

revoke all on function public.usuario_compro_producto(uuid, uuid) from public;
grant execute on function public.usuario_compro_producto(uuid, uuid) to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. BLINDAJE EN ESCRITURA (trigger)
--    Aunque la política de RLS ya lo exige, el trigger vuelve a calcular
--    `verificada` y fuerza `aprobada = false`: si mañana alguien afloja una
--    política, sigue sin poder autopublicarse una reseña de 5 estrellas.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.blindar_resena()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  es_admin boolean := false;
  es_servicio boolean := false;
  claims text;
begin
  begin
    claims := current_setting('request.jwt.claims', true);
    es_servicio := coalesce(claims::jsonb ->> 'role', '') = 'service_role';
  exception when others then
    es_servicio := false;
  end;
  es_servicio := es_servicio or current_user in ('postgres', 'supabase_admin', 'service_role');

  select exists (
    select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'
  ) into es_admin;

  if tg_op = 'INSERT' then
    -- La reseña es de quien la escribe, no de quien diga el JSON.
    if not (es_servicio or es_admin) then
      new.usuario_id := coalesce(auth.uid(), new.usuario_id);
      new.aprobada := false;          -- se publica cuando el admin la revisa
      new.respuesta_tienda := null;   -- la respuesta de la tienda es del admin
    end if;
    -- El sello "Compra verificada" lo pone la BD mirando los pedidos pagados.
    new.verificada := public.usuario_compro_producto(new.usuario_id, new.producto_id);
    new.creado_el := now();
    new.actualizado_el := now();
    return new;
  end if;

  -- UPDATE: si el cliente edita el contenido, vuelve a la cola de moderación.
  if not (es_servicio or es_admin) then
    new.verificada := old.verificada;
    new.respuesta_tienda := old.respuesta_tienda;
    if new.calificacion is distinct from old.calificacion
       or new.comentario is distinct from old.comentario
       or new.titulo is distinct from old.titulo then
      new.aprobada := false;
    else
      new.aprobada := old.aprobada;
    end if;
  end if;

  if new.aprobada is distinct from old.aprobada then
    new.moderado_el := now();
  end if;
  new.actualizado_el := now();
  return new;
end;
$$;

drop trigger if exists trg_blindar_resena on public.resenas_productos;
create trigger trg_blindar_resena
  before insert or update on public.resenas_productos
  for each row execute function public.blindar_resena();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CONTADORES DEL PRODUCTO SIEMPRE REALES
--    `productos.calificacion_promedio` y `productos.total_resenas` ya se leen
--    en la ficha, en las tarjetas del catálogo y en el JSON-LD. Se recalculan
--    solos a partir de las reseñas APROBADAS: nadie los escribe a mano, así que
--    no pueden volver a decir "4.9 de 247" sin que existan esas 247.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.sincronizar_resumen_resenas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  objetivo uuid := coalesce(new.producto_id, old.producto_id);
begin
  update public.productos p
     set calificacion_promedio = coalesce(r.media, 0),
         total_resenas = coalesce(r.total, 0)
    from (
      select round(avg(calificacion)::numeric, 2) as media, count(*)::int as total
        from public.resenas_productos
       where producto_id = objetivo and aprobada = true
    ) r
   where p.id = objetivo;
  return null;
end;
$$;

drop trigger if exists trg_sincronizar_resumen_resenas on public.resenas_productos;
create trigger trg_sincronizar_resumen_resenas
  after insert or update or delete on public.resenas_productos
  for each row execute function public.sincronizar_resumen_resenas();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS
--    Leer lo aprobado: cualquiera (la ficha es pública).
--    Escribir: solo un autenticado que compró ese producto.
--    Moderar (aprobar, responder, borrar lo que sea): solo admin.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.resenas_productos enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'resenas_productos'
  loop
    execute format('drop policy if exists %I on public.resenas_productos', pol.policyname);
  end loop;
end $$;

-- a) Lectura pública: SOLO las aprobadas.
create policy resenas_lectura_publica on public.resenas_productos
  for select to anon, authenticated
  using (aprobada = true);

-- b) Cada quien ve la suya aunque siga pendiente (para saber que se envió).
create policy resenas_lectura_propia on public.resenas_productos
  for select to authenticated
  using (usuario_id = auth.uid());

-- c) Escribir exige compra pagada de ESE producto. Sin pedido → sin reseña.
create policy resenas_insert_comprador on public.resenas_productos
  for insert to authenticated
  with check (
    usuario_id = auth.uid()
    and public.usuario_compro_producto(auth.uid(), producto_id)
  );

-- d) Corregir la propia reseña (el trigger la devuelve a moderación).
create policy resenas_update_propia on public.resenas_productos
  for update to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- e) Retirar la propia reseña.
create policy resenas_delete_propia on public.resenas_productos
  for delete to authenticated
  using (usuario_id = auth.uid());

-- f) Moderación: el admin hace lo que necesite.
create policy resenas_admin_todo on public.resenas_productos
  for all to authenticated
  using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'))
  with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'));

commit;

-- ============================================================================
-- VERIFICACIÓN — ejecuta esto después y revisa la salida
-- ============================================================================

-- a) La tabla existe y tiene RLS activo (rls_activo debe ser true)
select relname as tabla, relrowsecurity as rls_activo
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relname = 'resenas_productos';

-- b) Políticas creadas (deben salir las 6: lectura_publica, lectura_propia,
--    insert_comprador, update_propia, delete_propia, admin_todo)
select policyname as politica, cmd as operacion, roles
  from pg_policies
 where schemaname = 'public' and tablename = 'resenas_productos'
 order by policyname;

-- c) Índices
select indexname as indice
  from pg_indexes
 where schemaname = 'public' and tablename = 'resenas_productos'
 order by indexname;

-- d) Triggers (deben estar los dos: blindaje y sincronización de contadores)
select tgname as trigger, tgenabled as estado
  from pg_trigger
 where tgrelid = 'public.resenas_productos'::regclass and not tgisinternal;

-- e) Prueba de la verificación de compra. Cambia los dos uuid por uno de tus
--    usuarios y un producto que ESE usuario haya pagado: debe devolver true.
--    Con un producto que no compró, false.
-- select public.usuario_compro_producto('UUID-DEL-USUARIO', 'UUID-DEL-PRODUCTO');

-- f) Quién tiene derecho a opinar hoy (clientes con pedidos pagados). Si sale
--    vacío, todavía no hay ninguna compra pagada y por eso no habrá reseñas.
select pe.id as pedido,
       pe.numero_pedido,
       pe.usuario_id,
       pe.email_cliente,
       coalesce(linea ->> 'producto_id', linea ->> 'id') as producto_id,
       linea ->> 'nombre' as producto
  from public.pedidos pe
  cross join lateral jsonb_array_elements(
    case when jsonb_typeof(to_jsonb(pe.productos)) = 'array'
         then to_jsonb(pe.productos) else '[]'::jsonb end
  ) as linea
 where lower(coalesce(pe.estado, '')) = 'pagado'
 order by pe.creado_el desc nulls last
 limit 50;

-- g) Cola de moderación: reseñas esperando aprobación del admin.
--    Mientras `aprobada` sea false NO se ve en la web (ni en el JSON-LD).
select id, producto_id, nombre_autor, calificacion, verificada, titulo, comentario, creado_el
  from public.resenas_productos
 where aprobada = false
 order by creado_el desc;

-- g2) PUBLICAR una reseña (esto es lo que hay que hacer con cada una que llegue):
--     copia el id de la consulta anterior y ejecuta
--       update public.resenas_productos set aprobada = true where id = 'UUID-DE-LA-RESEÑA';
--     Los contadores del producto y las estrellas de Google se actualizan solos.
--     Para responderla en público:
--       update public.resenas_productos set respuesta_tienda = 'Gracias …' where id = '…';

-- h) Comprobación de que los contadores del producto NO están inflados:
--    lo que dice `productos` debe coincidir con las reseñas aprobadas reales.
select p.slug,
       p.total_resenas as dice_el_producto,
       count(r.id) filter (where r.aprobada) as reseñas_reales,
       p.calificacion_promedio as media_guardada,
       round(avg(r.calificacion) filter (where r.aprobada)::numeric, 2) as media_real
  from public.productos p
  left join public.resenas_productos r on r.producto_id = p.id
 group by p.slug, p.total_resenas, p.calificacion_promedio
having p.total_resenas <> count(r.id) filter (where r.aprobada)
 order by p.slug;

-- Si (h) devuelve filas, son productos con contadores heredados de las reseñas
-- inventadas. Se limpian de una vez con:
--   update public.productos set total_resenas = 0, calificacion_promedio = 0
--    where id not in (select producto_id from public.resenas_productos where aprobada);
