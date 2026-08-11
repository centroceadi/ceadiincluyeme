import { requireRole } from "@/lib/supabase/dal";
import { ComingSoon } from "@/components/portal/coming-soon";

export default async function AdminPage() {
  const profile = await requireRole(["admin"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "admin"}
      </h1>
      <ComingSoon
        title="Panel de administración"
        description="Pacientes, especialistas, citas, expedientes y contabilidad llegan en las Fases 2–4."
      />
    </div>
  );
}
