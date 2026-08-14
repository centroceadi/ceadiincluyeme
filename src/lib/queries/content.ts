import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { HeroSlide, Resource, TeamMember } from "@/lib/types/content";

/**
 * Contenido público de la landing. Mismo patrón que
 * src/lib/queries/clinical.ts: no filtra por rol a mano — RLS ya decide
 * (público solo ve `active = true`, admin ve todo), así que la misma
 * función sirve tanto para /portal/admin/* como para la landing sin sesión.
 */

export async function listTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order");
  return (data ?? []) as TeamMember[];
}

export async function listResources(): Promise<Resource[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .order("display_order");
  return (data ?? []) as Resource[];
}

export async function listHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_carousel_slides")
    .select("*")
    .order("display_order");
  return (data ?? []) as HeroSlide[];
}
