import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

const AUTH_ROUTES = ["/login"];

/**
 * Proxy (antes "Middleware", renombrado en Next.js 16 — ver
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 *
 * Hace únicamente el chequeo *optimista*: refresca la sesión de Supabase y
 * redirige según si hay usuario autenticado o no. El chequeo de **rol**
 * (admin/terapeuta/tutor/servicio_cliente) es una verificación *segura* que
 * requiere leer `profiles` en la base — eso se hace en el layout de
 * `/portal` (Data Access Layer), no acá, para no pegarle a la DB en cada
 * request/prefetch.
 */
export default async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isPortalRoute = pathname.startsWith("/portal");
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isPortalRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas excepto:
     * - _next/static, _next/image (assets internos)
     * - archivos estáticos comunes (íconos, imágenes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
