import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">El enlace ya no es válido</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Puede haber expirado o ya haberse usado. Pedí un nuevo enlace o iniciá
        sesión con tu contraseña.
      </p>
      <Button render={<Link href="/login">Volver a ingresar</Link>} />
    </div>
  );
}
