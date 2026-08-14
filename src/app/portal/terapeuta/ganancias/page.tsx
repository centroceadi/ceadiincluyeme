import { requireRole } from "@/lib/supabase/dal";
import { listMyEarnings } from "@/lib/queries/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceiptStatusBadge } from "@/components/portal/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function TerapeutaGananciasPage() {
  await requireRole(["terapeuta"]);
  const earnings = await listMyEarnings();

  const totalPaid = earnings
    .filter((e) => e.receipt_status === "paid")
    .reduce((sum, e) => sum + Number(e.line_total), 0);
  const totalPending = earnings
    .filter((e) => e.receipt_status !== "paid" && e.receipt_status !== "cancelled")
    .reduce((sum, e) => sum + Number(e.line_total), 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Mis ganancias</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Cobrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Pendiente de cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Detalle ({earnings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado del recibo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.patient_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    {e.receipt_issue_date ? formatDate(e.receipt_issue_date) : "—"}
                  </TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell>{formatCurrency(e.line_total)}</TableCell>
                  <TableCell>
                    <ReceiptStatusBadge status={e.receipt_status} />
                  </TableCell>
                </TableRow>
              ))}
              {earnings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no tenés recibos con líneas a tu nombre.
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
