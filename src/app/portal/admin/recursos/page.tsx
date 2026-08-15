import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";

export default async function AdminRecursosPage() {
  await requireRole(["admin"]);
  const resources = await listResources();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Recursos</h1>
      <p className="text-sm text-muted-foreground">
        Se muestran en la sección &quot;Recursos&quot; de la landing pública
        — solo los marcados como activos. Los artículos tienen su propia
        página (<code>/recursos/[slug]</code>); los videos enlazan directo
        al link externo (Vimeo, YouTube, etc.).
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar recurso</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createResource}
            encType="multipart/form-data"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required className="w-56" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resource_type">Tipo</Label>
                <NativeSelect id="resource_type" name="resource_type" className="w-32">
                  <option value="articulo">Artículo</option>
                  <option value="video">Video</option>
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Categoría</Label>
                <Input id="category" name="category" className="w-36" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="author">Autor</Label>
                <Input id="author" name="author" className="w-44" />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="url">Link (obligatorio para video)</Label>
                <Input id="url" name="url" type="url" className="w-64" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cover_image">Imagen de portada</Label>
                <input
                  id="cover_image"
                  name="cover_image"
                  type="file"
                  accept="image/*"
                  className="text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tags">Tags (separados por coma)</Label>
                <Input id="tags" name="tags" className="w-56" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Resumen</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">
                Contenido completo (solo artículos)
              </Label>
              <Textarea id="content" name="content" rows={8} />
            </div>

            <Button type="submit" className="self-start">
              Agregar
            </Button>
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
                <TableHead>Tipo</TableHead>
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
                  <TableCell className="capitalize">{r.resource_type}</TableCell>
                  <TableCell>{r.category ?? "—"}</TableCell>
                  <TableCell>
                    {r.resource_type === "articulo" && r.slug ? (
                      <Link
                        href={`/recursos/${r.slug}`}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Ver artículo ↗
                      </Link>
                    ) : r.url ? (
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
                    colSpan={6}
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
