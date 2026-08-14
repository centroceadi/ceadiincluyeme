"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/types/content";

/**
 * Slides de arranque mientras no hay contenido real (activo) en
 * `hero_carousel_slides` — la landing (src/app/page.tsx) le pasa los
 * slides reales de Supabase; si no hay ninguno activo, cae acá.
 */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    image_url: null,
    title: "Acompañamiento clínico y psicopedagógico",
    subtitle: "Un equipo especializado para cada etapa del desarrollo.",
    display_order: 0,
    transition_type: "fade",
    duration_ms: 6000,
    overlay_opacity: 0.45,
    active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-2",
    image_url: null,
    title: "Seguimiento cercano, en cada cita",
    subtitle: "Trazabilidad completa del proceso de cada paciente.",
    display_order: 1,
    transition_type: "fade",
    duration_ms: 6000,
    overlay_opacity: 0.45,
    active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-3",
    image_url: null,
    title: "Un centro, un equipo, un mismo objetivo",
    subtitle: "CEADI — Centro de Aprendizaje y Cambio.",
    display_order: 2,
    transition_type: "fade",
    duration_ms: 6000,
    overlay_opacity: 0.45,
    active: true,
    created_at: "",
    updated_at: "",
  },
];

const GRADIENTS = [
  "from-teal-600 to-emerald-700",
  "from-indigo-600 to-blue-700",
  "from-amber-600 to-orange-700",
];

export function HeroCarousel({
  slides = FALLBACK_SLIDES,
}: {
  slides?: HeroSlide[];
}) {
  const [index, setIndex] = useState(0);
  const active = slides[index];

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      active.duration_ms
    );
    return () => clearTimeout(id);
  }, [index, slides, active.duration_ms]);

  return (
    <div className="relative h-[70svh] min-h-[420px] w-full overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
            GRADIENTS[i % GRADIENTS.length],
            i === index ? "opacity-100" : "opacity-0"
          )}
          style={
            slide.image_url
              ? {
                  backgroundImage: `url(${slide.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
      ))}

      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: active.overlay_opacity }}
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-4 text-center text-white">
        <h1 className="max-w-2xl text-3xl font-semibold text-balance md:text-5xl">
          {active.title}
        </h1>
        {active.subtitle && (
          <p className="max-w-xl text-base text-white/90 md:text-lg">
            {active.subtitle}
          </p>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
