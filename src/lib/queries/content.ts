import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ContactRequest,
  HeroSlide,
  Resource,
  TeamMember,
} from "@/lib/types/content";

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

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as Resource | null;
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Resource | null;
}

export async function listHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_carousel_slides")
    .select("*")
    .order("display_order");
  return (data ?? []) as HeroSlide[];
}

/**
 * Solicitudes del formulario público de contacto. A diferencia de las
 * funciones de arriba, esta SÍ depende de RLS para ocultar datos por
 * completo (no "público ve activos, admin ve todo" — acá el público no ve
 * nada): sin sesión admin/servicio_cliente, devuelve lista vacía.
 */
export async function listContactRequests(): Promise<ContactRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as ContactRequest[];
}
