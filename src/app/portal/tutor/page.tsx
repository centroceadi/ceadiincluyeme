import { requireRole } from "@/lib/supabase/dal";
import { ComingSoon } from "@/components/portal/coming-soon";

export default async function TutorPage() {
  const profile = await requireRole(["tutor"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "tutor"}
      </h1>
      <ComingSoon
        title="Seguimiento de tus hijos/as"
        description="Vista de solo lectura de los pacientes donde sos guardián, con sus citas y avances. Llega en la Fase 3."
      />
    </div>
  );
}
