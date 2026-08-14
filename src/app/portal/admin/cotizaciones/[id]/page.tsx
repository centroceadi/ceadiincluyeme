import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/dal";
import { getQuote, listBillingServices, listQuoteLines } from "@/lib/queries/billing";
import { QuoteDetail } from "@/components/portal/billing/quote-detail";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const { id } = await params;

  const quote = await getQuote(id);
  if (!quote) notFound();

  const [lines, services] = await Promise.all([
    listQuoteLines(id),
    listBillingServices(),
  ]);

  return <QuoteDetail quote={quote} lines={lines} services={services} />;
}
