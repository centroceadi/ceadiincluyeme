import { createAppointment } from "@/lib/actions/clinical";
import type { Patient } from "@/lib/types/clinical";
import type { SpecialistWithName } from "@/lib/queries/clinical";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

/** Form de agendar cita, compartido entre /portal/admin/citas y
 * /portal/servicio-cliente/citas (ambos roles pueden agendar para
 * cualquier especialista, a diferencia de terapeuta que solo agenda para
 * sí mismo). */
export function AppointmentForm({
  patients,
  specialists,
}: {
  patients: Patient[];
  specialists: SpecialistWithName[];
}) {
  return (
    <form action={createAppointment} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patient_id">Paciente</Label>
        <NativeSelect id="patient_id" name="patient_id" required className="w-48">
          <option value="">Elegir…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="specialist_id">Especialista</Label>
        <NativeSelect
          id="specialist_id"
          name="specialist_id"
          required
          className="w-48"
        >
          <option value="">Elegir…</option>
          {specialists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name ?? s.specialty}
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
  );
}
