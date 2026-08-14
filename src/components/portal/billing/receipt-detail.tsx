import Link from "next/link";
import { addReceiptLine, recordTransaction } from "@/lib/actions/billing";
import type { ReceiptLineWithNames, ReceiptWithPatientName } from "@/lib/queries/billing";
import type { BillingService, Transaction } from "@/lib/types/billing";
import type { SpecialistWithName } from "@/lib/queries/clinical";
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
import { NativeSelect } from "@/components/ui/native-select";
import { ReceiptStatusBadge } from "@/components/portal/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  check: "Cheque",
  other: "Otro",
};

export function ReceiptDetail({
  receipt,
  lines,
  transactions,
  services,
  specialists,
  printHref,
}: {
  receipt: ReceiptWithPatientName;
  lines: ReceiptLineWithNames[];
  transactions: Transaction[];
  services: BillingService[];
  specialists: SpecialistWithName[];
  printHref: string;
}) {
  const paid = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = receipt.total - paid;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">
          Recibo — {receipt.patient_name}
        </h1>
        <ReceiptStatusBadge status={receipt.status} />
        <Button variant="outline" size="sm" render={<Link href={printHref}>Imprimir (POS 72mm)</Link>} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Líneas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={addReceiptLine} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="receipt_id" value={receipt.id} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="billing_service_id">Servicio</Label>
              <NativeSelect
                id="billing_service_id"
                name="billing_service_id"
                required
                className="w-48"
              >
                <option value="">Elegir…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatCurrency(s.unit_price)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="specialist_id">Especialista</Label>
              <NativeSelect id="specialist_id" name="specialist_id" className="w-44">
                <option value="">— (sin atribuir)</option>
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name ?? s.specialty}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                defaultValue={1}
                className="w-20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit_price">Precio (opcional)</Label>
              <Input
                id="unit_price"
                name="unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Precio del catálogo"
                className="w-36"
              />
            </div>
            <Button type="submit">Agregar línea</Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Especialista</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead>Precio unit.</TableHead>
                <TableHead>ITBIS</TableHead>
                <TableHead>Total línea</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.description}</TableCell>
                  <TableCell>{l.specialist_name ?? "—"}</TableCell>
                  <TableCell>{l.quantity}</TableCell>
                  <TableCell>{formatCurrency(l.unit_price)}</TableCell>
                  <TableCell>{l.itbis_rate}%</TableCell>
                  <TableCell>{formatCurrency(l.line_total)}</TableCell>
                </TableRow>
              ))}
              {lines.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Sin líneas todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col items-end gap-1 border-t pt-3 text-sm">
            <div className="flex w-48 justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="flex w-48 justify-between">
              <span className="text-muted-foreground">ITBIS</span>
              <span>{formatCurrency(receipt.itbis_total)}</span>
            </div>
            <div className="flex w-48 justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            action={recordTransaction}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="receipt_id" value={receipt.id} />
            <input type="hidden" name="patient_id" value={receipt.patient_id} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-32"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment_method">Método</Label>
              <NativeSelect id="payment_method" name="payment_method" className="w-36">
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="check">Cheque</option>
                <option value="other">Otro</option>
              </NativeSelect>
            </div>
            <Button type="submit">Registrar pago</Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{formatDate(t.transaction_date)}</TableCell>
                  <TableCell>
                    {PAYMENT_METHOD_LABEL[t.payment_method] ?? t.payment_method}
                  </TableCell>
                  <TableCell>{formatCurrency(t.amount)}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    Sin pagos registrados todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end text-sm">
            <span className="font-medium">
              Balance pendiente: {formatCurrency(Math.max(balance, 0))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
