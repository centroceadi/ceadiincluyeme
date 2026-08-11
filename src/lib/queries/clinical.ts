import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Appointment,
  ClinicalRecord,
  Patient,
  PsychoRecord,
  Specialist,
  TraceabilityEvent,
} from "@/lib/types/clinical";

/**
 * Capa de lectura del núcleo clínico. Ninguna función de acá filtra por
 * rol explícitamente — RLS ya devuelve solo las filas que le tocan a
 * quien hace la query (ver supabase/migrations/20260811100000_clinical_core.sql),
 * así que la misma función sirve para admin, terapeuta, tutor y
 * servicio_cliente.
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

export type SpecialistWithName = Specialist & { full_name: string | null };

export async function listSpecialists(): Promise<SpecialistWithName[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("specialists")
    .select("*")
    .order("specialty");
  const specialists = (data ?? []) as Specialist[];
  const names = await namesById(
    supabase,
    specialists.map((s) => s.id)
  );
  return specialists.map((s) => ({
    ...s,
    full_name: names.get(s.id) ?? null,
  }));
}

/** Perfiles con role=terapeuta que todavía no tienen fila en `specialists`. */
export async function listUnlinkedTherapistProfiles(): Promise<
  { id: string; full_name: string | null }[]
> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: specialists }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("role", "terapeuta"),
    supabase.from("specialists").select("id"),
  ]);
  const linked = new Set((specialists ?? []).map((s) => s.id));
  return (profiles ?? []).filter((p) => !linked.has(p.id));
}

export async function listPatients(): Promise<Patient[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .order("full_name");
  return (data ?? []) as Patient[];
}

export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Patient | null;
}

export type AppointmentWithNames = Appointment & {
  patient_name: string | null;
  specialist_name: string | null;
};

export async function listAppointments(filter?: {
  patientId?: string;
}): Promise<AppointmentWithNames[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("*")
    .order("scheduled_at", { ascending: false });

  if (filter?.patientId) {
    query = query.eq("patient_id", filter.patientId);
  }

  const { data } = await query;
  const appointments = (data ?? []) as Appointment[];

  const [specialistNames, patients] = await Promise.all([
    namesById(
      supabase,
      appointments.map((a) => a.specialist_id)
    ),
    (async () => {
      const ids = [...new Set(appointments.map((a) => a.patient_id))];
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from("patients")
        .select("id, full_name")
        .in("id", ids);
      return data ?? [];
    })(),
  ]);
  const patientNames = new Map(patients.map((p) => [p.id, p.full_name]));

  return appointments.map((a) => ({
    ...a,
    specialist_name: specialistNames.get(a.specialist_id) ?? null,
    patient_name: patientNames.get(a.patient_id) ?? null,
  }));
}

export async function listClinicalRecords(
  patientId: string
): Promise<ClinicalRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clinical_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false });
  return (data ?? []) as ClinicalRecord[];
}

export async function listPsychoRecords(
  patientId: string
): Promise<PsychoRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("psycho_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false });
  return (data ?? []) as PsychoRecord[];
}

export async function listTraceabilityEvents(
  patientId: string
): Promise<TraceabilityEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("traceability_events")
    .select("*")
    .eq("patient_id", patientId)
    .order("occurred_at", { ascending: false });
  return (data ?? []) as TraceabilityEvent[];
}
