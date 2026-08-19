import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/supabase/dal";
import { getResourceById } from "@/lib/queries/content";
import { updateResource } from "@/lib/actions/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

export default async function EditarRecursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const { id } = await params;
  const resource = await getResourceById(id);
  if (!resource) notFound();

  const updateResourceWithId = updateResource.bind(null, resource.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/portal/admin/recursos"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a Recursos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Modificar recurso</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{resource.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={updateResourceWithId}
            encType="multipart/form-data"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={resource.title}
                  className="w-56"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resource_type">Tipo</Label>
                <NativeSelect
                  id="resource_type"
                  name="resource_type"
                  defaultValue={resource.resource_type}
                  className="w-32"
                >
                  <option value="articulo">Artículo</option>
                  <option value="video">Video</option>
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={resource.category ?? ""}
                  className="w-36"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  name="author"
                  defaultValue={resource.author ?? ""}
                  className="w-44"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="url">Link (obligatorio para video)</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  defaultValue={resource.url ?? ""}
                  className="w-64"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slug">Slug (solo artículos)</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={resource.slug ?? ""}
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tags">Tags (separados por coma)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={resource.tags.join(", ")}
                  className="w-56"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cover_image">Imagen de portada</Label>
                <input
                  id="cover_image"
                  name="cover_image"
                  type="file"
                  accept="image/*"
                  className="text-sm"
                />
                {resource.cover_image_url && (
                  <a
                    href={resource.cover_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver imagen actual ↗
                  </a>
                )}
                <p className="text-xs text-muted-foreground">
                  Dejalo vacío para mantener la imagen actual.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Resumen</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={resource.description ?? ""}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">
                Contenido completo (solo artículos)
              </Label>
              <Textarea
                id="content"
                name="content"
                rows={8}
                defaultValue={resource.content ?? ""}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="self-start">
                Guardar cambios
              </Button>
              <Button
                variant="outline"
                className="self-start"
                render={<Link href="/portal/admin/recursos">Cancelar</Link>}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
