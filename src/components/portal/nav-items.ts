import type { Role } from "@/lib/types/roles";

export type NavItem = {
  href: string;
  label: string;
};

/**
 * Ítems de navegación del portal por rol. Se amplía en cada fase a medida
 * que se agregan módulos (contabilidad llega en Fase 4, usuarios en Fase 5).
 */
export const NAV_ITEMS: Record<Role, NavItem[]> = {
  admin: [
    { href: "/portal/admin", label: "Resumen" },
    { href: "/portal/admin/pacientes", label: "Pacientes" },
    { href: "/portal/admin/especialistas", label: "Especialistas" },
    { href: "/portal/admin/citas", label: "Citas" },
    { href: "/portal/admin/servicios", label: "Servicios" },
    { href: "/portal/admin/recibos", label: "Recibos" },
    { href: "/portal/admin/cotizaciones", label: "Cotizaciones" },
    { href: "/portal/admin/pagos-recurrentes", label: "Pagos recurrentes" },
    { href: "/portal/admin/usuarios", label: "Usuarios" },
    { href: "/portal/admin/equipo", label: "Equipo" },
    { href: "/portal/admin/recursos", label: "Recursos" },
    { href: "/portal/admin/carrusel", label: "Carrusel" },
  ],
  terapeuta: [
    { href: "/portal/terapeuta", label: "Resumen" },
    { href: "/portal/terapeuta/agenda", label: "Mi agenda" },
    { href: "/portal/terapeuta/pacientes", label: "Mis pacientes" },
    { href: "/portal/terapeuta/ganancias", label: "Mis ganancias" },
  ],
  tutor: [
    { href: "/portal/tutor", label: "Resumen" },
    { href: "/portal/tutor/hijos", label: "Mis hijos/as" },
  ],
  servicio_cliente: [
    { href: "/portal/servicio-cliente", label: "Resumen" },
    { href: "/portal/servicio-cliente/citas", label: "Agenda de citas" },
    { href: "/portal/servicio-cliente/pacientes", label: "Alta de pacientes" },
    { href: "/portal/servicio-cliente/recibos", label: "Recibos" },
    { href: "/portal/servicio-cliente/cotizaciones", label: "Cotizaciones" },
    {
      href: "/portal/servicio-cliente/pagos-recurrentes",
      label: "Pagos recurrentes",
    },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  terapeuta: "Terapeuta",
  tutor: "Tutor/Padre",
  servicio_cliente: "Servicio al Cliente",
};
