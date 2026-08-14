-- Fase 5: administración y contenido.
-- team_members, resources, hero_carousel_slides (contenido público de la
-- landing) + profiles.active (activar/desactivar usuarios) + bucket de
-- Storage para las imágenes que sube el admin.
--
-- A diferencia de todo lo anterior, team_members/resources/
-- hero_carousel_slides son PÚBLICOS: la landing los lee sin sesión
-- (visitantes anónimos). RLS de select no chequea auth.uid(), solo
-- `active = true`.

-- ============================================================
-- 1) profiles.active — activar/desactivar sin borrar la cuenta
-- ============================================================

alter table public.profiles
  add column active boolean not null default true;

-- ============================================================
-- 2) Tablas de contenido público
-- ============================================================

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null,
  photo_url text,
  bio text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  category text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

create type public.slide_transition as enum ('fade', 'slide');

create table public.hero_carousel_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  title text not null,
  subtitle text,
  display_order integer not null default 0,
  transition_type public.slide_transition not null default 'fade',
  duration_ms integer not null default 6000 check (duration_ms > 0),
  overlay_opacity numeric(3, 2) not null default 0.45
    check (overlay_opacity >= 0 and overlay_opacity <= 1),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger hero_carousel_slides_set_updated_at
  before update on public.hero_carousel_slides
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3) RLS: público lee lo activo, admin administra todo
-- ============================================================

alter table public.team_members enable row level security;
alter table public.resources enable row level security;
alter table public.hero_carousel_slides enable row level security;

create policy "team_members_select_public"
  on public.team_members for select
  using (active = true);

create policy "team_members_all_admin"
  on public.team_members for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "resources_select_public"
  on public.resources for select
  using (active = true);

create policy "resources_all_admin"
  on public.resources for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "hero_carousel_slides_select_public"
  on public.hero_carousel_slides for select
  using (active = true);

create policy "hero_carousel_slides_all_admin"
  on public.hero_carousel_slides for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ============================================================
-- 4) Storage: bucket público para fotos de equipo e imágenes del
--    carrusel. `public = true` en el bucket permite servir los
--    archivos por URL directa sin autenticación; igual hace falta
--    policy explícita en storage.objects para poder subir/borrar.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('landing-media', 'landing-media', true)
on conflict (id) do nothing;

create policy "landing_media_select_public"
  on storage.objects for select
  using (bucket_id = 'landing-media');

create policy "landing_media_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'landing-media' and public.current_user_role() = 'admin'
  );

create policy "landing_media_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'landing-media' and public.current_user_role() = 'admin'
  )
  with check (
    bucket_id = 'landing-media' and public.current_user_role() = 'admin'
  );

create policy "landing_media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'landing-media' and public.current_user_role() = 'admin'
  );
