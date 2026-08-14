import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus, PatientStatus } from "@/lib/types/clinical";
import type { QuoteStatus, ReceiptStatus } from "@/lib/types/billing";

const APPOINTMENT_STATUS: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  scheduled: { label: "Agendada", variant: "outline" },
  confirmed: { label: "Confirmada", variant: "secondary" },
  completed: { label: "Completada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
  no_show: { label: "No asistió", variant: "destructive" },
};

const PATIENT_STATUS: Record<
  PatientStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Activo", variant: "default" },
  inactive: { label: "Inactivo", variant: "outline" },
  discharged: { label: "De alta", variant: "secondary" },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, variant } = APPOINTMENT_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const { label, variant } = PATIENT_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

const RECEIPT_STATUS: Record<
  ReceiptStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Borrador", variant: "outline" },
  issued: { label: "Emitido", variant: "secondary" },
  partially_paid: { label: "Pago parcial", variant: "secondary" },
  paid: { label: "Pagado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const QUOTE_STATUS: Record<
  QuoteStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Borrador", variant: "outline" },
  sent: { label: "Enviada", variant: "secondary" },
  accepted: { label: "Aceptada", variant: "default" },
  rejected: { label: "Rechazada", variant: "destructive" },
  expired: { label: "Expirada", variant: "destructive" },
};

export function ReceiptStatusBadge({ status }: { status: ReceiptStatus }) {
  const { label, variant } = RECEIPT_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const { label, variant } = QUOTE_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
