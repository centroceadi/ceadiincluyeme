-- Extiende `resources` para poder migrar los artículos/videos reales del
-- sitio anterior (Base44) con su contenido completo, no solo título+link.
-- RLS ya existente (resources_select_public / resources_all_admin) sigue
-- aplicando tal cual — solo se agregan columnas.

create type public.resource_type as enum ('articulo', 'video');

alter table public.resources
  add column resource_type public.resource_type not null default 'articulo',
  add column author text,
  add column content text,
  add column cover_image_url text,
  add column slug text unique,
  add column tags text[] not null default '{}';
