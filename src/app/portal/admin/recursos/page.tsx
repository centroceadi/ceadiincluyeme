import { requireRole } from "@/lib/supabase/dal";
import { listResources } from "@/lib/queries/content";
import {
  createResource,
  deleteResource,
  toggleResourceActive,
} from "@/lib/actions/content";
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

export default async function AdminRecursosPage() {
  await requireRole(["admin"]);
  const resources = await listResources();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Recursos</h1>
      <p className="text-sm text-muted-foreground">
        Se muestran en la sección &quot;Recursos&quot; de la landing pública
        — solo los marcados como activos.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar recurso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createResource} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required className="w-48" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categoría</Label>
              <Input id="category" name="category" className="w-36" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url">Link</Label>
              <Input id="url" name="url" type="url" className="w-56" />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recursos ({resources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>{r.category ?? "—"}</TableCell>
                  <TableCell>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        Abrir ↗
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.active ? "default" : "outline"}>
                      {r.active ? "Activo" : "Oculto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <form
                        action={toggleResourceActive.bind(null, r.id, !r.active)}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          {r.active ? "Ocultar" : "Mostrar"}
                        </Button>
                      </form>
                      <form action={deleteResource.bind(null, r.id)}>
                        <Button type="submit" size="sm" variant="destructive">
                          Borrar
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {resources.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay recursos cargados.
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
