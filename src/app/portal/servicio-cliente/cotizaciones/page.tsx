import { requireRole } from "@/lib/supabase/dal";
import { listQuotes } from "@/lib/queries/billing";
import { listPatients } from "@/lib/queries/clinical";
import { QuotesSection } from "@/components/portal/billing/quotes-section";

export default async function ServicioClienteCotizacionesPage() {
  await requireRole(["servicio_cliente"]);
  const [quotes, patients] = await Promise.all([listQuotes(), listPatients()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Cotizaciones</h1>
      <QuotesSection
        quotes={quotes}
        patients={patients}
        basePath="/portal/servicio-cliente/cotizaciones"
      />
    </div>
  );
}
