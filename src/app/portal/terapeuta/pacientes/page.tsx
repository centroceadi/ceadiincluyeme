import Link from "next/link";
import { requireRole } from "@/lib/supabase/dal";
import { listPatients } from "@/lib/queries/clinical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientStatusBadge } from "@/components/portal/status-badge";

export default async function TerapeutaPacientesPage() {
  await requireRole(["terapeuta"]);
  const patients = await listPatients();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Mis pacientes</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pacientes que tratás ({patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell>
                    <PatientStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/portal/terapeuta/pacientes/${p.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver expediente →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {patients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no tenés pacientes asignados.
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
