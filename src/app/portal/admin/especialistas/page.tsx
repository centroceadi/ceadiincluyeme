import Link from "next/link";
import { requireRole } from "@/lib/supabase/dal";
import {
  listSpecialists,
  listUnlinkedTeamMembers,
  listUnlinkedTherapistProfiles,
} from "@/lib/queries/clinical";
import { createSpecialist, inviteAndLinkSpecialist } from "@/lib/actions/clinical";
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

export default async function AdminEspecialistasPage() {
  await requireRole(["admin"]);
  const [specialists, unlinkedProfiles, unlinkedTeamMembers] = await Promise.all([
    listSpecialists(),
    listUnlinkedTherapistProfiles(),
    listUnlinkedTeamMembers(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Especialistas</h1>
      <p className="text-sm text-muted-foreground">
        Solo los especialistas de acá abajo se pueden asignar a citas — un
        integrante del{" "}
        <Link href="/portal/admin/equipo" className="text-primary hover:underline">
          Equipo
        </Link>{" "}
        (landing pública) recién queda asignable después de invitarlo y
        vincularlo acá.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Invitar integrante del equipo como especialista
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {unlinkedTeamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todos los integrantes activos del Equipo ya están vinculados a
              un especialista (o todavía no hay integrantes cargados en{" "}
              <Link href="/portal/admin/equipo" className="text-primary hover:underline">
                Equipo
              </Link>
              ).
            </p>
          ) : (
            <form
              action={inviteAndLinkSpecialist}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="team_member_id">Integrante del equipo</Label>
                <NativeSelect
                  id="team_member_id"
                  name="team_member_id"
                  required
                  className="w-56"
                >
                  <option value="">Elegir…</option>
                  {unlinkedTeamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite_email">Email</Label>
                <Input
                  id="invite_email"
                  name="email"
                  type="email"
                  required
                  className="w-56"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite_specialty">Especialidad</Label>
                <Input
                  id="invite_specialty"
                  name="specialty"
                  required
                  className="w-52"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite_license_number">Nº de licencia</Label>
                <Input
                  id="invite_license_number"
                  name="license_number"
                  className="w-40"
                />
              </div>
              <Button type="submit">Invitar y vincular</Button>
            </form>
          )}
          <p className="text-sm text-muted-foreground">
            Crea la cuenta de portal (rol terapeuta) con la bio ya cargada
            desde Equipo, y la deja lista para asignar citas apenas acepte
            la invitación.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Vincular un usuario ya invitado
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {unlinkedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay perfiles con rol &quot;terapeuta&quot; pendientes de
              vincular. Para uno nuevo, invitalo desde arriba o desde{" "}
              <Link href="/portal/admin/usuarios" className="text-primary hover:underline">
                Usuarios
              </Link>
              .
            </p>
          ) : (
            <form
              action={createSpecialist}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile_id">Usuario</Label>
                <NativeSelect id="profile_id" name="profile_id" required className="w-56">
                  <option value="">Elegir…</option>
                  {unlinkedProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name ?? p.id}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="specialty">Especialidad</Label>
                <Input id="specialty" name="specialty" required className="w-52" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="license_number">Nº de licencia</Label>
                <Input id="license_number" name="license_number" className="w-40" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="team_member_id_link">
                  Vincular con integrante del equipo (opcional)
                </Label>
                <NativeSelect
                  id="team_member_id_link"
                  name="team_member_id"
                  className="w-56"
                >
                  <option value="">— sin vincular —</option>
                  {unlinkedTeamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <Button type="submit">Guardar</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Especialistas ({specialists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialists.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {s.team_member_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.team_member_photo_url}
                        alt={s.full_name ?? ""}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {s.full_name ?? "—"}
                  </TableCell>
                  <TableCell>{s.specialty}</TableCell>
                  <TableCell>{s.license_number ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={s.team_member_id ? "default" : "outline"}>
                      {s.team_member_id ? "Vinculado" : "Sin vincular"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.active ? "default" : "outline"}>
                      {s.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {specialists.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Todavía no hay especialistas.
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
