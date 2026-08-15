# CeadiPortal

Sistema de gestión clínica y psicopedagógica para CEADI Inclúyeme (Centro de
Evaluación, Atención al Desarrollo e Inclusión, República Dominicana).
Landing pública administrable + portal
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

## Núcleo clínico (Fase 2 — backend)

Migración `20260811100000_clinical_core.sql`: `specialists`, `patients`,
`appointments`, `clinical_records`, `psycho_records`, `traceability_events`
— con RLS y probado por rol (terapeuta/tutor/servicio_cliente/anon) contra
el proyecto real antes de mergear. Tipos TS espejo en
`src/lib/types/clinical.ts`. Todavía sin UI (listados/formularios) — es la
siguiente pasada.

Notas de diseño:

- `traceability_events` es un log append-only: nadie inserta ahí
  directamente (sin policy de insert para ningún rol), lo alimentan
  triggers en `patients`/`appointments`/`clinical_records`/`psycho_records`.
  Cada fila tiene `is_clinical` — servicio_cliente y tutor solo ven las
  `false`.
- `is_patient_specialist(patient_id)` / `is_patient_guardian(patient_id)`
  (SECURITY DEFINER) son los helpers que reusan las policies de las 6
  tablas para no repetir la lógica de "¿es mi paciente?".
- servicio_cliente y tutor **no tienen ninguna policy** sobre
  `clinical_records`/`psycho_records` — ausencia deliberada, no un
  descuido, para que quede imposible de ver aunque cambie la UI.

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

**Fase 2 (Núcleo clínico) — completa.** Modelo de datos + RLS +  UI por rol:

- Admin: `/portal/admin/{pacientes,especialistas,citas}`
- Servicio al cliente: `/portal/servicio-cliente/{pacientes,citas}`
- Terapeuta: `/portal/terapeuta/{agenda,pacientes,pacientes/[id]}` (expedientes
  clínico/psicopedagógico en el detalle del paciente)
- Tutor: `/portal/tutor/hijos` y `/portal/tutor/hijos/[id]` (citas + muro de
  trazabilidad no clínico)

Todas las queries en `src/lib/queries/clinical.ts` son agnósticas de rol —
RLS decide qué filas devolver, la misma función sirve para los 4 roles.

**Fase 3 (Roles y permisos avanzados) — completa.** Portal Tutor y rol
Servicio al Cliente ya habían quedado construidos en la Fase 2; acá se
cerró el ítem de RLS completo. Hallazgos de la auditoría, corregidos en
`20260814000000_rls_hardening.sql`:

- `profiles` no dejaba leer el nombre de otros usuarios ni siquiera para el
  directorio de especialistas (specialists.id referencia profiles.id, el
  nombre vive ahí) — terapeuta/tutor/servicio_cliente veían nombres vacíos
  en toda la UI de Fase 2. Nueva policy: cualquier logueado puede leer
  `full_name` de perfiles que tengan fila en `specialists`.
- `servicio_cliente` tenía policy `for all` (incluye DELETE) sobre
  `patients` y `appointments` — un hard delete de paciente cascadea sus
  citas/expedientes/trazabilidad. Reemplazado por policies explícitas de
  select/insert/update, sin delete. Admin conserva `for all`.

Ambos fixes verificados con sesiones reales por rol contra el proyecto
Supabase antes de mergear.

**Fase 4 (Contabilidad) — completa.** Migración
`20260814100000_billing.sql`: `billing_services`, `receipts`,
`receipt_lines`, `quotes`, `quote_lines`, `recurring_payments`,
`transactions`. Tipos TS en `src/lib/types/billing.ts`.

Decisiones confirmadas con el usuario (2026-08-14):

- Emiten/cobran recibos: **admin y servicio_cliente**. Terapeuta solo ve
  los propios, de solo lectura ("Mis Ganancias") — vía
  `receipt_lines.specialist_id`.
- **NCF es de uso interno únicamente** — no valida contra el formato/
  secuencia oficial de la DGII. Sigue sin confirmar con CEADI si hace
  falta integrar e-CF de verdad (fuera de alcance por ahora).
