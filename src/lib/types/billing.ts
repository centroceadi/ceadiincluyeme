/**
 * Tipos del módulo de contabilidad (Fase 4). Reflejan 1:1 el esquema de
 * supabase/migrations/20260814100000_billing.sql — si cambia la
 * migración, actualizar acá también.
 *
 * Nota de nomenclatura: la tabla se llama `receipts` pero en toda la UI
 * el concepto se muestra como "Recibo" (convención heredada de la
 * versión anterior en Base44).
 */

export type PaymentCondition = "contado" | "credito" | "cuotas";

export type ReceiptStatus =
  | "draft"
  | "issued"
  | "paid"
  | "partially_paid"
  | "cancelled";

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly";

export type PaymentMethod = "cash" | "card" | "transfer" | "check" | "other";

export type BillingService = {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  /** Art. 343 Código Tributario RD: servicios de salud exentos de ITBIS. */
  itbis_exempt: boolean;
  itbis_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Receipt = {
  id: string;
  patient_id: string;
  /** Uso interno únicamente — NO es un e-CF válido ante la DGII. */
  ncf: string | null;
  issue_date: string;
  payment_condition: PaymentCondition;
  status: ReceiptStatus;
  subtotal: number;
  itbis_total: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ReceiptLine = {
  id: string;
  receipt_id: string;
  billing_service_id: string | null;
  appointment_id: string | null;
  specialist_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  itbis_rate: number;
  line_total: number;
  created_at: string;
};

export type Quote = {
  id: string;
  patient_id: string;
  issue_date: string;
  valid_until: string | null;
  status: QuoteStatus;
  subtotal: number;
  itbis_total: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteLine = {
  id: string;
  quote_id: string;
  billing_service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  itbis_rate: number;
  line_total: number;
  created_at: string;
};

export type RecurringPayment = {
  id: string;
  patient_id: string;
  billing_service_id: string | null;
  amount: number;
  frequency: RecurrenceFrequency;
  next_charge_date: string;
  active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  receipt_id: string | null;
  patient_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_date: string;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
};
