import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/dal";
import {
  getReceipt,
  listBillingServices,
  listReceiptLines,
  listTransactions,
} from "@/lib/queries/billing";
import { listSpecialists } from "@/lib/queries/clinical";
import { ReceiptDetail } from "@/components/portal/billing/receipt-detail";

export default async function AdminReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const { id } = await params;

  const receipt = await getReceipt(id);
  if (!receipt) notFound();

  const [lines, transactions, services, specialists] = await Promise.all([
    listReceiptLines(id),
    listTransactions(id),
    listBillingServices(),
    listSpecialists(),
  ]);

  return (
    <ReceiptDetail
      receipt={receipt}
      lines={lines}
      transactions={transactions}
      services={services}
      specialists={specialists}
      printHref={`/imprimir/recibos/${id}`}
    />
  );
}
