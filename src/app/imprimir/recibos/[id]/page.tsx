import { notFound } from "next/navigation";
import { verifySession } from "@/lib/supabase/dal";
import { getReceipt, listReceiptLines } from "@/lib/queries/billing";
import { PrintButton } from "@/components/portal/billing/print-button";
import { formatCurrency, formatDate } from "@/lib/format";

/**
 * Recibo en formato térmico POS: 72mm de ancho, largo adaptable al
 * contenido (ver contexto del proyecto). Ruta fuera de /portal a
 * propósito — no lleva el shell del portal (sidebar/topbar
 * desperdiciarían papel térmico). El acceso sigue protegido por RLS:
 * `getReceipt` devuelve null si el usuario logueado no puede ver este
 * recibo.
 */
export default async function PrintReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;

  const receipt = await getReceipt(id);
  if (!receipt) notFound();

  const lines = await listReceiptLines(id);

  return (
    <div className="flex flex-col items-center gap-4 bg-muted/30 py-6 print:bg-white print:py-0">
      <style>{`@page { size: 72mm auto; margin: 0; }`}</style>

      <div className="print:hidden">
        <PrintButton />
      </div>

      <div className="w-[72mm] bg-white p-2 text-[10px] leading-tight text-black print:p-1">
        <div className="text-center">
          <p className="text-xs font-bold">CEADI</p>
          <p>Centro de Aprendizaje y Cambio</p>
          <p>República Dominicana</p>
        </div>

        <div className="my-1 border-t border-dashed border-black" />

        <p>Recibo: {receipt.id.slice(0, 8)}</p>
        <p>Fecha: {formatDate(receipt.issue_date)}</p>
        <p>Paciente: {receipt.patient_name ?? "—"}</p>
        <p>Condición: {receipt.payment_condition}</p>
        {receipt.ncf && <p>NCF (uso interno): {receipt.ncf}</p>}

        <div className="my-1 border-t border-dashed border-black" />

        {lines.map((l) => (
          <div key={l.id} className="mb-1">
            <div className="flex justify-between">
              <span>{l.description}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                {l.quantity} x {formatCurrency(l.unit_price)}
              </span>
              <span>{formatCurrency(l.line_total)}</span>
            </div>
          </div>
        ))}

        <div className="my-1 border-t border-dashed border-black" />

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(receipt.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>ITBIS</span>
          <span>{formatCurrency(receipt.itbis_total)}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(receipt.total)}</span>
        </div>

        <div className="my-1 border-t border-dashed border-black" />

        <p className="text-center">
          Servicios de salud exentos de ITBIS — Art. 343 Código Tributario RD
        </p>
        <p className="text-center">¡Gracias!</p>
      </div>
    </div>
  );
}
