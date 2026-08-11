import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/dal";
import {
  getPatient,
  listAppointments,
  listTraceabilityEvents,
} from "@/lib/queries/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientStatusBadge } from "@/components/portal/status-badge";
import { AppointmentsTable } from "@/components/portal/appointments-table";
import { formatDateTime } from "@/lib/format";

const EVENT_LABEL: Record<string, string> = {
  patient_created: "Alta como paciente",
  appointment_created: "Cita agendada",
  appointment_status_changed: "Cambio de estado de cita",
};

export default async function TutorHijoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["tutor"]);
  const { id } = await params;

  const patient = await getPatient(id);
  // RLS ya filtró: si no sos el guardián, getPatient devuelve null acá.
  if (!patient) notFound();

  const [appointments, events] = await Promise.all([
    listAppointments({ patientId: id }),
    listTraceabilityEvents(id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{patient.full_name}</h1>
        <PatientStatusBadge status={patient.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentsTable appointments={appointments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seguimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-3">
            {events.map((e) => (
              <li key={e.id} className="border-l-2 border-muted pl-3 text-sm">
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(e.occurred_at)}
                </div>
                <div className="font-medium">
                  {EVENT_LABEL[e.event_type] ?? e.event_type}
                </div>
                <div className="text-muted-foreground">{e.summary}</div>
              </li>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todavía no hay actividad registrada.
              </p>
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
