import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/lib/supabase/dal";
import { SetPasswordForm } from "./set-password-form";

/**
 * A donde manda `/auth/callback` tras un link de invite/recovery: hay
 * sesión (la dejó el canje del code) pero todavía no hay contraseña.
 * `verifySession()` ya se encarga de mandar a /login si no hay sesión.
 */
export default async function SetPasswordPage() {
  await verifySession();

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Elegí tu contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
