"use client";

import { useActionState } from "react";
import { SendIcon } from "lucide-react";
import {
  submitContactRequest,
  type ContactRequestState,
} from "@/lib/actions/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

const SEDES = [
  "Villa Marina (D.N.)",
  "Villa Mella (S.D. Norte)",
  "Independencia (D.N.)",
];

export function ContactForm({ servicios }: { servicios: string[] }) {
  const [state, action, pending] = useActionState<
    ContactRequestState,
    FormData
  >(submitContactRequest, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Formulario de Contacto</CardTitle>
      </CardHeader>
      <CardContent>
        {state?.ok ? (
          <p className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
            ¡Gracias! Recibimos tu solicitud — te contactaremos a la
            brevedad.
          </p>
        ) : (
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Nombre completo *</Label>
              <Input id="full_name" name="full_name" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="preferred_location">Sede de preferencia *</Label>
                <NativeSelect
                  id="preferred_location"
                  name="preferred_location"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Elegir…
                  </option>
                  {SEDES.map((sede) => (
                    <option key={sede} value={sede}>
                      {sede}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="service_interest">Servicio de interés</Label>
                <NativeSelect
                  id="service_interest"
                  name="service_interest"
                  defaultValue=""
                >
                  <option value="">Elegir…</option>
                  {servicios.map((servicio) => (
                    <option key={servicio} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="Contanos brevemente el motivo de tu consulta…"
              />
            </div>

            {state?.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="gap-2">
              <SendIcon className="size-4" />
              {pending ? "Enviando…" : "Enviar Solicitud"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Tu información es confidencial y solo será utilizada para
              responder a tu solicitud.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
