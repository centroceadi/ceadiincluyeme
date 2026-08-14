import { addQuoteLine } from "@/lib/actions/billing";
import type { QuoteWithPatientName } from "@/lib/queries/billing";
import type { BillingService, QuoteLine } from "@/lib/types/billing";
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
import { QuoteStatusBadge } from "@/components/portal/status-badge";
import { formatCurrency } from "@/lib/format";

export function QuoteDetail({
  quote,
  lines,
  services,
}: {
  quote: QuoteWithPatientName;
  lines: QuoteLine[];
  services: BillingService[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">
          Cotización — {quote.patient_name}
        </h1>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Líneas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={addQuoteLine} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="quote_id" value={quote.id} />
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
            <Button type="submit">Agregar línea</Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead>Precio unit.</TableHead>
                <TableHead>Total línea</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.description}</TableCell>
                  <TableCell>{l.quantity}</TableCell>
                  <TableCell>{formatCurrency(l.unit_price)}</TableCell>
                  <TableCell>{formatCurrency(l.line_total)}</TableCell>
                </TableRow>
              ))}
              {lines.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex w-48 justify-between">
              <span className="text-muted-foreground">ITBIS</span>
              <span>{formatCurrency(quote.itbis_total)}</span>
            </div>
            <div className="flex w-48 justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
