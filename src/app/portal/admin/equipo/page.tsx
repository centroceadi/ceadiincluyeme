import Link from "next/link";
import { requireRole } from "@/lib/supabase/dal";
import { listTeamMembers } from "@/lib/queries/content";
import { listSpecialists } from "@/lib/queries/clinical";
import {
  createTeamMember,
  deleteTeamMember,
  toggleTeamMemberActive,
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

export default async function AdminEquipoPage() {
  await requireRole(["admin"]);
  const [members, specialists] = await Promise.all([
    listTeamMembers(),
    listSpecialists(),
  ]);
  const linkedTeamMemberIds = new Set(
    specialists.map((s) => s.team_member_id).filter((id): id is string => !!id)
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Equipo</h1>
      <p className="text-sm text-muted-foreground">
        Se muestra en la sección &quot;Equipo&quot; de la landing pública —
        solo los integrantes marcados como activos. Un integrante
        &quot;Terapeuta&quot; solo puede recibir citas si además tiene cuenta
        de portal vinculada en{" "}
        <Link href="/portal/admin/especialistas" className="text-primary hover:underline">
          Especialistas
        </Link>
        .
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar integrante</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createTeamMember}
            encType="multipart/form-data"
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Nombre</Label>
              <Input id="full_name" name="full_name" required className="w-48" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role_title">Cargo</Label>
              <Input id="role_title" name="role_title" required className="w-44" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="photo">Foto</Label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                className="text-sm"
              />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Integrantes ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Especialista</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo_url}
                        alt={m.full_name}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{m.full_name}</TableCell>
                  <TableCell>{m.role_title}</TableCell>
                  <TableCell>
                    {linkedTeamMemberIds.has(m.id) ? (
                      <Badge>Vinculado</Badge>
                    ) : (
                      <Link
                        href="/portal/admin/especialistas"
                        className="text-sm text-primary hover:underline"
                      >
                        Vincular →
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.active ? "default" : "outline"}>
                      {m.active ? "Activo" : "Oculto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <form
                        action={toggleTeamMemberActive.bind(null, m.id, !m.active)}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          {m.active ? "Ocultar" : "Mostrar"}
                        </Button>
                      </form>
                      <form action={deleteTeamMember.bind(null, m.id)}>
                        <Button type="submit" size="sm" variant="destructive">
                          Borrar
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay integrantes cargados.
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
