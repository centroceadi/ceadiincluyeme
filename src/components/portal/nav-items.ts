import type { Role } from "@/lib/types/roles";

export type NavItem = {
  href: string;
  label: string;
};

/**
 * Ítems de navegación del portal por rol. Se amplía en cada fase a medida
 * que se agregan módulos (citas, expedientes, contabilidad, etc.).
 */
export const NAV_ITEMS: Record<Role, NavItem[]> = {
  admin: [
    { href: "/portal/admin", label: "Resumen" },
    { href: "/portal/admin", label: "Pacientes" },
    { href: "/portal/admin", label: "Citas" },
    { href: "/portal/admin", label: "Contabilidad" },
    { href: "/portal/admin", label: "Usuarios" },
  ],
  terapeuta: [
    { href: "/portal/terapeuta", label: "Resumen" },
    { href: "/portal/terapeuta", label: "Mi agenda" },
    { href: "/portal/terapeuta", label: "Mis pacientes" },
    { href: "/portal/terapeuta", label: "Mis ganancias" },
  ],
  tutor: [
    { href: "/portal/tutor", label: "Resumen" },
    { href: "/portal/tutor", label: "Mis hijos/as" },
    { href: "/portal/tutor", label: "Citas" },
  ],
  servicio_cliente: [
    { href: "/portal/servicio-cliente", label: "Resumen" },
    { href: "/portal/servicio-cliente", label: "Agenda de citas" },
    { href: "/portal/servicio-cliente", label: "Alta de pacientes" },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  terapeuta: "Terapeuta",
  tutor: "Tutor/Padre",
  servicio_cliente: "Servicio al Cliente",
};
