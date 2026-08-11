/**
 * Forma de una fila de `hero_carousel_slides` (tabla de contenido/landing).
 * Hoy la landing usa slides hardcodeados (FALLBACK_SLIDES); cuando el CMS
 * (Fase 5) esté conectado, `getHeroSlides()` reemplaza el fallback por una
 * query a Supabase con este mismo shape.
 */
export type HeroSlide = {
  id: string;
  image_url: string;
  title: string;
  subtitle: string | null;
  order: number;
  transition_type: "fade" | "slide";
  duration_ms: number;
  overlay_opacity: number; // 0–1
};
