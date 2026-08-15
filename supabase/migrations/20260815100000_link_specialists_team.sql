-- Conecta specialists (cuenta de portal, agenda/citas, clínico) con
-- team_members (bio pública de la landing). Un team_member puede
-- corresponder a lo sumo un specialist (unique); no todos los
-- team_members tienen cuenta de portal, por eso es nullable en
-- specialists, no al revés.

alter table public.specialists
  add column team_member_id uuid references public.team_members (id) on delete set null,
  add constraint specialists_team_member_id_unique unique (team_member_id);
