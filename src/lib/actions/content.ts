"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SlideTransition } from "@/lib/types/content";

/**
 * Server actions de contenido (equipo, recursos, carrusel). RLS decide
 * la autorización real (ver supabase/migrations/20260814200000_admin_content.sql)
 * — solo admin tiene policy de insert/update/delete en estas 3 tablas.
 */

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

/** Sube un archivo al bucket público `landing-media` bajo `folder/` y
 * devuelve su URL pública. Si no se adjuntó archivo, devuelve null. */
async function uploadImage(
  supabase: SupabaseClient,
  file: FormDataEntryValue | null,
  folder: string
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("landing-media")
    .upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("landing-media").getPublicUrl(path);
  return publicUrl;
}

function revalidateContent() {
  revalidatePath("/portal/admin/equipo");
  revalidatePath("/portal/admin/recursos");
  revalidatePath("/portal/admin/carrusel");
  revalidatePath("/");
}

// ---- equipo ----

export async function createTeamMember(formData: FormData) {
  const full_name = str(formData, "full_name");
  const role_title = str(formData, "role_title");
  if (!full_name || !role_title) {
    throw new Error("Faltan datos del integrante del equipo.");
  }

  const supabase = await createClient();
  const photo_url = await uploadImage(supabase, formData.get("photo"), "team");

  const { error } = await supabase.from("team_members").insert({
    full_name,
    role_title,
    bio: str(formData, "bio"),
    photo_url,
    display_order: Number(str(formData, "display_order") ?? "0"),
  });
  if (error) throw new Error(error.message);

  revalidateContent();
}

export async function toggleTeamMemberActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateContent();
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateContent();
}

// ---- recursos ----

export async function createResource(formData: FormData) {
  const title = str(formData, "title");
  if (!title) throw new Error("El título es obligatorio.");

  const supabase = await createClient();
  const { error } = await supabase.from("resources").insert({
    title,
    description: str(formData, "description"),
    url: str(formData, "url"),
    category: str(formData, "category"),
    display_order: Number(str(formData, "display_order") ?? "0"),
  });
  if (error) throw new Error(error.message);

  revalidateContent();
}

export async function toggleResourceActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("resources")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateContent();
}

export async function deleteResource(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateContent();
}

// ---- carrusel ----

export async function createHeroSlide(formData: FormData) {
  const title = str(formData, "title");
  if (!title) throw new Error("El título es obligatorio.");

  const supabase = await createClient();
  const image_url = await uploadImage(supabase, formData.get("image"), "carousel");

  const { error } = await supabase.from("hero_carousel_slides").insert({
    title,
    subtitle: str(formData, "subtitle"),
    image_url,
    display_order: Number(str(formData, "display_order") ?? "0"),
    transition_type: (str(formData, "transition_type") ?? "fade") as SlideTransition,
    duration_ms: Number(str(formData, "duration_ms") ?? "6000"),
    overlay_opacity: Number(str(formData, "overlay_opacity") ?? "0.45"),
  });
  if (error) throw new Error(error.message);

  revalidateContent();
}

export async function toggleHeroSlideActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_carousel_slides")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateContent();
}

export async function deleteHeroSlide(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_carousel_slides")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateContent();
}
