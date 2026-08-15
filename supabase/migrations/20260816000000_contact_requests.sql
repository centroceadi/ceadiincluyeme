-- Formulario público de contacto de la landing. A diferencia de
-- team_members/resources/hero_carousel_slides (público LEE, admin
-- ESCRIBE), acá es al revés: cualquiera (incluso anónimo) puede
-- INSERTAR una solicitud, pero son datos de contacto de gente real —
-- nadie sin sesión, y ni siquiera todos los roles con sesión, puede
-- LEERLOS. Solo admin y servicio_cliente.

create type public.contact_request_status as enum ('nuevo', 'contactado', 'cerrado');

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  preferred_location text,
  service_interest text,
  message text not null,
  status public.contact_request_status not null default 'nuevo',
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

-- Cualquiera puede mandar una solicitud, incluso sin sesión — es el
-- form público de la landing.
create policy "contact_requests_insert_public"
  on public.contact_requests for insert
  with check (true);

create policy "contact_requests_all_admin"
  on public.contact_requests for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "contact_requests_select_servicio_cliente"
  on public.contact_requests for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "contact_requests_update_servicio_cliente"
  on public.contact_requests for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');
