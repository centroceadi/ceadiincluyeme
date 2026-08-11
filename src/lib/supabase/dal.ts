import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isRole, type Role } from "@/lib/types/roles";

export type Profile = {
  id: string;
  full_name: string | null;
  role: Role;
};

/**
 * Data Access Layer — punto único de verificación de sesión + rol.
 *
 * `proxy.ts` ya hace el chequeo optimista (¿hay sesión?). Estas funciones
 * hacen el chequeo *seguro*: confirman el usuario contra Supabase Auth y,
 * para rol, contra la tabla `profiles` (protegida por RLS).
 *
 * `cache()` memoiza por render pass — llamar `getProfile()` varias veces en
 * el árbol de un mismo request no dispara queries repetidas.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { user, supabase };
});

export const getProfile = cache(async (): Promise<Profile> => {
  const { user, supabase } = await verifySession();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (error || !data || !isRole(data.role)) {
    // Perfil inexistente o rol inválido: no confiar, cortar acá.
    redirect("/login");
  }

  return data as Profile;
});

/** Exige que el usuario tenga uno de los roles dados; si no, 404 lógico a su propio home. */
export async function requireRole(allowed: Role[]) {
  const profile = await getProfile();

  if (!allowed.includes(profile.role)) {
    redirect("/portal");
  }

  return profile;
}
