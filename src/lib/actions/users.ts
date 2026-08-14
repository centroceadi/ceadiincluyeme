"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySession } from "@/lib/supabase/dal";
import { isRole, type Role } from "@/lib/types/roles";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

/**
 * Invita a un usuario nuevo (alta por invitación, sin self-signup — ver
 * contexto del proyecto). Usa el cliente admin (service_role) porque
 * `inviteUserByEmail` es una operación de Auth admin, no de RLS.
 *
 * ⚠️ El email que manda Supabase usa por defecto `{{ .ConfirmationURL }}`,
 * que apunta al `/verify` de Supabase y redirige con los tokens en el
 * *fragmento* de la URL (#access_token=...) — nuestro `/auth/confirm`
 * espera `token_hash` como query param y no lo va a recibir así. Hay que
 * editar la plantilla "Invite user" en el dashboard (Authentication →
 * Email Templates) para que el link sea:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
 * (mismo ajuste para "Magic Link" y "Reset Password" si se usan desde acá).
 * Documentado también en el README.
 */
export async function inviteUser(formData: FormData) {
  const email = str(formData, "email");
  const full_name = str(formData, "full_name");
  const role = str(formData, "role");
  if (!email || !role || !isRole(role)) {
    throw new Error("Faltan datos para invitar al usuario.");
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo: `${siteUrl}/auth/confirm?next=%2Fauth%2Fset-password`,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/usuarios");
}

export async function updateUserRole(formData: FormData) {
  const userId = str(formData, "user_id");
  const role = str(formData, "role");
  if (!userId || !role || !isRole(role)) {
    throw new Error("Faltan datos para cambiar el rol.");
  }

  const { user } = await verifySession();
  if (user.id === userId) {
    throw new Error("No podés cambiar tu propio rol desde acá.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: role as Role })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/usuarios");
}

export async function toggleUserActive(userId: string, active: boolean) {
  const { user } = await verifySession();
  if (user.id === userId) {
    throw new Error("No podés desactivar tu propia cuenta.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ active })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/portal/admin/usuarios");
}
