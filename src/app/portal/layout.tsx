import { getProfile } from "@/lib/supabase/dal";
import { PortalShell } from "@/components/portal/portal-shell";

/**
 * Layout de todo `/portal/*`. `getProfile()` (DAL) es la verificación
 * *segura*: confirma el usuario contra Supabase Auth y trae su rol desde
 * `profiles` (RLS). El chequeo optimista de "¿hay sesión?" ya lo hizo
 * `proxy.ts` antes de llegar acá.
 */
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return <PortalShell profile={profile}>{children}</PortalShell>;
}
