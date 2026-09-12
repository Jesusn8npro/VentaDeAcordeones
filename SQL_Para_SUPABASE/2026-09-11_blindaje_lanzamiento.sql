-- ============================================================================
-- BLINDAJE PRE-LANZAMIENTO — VentaDeAcordeones.com · 11 sep 2026
--
-- Cómo ejecutarlo: Supabase → SQL Editor → pegar todo → Run.
-- Es idempotente: se puede correr varias veces sin romper nada.
-- Al final hay un bloque de VERIFICACIÓN que muestra cómo quedó todo.
--
-- Qué arregla (los tres agujeros que permiten robar o regalar mercancía):
--   1. Cualquier usuario registrado podía convertirse en administrador.
--   2. El navegador podía crear pedidos con el total que quisiera, marcarlos
--      como pagados y cambiar el stock.
--   3. Cualquier autenticado podía leer y editar los datos de contacto (leads)
--      y, si quedaban políticas antiguas, los precios de los productos.
-- ============================================================================

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EL ROL NO SE AUTOASIGNA
--    La política de `usuarios` deja a cada quien actualizar su propia fila, y
--    eso incluía la columna `rol`. Con la anon key en la mano bastaba un PATCH
--    para volverse admin. El trigger congela `rol` salvo que quien escriba sea
--    el service_role (backend) o un admin ya existente.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.proteger_rol_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  es_servicio boolean := false;
  es_admin_actual boolean := false;
  claims text;
begin
  -- El backend (service_role) y el owner de la BD pueden fijar el rol; nadie mas.
  begin
    claims := current_setting('request.jwt.claims', true);
    es_servicio := coalesce(claims::jsonb ->> 'role', '') = 'service_role';
  exception when others then
    es_servicio := false;
  end;
  es_servicio := es_servicio or current_user in ('postgres', 'supabase_admin', 'service_role');

  -- ¿Quien hace la escritura ya es admin? (lectura directa, sin pasar por RLS)
  select exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and u.rol = 'admin'
  ) into es_admin_actual;

  if es_servicio or es_admin_actual then
    return new;   -- backend o admin: puede poner el rol que necesite
  end if;

  if tg_op = 'INSERT' then
    new.rol := 'cliente';
  elsif tg_op = 'UPDATE' then
    new.rol := old.rol;          -- se ignora en silencio cualquier intento de cambiarlo
  end if;

  return new;
end;
$$;

drop trigger if exists trg_proteger_rol_usuario on public.usuarios;
create trigger trg_proteger_rol_usuario
  before insert or update on public.usuarios
  for each row execute function public.proteger_rol_usuario();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PEDIDOS: los crea y los modifica SOLO el servidor
--    El cliente puede LEER sus pedidos. Crear, cambiar el total o marcar
--    "pagado" es competencia del service_role (app/api/pedidos/crear y
--    app/api/epayco/confirmar, que valida la firma y el monto).
-- ─────────────────────────────────────────────────────────────────────────────
alter table if exists public.pedidos enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'pedidos'
  loop
    execute format('drop policy if exists %I on public.pedidos', pol.policyname);
  end loop;
end $$;

