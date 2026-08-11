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
        ]}
      />
      <ComingSoon
        title="Contabilidad y gestión de usuarios"
        description="Recibos, cotizaciones, ITBIS/NCF y administración de roles llegan en las Fases 4–5."
      />
    </div>
  );
}
