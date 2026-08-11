import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components ("use client").
 * Usa las credenciales públicas (anon key) — nunca la service role key acá.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
