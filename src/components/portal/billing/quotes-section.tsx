import Link from "next/link";
import { createQuote } from "@/lib/actions/billing";
import type { QuoteWithPatientName } from "@/lib/queries/billing";
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
import { NativeSelect } from "@/components/ui/native-select";
import { QuoteStatusBadge } from "@/components/portal/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

export function QuotesSection({
  quotes,
  patients,
  basePath,
}: {
  quotes: QuoteWithPatientName[];
  patients: Patient[];
  basePath: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva cotización</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createQuote} className="flex flex-wrap items-end gap-3">
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
              <Label htmlFor="valid_until">Válida hasta</Label>
              <Input id="valid_until" name="valid_until" type="date" className="w-40" />
            </div>
            <Button type="submit">Crear cotización</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Cotizaciones ({quotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Válida hasta</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">
                    {q.patient_name ?? "—"}
                  </TableCell>
                  <TableCell>{formatDate(q.issue_date)}</TableCell>
                  <TableCell>
                    {q.valid_until ? formatDate(q.valid_until) : "—"}
                  </TableCell>
                  <TableCell>{formatCurrency(q.total)}</TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`${basePath}/${q.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {quotes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay cotizaciones.
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
