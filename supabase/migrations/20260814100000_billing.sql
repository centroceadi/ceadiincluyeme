-- Fase 4: contabilidad (RD).
-- billing_services, receipts, receipt_lines, quotes, quote_lines,
-- recurring_payments, transactions — RLS incluido en esta misma migración.
--
-- Decisiones confirmadas con el usuario (2026-08-14):
--   - Emiten/cobran recibos: admin y servicio_cliente. Terapeuta solo ve
--     los propios ("Mis Ganancias"), de solo lectura.
--   - NCF: campo de texto libre, de uso INTERNO únicamente. No se valida
--     contra el formato/secuencia oficial de la DGII — sigue pendiente
--     confirmar con CEADI si hace falta integrar e-CF (fuera de alcance
--     por ahora, ver contexto del proyecto).
--   - Exención de ITBIS en servicios de salud (Art. 343 Código Tributario
--     RD): billing_services nace con itbis_exempt = true por defecto.
--
-- Orden: 1) tablas, 2) helpers de RLS, 3) policies, 4) triggers de
-- totales (subtotal/itbis_total/total se recalculan solos cuando cambian
-- las líneas, nunca se confía en que el cliente mande los totales bien).

-- ============================================================
-- 1) Tablas
-- ============================================================

create table public.billing_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  -- Art. 343 Código Tributario RD: servicios de salud exentos de ITBIS.
  -- Exento por defecto; se puede desmarcar para ítems no exentos.
  itbis_exempt boolean not null default true,
  itbis_rate numeric(5, 2) not null default 0 check (itbis_rate >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger billing_services_set_updated_at
  before update on public.billing_services
  for each row execute function public.set_updated_at();

create type public.payment_condition as enum ('contado', 'credito', 'cuotas');
create type public.receipt_status as enum (
  'draft',
  'issued',
  'paid',
  'partially_paid',
  'cancelled'
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete restrict,
  -- Uso interno únicamente — NO es un e-CF válido ante la DGII. Ver nota
  -- arriba y en el contexto del proyecto.
  ncf text,
  issue_date date not null default current_date,
  payment_condition public.payment_condition not null default 'contado',
  status public.receipt_status not null default 'issued',
  subtotal numeric(12, 2) not null default 0,
  itbis_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger receipts_set_updated_at
  before update on public.receipts
  for each row execute function public.set_updated_at();

create table public.receipt_lines (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  billing_service_id uuid references public.billing_services (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  -- A qué especialista se le atribuye esta línea — es lo que arma
  -- "Mis Ganancias" del terapeuta. Nullable: puede haber líneas sin
  -- especialista asociado (ej. un producto/material).
  specialist_id uuid references public.specialists (id) on delete set null,
  description text not null,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  itbis_rate numeric(5, 2) not null default 0 check (itbis_rate >= 0),
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index receipt_lines_receipt_id_idx on public.receipt_lines (receipt_id);
create index receipt_lines_specialist_id_idx on public.receipt_lines (specialist_id);

create type public.quote_status as enum (
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired'
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete restrict,
  issue_date date not null default current_date,
  valid_until date,
  status public.quote_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  itbis_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

create table public.quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  billing_service_id uuid references public.billing_services (id) on delete restrict,
  description text not null,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  itbis_rate numeric(5, 2) not null default 0 check (itbis_rate >= 0),
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index quote_lines_quote_id_idx on public.quote_lines (quote_id);

create type public.recurrence_frequency as enum ('weekly', 'biweekly', 'monthly');

create table public.recurring_payments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  billing_service_id uuid references public.billing_services (id) on delete restrict,
  amount numeric(12, 2) not null check (amount >= 0),
  frequency public.recurrence_frequency not null default 'monthly',
  next_charge_date date not null,
  active boolean not null default true,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger recurring_payments_set_updated_at
  before update on public.recurring_payments
  for each row execute function public.set_updated_at();

create type public.payment_method as enum ('cash', 'card', 'transfer', 'check', 'other');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references public.receipts (id) on delete set null,
  patient_id uuid not null references public.patients (id) on delete restrict,
  amount numeric(12, 2) not null check (amount >= 0),
  payment_method public.payment_method not null default 'cash',
  transaction_date date not null default current_date,
  notes text,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index transactions_receipt_id_idx on public.transactions (receipt_id);

-- ============================================================
-- 2) Helpers de RLS
-- ============================================================

-- ¿Tiene el especialista actual alguna línea en este recibo? (para
-- "Mis Ganancias": solo lectura de recibos/transacciones propias)
create or replace function public.is_specialist_receipt_line(p_receipt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.receipt_lines rl
    where rl.receipt_id = p_receipt_id and rl.specialist_id = auth.uid()
  );
$$;

-- ============================================================
-- 3) RLS + policies
-- ============================================================

alter table public.billing_services enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_lines enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_lines enable row level security;
alter table public.recurring_payments enable row level security;
alter table public.transactions enable row level security;

-- ---- billing_services: catálogo, de lectura amplia (no es sensible;
-- es una lista de precios), escritura solo admin ----

create policy "billing_services_select_authenticated"
  on public.billing_services for select
  using (auth.uid() is not null);

create policy "billing_services_all_admin"
  on public.billing_services for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ---- receipts ----

create policy "receipts_all_admin"
  on public.receipts for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "receipts_select_servicio_cliente"
  on public.receipts for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "receipts_insert_servicio_cliente"
  on public.receipts for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "receipts_update_servicio_cliente"
  on public.receipts for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

create policy "receipts_select_specialist"
  on public.receipts for select
  using (public.is_specialist_receipt_line(id));

-- ---- receipt_lines ----

create policy "receipt_lines_all_admin"
  on public.receipt_lines for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "receipt_lines_select_servicio_cliente"
  on public.receipt_lines for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "receipt_lines_insert_servicio_cliente"
  on public.receipt_lines for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "receipt_lines_update_servicio_cliente"
  on public.receipt_lines for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

create policy "receipt_lines_select_specialist"
  on public.receipt_lines for select
  using (specialist_id = auth.uid());

-- ---- quotes ----

create policy "quotes_all_admin"
  on public.quotes for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "quotes_select_servicio_cliente"
  on public.quotes for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "quotes_insert_servicio_cliente"
  on public.quotes for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "quotes_update_servicio_cliente"
  on public.quotes for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

-- ---- quote_lines ----

create policy "quote_lines_all_admin"
  on public.quote_lines for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "quote_lines_select_servicio_cliente"
  on public.quote_lines for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "quote_lines_insert_servicio_cliente"
  on public.quote_lines for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "quote_lines_update_servicio_cliente"
  on public.quote_lines for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

-- ---- recurring_payments ----

create policy "recurring_payments_all_admin"
  on public.recurring_payments for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "recurring_payments_select_servicio_cliente"
  on public.recurring_payments for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "recurring_payments_insert_servicio_cliente"
  on public.recurring_payments for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "recurring_payments_update_servicio_cliente"
  on public.recurring_payments for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

-- ---- transactions ----

create policy "transactions_all_admin"
  on public.transactions for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "transactions_select_servicio_cliente"
  on public.transactions for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "transactions_insert_servicio_cliente"
  on public.transactions for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "transactions_update_servicio_cliente"
  on public.transactions for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

create policy "transactions_select_specialist"
  on public.transactions for select
  using (
    receipt_id is not null
    and public.is_specialist_receipt_line(receipt_id)
  );

-- ============================================================
-- 4) Triggers: totales de receipts/quotes se recalculan solos a partir
--    de sus líneas — nunca se confía en que el cliente los mande bien.
-- ============================================================

create or replace function public.recompute_receipt_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid := coalesce(new.receipt_id, old.receipt_id);
  new_subtotal numeric(12, 2);
  new_itbis numeric(12, 2);
begin
  select
    coalesce(sum(line_total), 0),
    coalesce(sum(line_total * itbis_rate / 100), 0)
  into new_subtotal, new_itbis
  from public.receipt_lines
  where receipt_id = target_id;

  update public.receipts
  set
    subtotal = new_subtotal,
    itbis_total = new_itbis,
    total = new_subtotal + new_itbis
  where id = target_id;

  return coalesce(new, old);
end;
$$;

create trigger receipt_lines_recompute_totals
  after insert or update or delete on public.receipt_lines
  for each row execute function public.recompute_receipt_totals();

create or replace function public.recompute_quote_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid := coalesce(new.quote_id, old.quote_id);
  new_subtotal numeric(12, 2);
  new_itbis numeric(12, 2);
begin
  select
    coalesce(sum(line_total), 0),
    coalesce(sum(line_total * itbis_rate / 100), 0)
  into new_subtotal, new_itbis
  from public.quote_lines
  where quote_id = target_id;

  update public.quotes
  set
    subtotal = new_subtotal,
    itbis_total = new_itbis,
    total = new_subtotal + new_itbis
  where id = target_id;

  return coalesce(new, old);
end;
$$;

create trigger quote_lines_recompute_totals
  after insert or update or delete on public.quote_lines
  for each row execute function public.recompute_quote_totals();
