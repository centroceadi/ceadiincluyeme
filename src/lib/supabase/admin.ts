import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la service role key: bypassea RLS por completo.
 *
 * Uso restringido a lógica de servidor explícitamente administrativa
 * (altas de usuario por invitación, jobs de contabilidad, migraciones).
 * Nunca importar desde un Client Component ni exponer `SUPABASE_SERVICE_ROLE_KEY`
 * con el prefijo NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
