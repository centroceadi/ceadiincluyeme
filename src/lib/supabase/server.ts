import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * `cookies()` es async en Next.js (App Router). El `setAll` puede fallar si se
 * llama desde un Server Component puro (sin acceso de escritura a cookies) —
 * se ignora ese caso porque el `proxy.ts` ya se encarga de refrescar la sesión.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component sin escritura de cookies.
            // Se puede ignorar si `proxy.ts` refresca sesiones en cada request.
          }
        },
      },
    }
  );
}
