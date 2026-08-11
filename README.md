# CeadiPortal

Sistema de gestión clínica y psicopedagógica para CEADI (Centro de Aprendizaje y
Cambio, República Dominicana). Landing pública administrable + portal
multi-rol (Admin, Terapeuta, Tutor/Padre, Servicio al Cliente) con
expedientes clínicos, agenda de citas, muro de trazabilidad y contabilidad
conforme a normativa fiscal dominicana (ITBIS, NCF).

Ver `contexto` en la raíz del monorepo local para el contexto completo del
proyecto (roles, modelo de datos, fases, convenciones).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4, shadcn/ui)
- **Supabase** (Postgres, Auth, Storage, RLS) — proyecto propio, sin relación
  con otros proyectos del portafolio
- **Vercel** (hosting, deploy por rama, previews por PR)

> ⚠️ Este scaffold usa Next.js 16, que renombró `middleware.ts` a
> [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
> y trae otros cambios respecto a versiones anteriores. Antes de tocar
> routing/auth, revisar `node_modules/next/dist/docs/` (no confiar solo en
> conocimiento previo de Next.js).

## Setup local

1. **Dependencias**

   ```bash
   npm install
   ```

2. **Variables de entorno**

   ```bash
   cp .env.local.example .env.local
   ```

   Completar con las credenciales del proyecto Supabase de CeadiPortal
   (Project Settings → API). `SUPABASE_SERVICE_ROLE_KEY` solo se usa en
   servidor (`src/lib/supabase/admin.ts`) — nunca exponerla al cliente.

3. **Base de datos**

   Correr las migraciones de `supabase/migrations/` contra el proyecto
   Supabase (SQL Editor del dashboard, o `supabase db push` si usás la CLI).
   La primera (`20260811000001_profiles.sql`) crea `profiles` + el enum de
   roles + las policies de RLS.

4. **Alta del primer usuario admin**

   No hay self-signup. Invitar al primer usuario desde el dashboard de
   Supabase (Authentication → Users → Invite), pasando en
   `raw_user_meta_data` algo como `{"full_name": "...", "role": "admin"}` —
   el trigger `handle_new_user` crea el `profiles` correspondiente.

   Antes de invitar, agregar la URL donde corre la app a **Authentication →
   URL Configuration → Redirect URLs** (ej. `http://localhost:3000/**` en
   dev, `https://<dominio>/**` en cada entorno de Vercel) — si falta,
   Supabase descarta el `redirect_to` del link de invitación/recovery y cae
   al Site URL por defecto, rompiendo el flujo silenciosamente.

   Si el plan de Supabase tiene límite de envío de emails y no llega la
   invitación, generar el link directo con la Admin API
   (`POST /auth/v1/admin/generate_link`, con el `service_role` key) y
   compartirlo manualmente — evita el rate limit de emails.

5. **Levantar**

   ```bash
   npm run dev
   ```

## Estructura

```
src/
  app/
    page.tsx              # Landing pública
    login/                # Login (email/password)
    auth/callback/         # Canje de código PKCE de Supabase Auth (ej. OAuth)
    auth/confirm/           # Verificación de token_hash (invite/recovery/magic link)
    auth/set-password/       # Pantalla para setear contraseña tras invite/recovery
    portal/                 # Área autenticada, multi-rol
      admin/  terapeuta/  tutor/  servicio-cliente/
  components/
    ui/                    # shadcn/ui
    site/                  # Landing (header, footer, hero carousel)
    portal/                # Shell y nav del portal
  lib/
    supabase/
      client.ts            # Cliente browser (Client Components)
      server.ts             # Cliente server (Server Components/Actions)
      admin.ts               # Cliente service role (server-only, RLS bypass)
      session.ts             # Refresco de sesión, usado desde proxy.ts
      dal.ts                  # Data Access Layer: verifySession/getProfile/requireRole
    actions/auth.ts          # Server Actions de login/logout
    types/roles.ts            # Roles del portal
  proxy.ts                    # Chequeo optimista de auth en cada request
supabase/
  migrations/                 # SQL versionado, RLS incluido en la misma migración que crea la tabla
```

## Dos rutas de confirmación de auth, a propósito

- `/auth/callback` — para flujos que Supabase resuelve con `?code=` (ej.
  OAuth): hace `exchangeCodeForSession`.
- `/auth/confirm` — para invite/recovery/magic link generados por la Admin
  API o el dashboard: verifica `token_hash` con `verifyOtp()`. Estos links
  a veces vuelven con los tokens en el **fragmento** de la URL
  (`#access_token=...`), que nunca llega al servidor — por eso no sirve
  `exchangeCodeForSession` para ese caso. Usar siempre `/auth/confirm` para
  invitaciones y reset de contraseña.

## Convenciones (ver `contexto` para el detalle)

- RLS en la misma migración/PR que crea la tabla — nunca "se agrega después".
- El chequeo de **rol** (no solo de sesión) vive en el DAL
  (`src/lib/supabase/dal.ts`), no en `proxy.ts` — Proxy solo hace el chequeo
  optimista de sesión para no pegarle a la base en cada request/prefetch.
- Nombrar el concepto de factura como "Recibo" en toda la UI (tabla interna:
  `receipts`).
- Nunca loguear PII ni datos de salud en consola o mensajes de commit.

## Deploy (Vercel)

Producción: https://ceadiincluyeme-one.vercel.app

Env vars en Vercel (Settings → Environment Variables): las mismas 4 de
`.env.local.example`, con `NEXT_PUBLIC_SITE_URL` apuntando al dominio de
cada entorno. Cambios en env vars no aplican al deploy ya hecho — hay que
redeployar (Deployments → `···` → Redeploy).

No olvidar agregar cada dominio nuevo (`https://<dominio>/**`) a
Authentication → URL Configuration → Redirect URLs en Supabase — ver nota
arriba, es el error más fácil de repetir al agregar un entorno.

## Estado

**Fase 1 (Fundación) — completa.** Repo en GitHub, deploy en Vercel,
Supabase conectado con RLS, auth (login + invite + recovery + roles)
probado end-to-end en local y en producción.

Siguiente: Fase 2 — núcleo clínico (pacientes, especialistas, citas,
expedientes, muro de trazabilidad).
