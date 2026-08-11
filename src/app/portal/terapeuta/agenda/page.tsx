import { requireRole } from "@/lib/supabase/dal";
import { listAppointments, listPatients } from "@/lib/queries/clinical";
import { createAppointment } from "@/lib/actions/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { AppointmentsTable } from "@/components/portal/appointments-table";

export default async function TerapeutaAgendaPage() {
  const profile = await requireRole(["terapeuta"]);
  const [appointments, patients] = await Promise.all([
    listAppointments(),
    listPatients(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Mi agenda</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agendar cita propia</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createAppointment}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="specialist_id" value={profile.id} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient_id">Paciente</Label>
              <NativeSelect
                id="patient_id"
                name="patient_id"
                required
                className="w-48"
              >
                <option value="">Elegir…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" name="date" type="date" required className="w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" name="time" type="time" required className="w-32" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment_type">Tipo</Label>
              <Input
                id="appointment_type"
                name="appointment_type"
                placeholder="Terapia clínica…"
                className="w-44"
              />
            </div>
            <Button type="submit">Agendar</Button>
          </form>
          {patients.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Todavía no tenés pacientes asignados — servicio al cliente da
              de alta y agenda la primera cita.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Mis citas ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentsTable appointments={appointments} showActions />
        </CardContent>
      </Card>
    </div>
  );
}
