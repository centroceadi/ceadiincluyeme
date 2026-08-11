"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState =
  | {
      error: string;
    }
  | undefined;

/**
 * Login con email/password. CeadiPortal no tiene auto-registro público:
 * las cuentas (terapeuta, tutor, servicio_cliente) las crea un admin desde
 * el propio portal (Fase 5) o por invitación de Supabase Auth.
 */
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciales inválidas." };
  }

  redirect("/portal");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
