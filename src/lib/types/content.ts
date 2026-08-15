/**
 * Tipos del contenido público de la landing (Fase 5). Reflejan 1:1 el
 * esquema de supabase/migrations/20260814200000_admin_content.sql — si
 * cambia la migración, actualizar acá también.
 *
 * `hero_carousel_slides`/`team_members`/`resources` son tablas PÚBLICAS:
 * cualquiera (sin sesión) puede leer las filas con `active = true`. El
 * admin las gestiona desde /portal/admin/{carrusel,equipo,recursos}.
 */

export type SlideTransition = "fade" | "slide";

export type HeroSlide = {
  id: string;
  image_url: string | null;
  title: string;
  subtitle: string | null;
  display_order: number;
  transition_type: SlideTransition;
  duration_ms: number;
  overlay_opacity: number; // 0–1
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  full_name: string;
  role_title: string;
  photo_url: string | null;
  bio: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ResourceType = "articulo" | "video";

export type Resource = {
  id: string;
  title: string;
  description: string | null;
  /** Link externo — para `resource_type: "video"`, el link a Vimeo/YouTube. */
  url: string | null;
  category: string | null;
  display_order: number;
  active: boolean;
  resource_type: ResourceType;
  author: string | null;
  /** Cuerpo completo del artículo — null para videos. */
  content: string | null;
  cover_image_url: string | null;
  /** Único cuando no es null — arma /recursos/[slug] para artículos. */
  slug: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};
