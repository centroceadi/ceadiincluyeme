import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Confirmación de OTP (magic link, invite, recovery) vía `token_hash`,
 * verificada acá mismo con `verifyOtp()` — a diferencia de `/auth/callback`
 * (que espera `?code=` de un intercambio PKCE), esta ruta no depende de
 * que Supabase redirija con un `code`: sirve tanto si el link vino del
 * `/verify` de Supabase (que a veces devuelve el token en el fragmento,
 * invisible para el servidor) como si apuntamos acá directo con el
 * `token_hash` desde el email/action_link. Ver:
 * https://supabase.com/docs/guides/auth/server-side/nextjs#email-otp
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/portal";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // invite/recovery: todavía no hay contraseña, hay que ir a setearla
      // aunque no se haya pasado `next` explícito.
      const destination =
        type === "invite" || type === "recovery" ? "/auth/set-password" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
