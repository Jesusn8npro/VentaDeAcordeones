-- Script: crear_tabla_articulo.sql
-- Crea la tabla public."ARTICULO" con columnas en español, índices,
-- trigger de actualizado_en, habilita RLS y define políticas.

begin;

-- UUID helper
create extension if not exists pgcrypto;

-- Tabla principal de artículos (nombre exacto: "ARTICULO")
create table if not exists public."ARTICULO" (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  titulo text not null,
  autor text not null,
  autor_iniciales text,
  fecha_publicacion timestamptz not null default now(),
  lectura_min integer not null check (lectura_min > 0),
  calificacion numeric(3,1) check (calificacion >= 0 and calificacion <= 5),
  portada_url text,
  resumen_breve text,
  resumen_completo text,
  secciones jsonb not null,
  cta jsonb,
  estado_publicacion text not null default 'borrador' check (estado_publicacion in ('borrador','publicado','archivado')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint articulo_slug_unico unique (slug)
);

-- Índices útiles
create index if not exists articulo_fecha_publicacion_idx on public."ARTICULO" (fecha_publicacion);
create index if not exists articulo_secciones_gin_idx on public."ARTICULO" using gin (secciones jsonb_path_ops);

-- Trigger para mantener actualizado_en
create or replace function public.set_actualizado_en_articulo()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_actualizado_en_articulo on public."ARTICULO";
create trigger trg_actualizado_en_articulo
before update on public."ARTICULO"
for each row execute function public.set_actualizado_en_articulo();

-- Habilitar RLS
alter table public."ARTICULO" enable row level security;

-- Políticas RLS
-- Lectura pública de artículos publicados. Admin (claim is_admin=true) puede leer todo.
drop policy if exists "Lectura pública de publicados" on public."ARTICULO";
create policy "Lectura pública de publicados"
on public."ARTICULO"
for select
to public
using (estado_publicacion = 'publicado' or (auth.jwt() ->> 'is_admin') = 'true');

-- Inserción sólo para usuarios autenticados con claim is_admin=true
drop policy if exists "Inserción solo admin" on public."ARTICULO";
create policy "Inserción solo admin"
on public."ARTICULO"
for insert
to authenticated
with check ((auth.jwt() ->> 'is_admin') = 'true');

-- Actualización sólo admin
drop policy if exists "Actualización solo admin" on public."ARTICULO";
create policy "Actualización solo admin"
on public."ARTICULO"
for update
to authenticated
using ((auth.jwt() ->> 'is_admin') = 'true')
with check ((auth.jwt() ->> 'is_admin') = 'true');

-- Eliminación sólo admin
drop policy if exists "Eliminación solo admin" on public."ARTICULO";
create policy "Eliminación solo admin"
on public."ARTICULO"
for delete
to authenticated
using ((auth.jwt() ->> 'is_admin') = 'true');

commit;