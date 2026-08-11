import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback del flujo PKCE de Supabase Auth (magic link, invitación,
 * recuperación de contraseña). Supabase redirige acá con `?code=...` (y,
 * para invite/recovery, `?type=...`); canjeamos el code por una sesión y
 * seguimos a `next` — salvo que sea invite/recovery, en cuyo caso la
 * persona todavía no tiene contraseña y hay que mandarla a setearla.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/portal";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const destination =
        type === "invite" || type === "recovery"
          ? "/auth/set-password"
          : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
