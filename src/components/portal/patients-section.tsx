import { createPatient } from "@/lib/actions/clinical";
import type { Patient } from "@/lib/types/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PatientStatusBadge } from "@/components/portal/status-badge";
import { formatDate } from "@/lib/format";

/** Lista + alta de pacientes — la usan tanto admin como servicio_cliente,
 * los dos únicos roles con policy de insert sobre `patients`. */
export function PatientsSection({ patients }: { patients: Patient[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dar de alta un paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPatient} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input id="full_name" name="full_name" required className="w-56" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                className="w-44"
              />
            </div>
            <Button type="submit">Agregar paciente</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Todos los pacientes ({patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha de nacimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell>
                    {p.date_of_birth ? formatDate(p.date_of_birth) : "—"}
                  </TableCell>
                  <TableCell>
                    <PatientStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>{formatDate(p.created_at)}</TableCell>
                </TableRow>
              ))}
              {patients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay pacientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
