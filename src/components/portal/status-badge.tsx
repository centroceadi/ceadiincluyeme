import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus, PatientStatus } from "@/lib/types/clinical";

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
