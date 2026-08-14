import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ disabled?: string }>;
}) {
  const { disabled } = await searchParams;

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Ingresar a CeadiPortal</CardTitle>
        </CardHeader>
        <CardContent>
          {disabled && (
            <p className="mb-4 text-sm text-destructive">
              Tu cuenta fue desactivada. Contactá a un administrador si creés
              que es un error.
            </p>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
