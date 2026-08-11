-- Fase 2: núcleo clínico.
-- specialists, patients, appointments, clinical_records, psycho_records,
-- traceability_events — RLS incluido en esta misma migración.
--
-- Orden deliberado: 1) tablas, 2) helpers de RLS (referencian las tablas,
-- así que van después), 3) policies, 4) triggers del muro de trazabilidad.
--
-- Reglas de acceso (ver contexto del proyecto):
--   admin             — acceso total.
--   terapeuta         — sus propias citas; expedientes clínicos/psicopeda-
--                        gógicos de los pacientes que trata.
--   tutor             — solo lectura de sus pacientes (guardian_id) y de
--                        eventos NO clínicos del muro de trazabilidad.
--   servicio_cliente  — gestiona citas de todos los terapeutas y alta de
--                        pacientes; SIN acceso a expedientes clínicos ni
--                        a eventos clínicos del muro de trazabilidad
--                        (bloqueado acá, a nivel de policy).

-- ============================================================
-- 1) Tablas
-- ============================================================

-- specialists — 1:1 con profiles
create table public.specialists (
  id uuid primary key references public.profiles (id) on delete cascade,
  specialty text not null,
  license_number text,
  bio text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger specialists_set_updated_at
  before update on public.specialists
  for each row execute function public.set_updated_at();

-- patients
create type public.patient_status as enum ('active', 'inactive', 'discharged');

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  date_of_birth date,
  guardian_id uuid references public.profiles (id) on delete set null,
  status public.patient_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

-- appointments
create type public.appointment_status as enum (
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  specialist_id uuid not null references public.specialists (id) on delete restrict,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  status public.appointment_status not null default 'scheduled',
  appointment_type text,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- clinical_records — expedientes clínicos (sensible)
create table public.clinical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  specialist_id uuid not null references public.specialists (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  session_date date not null default current_date,
  summary text not null,
  details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clinical_records_set_updated_at
  before update on public.clinical_records
  for each row execute function public.set_updated_at();

-- psycho_records — expedientes psicopedagógicos (sensible)
create table public.psycho_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  specialist_id uuid not null references public.specialists (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  session_date date not null default current_date,
  area text,
  summary text not null,
  recommendations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger psycho_records_set_updated_at
  before update on public.psycho_records
  for each row execute function public.set_updated_at();

-- traceability_events — muro de trazabilidad (log append-only)
create type public.traceability_event_type as enum (
  'patient_created',
  'appointment_created',
  'appointment_status_changed',
  'clinical_record_created',
  'psycho_record_created'
);

create table public.traceability_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  event_type public.traceability_event_type not null,
  actor_id uuid references public.profiles (id) on delete set null,
  -- true para eventos que exponen contenido clínico (aunque sea solo el
  -- resumen): oculto para servicio_cliente y tutor.
  is_clinical boolean not null default false,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index traceability_events_patient_id_occurred_at_idx
  on public.traceability_events (patient_id, occurred_at desc);

-- ============================================================
-- 2) Helpers de RLS (SECURITY DEFINER, evitan recursión) — van después
--    de las tablas porque las referencian.
-- ============================================================

-- ¿El usuario actual trató alguna vez a este paciente (cita o expediente)?
create or replace function public.is_patient_specialist(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.appointments a
    where a.patient_id = p_patient_id and a.specialist_id = auth.uid()
  ) or exists (
    select 1 from public.clinical_records c
    where c.patient_id = p_patient_id and c.specialist_id = auth.uid()
  ) or exists (
    select 1 from public.psycho_records p
    where p.patient_id = p_patient_id and p.specialist_id = auth.uid()
  );
$$;

-- ¿El usuario actual es el tutor/guardián de este paciente?
create or replace function public.is_patient_guardian(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.patients pt
    where pt.id = p_patient_id and pt.guardian_id = auth.uid()
  );
$$;

-- ============================================================
-- 3) RLS + policies
-- ============================================================

alter table public.specialists enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.clinical_records enable row level security;
alter table public.psycho_records enable row level security;
alter table public.traceability_events enable row level security;

-- ---- specialists ----

-- Cualquier usuario logueado del portal puede ver el directorio de
-- especialistas (nombre/especialidad) — lo necesitan servicio_cliente para
-- agendar y tutor para saber quién atiende a su hijo/a. No es dato clínico.
create policy "specialists_select_authenticated"
  on public.specialists for select
  using (auth.uid() is not null);

create policy "specialists_update_own"
  on public.specialists for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "specialists_all_admin"
  on public.specialists for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ---- patients ----

create policy "patients_all_admin"
  on public.patients for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- servicio_cliente: alta y gestión de pacientes (sin ver expedientes).
create policy "patients_all_servicio_cliente"
  on public.patients for all
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

create policy "patients_select_specialist"
  on public.patients for select
  using (public.is_patient_specialist(id));

create policy "patients_select_guardian"
  on public.patients for select
  using (guardian_id = auth.uid());

-- ---- appointments ----

create policy "appointments_all_admin"
  on public.appointments for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "appointments_all_servicio_cliente"
  on public.appointments for all
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

create policy "appointments_select_own"
  on public.appointments for select
  using (specialist_id = auth.uid());

create policy "appointments_insert_own"
  on public.appointments for insert
  with check (specialist_id = auth.uid());

create policy "appointments_update_own"
  on public.appointments for update
  using (specialist_id = auth.uid())
  with check (specialist_id = auth.uid());

create policy "appointments_select_guardian"
  on public.appointments for select
  using (public.is_patient_guardian(patient_id));

-- ---- clinical_records ----
-- Sin policy para servicio_cliente ni tutor a propósito: nunca deben poder
-- leer expedientes clínicos (ver contexto del proyecto).

create policy "clinical_records_all_admin"
  on public.clinical_records for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "clinical_records_select_treating_specialist"
  on public.clinical_records for select
  using (public.is_patient_specialist(patient_id));

create policy "clinical_records_insert_own"
  on public.clinical_records for insert
  with check (specialist_id = auth.uid());

create policy "clinical_records_update_own"
  on public.clinical_records for update
  using (specialist_id = auth.uid())
  with check (specialist_id = auth.uid());

create policy "clinical_records_delete_own"
  on public.clinical_records for delete
  using (specialist_id = auth.uid());

-- ---- psycho_records ----
-- Mismas reglas que clinical_records, y por la misma razón: sin policy
-- para servicio_cliente ni tutor.

create policy "psycho_records_all_admin"
  on public.psycho_records for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "psycho_records_select_treating_specialist"
  on public.psycho_records for select
  using (public.is_patient_specialist(patient_id));

create policy "psycho_records_insert_own"
  on public.psycho_records for insert
  with check (specialist_id = auth.uid());

create policy "psycho_records_update_own"
  on public.psycho_records for update
  using (specialist_id = auth.uid())
  with check (specialist_id = auth.uid());

create policy "psycho_records_delete_own"
  on public.psycho_records for delete
  using (specialist_id = auth.uid());

-- ---- traceability_events ----
-- Sin policies de insert/update/delete para ningún rol vía API: el log
-- solo lo escriben los triggers de abajo (SECURITY DEFINER), nunca
-- directamente un cliente.

create policy "traceability_events_select_admin"
  on public.traceability_events for select
  using (public.current_user_role() = 'admin');

create policy "traceability_events_select_specialist"
  on public.traceability_events for select
  using (public.is_patient_specialist(patient_id));

create policy "traceability_events_select_guardian"
  on public.traceability_events for select
  using (not is_clinical and public.is_patient_guardian(patient_id));

create policy "traceability_events_select_servicio_cliente"
  on public.traceability_events for select
  using (
    not is_clinical
    and public.current_user_role() = 'servicio_cliente'
  );

-- ============================================================
-- 4) Triggers que alimentan el muro de trazabilidad
-- ============================================================

create or replace function public.log_patient_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.traceability_events
    (patient_id, event_type, actor_id, is_clinical, summary)
  values (
    new.id,
    'patient_created',
    auth.uid(),
    false,
    'Paciente dado de alta: ' || new.full_name
  );
  return new;
end;
$$;

create trigger patients_log_created
  after insert on public.patients
  for each row execute function public.log_patient_created();

create or replace function public.log_appointment_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.traceability_events
      (patient_id, event_type, actor_id, is_clinical, summary, metadata)
    values (
      new.patient_id,
      'appointment_created',
      auth.uid(),
      false,
      'Cita agendada para ' || to_char(new.scheduled_at, 'YYYY-MM-DD HH24:MI'),
      jsonb_build_object('appointment_id', new.id, 'status', new.status)
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.traceability_events
      (patient_id, event_type, actor_id, is_clinical, summary, metadata)
    values (
      new.patient_id,
      'appointment_status_changed',
      auth.uid(),
      false,
      'Cita cambió de estado: ' || old.status || ' → ' || new.status,
      jsonb_build_object(
        'appointment_id', new.id,
        'from', old.status,
        'to', new.status
      )
    );
  end if;
  return new;
end;
$$;

create trigger appointments_log_event
  after insert or update on public.appointments
  for each row execute function public.log_appointment_event();

create or replace function public.log_clinical_record_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.traceability_events
    (patient_id, event_type, actor_id, is_clinical, summary, metadata)
  values (
    new.patient_id,
    'clinical_record_created',
    auth.uid(),
    true,
    'Nueva nota clínica registrada',
    jsonb_build_object('clinical_record_id', new.id)
  );
  return new;
end;
$$;

create trigger clinical_records_log_created
  after insert on public.clinical_records
  for each row execute function public.log_clinical_record_created();

create or replace function public.log_psycho_record_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.traceability_events
    (patient_id, event_type, actor_id, is_clinical, summary, metadata)
  values (
    new.patient_id,
    'psycho_record_created',
    auth.uid(),
    true,
    'Nueva nota psicopedagógica registrada',
    jsonb_build_object('psycho_record_id', new.id)
  );
  return new;
end;
$$;

create trigger psycho_records_log_created
  after insert on public.psycho_records
  for each row execute function public.log_psycho_record_created();
