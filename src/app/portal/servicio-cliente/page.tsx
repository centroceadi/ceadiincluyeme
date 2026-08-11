import { requireRole } from "@/lib/supabase/dal";
import { ComingSoon } from "@/components/portal/coming-soon";

export default async function ServicioClientePage() {
  const profile = await requireRole(["servicio_cliente"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "equipo de servicio al cliente"}
      </h1>
      <ComingSoon
        title="Agenda y alta de pacientes"
        description="Gestión de citas de todos los terapeutas y alta de pacientes, sin acceso a expedientes clínicos ni notas de seguimiento. Llega en la Fase 3."
      />
    </div>
  );
}
