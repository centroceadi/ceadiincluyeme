import { createRecurringPayment } from "@/lib/actions/billing";
import type { RecurringPaymentWithNames } from "@/lib/queries/billing";
import type { BillingService } from "@/lib/types/billing";
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
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { formatCurrency, formatDate } from "@/lib/format";

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
};

export function RecurringPaymentsSection({
  recurringPayments,
  patients,
  services,
}: {
  recurringPayments: RecurringPaymentWithNames[];
  patients: Patient[];
  services: BillingService[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo pago recurrente</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createRecurringPayment}
            className="flex flex-wrap items-end gap-3"
          >
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
              <Label htmlFor="billing_service_id">Servicio (opcional)</Label>
              <NativeSelect
                id="billing_service_id"
                name="billing_service_id"
                className="w-48"
              >
                <option value="">— sin servicio específico —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-28"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="frequency">Frecuencia</Label>
              <NativeSelect id="frequency" name="frequency" className="w-32">
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="next_charge_date">Próximo cobro</Label>
              <Input
                id="next_charge_date"
                name="next_charge_date"
                type="date"
                required
                className="w-40"
              />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pagos recurrentes ({recurringPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Próximo cobro</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringPayments.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.patient_name ?? "—"}
                  </TableCell>
                  <TableCell>{r.service_name ?? "—"}</TableCell>
                  <TableCell>{formatCurrency(r.amount)}</TableCell>
                  <TableCell>{FREQUENCY_LABEL[r.frequency]}</TableCell>
                  <TableCell>{formatDate(r.next_charge_date)}</TableCell>
                  <TableCell>
                    <Badge variant={r.active ? "default" : "outline"}>
                      {r.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {recurringPayments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay pagos recurrentes.
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