- `billing_services.itbis_exempt` nace en `true` por defecto — Art. 343
  del Código Tributario RD (servicios de salud exentos de ITBIS).
- `subtotal`/`itbis_total`/`total` de `receipts`/`quotes` se recalculan
  solos con un trigger cuando cambian sus líneas — nunca se confía en
  que el cliente mande los totales bien.

Probado contra el proyecto real: un recibo con 2 líneas recalculó sus
totales solo, un terapeuta de prueba vio únicamente sus propias líneas/
recibos, y `servicio_cliente` no pudo borrar un recibo (RLS lo bloqueó).
Datos y usuarios de prueba limpiados al terminar.

UI por rol:

- Admin: `/portal/admin/{servicios,recibos,recibos/[id],cotizaciones,
  cotizaciones/[id],pagos-recurrentes}`
- Servicio al cliente: mismas rutas bajo `/portal/servicio-cliente/`
  (sin `servicios` — el catálogo lo administra solo admin)
- Terapeuta: `/portal/terapeuta/ganancias` ("Mis Ganancias", solo lectura)
- Recibo → línea → pago es un flujo de 3 pasos: crear el recibo redirige
  directo a su detalle, donde se agregan líneas (con especialista
  atribuido) y se registran pagos. El recibo pasa a `paid`/
  `partially_paid` solo cuando la suma de pagos lo cubre.
- `/imprimir/recibos/[id]`: vista de impresión térmica POS, 72mm de
  ancho, fuera del layout del portal (sin sidebar) — protegida por RLS
  vía `getReceipt()`, no por rol específico (cualquiera que pueda ver
  el recibo puede imprimirlo).

Probado end-to-end contra el proyecto real: recibo con línea y pago
parcial renderizado correctamente en el detalle y en la vista de
impresión, y aislamiento por rol confirmado con una sesión real de
servicio_cliente (ve su propia sección, redirige fuera de admin y de
Mis Ganancias). Datos de prueba limpiados al terminar.

**Fase 5 (Administración y contenido) — completa.** Migración
`20260814200000_admin_content.sql`: `team_members`, `resources`,
`hero_carousel_slides` (contenido **público** de la landing — RLS de
select no chequea sesión, solo `active = true`) + `profiles.active`
(activar/desactivar cuentas sin borrarlas) + bucket de Storage
`landing-media` (público, con policies de insert/update/delete solo para
admin) para las fotos del equipo y las imágenes del carrusel.

- `/portal/admin/usuarios`: invitar (usa el cliente admin/service_role
  de `src/lib/supabase/admin.ts`, sin usar hasta ahora), cambiar rol,
  activar/desactivar. Un admin no puede tocar su propio rol ni
  desactivarse a sí mismo (protección explícita en las server actions).
  Cuenta desactivada → la sesión existente se corta en el próximo
  request, aunque el token siga técnicamente vigente (`getProfile()` en
  el DAL revisa `active` contra la base en cada llamada, no confía en el
  JWT). Probado con una sesión real: `active=false` bloqueó el acceso
  en la siguiente request.
- `/portal/admin/{equipo,recursos,carrusel}`: CRUD con subida de imagen
  real a Storage (`landing-media/team/…`, `landing-media/carousel/…`).
  La subida pasa por un `<input type="file">` normal dentro del mismo
  form — Server Actions de Next.js reciben `File` directo en el
  `FormData`, no hace falta ningún cliente de subida en el navegador.
- La landing (`/`) ahora lee `hero_carousel_slides`/`team_members`/
  `resources` reales; si no hay ningún slide activo, cae al fallback
  hardcodeado de siempre.

