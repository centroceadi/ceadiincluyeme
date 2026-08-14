-- Fase 3: RLS completo — cierre de dos huecos encontrados al auditar la
-- Fase 2 con sesiones reales por rol.
--
-- 1) `profiles` solo se podía leer la fila propia o, si sos admin, todas.
--    Pero specialists.id referencia profiles.id (el nombre del
--    especialista vive en profiles, no en specialists) — así que
--    terapeuta/tutor/servicio_cliente veían el directorio de
--    especialistas con el nombre vacío en toda la UI de Fase 2.
--    Confirmado con una sesión real de servicio_cliente antes de este fix.
--
-- 2) `patients` y `appointments` le daban a servicio_cliente una policy
--    "for all", lo que incluye DELETE. Un hard delete de un paciente
--    cascadea (on delete cascade) sus citas, expedientes clínicos/
--    psicopedagógicos y eventos de trazabilidad — servicio_cliente no
--    debería poder borrar historial clínico completo con un DELETE.
--    Se reemplaza por policies explícitas de select/insert/update
--    (sin delete). Admin conserva "for all" — tiene acceso total a
--    propósito.

-- ---- 1) directorio de especialistas visible para cualquier logueado ----

create policy "profiles_select_specialist_directory"
  on public.profiles for select
  using (
    exists (
      select 1 from public.specialists s where s.id = profiles.id
    )
  );

-- ---- 2a) patients: servicio_cliente pierde DELETE ----

drop policy "patients_all_servicio_cliente" on public.patients;

create policy "patients_select_servicio_cliente"
  on public.patients for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "patients_insert_servicio_cliente"
  on public.patients for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "patients_update_servicio_cliente"
  on public.patients for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');

-- ---- 2b) appointments: servicio_cliente pierde DELETE ----

drop policy "appointments_all_servicio_cliente" on public.appointments;

create policy "appointments_select_servicio_cliente"
  on public.appointments for select
  using (public.current_user_role() = 'servicio_cliente');

create policy "appointments_insert_servicio_cliente"
  on public.appointments for insert
  with check (public.current_user_role() = 'servicio_cliente');

create policy "appointments_update_servicio_cliente"
  on public.appointments for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');
