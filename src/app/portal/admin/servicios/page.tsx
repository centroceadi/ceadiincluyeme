import { requireRole } from "@/lib/supabase/dal";
import { listBillingServices } from "@/lib/queries/billing";
import { ServicesSection } from "@/components/portal/billing/services-section";

export default async function AdminServiciosPage() {
  await requireRole(["admin"]);
  const services = await listBillingServices();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Catálogo de servicios</h1>
      <ServicesSection services={services} />
    </div>
  );
}
