-- Fase 1: identidad y roles.
-- `profiles` extiende auth.users con el rol de RBAC del portal.
-- RLS incluido en esta misma migración (convención: nunca "se agrega después").

create type public.ceadi_role as enum (
  'admin',
  'terapeuta',
  'tutor',
  'servicio_cliente'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.ceadi_role not null default 'tutor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER para poder chequear el rol propio desde las policies
-- sin caer en recursión (una policy de profiles que hace SELECT sobre
-- profiles).
create or replace function public.current_user_role()
returns public.ceadi_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.current_user_role() = 'admin');

-- Cada quien puede tocar su propio nombre; el rol se administra aparte
-- (solo admin, vía policy de abajo) para que nadie se autoasigne un rol.
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.current_user_role() = 'admin');

create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.current_user_role() = 'admin');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Alta de usuarios es por invitación de un admin (no hay self-signup).
-- Este trigger crea la fila de profiles al crearse el usuario en auth.users,
-- tomando full_name/role de los metadata pasados en la invitación.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.ceadi_role,
      'tutor'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
