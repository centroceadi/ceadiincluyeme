import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request y la propaga tanto al
 * request (para Server Components de esa misma respuesta) como a la
 * response (cookies que llegan al navegador).
 *
 * Llamado desde `proxy.ts` — ver
 * https://supabase.com/docs/guides/auth/server-side/nextjs para el porqué:
 * los Server Components no pueden escribir cookies, así que el refresh
 * del access token tiene que pasar por acá.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: no eliminar. `getUser()` revalida el token contra Supabase Auth
  // (a diferencia de `getSession()`, que solo lee la cookie sin verificar).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