⚠️ **Pendiente de configurar a mano en el dashboard**: el email que manda
`inviteUserByEmail` usa por defecto `{{ .ConfirmationURL }}`, que apunta
al `/verify` de Supabase y redirige con los tokens en el *fragmento* de
la URL — el mismo problema que ya resolvimos en Fase 1 para
invite/recovery manuales (ver sección de arriba). Para que el botón del
email de invitación funcione solo, hay que editar la plantilla **"Invite
user"** en Authentication → Email Templates y cambiar el link a:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
```

Sin este cambio, invitar desde `/portal/admin/usuarios` sigue funcionando
para crear el usuario, pero el link del email no confirma solo — hay que
generar el link a mano con la Admin API (mismo procedimiento que en Fase
1) hasta que se actualice la plantilla.

---

Con esto, las Fases 1–5 del plan original (fundación, núcleo clínico,
roles/RLS, contabilidad, administración/contenido) están completas.

**Migración de contenido real (2026-08-15)**: los 5 recursos publicados en
centroceadi.net (2 artículos completos, 3 videos) ya están cargados en la
base real, con las imágenes de portada re-alojadas en nuestro Storage
(no dependen de que el sitio viejo siga online). Primer pedazo real de
Fase 6.

- Migración `20260815000000_resources_articles.sql`: `resources` ahora
  soporta `resource_type` (articulo/video), `author`, `content`
  (cuerpo completo), `cover_image_url`, `slug` (único) y `tags`.
- `/recursos/[slug]`: página pública del artículo completo, fuera del
  layout del portal, protegida solo por RLS (no por rol — cualquiera
  puede leer un recurso activo). Los videos no tienen página propia,
  enlazan directo al link externo (Vimeo).
- Cómo se sacó el contenido real sin acceso de admin al sitio viejo: el
  HTML es una SPA Base44 (JS+CSS compilados servidos por CDN), pero sus
  entidades de datos son legibles públicamente vía
  `GET /api/apps/{appId}/entities/{EntityName}` en el propio dominio
  (`centroceadi.net/api/apps/69c33a6b5ae8d596e4a6bb3d/entities/Resource`)
  — el nombre exacto de la entidad (`Resource`, no `Resources` ni
  `Recursos`) se encontró por prueba y error contra el mensaje de error
  del backend. Sirvió porque esa entidad tenía permiso de lectura
  pública configurado en Base44 (igual que nuestras tablas de
  contenido); no aplica a entidades que requieran auth.

**Equipo ↔ Especialistas conectados (2026-08-15)**, migración
`20260815100000_link_specialists_team.sql`: `specialists.team_member_id`
(nullable, único) — antes eran dos mundos separados (Equipo = bio
pública de la landing, Especialistas = cuenta de portal + agenda/citas),
con los 11 terapeutas reales del Equipo sin ninguna cuenta de portal, así
que ninguno era asignable a una cita.

- `/portal/admin/especialistas` tiene ahora una acción "Invitar
  integrante del equipo como especialista": en un solo paso crea la
  cuenta de portal (rol terapeuta), la fila de `specialists` con la bio
  pre-cargada desde `team_members`, y las deja vinculadas — apenas la
  persona acepta la invitación ya es asignable en `/portal/admin/citas`.
  El form viejo ("vincular un usuario ya invitado") sigue existiendo
  para cuando el usuario de portal ya existía de antes.
- `/portal/admin/equipo` muestra si cada integrante ya tiene especialista
  vinculado o no, con link directo a Especialistas.
- Probado con sesión real de admin (Playwright contra el dev server, no
  solo REST): 1) intento con un email ya registrado falló limpio (sin
  dejar nada a medias); 2) `example.com` es rechazado por la validación
  de Supabase — para probar con datos reales pero sin mandarle un email
  real a nadie, usar un alias `+` del propio email
  (`tuemail+prueba@gmail.com` — llega al mismo inbox, pero Supabase lo
  trata como dirección nueva); 3) con eso, el flujo completo funcionó:
  perfil + specialists + team_member_id vinculados, y la persona
  apareció en el selector de especialista de Citas. Dato de prueba
  limpiado al terminar.

Siguiente: seguir con Fase 6 (resto de la migración de datos reales
desde Base44 + QA por rol) y Fase 7 (corte a producción) — ver
`contexto` para el detalle.
