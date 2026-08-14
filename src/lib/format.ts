/** Formateo compartido para fechas/horas en la UI del portal (es-DO). */

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { dateStyle: "medium" });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(amount);
}
