import { requireRole } from "@/lib/supabase/dal";
import { QuickLinks } from "@/components/portal/quick-links";
import { ComingSoon } from "@/components/portal/coming-soon";

export default async function AdminPage() {
  const profile = await requireRole(["admin"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "admin"}
      </h1>
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
      <ComingSoon
        title="Gestión de usuarios"
        description="Administración de roles y usuarios llega en la Fase 5."
      />
    </div>
  );
}
