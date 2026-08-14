import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRole } from "@/lib/types/roles";
import type { ManagedUser } from "@/lib/types/users";

/**
 * Lista de usuarios para /portal/admin/usuarios. El email vive en
 * auth.users, no en `profiles` — hace falta el cliente admin
 * (service_role) para traerlo. Esta función solo se debe llamar desde
 * una página ya protegida con requireRole(['admin']); el cliente RLS
 * (`createClient()`) igual solo deja leer todas las `profiles` si quien
 * pregunta es admin, como defensa en profundidad.
 */
export async function listManagedUsers(): Promise<ManagedUser[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, active, created_at")
    .order("created_at");

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  const emailById = new Map(data.users.map((u) => [u.id, u.email ?? null]));

  return (profiles ?? [])
    .filter((p) => isRole(p.role))
    .map((p) => ({
      id: p.id,
      email: emailById.get(p.id) ?? null,
      full_name: p.full_name,
      role: p.role,
      active: p.active,
      created_at: p.created_at,
    }));
}
