import { requireRole } from "@/lib/supabase/dal";
import {
  listSpecialists,
  listUnlinkedTherapistProfiles,
} from "@/lib/queries/clinical";
import { createSpecialist } from "@/lib/actions/clinical";
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
  const [specialists, unlinkedProfiles] = await Promise.all([
    listSpecialists(),
    listUnlinkedTherapistProfiles(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Especialistas</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Convertir un usuario en especialista
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {unlinkedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay perfiles con rol &quot;terapeuta&quot; pendientes de
              vincular. Invitá primero al usuario desde Supabase
              (Authentication → Users → Invite, con{" "}
              <code>role: &quot;terapeuta&quot;</code> en los metadata).
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
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialists.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {s.full_name ?? "—"}
                  </TableCell>
                  <TableCell>{s.specialty}</TableCell>
                  <TableCell>{s.license_number ?? "—"}</TableCell>
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
                    colSpan={4}
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
