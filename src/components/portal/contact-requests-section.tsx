import { updateContactRequestStatus } from "@/lib/actions/content";
import type { ContactRequest, ContactRequestStatus } from "@/lib/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<ContactRequestStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cerrado: "Cerrado",
};

const STATUS_VARIANT: Record<ContactRequestStatus, "default" | "secondary" | "outline"> = {
  nuevo: "default",
  contactado: "secondary",
  cerrado: "outline",
};

const ALL_STATUSES: ContactRequestStatus[] = ["nuevo", "contactado", "cerrado"];

/** Lista de solicitudes del formulario público de contacto — compartida
 * entre admin y servicio_cliente (los dos únicos roles con policy de
 * select sobre `contact_requests`, ver
 * supabase/migrations/20260816000000_contact_requests.sql). */
export function ContactRequestsSection({
  requests,
}: {
  requests: ContactRequest[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Solicitudes recibidas ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(r.created_at)}
                </TableCell>
                <TableCell className="font-medium">{r.full_name}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex flex-col">
                    <a href={`tel:${r.phone}`} className="hover:underline">
                      {r.phone}
                    </a>
                    {r.email && (
                      <a
                        href={`mailto:${r.email}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {r.email}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{r.preferred_location ?? "—"}</TableCell>
                <TableCell>{r.service_interest ?? "—"}</TableCell>
                <TableCell className="max-w-64">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {r.message}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[r.status]}>
                    {STATUS_LABEL[r.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {ALL_STATUSES.filter((s) => s !== r.status).map((s) => (
                      <form
                        key={s}
                        action={updateContactRequestStatus.bind(null, r.id, s)}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          {STATUS_LABEL[s]}
                        </Button>
                      </form>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  Todavía no hay solicitudes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
