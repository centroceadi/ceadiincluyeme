import { requireRole } from "@/lib/supabase/dal";
import { listHeroSlides } from "@/lib/queries/content";
import {
  createHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideActive,
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
import { NativeSelect } from "@/components/ui/native-select";

export default async function AdminCarruselPage() {
  await requireRole(["admin"]);
  const slides = await listHeroSlides();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Carrusel de la landing</h1>
      <p className="text-sm text-muted-foreground">
        Los slides activos se muestran en orden en el carrusel de la
        landing. Sin slides activos, la landing usa un fallback genérico.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar slide</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createHeroSlide}
            encType="multipart/form-data"
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required className="w-56" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input id="subtitle" name="subtitle" className="w-56" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="image">Imagen</Label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="display_order">Orden</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                defaultValue={0}
                className="w-20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="transition_type">Transición</Label>
              <NativeSelect
                id="transition_type"
                name="transition_type"
                className="w-28"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duration_ms">Duración (ms)</Label>
              <Input
                id="duration_ms"
                name="duration_ms"
                type="number"
                step={500}
                defaultValue={6000}
                className="w-28"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="overlay_opacity">Overlay (0–1)</Label>
              <Input
                id="overlay_opacity"
                name="overlay_opacity"
                type="number"
                step={0.05}
                min={0}
                max={1}
                defaultValue={0.45}
                className="w-24"
              />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Slides ({slides.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="h-10 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-16 rounded bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={s.active ? "default" : "outline"}>
                      {s.active ? "Activo" : "Oculto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <form
                        action={toggleHeroSlideActive.bind(null, s.id, !s.active)}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          {s.active ? "Ocultar" : "Mostrar"}
                        </Button>
                      </form>
                      <form action={deleteHeroSlide.bind(null, s.id)}>
                        <Button type="submit" size="sm" variant="destructive">
                          Borrar
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {slides.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay slides cargados.
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
