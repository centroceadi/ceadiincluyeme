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
    auth/callback/         # Canje de código PKCE de Supabase Auth
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

## Convenciones (ver `contexto` para el detalle)

- RLS en la misma migración/PR que crea la tabla — nunca "se agrega después".
- El chequeo de **rol** (no solo de sesión) vive en el DAL
  (`src/lib/supabase/dal.ts`), no en `proxy.ts` — Proxy solo hace el chequeo
  optimista de sesión para no pegarle a la base en cada request/prefetch.
- Nombrar el concepto de factura como "Recibo" en toda la UI (tabla interna:
  `receipts`).
- Nunca loguear PII ni datos de salud en consola o mensajes de commit.

## Estado

**Fase 1 (Fundación)** — repo, Supabase, Auth + roles, layout base, landing
con carrusel. Deploy en Vercel y conexión real a un proyecto Supabase:
pendiente de credenciales.

Siguiente: Fase 2 — núcleo clínico (pacientes, especialistas, citas,
expedientes, muro de trazabilidad).
