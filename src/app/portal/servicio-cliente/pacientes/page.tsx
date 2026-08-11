import { requireRole } from "@/lib/supabase/dal";
import { listPatients } from "@/lib/queries/clinical";
import { PatientsSection } from "@/components/portal/patients-section";

export default async function ServicioClientePacientesPage() {
  await requireRole(["servicio_cliente"]);
  const patients = await listPatients();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Alta de pacientes</h1>
      <PatientsSection patients={patients} />
    </div>
  );
}
