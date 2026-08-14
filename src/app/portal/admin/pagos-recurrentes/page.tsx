import { requireRole } from "@/lib/supabase/dal";
import { listBillingServices, listRecurringPayments } from "@/lib/queries/billing";
import { listPatients } from "@/lib/queries/clinical";
import { RecurringPaymentsSection } from "@/components/portal/billing/recurring-payments-section";

export default async function AdminPagosRecurrentesPage() {
  await requireRole(["admin"]);
  const [recurringPayments, patients, services] = await Promise.all([
    listRecurringPayments(),
    listPatients(),
    listBillingServices(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Pagos recurrentes</h1>
      <RecurringPaymentsSection
        recurringPayments={recurringPayments}
        patients={patients}
        services={services}
      />
    </div>
  );
}
