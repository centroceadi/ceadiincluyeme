import type { Role } from "@/lib/types/roles";

/** Fila combinada de `profiles` + `auth.users` (el email vive en
 * auth.users, no en profiles) — usada solo en /portal/admin/usuarios,
 * que arma esta lista con el cliente admin (service_role). */
export type ManagedUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  active: boolean;
  created_at: string;
};
