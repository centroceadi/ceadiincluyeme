import { requireRole } from "@/lib/supabase/dal";
import { QuickLinks } from "@/components/portal/quick-links";

export default async function AdminPage() {
  const profile = await requireRole(["admin"]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "admin"}
      </h1>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Clínico
        </h2>
        <QuickLinks
          links={[
            {
              href: "/portal/admin/pacientes",
              title: "Pacientes",
              description: "Ver y dar de alta pacientes.",
            },
            {
              href: "/portal/admin/especialistas",
              title: "Especialistas",
              description: "Vincular usuarios como especialistas del centro.",
            },
            {
              href: "/portal/admin/citas",
              title: "Citas",
              description: "Agenda completa de todos los especialistas.",
            },
          ]}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Contabilidad
        </h2>
        <QuickLinks
          links={[
            {
              href: "/portal/admin/servicios",
              title: "Servicios",
              description: "Catálogo de servicios y precios (ITBIS).",
            },
            {
              href: "/portal/admin/recibos",
              title: "Recibos",
              description: "Emitir recibos, registrar pagos, imprimir POS.",
            },
            {
              href: "/portal/admin/cotizaciones",
              title: "Cotizaciones",
              description: "Armar cotizaciones para pacientes.",
            },
            {
              href: "/portal/admin/pagos-recurrentes",
              title: "Pagos recurrentes",
              description: "Planes de pago periódicos por paciente.",
            },
          ]}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Administración y contenido
        </h2>
        <QuickLinks
          links={[
            {
              href: "/portal/admin/usuarios",
              title: "Usuarios",
              description: "Invitar, cambiar rol, activar/desactivar.",
            },
            {
              href: "/portal/admin/equipo",
              title: "Equipo",
              description: "Quién aparece en la sección Equipo de la landing.",
            },
            {
              href: "/portal/admin/recursos",
              title: "Recursos",
              description: "Material para familias en la landing pública.",
            },
            {
              href: "/portal/admin/carrusel",
              title: "Carrusel",
              description: "Slides del hero de la landing.",
            },
          ]}
        />
      </div>
    </div>
  );
}