-- Lectura: cada quien ve lo suyo; el admin ve todo.
create policy pedidos_select_propio on public.pedidos
  for select to authenticated
  using (
    usuario_id = auth.uid()
    or exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

-- Escritura del admin desde el panel (el service_role no pasa por RLS).
create policy pedidos_admin_todo on public.pedidos
  for all to authenticated
  using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'))
  with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'));

-- OJO: no hay política de INSERT/UPDATE para clientes. Es intencional.

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PRODUCTOS: catálogo público de solo lectura
--    Existían políticas antiguas que dejaban a cualquier autenticado hacer
--    INSERT/UPDATE/DELETE (es decir, cambiarse el precio antes de comprar).
-- ─────────────────────────────────────────────────────────────────────────────
alter table if exists public.productos enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'productos'
  loop
    execute format('drop policy if exists %I on public.productos', pol.policyname);
  end loop;
end $$;

create policy productos_lectura_publica on public.productos
  for select to anon, authenticated
  using (true);

create policy productos_admin_todo on public.productos
  for all to authenticated
  using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'))
  with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. LEADS DEL CHAT: datos personales de quien escribe (nombre, WhatsApp, email)
--    La política vieja decía "auth.uid() is not null", o sea: cualquier
--    registrado podía leer y editar los leads de todos.
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  pol record;
begin
  if to_regclass('public.leadschat') is null then
    return;
  end if;

  execute 'alter table public.leadschat enable row level security';

  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'leadschat' loop
    execute format('drop policy if exists %I on public.leadschat', pol.policyname);
  end loop;

  -- El chat publico crea su propio lead sin sesion: puede INSERTAR, nunca leer.
  execute 'create policy leadschat_insert_publico on public.leadschat for insert to anon, authenticated with check (true)';

  execute 'create policy leadschat_select_propio on public.leadschat for select to authenticated using ('
        || '(usuario_id is not null and usuario_id = auth.uid())'
        || ' or exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = ''admin''))';

  execute 'create policy leadschat_update_propio on public.leadschat for update to authenticated using ('
        || '(usuario_id is not null and usuario_id = auth.uid())'
        || ' or exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = ''admin''))';
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CARRITO — NO se toca aquí a propósito.
--    Activar RLS sin políticas dejaría el carrito inservible (invitados incluidos).
--    Si `carrito` hoy no tiene RLS, revísalo aparte con las columnas reales
--    (usuario_id para logueados, session_id para invitados).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ARCHIVOS (Storage): subir y borrar imágenes es cosa del admin
--    Los buckets siguen siendo de lectura pública (las fotos del catálogo se
--    ven en la web), pero escribir en ellos deja de estar abierto.
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  b text;
  buckets text[] := array['imagenes', 'imagenes_tienda', 'videos', 'productos'];
  cond_admin text := 'exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = ''admin'')';
begin
  foreach b in array buckets loop
    if not exists (select 1 from storage.buckets where id = b) then
      continue;
    end if;

    execute format('drop policy if exists %I on storage.objects', b || '_lectura_publica');
    execute format('drop policy if exists %I on storage.objects', b || '_escritura_admin');

    execute format(
      'create policy %I on storage.objects for select to anon, authenticated using (bucket_id = %L)',
      b || '_lectura_publica', b);

    execute format(
      'create policy %I on storage.objects for all to authenticated using (bucket_id = %L and %s) with check (bucket_id = %L and %s)',
      b || '_escritura_admin', b, cond_admin, b, cond_admin);

    -- 10 MB por archivo y solo imagen/video: nadie sube ejecutables ni llena el disco.
    update storage.buckets
       set file_size_limit = 10485760,
           allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm']
     where id = b;
  end loop;
exception when insufficient_privilege then
  raise notice 'Sin permisos para cambiar politicas de storage desde SQL Editor: hazlo en Storage > Policies.';
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. REGISTRO DE CONFIRMACIONES DE PAGO
--    El webhook guarda aquí TODA confirmación de ePayco (aprobada o no) para
--    poder auditar un cobro después. Nadie puede leerla salvo el admin.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.transacciones_epayco_logs (
  id             bigserial primary key,
  ref_payco      text,
  transaction_id text,
  numero_pedido  text,
  cod_response   text,
  respuesta      text,
  monto          numeric,
  moneda         text,
  aprobado       boolean default false,
  payload        jsonb,
  creado_el      timestamptz not null default now()
);

create index if not exists idx_epayco_logs_numero_pedido on public.transacciones_epayco_logs (numero_pedido);
create index if not exists idx_epayco_logs_creado on public.transacciones_epayco_logs (creado_el desc);

alter table public.transacciones_epayco_logs enable row level security;

drop policy if exists epayco_logs_admin on public.transacciones_epayco_logs;
create policy epayco_logs_admin on public.transacciones_epayco_logs
  for select to authenticated
  using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin'));

commit;

-- ============================================================================
-- VERIFICACIÓN — ejecuta esto después y revisa la salida
-- ============================================================================

-- a) Tablas con RLS activo (debe decir true en usuarios, pedidos, productos, leadschat)
select relname as tabla, relrowsecurity as rls_activo
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relname in ('usuarios','pedidos','productos','leadschat','carrito','transacciones_epayco_logs')
 order by relname;

-- b) Políticas que siguen vivas
select tablename as tabla, policyname as politica, cmd as operacion, roles
  from pg_policies
 where schemaname = 'public'
   and tablename in ('usuarios','pedidos','productos','leadschat','carrito')
 order by tablename, policyname;

-- c) Políticas peligrosas: escritura abierta a cualquiera (debería salir vacío)
select tablename as tabla, policyname as politica, cmd as operacion
  from pg_policies
 where schemaname = 'public'
   and cmd <> 'SELECT'
   and (coalesce(qual, '') ilike '%true%' or coalesce(with_check, '') ilike '%true%')
   and tablename not in ('leadschat')
 order by tablename;

-- d) El trigger del rol está puesto
select tgname as trigger, tgenabled as estado
  from pg_trigger
 where tgrelid = 'public.usuarios'::regclass and not tgisinternal;

-- e) MUY IMPORTANTE: debe existir al menos un administrador. Si esta consulta
--    devuelve 0 filas, nadie podra entrar al panel: crea el admin desde aqui con
--        update public.usuarios set rol = 'admin' where email = 'acordeon91@gmail.com';
--    (esta consulta se ejecuta como owner, asi que el trigger la deja pasar).
select id, email, rol from public.usuarios where rol = 'admin';
