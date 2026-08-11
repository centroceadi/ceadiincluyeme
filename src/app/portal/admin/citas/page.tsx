import { requireRole } from "@/lib/supabase/dal";
import { listAppointments, listPatients, listSpecialists } from "@/lib/queries/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentForm } from "@/components/portal/appointment-form";
import { AppointmentsTable } from "@/components/portal/appointments-table";

export default async function AdminCitasPage() {
  await requireRole(["admin"]);
  const [appointments, patients, specialists] = await Promise.all([
    listAppointments(),
    listPatients(),
    listSpecialists(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Citas</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agendar cita</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm patients={patients} specialists={specialists} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Todas las citas ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentsTable appointments={appointments} showActions />
        </CardContent>
      </Card>
    </div>
  );
}
