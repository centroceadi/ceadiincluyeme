-- Probando el flujo real después de correr 20260816000000_contact_requests.sql,
-- el insert como anon devolvió 42501 ("new row violates row-level security
-- policy") — la tabla y el enable RLS quedaron bien, pero la policy de
-- insert público no está tomando efecto (posible corte a mitad del script
-- original en el SQL Editor). Este fix es idempotente: tira cada policy si
-- existe y la vuelve a crear, así se puede correr sin importar en qué
-- estado parcial haya quedado.

drop policy if exists "contact_requests_insert_public" on public.contact_requests;
create policy "contact_requests_insert_public"
  on public.contact_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_requests_all_admin" on public.contact_requests;
create policy "contact_requests_all_admin"
  on public.contact_requests for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "contact_requests_select_servicio_cliente" on public.contact_requests;
create policy "contact_requests_select_servicio_cliente"
  on public.contact_requests for select
  using (public.current_user_role() = 'servicio_cliente');

drop policy if exists "contact_requests_update_servicio_cliente" on public.contact_requests;
create policy "contact_requests_update_servicio_cliente"
  on public.contact_requests for update
  using (public.current_user_role() = 'servicio_cliente')
  with check (public.current_user_role() = 'servicio_cliente');
