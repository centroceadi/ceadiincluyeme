import Link from "next/link";
import { createReceipt } from "@/lib/actions/billing";
import type { ReceiptWithPatientName } from "@/lib/queries/billing";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { ReceiptStatusBadge } from "@/components/portal/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

/** Lista + alta de recibos — compartido entre admin y servicio_cliente
 * (los dos únicos roles con policy de insert sobre `receipts`). */
export function ReceiptsSection({
  receipts,
  patients,
  basePath,
}: {
  receipts: ReceiptWithPatientName[];
  patients: Patient[];
  basePath: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo recibo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createReceipt} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="base_path" value={basePath} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient_id">Paciente</Label>
              <NativeSelect
                id="patient_id"
                name="patient_id"
                required
                className="w-56"
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
              <Label htmlFor="payment_condition">Condición de pago</Label>
              <NativeSelect
                id="payment_condition"
                name="payment_condition"
                className="w-36"
              >
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
                <option value="cuotas">Cuotas</option>
              </NativeSelect>
            </div>
            <Button type="submit">Crear recibo</Button>
          </form>
          <p className="mt-2 text-sm text-muted-foreground">
            Después de crearlo, agregás las líneas (servicios) en el
            detalle del recibo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recibos ({receipts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Condición</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.patient_name ?? "—"}
                  </TableCell>
                  <TableCell>{formatDate(r.issue_date)}</TableCell>
                  <TableCell className="capitalize">
                    {r.payment_condition}
                  </TableCell>
                  <TableCell>{formatCurrency(r.total)}</TableCell>
                  <TableCell>
                    <ReceiptStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`${basePath}/${r.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {receipts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay recibos.
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
