"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  PaymentCondition,
  PaymentMethod,
  ReceiptStatus,
  RecurrenceFrequency,
} from "@/lib/types/billing";

/**
 * Server actions de contabilidad. Confían en RLS para la autorización real
 * (ver supabase/migrations/20260814100000_billing.sql) — acá solo se arma
 * el insert/update; si el rol no tiene permiso, Supabase devuelve un error.
 */

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function revalidateBilling(path: string) {
  revalidatePath(`/portal/admin/${path}`);
  revalidatePath(`/portal/servicio-cliente/${path}`);
}

// ---- catálogo de servicios ----

export async function createBillingService(formData: FormData) {
  const name = str(formData, "name");
  const unit_price = str(formData, "unit_price");
  if (!name || !unit_price) {
    throw new Error("Faltan datos para el servicio.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("billing_services").insert({
    name,
    description: str(formData, "description"),
    unit_price: Number(unit_price),
    itbis_exempt: formData.get("itbis_exempt") === "on",
    itbis_rate: Number(str(formData, "itbis_rate") ?? "0"),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/servicios");
}

// ---- recibos ----

export async function createReceipt(formData: FormData) {
  const patient_id = str(formData, "patient_id");
  const basePath = str(formData, "base_path") ?? "/portal/admin/recibos";
  if (!patient_id) throw new Error("Elegí un paciente.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipts")
    .insert({
      patient_id,
      ncf: str(formData, "ncf"),
      payment_condition: (str(formData, "payment_condition") ??
        "contado") as PaymentCondition,
      notes: str(formData, "notes"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidateBilling("recibos");
  redirect(`${basePath}/${data.id}`);
}

export async function addReceiptLine(formData: FormData) {
  const receipt_id = str(formData, "receipt_id");
  const billing_service_id = str(formData, "billing_service_id");
  const quantity = Number(str(formData, "quantity") ?? "1");
  if (!receipt_id || !billing_service_id || !quantity) {
    throw new Error("Faltan datos para la línea del recibo.");
  }

  const supabase = await createClient();
  const { data: service, error: serviceError } = await supabase
    .from("billing_services")
    .select("*")
    .eq("id", billing_service_id)
    .single();
  if (serviceError || !service) {
    throw new Error("No se encontró el servicio elegido.");
  }

  const unit_price = str(formData, "unit_price")
    ? Number(str(formData, "unit_price"))
    : service.unit_price;
  const itbis_rate = service.itbis_exempt ? 0 : service.itbis_rate;
  const line_total = quantity * unit_price;

  const { error } = await supabase.from("receipt_lines").insert({
    receipt_id,
    billing_service_id,
    specialist_id: str(formData, "specialist_id"),
    description: str(formData, "description") ?? service.name,
    quantity,
    unit_price,
    itbis_rate,
    line_total,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/portal/admin/recibos/${receipt_id}`);
  revalidatePath(`/portal/servicio-cliente/recibos/${receipt_id}`);
}

export async function updateReceiptStatus(
  receiptId: string,
  status: ReceiptStatus
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("receipts")
    .update({ status })
    .eq("id", receiptId);
  if (error) throw new Error(error.message);

  revalidatePath(`/portal/admin/recibos/${receiptId}`);
  revalidatePath(`/portal/servicio-cliente/recibos/${receiptId}`);
}

/** Registra un pago y, si con eso el recibo queda cubierto (o parcialmente
 * cubierto), actualiza `status` para que quede reflejado sin un paso extra. */
export async function recordTransaction(formData: FormData) {
  const receipt_id = str(formData, "receipt_id");
  const patient_id = str(formData, "patient_id");
  const amountStr = str(formData, "amount");
  if (!receipt_id || !patient_id || !amountStr) {
    throw new Error("Faltan datos para registrar el pago.");
  }
  const amount = Number(amountStr);

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert({
    receipt_id,
    patient_id,
    amount,
    payment_method: (str(formData, "payment_method") ?? "cash") as PaymentMethod,
    notes: str(formData, "notes"),
  });
  if (error) throw new Error(error.message);

  const [{ data: receipt }, { data: transactions }] = await Promise.all([
    supabase.from("receipts").select("total").eq("id", receipt_id).single(),
    supabase.from("transactions").select("amount").eq("receipt_id", receipt_id),
  ]);
  const paid = (transactions ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
  if (receipt) {
    const status: ReceiptStatus =
      paid >= Number(receipt.total) && Number(receipt.total) > 0
        ? "paid"
        : paid > 0
          ? "partially_paid"
          : "issued";
    await supabase.from("receipts").update({ status }).eq("id", receipt_id);
  }

  revalidatePath(`/portal/admin/recibos/${receipt_id}`);
  revalidatePath(`/portal/servicio-cliente/recibos/${receipt_id}`);
}

// ---- cotizaciones ----

export async function createQuote(formData: FormData) {
  const patient_id = str(formData, "patient_id");
  const basePath = str(formData, "base_path") ?? "/portal/admin/cotizaciones";
  if (!patient_id) throw new Error("Elegí un paciente.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      patient_id,
      valid_until: str(formData, "valid_until"),
      notes: str(formData, "notes"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidateBilling("cotizaciones");
  redirect(`${basePath}/${data.id}`);
}

export async function addQuoteLine(formData: FormData) {
  const quote_id = str(formData, "quote_id");
  const billing_service_id = str(formData, "billing_service_id");
  const quantity = Number(str(formData, "quantity") ?? "1");
  if (!quote_id || !billing_service_id || !quantity) {
    throw new Error("Faltan datos para la línea de la cotización.");
  }

  const supabase = await createClient();
  const { data: service, error: serviceError } = await supabase
    .from("billing_services")
    .select("*")
    .eq("id", billing_service_id)
    .single();
  if (serviceError || !service) {
    throw new Error("No se encontró el servicio elegido.");
  }

  const unit_price = str(formData, "unit_price")
    ? Number(str(formData, "unit_price"))
    : service.unit_price;
  const itbis_rate = service.itbis_exempt ? 0 : service.itbis_rate;
  const line_total = quantity * unit_price;

  const { error } = await supabase.from("quote_lines").insert({
    quote_id,
    billing_service_id,
    description: str(formData, "description") ?? service.name,
    quantity,
    unit_price,
    itbis_rate,
    line_total,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/portal/admin/cotizaciones/${quote_id}`);
  revalidatePath(`/portal/servicio-cliente/cotizaciones/${quote_id}`);
}

// ---- pagos recurrentes ----

export async function createRecurringPayment(formData: FormData) {
  const patient_id = str(formData, "patient_id");
  const amount = str(formData, "amount");
  const next_charge_date = str(formData, "next_charge_date");
  if (!patient_id || !amount || !next_charge_date) {
    throw new Error("Faltan datos para el pago recurrente.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("recurring_payments").insert({
    patient_id,
    billing_service_id: str(formData, "billing_service_id"),
    amount: Number(amount),
    frequency: (str(formData, "frequency") ?? "monthly") as RecurrenceFrequency,
    next_charge_date,
    notes: str(formData, "notes"),
  });
  if (error) throw new Error(error.message);

  revalidateBilling("pagos-recurrentes");
}
