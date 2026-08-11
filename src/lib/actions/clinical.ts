"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/supabase/dal";
import type { AppointmentStatus } from "@/lib/types/clinical";

/**
 * Server actions del núcleo clínico. Todas confían en RLS para la
 * autorización real (ver supabase/migrations/20260811100000_clinical_core.sql)
 * — acá solo se arma el insert/update; si el rol no tiene permiso, Supabase
 * devuelve un error y lo mostramos tal cual.
 */

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createPatient(formData: FormData) {
  const full_name = str(formData, "full_name");
  if (!full_name) throw new Error("El nombre es obligatorio.");

  const supabase = await createClient();
  const { error } = await supabase.from("patients").insert({
    full_name,
    date_of_birth: str(formData, "date_of_birth"),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/pacientes");
  revalidatePath("/portal/servicio-cliente/pacientes");
}

export async function createSpecialist(formData: FormData) {
  const id = str(formData, "profile_id");
  const specialty = str(formData, "specialty");
  if (!id || !specialty) {
    throw new Error("Elegí un perfil y completá la especialidad.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("specialists").insert({
    id,
    specialty,
    license_number: str(formData, "license_number"),
    bio: str(formData, "bio"),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/especialistas");
}

export async function createAppointment(formData: FormData) {
  const patient_id = str(formData, "patient_id");
  const specialist_id = str(formData, "specialist_id");
  const date = str(formData, "date");
  const time = str(formData, "time");
  if (!patient_id || !specialist_id || !date || !time) {
    throw new Error("Faltan datos para agendar la cita.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("appointments").insert({
    patient_id,
    specialist_id,
    scheduled_at: new Date(`${date}T${time}`).toISOString(),
    duration_minutes: Number(str(formData, "duration_minutes") ?? "60"),
    appointment_type: str(formData, "appointment_type"),
    notes: str(formData, "notes"),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/citas");
  revalidatePath("/portal/servicio-cliente/citas");
  revalidatePath("/portal/terapeuta/agenda");
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/citas");
  revalidatePath("/portal/servicio-cliente/citas");
  revalidatePath("/portal/terapeuta/agenda");
}

export async function createClinicalRecord(formData: FormData) {
  const patient_id = str(formData, "patient_id");
  const summary = str(formData, "summary");
  if (!patient_id || !summary) {
    throw new Error("Faltan datos para guardar la nota clínica.");
  }

  const { user, supabase } = await verifySession();
  const { error } = await supabase.from("clinical_records").insert({
    patient_id,
    specialist_id: user.id,
    summary,
    details: str(formData, "details"),
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/portal/terapeuta/pacientes/${patient_id}`);
}

export async function createPsychoRecord(formData: FormData) {
  const patient_id = str(formData, "patient_id");
  const summary = str(formData, "summary");
  if (!patient_id || !summary) {
    throw new Error("Faltan datos para guardar la nota psicopedagógica.");
  }

  const { user, supabase } = await verifySession();
  const { error } = await supabase.from("psycho_records").insert({
    patient_id,
    specialist_id: user.id,
    area: str(formData, "area"),
    summary,
    recommendations: str(formData, "recommendations"),
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/portal/terapeuta/pacientes/${patient_id}`);
}
