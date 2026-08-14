import { createBillingService } from "@/lib/actions/billing";
import type { BillingService } from "@/lib/types/billing";
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
import { formatCurrency } from "@/lib/format";

/** Catálogo de servicios — solo admin puede crear (RLS), acá va el
 * form + la lista completa. */
export function ServicesSection({ services }: { services: BillingService[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar servicio al catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createBillingService}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required className="w-56" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit_price">Precio</Label>
              <Input
                id="unit_price"
                name="unit_price"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-32"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="itbis_rate">ITBIS % (si no exento)</Label>
              <Input
                id="itbis_rate"
                name="itbis_rate"
                type="number"
                step="0.01"
                min="0"
                defaultValue={0}
                className="w-32"
              />
            </div>
            <div className="flex h-8 items-center gap-2">
              <input
                id="itbis_exempt"
                name="itbis_exempt"
                type="checkbox"
                defaultChecked
                className="size-4"
              />
              <Label htmlFor="itbis_exempt">
                Exento de ITBIS (Art. 343 — salud)
              </Label>
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Servicios ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>ITBIS</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{formatCurrency(s.unit_price)}</TableCell>
                  <TableCell>
                    {s.itbis_exempt ? (
                      <Badge variant="outline">Exento</Badge>
                    ) : (
                      `${s.itbis_rate}%`
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.active ? "default" : "outline"}>
                      {s.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay servicios en el catálogo.
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
