/**
 * Tipos del núcleo clínico (Fase 2). Reflejan 1:1 el esquema de
 * supabase/migrations/20260811100000_clinical_core.sql — si cambia la
 * migración, actualizar acá también.
 */

export type PatientStatus = "active" | "inactive" | "discharged";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type TraceabilityEventType =
  | "patient_created"
  | "appointment_created"
  | "appointment_status_changed"
  | "clinical_record_created"
  | "psycho_record_created";

export type Specialist = {
  id: string; // = profiles.id
  specialty: string;
  license_number: string | null;
  bio: string | null;
  active: boolean;
  /** Vínculo opcional con su bio pública en team_members (landing). */
  team_member_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Patient = {
  id: string;
  full_name: string;
  date_of_birth: string | null; // date (YYYY-MM-DD)
  guardian_id: string | null; // profiles.id del tutor
  status: PatientStatus;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  specialist_id: string;
  scheduled_at: string; // timestamptz ISO
  duration_minutes: number;
  status: AppointmentStatus;
  appointment_type: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClinicalRecord = {
  id: string;
  patient_id: string;
  specialist_id: string;
  appointment_id: string | null;
  session_date: string; // date
  summary: string;
  details: string | null;
  created_at: string;
  updated_at: string;
};

export type PsychoRecord = {
  id: string;
  patient_id: string;
  specialist_id: string;
  appointment_id: string | null;
  session_date: string; // date
  area: string | null;
  summary: string;
  recommendations: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Fila del muro de trazabilidad. `is_clinical` ya viene filtrado por RLS
 * según el rol (servicio_cliente y tutor nunca reciben filas con
 * is_clinical = true), pero se expone igual por si la UI quiere marcarlas
 * visualmente para admin/terapeuta.
 */
export type TraceabilityEvent = {
  id: string;
  patient_id: string;
  event_type: TraceabilityEventType;
  actor_id: string | null;
  is_clinical: boolean;
  summary: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
};
