import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/components/portal/status-badge";
import { formatDateTime } from "@/lib/format";
import { updateAppointmentStatus } from "@/lib/actions/clinical";
import type { AppointmentWithNames } from "@/lib/queries/clinical";

const NEXT_STATUS: Record<string, { status: "completed" | "cancelled"; label: string }[]> = {
  scheduled: [
    { status: "completed", label: "Marcar completada" },
    { status: "cancelled", label: "Cancelar" },
  ],
  confirmed: [
    { status: "completed", label: "Marcar completada" },
    { status: "cancelled", label: "Cancelar" },
  ],
};

/** Tabla de citas compartida entre admin/servicio_cliente/terapeuta.
 * `showActions` habilita los botones de cambio de estado — RLS igual
 * bloquea la escritura si el que mira no tiene permiso, esto es solo UX. */
export function AppointmentsTable({
  appointments,
  showActions = false,
}: {
  appointments: AppointmentWithNames[];
  showActions?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Especialista</TableHead>
          <TableHead>Fecha y hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          {showActions && <TableHead>Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">
              {a.patient_name ?? "—"}
            </TableCell>
            <TableCell>{a.specialist_name ?? "—"}</TableCell>
            <TableCell>{formatDateTime(a.scheduled_at)}</TableCell>
            <TableCell>{a.appointment_type ?? "—"}</TableCell>
            <TableCell>
              <AppointmentStatusBadge status={a.status} />
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  {(NEXT_STATUS[a.status] ?? []).map((next) => (
                    <form
                      key={next.status}
                      action={updateAppointmentStatus.bind(null, a.id, next.status)}
                    >
                      <Button type="submit" size="sm" variant="outline">
                        {next.label}
                      </Button>
                    </form>
                  ))}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {appointments.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={showActions ? 6 : 5}
              className="text-center text-muted-foreground"
            >
              No hay citas todavía.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
