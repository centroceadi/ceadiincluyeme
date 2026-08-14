import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  BillingService,
  Quote,
  QuoteLine,
  Receipt,
  ReceiptLine,
  RecurringPayment,
  Transaction,
} from "@/lib/types/billing";

/**
 * Capa de lectura de contabilidad. Igual que src/lib/queries/clinical.ts:
 * ninguna función filtra por rol a mano — RLS ya devuelve solo lo que le
 * toca a quien hace la query (ver
 * supabase/migrations/20260814100000_billing.sql).
 */

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function namesById(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, string | null>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);
  return new Map((data ?? []).map((p) => [p.id, p.full_name]));
}

export async function listBillingServices(): Promise<BillingService[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("billing_services")
    .select("*")
    .order("name");
  return (data ?? []) as BillingService[];
}

export async function getBillingService(
  id: string
): Promise<BillingService | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("billing_services")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as BillingService | null;
}

export type ReceiptWithPatientName = Receipt & { patient_name: string | null };

export async function listReceipts(): Promise<ReceiptWithPatientName[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receipts")
    .select("*")
    .order("issue_date", { ascending: false });
  const receipts = (data ?? []) as Receipt[];

  const ids = [...new Set(receipts.map((r) => r.patient_id))];
  const patients =
    ids.length === 0
      ? []
      : (
          await supabase.from("patients").select("id, full_name").in("id", ids)
        ).data ?? [];
  const names = new Map(patients.map((p) => [p.id, p.full_name]));

  return receipts.map((r) => ({
    ...r,
    patient_name: names.get(r.patient_id) ?? null,
  }));
}

export async function getReceipt(
  id: string
): Promise<ReceiptWithPatientName | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const { data: patient } = await supabase
    .from("patients")
    .select("full_name")
    .eq("id", data.patient_id)
    .maybeSingle();

  return { ...(data as Receipt), patient_name: patient?.full_name ?? null };
}

export type ReceiptLineWithNames = ReceiptLine & {
  specialist_name: string | null;
};

export async function listReceiptLines(
  receiptId: string
): Promise<ReceiptLineWithNames[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receipt_lines")
    .select("*")
    .eq("receipt_id", receiptId)
    .order("created_at");
  const lines = (data ?? []) as ReceiptLine[];

  const specialistIds = lines
    .map((l) => l.specialist_id)
    .filter((id): id is string => !!id);
  const names = await namesById(supabase, specialistIds);

  return lines.map((l) => ({
    ...l,
    specialist_name: l.specialist_id ? names.get(l.specialist_id) ?? null : null,
  }));
}

export async function listTransactions(
  receiptId: string
): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("receipt_id", receiptId)
    .order("transaction_date", { ascending: false });
  return (data ?? []) as Transaction[];
}

/** "Mis Ganancias": las líneas de recibo atribuidas al especialista logueado
 * (RLS ya restringe receipt_lines a `specialist_id = auth.uid()` para
 * terapeuta), con el nombre del paciente y la fecha del recibo. */
export type EarningLine = ReceiptLine & {
  patient_name: string | null;
  receipt_issue_date: string;
  receipt_status: Receipt["status"];
};

export async function listMyEarnings(): Promise<EarningLine[]> {
  const supabase = await createClient();
  const { data: lines } = await supabase
    .from("receipt_lines")
    .select("*")
    .order("created_at", { ascending: false });
  const receiptLines = (lines ?? []) as ReceiptLine[];

  const receiptIds = [...new Set(receiptLines.map((l) => l.receipt_id))];
  const receipts =
    receiptIds.length === 0
      ? []
      : (
          await supabase
            .from("receipts")
            .select("id, patient_id, issue_date, status")
            .in("id", receiptIds)
        ).data ?? [];
  const receiptById = new Map(receipts.map((r) => [r.id, r]));

  const patientIds = [...new Set(receipts.map((r) => r.patient_id))];
  const patients =
    patientIds.length === 0
      ? []
      : (
          await supabase.from("patients").select("id, full_name").in("id", patientIds)
        ).data ?? [];
  const patientNames = new Map(patients.map((p) => [p.id, p.full_name]));

  return receiptLines.map((l) => {
    const receipt = receiptById.get(l.receipt_id);
    return {
      ...l,
      patient_name: receipt ? patientNames.get(receipt.patient_id) ?? null : null,
      receipt_issue_date: receipt?.issue_date ?? "",
      receipt_status: (receipt?.status ?? "issued") as Receipt["status"],
    };
  });
}

export type QuoteWithPatientName = Quote & { patient_name: string | null };

export async function listQuotes(): Promise<QuoteWithPatientName[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("*")
    .order("issue_date", { ascending: false });
  const quotes = (data ?? []) as Quote[];

  const ids = [...new Set(quotes.map((q) => q.patient_id))];
  const patients =
    ids.length === 0
      ? []
      : (
          await supabase.from("patients").select("id, full_name").in("id", ids)
        ).data ?? [];
  const names = new Map(patients.map((p) => [p.id, p.full_name]));

  return quotes.map((q) => ({
    ...q,
    patient_name: names.get(q.patient_id) ?? null,
  }));
}

export async function getQuote(id: string): Promise<QuoteWithPatientName | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const { data: patient } = await supabase
    .from("patients")
    .select("full_name")
    .eq("id", data.patient_id)
    .maybeSingle();

  return { ...(data as Quote), patient_name: patient?.full_name ?? null };
}

export async function listQuoteLines(quoteId: string): Promise<QuoteLine[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quote_lines")
    .select("*")
    .eq("quote_id", quoteId)
    .order("created_at");
  return (data ?? []) as QuoteLine[];
}

export type RecurringPaymentWithNames = RecurringPayment & {
  patient_name: string | null;
  service_name: string | null;
};

export async function listRecurringPayments(): Promise<
  RecurringPaymentWithNames[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recurring_payments")
    .select("*")
    .order("next_charge_date");
  const rows = (data ?? []) as RecurringPayment[];

  const patientIds = [...new Set(rows.map((r) => r.patient_id))];
  const serviceIds = [
    ...new Set(rows.map((r) => r.billing_service_id).filter((id): id is string => !!id)),
  ];

  const [patients, services] = await Promise.all([
    patientIds.length
      ? supabase.from("patients").select("id, full_name").in("id", patientIds)
      : Promise.resolve({ data: [] }),
    serviceIds.length
      ? supabase.from("billing_services").select("id, name").in("id", serviceIds)
      : Promise.resolve({ data: [] }),
  ]);
  const patientNames = new Map((patients.data ?? []).map((p) => [p.id, p.full_name]));
  const serviceNames = new Map((services.data ?? []).map((s) => [s.id, s.name]));

  return rows.map((r) => ({
    ...r,
    patient_name: patientNames.get(r.patient_id) ?? null,
    service_name: r.billing_service_id
      ? serviceNames.get(r.billing_service_id) ?? null
      : null,
  }));
}
