import { requireRole } from "@/lib/supabase/dal";
import { QuickLinks } from "@/components/portal/quick-links";

export default async function ServicioClientePage() {
  const profile = await requireRole(["servicio_cliente"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "equipo de servicio al cliente"}
      </h1>
      <QuickLinks
        links={[
          {
            href: "/portal/servicio-cliente/citas",
            title: "Agenda de citas",
            description: "Agendar y gestionar citas de todos los especialistas.",
          },
          {
            href: "/portal/servicio-cliente/pacientes",
            title: "Alta de pacientes",
            description: "Registrar nuevos pacientes en el sistema.",
          },
        ]}
      />
    </div>
  );
}
