import { requireRole } from "@/lib/supabase/dal";
import { listReceipts } from "@/lib/queries/billing";
import { listPatients } from "@/lib/queries/clinical";
import { ReceiptsSection } from "@/components/portal/billing/receipts-section";

export default async function ServicioClienteRecibosPage() {
  await requireRole(["servicio_cliente"]);
  const [receipts, patients] = await Promise.all([
    listReceipts(),
    listPatients(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Recibos</h1>
      <ReceiptsSection
        receipts={receipts}
        patients={patients}
        basePath="/portal/servicio-cliente/recibos"
      />
    </div>
  );
}
