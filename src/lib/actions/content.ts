"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  ContactRequestStatus,
  ResourceType,
  SlideTransition,
} from "@/lib/types/content";

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

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createResource(formData: FormData) {
  const title = str(formData, "title");
  if (!title) throw new Error("El título es obligatorio.");

  const resource_type = (str(formData, "resource_type") ??
    "articulo") as ResourceType;
  const tagsRaw = str(formData, "tags");
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const slugInput = str(formData, "slug");

  const supabase = await createClient();
  const cover_image_url = await uploadImage(
    supabase,
    formData.get("cover_image"),
    "resources"
  );

  const { error } = await supabase.from("resources").insert({
    title,
    description: str(formData, "description"),
    url: str(formData, "url"),
    category: str(formData, "category"),
    display_order: Number(str(formData, "display_order") ?? "0"),
    resource_type,
    author: str(formData, "author"),
    content: str(formData, "content"),
    cover_image_url,
    slug: resource_type === "articulo" ? (slugInput ?? slugify(title)) : null,
    tags,
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

// ---- contacto ----

export type ContactRequestState =
  | { ok: true }
  | { ok: false; error: string }
  | undefined;

/**
 * Envío del formulario público de contacto (sin sesión — cualquier
 * visitante de la landing). A diferencia del resto de las actions de este
 * archivo, no tira: devuelve un state para que el form (client component,
 * useActionState) muestre un mensaje sin recargar la página. RLS
 * (contact_requests_insert_public) es lo único que realmente autoriza el
 * insert acá — esta función no chequea rol porque no requiere sesión.
 */
export async function submitContactRequest(
  _prevState: ContactRequestState,
  formData: FormData
): Promise<ContactRequestState> {
  const full_name = str(formData, "full_name");
  const phone = str(formData, "phone");
  const message = str(formData, "message");
  if (!full_name || !phone || !message) {
    return { ok: false, error: "Completá nombre, teléfono y mensaje." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({
    full_name,
    phone,
    email: str(formData, "email"),
    preferred_location: str(formData, "preferred_location"),
    service_interest: str(formData, "service_interest"),
    message,
  });
  if (error) {
    return {
      ok: false,
      error: "No pudimos enviar tu solicitud. Probá de nuevo en unos minutos.",
    };
  }

  return { ok: true };
}

export async function updateContactRequestStatus(
  id: string,
  status: ContactRequestStatus
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/admin/solicitudes");
  revalidatePath("/portal/servicio-cliente/solicitudes");
}
