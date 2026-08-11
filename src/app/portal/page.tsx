import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/dal";
import { ROLE_HOME } from "@/lib/types/roles";

/** `/portal` es solo un router: manda a cada quien a su home según rol. */
export default async function PortalIndexPage() {
  const profile = await getProfile();
  redirect(ROLE_HOME[profile.role]);
}
