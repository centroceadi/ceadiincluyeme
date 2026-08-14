import { requireRole } from "@/lib/supabase/dal";
import { listManagedUsers } from "@/lib/queries/users";
import { inviteUser, toggleUserActive, updateUserRole } from "@/lib/actions/users";
import { ROLES } from "@/lib/types/roles";
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
import { ROLE_LABEL } from "@/components/portal/nav-items";
import { formatDate } from "@/lib/format";

export default async function AdminUsuariosPage() {
  const me = await requireRole(["admin"]);
  const users = await listManagedUsers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Usuarios</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitar usuario</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form action={inviteUser} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="w-56" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Nombre</Label>
              <Input id="full_name" name="full_name" className="w-48" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Rol</Label>
              <NativeSelect id="role" name="role" required className="w-40">
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button type="submit">Invitar</Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Le llega un email para setear su contraseña. Si el email no
            llega (límite de envíos del plan), generá el link a mano desde
            la Admin API de Supabase.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === me.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.full_name ?? "—"}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (vos)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{u.email ?? "—"}</TableCell>
                    <TableCell>
                      {isSelf ? (
                        ROLE_LABEL[u.role]
                      ) : (
                        <form
                          action={updateUserRole}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="user_id" value={u.id} />
                          <NativeSelect
                            name="role"
                            defaultValue={u.role}
                            className="w-36"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </option>
                            ))}
                          </NativeSelect>
                          <Button type="submit" size="sm" variant="outline">
                            Guardar
                          </Button>
                        </form>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.active ? "default" : "outline"}>
                        {u.active ? "Activo" : "Desactivado"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(u.created_at)}</TableCell>
                    <TableCell>
                      {!isSelf && (
                        <form
                          action={toggleUserActive.bind(null, u.id, !u.active)}
                        >
                          <Button type="submit" size="sm" variant="outline">
                            {u.active ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
