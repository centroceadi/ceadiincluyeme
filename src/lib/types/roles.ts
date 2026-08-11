/**
 * Roles del portal CeadiPortal.
 *
 * Debe coincidir 1:1 con el enum/columna `role` de la tabla `profiles` en Supabase.
 * Ver contexto del proyecto: RLS obligatorio por rol en cada tabla.
 */
export const ROLES = [
  "admin",
  "terapeuta",
  "tutor",
  "servicio_cliente",
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}

/** Rutas de aterrizaje por rol dentro del portal, tras autenticar. */
export const ROLE_HOME: Record<Role, string> = {
  admin: "/portal/admin",
  terapeuta: "/portal/terapeuta",
  tutor: "/portal/tutor",
  servicio_cliente: "/portal/servicio-cliente",
};
