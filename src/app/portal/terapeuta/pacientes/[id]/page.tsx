import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/dal";
import {
  getPatient,
  listAppointments,
  listClinicalRecords,
  listPsychoRecords,
} from "@/lib/queries/clinical";
import { createClinicalRecord, createPsychoRecord } from "@/lib/actions/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PatientStatusBadge } from "@/components/portal/status-badge";
import { AppointmentsTable } from "@/components/portal/appointments-table";
import { formatDate } from "@/lib/format";

export default async function TerapeutaPacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["terapeuta"]);
  const { id } = await params;

  const patient = await getPatient(id);
  // RLS ya filtró: si no es "su" paciente, getPatient devuelve null acá.
  if (!patient) notFound();

  const [appointments, clinicalRecords, psychoRecords] = await Promise.all([
    listAppointments({ patientId: id }),
    listClinicalRecords(id),
    listPsychoRecords(id),
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
          <CardTitle className="text-base">Expediente clínico</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={createClinicalRecord} className="flex flex-col gap-3">
            <input type="hidden" name="patient_id" value={patient.id} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="summary">Resumen de la sesión</Label>
              <Textarea id="summary" name="summary" required rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="details">Detalle (opcional)</Label>
              <Textarea id="details" name="details" rows={3} />
            </div>
            <Button type="submit" className="self-start">
              Guardar nota clínica
            </Button>
          </form>

          <div className="flex flex-col gap-3 border-t pt-4">
            {clinicalRecords.map((r) => (
              <div key={r.id} className="rounded-lg border p-3 text-sm">
                <div className="mb-1 text-xs text-muted-foreground">
                  {formatDate(r.session_date)}
                </div>
                <p className="font-medium">{r.summary}</p>
                {r.details && (
                  <p className="mt-1 text-muted-foreground">{r.details}</p>
                )}
              </div>
            ))}
            {clinicalRecords.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sin notas clínicas todavía.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expediente psicopedagógico</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={createPsychoRecord} className="flex flex-col gap-3">
            <input type="hidden" name="patient_id" value={patient.id} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="area">Área evaluada</Label>
              <Input id="area" name="area" placeholder="Lenguaje, motricidad…" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="summary_psycho">Resumen</Label>
              <Textarea id="summary_psycho" name="summary" required rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recommendations">Recomendaciones (opcional)</Label>
              <Textarea id="recommendations" name="recommendations" rows={2} />
            </div>
            <Button type="submit" className="self-start">
              Guardar nota psicopedagógica
            </Button>
          </form>

          <div className="flex flex-col gap-3 border-t pt-4">
            {psychoRecords.map((r) => (
              <div key={r.id} className="rounded-lg border p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(r.session_date)}</span>
                  {r.area && <span>· {r.area}</span>}
                </div>
                <p className="font-medium">{r.summary}</p>
                {r.recommendations && (
                  <p className="mt-1 text-muted-foreground">
                    {r.recommendations}
                  </p>
                )}
              </div>
            ))}
            {psychoRecords.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sin notas psicopedagógicas todavía.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
