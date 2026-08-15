"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, HeartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/types/content";

/**
 * Slides de arranque mientras no hay contenido real (activo) en
 * `hero_carousel_slides` — la landing (src/app/page.tsx) le pasa los
 * slides reales de Supabase; si no hay ninguno activo, cae acá.
 *
 * El texto (badge/título/párrafo/botones) es FIJO — no cambia por
 * slide, solo la foto de fondo rota. `title`/`subtitle` de cada fila
 * quedan como texto alternativo de la imagen (accesibilidad), no se
 * muestran como caption superpuesto — eso fue a propósito: mostrar un
 * título distinto por foto, con la capa oscura necesaria para que se
 * leyera, tapaba las fotos del equipo.
 */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    image_url: "/hero-ceadi.png",
    title: "CEADI Inclúyeme",
    subtitle: null,
    display_order: 0,
    transition_type: "fade",
    duration_ms: 6000,
    overlay_opacity: 0.1,
    active: true,
    created_at: "",
    updated_at: "",
  },
];

const GRADIENTS = [
  "from-primary to-secondary",
  "from-accent to-primary",
  "from-secondary to-accent",
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
          role="img"
          aria-label={slide.title}
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

      <div className="relative flex h-full flex-col items-center justify-center gap-5 px-4 text-center text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
          <HeartIcon className="size-4 fill-current" />
          Atención Psicológica Infantil
        </span>

        <h1 className="max-w-2xl font-serif text-4xl font-bold text-balance md:text-6xl">
          Intervenir a tiempo
          <br />
          <span className="text-accent">cambia historias</span>
        </h1>

        <p className="max-w-xl text-base text-white/90 md:text-lg">
          En CEADI acompañamos a niños y familias en momentos donde el
          comportamiento, la tristeza, la ansiedad o las dificultades
          escolares necesitan atención profesional.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Agendar Consulta
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="#servicios"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Ver Servicios
          </Link>
        </div>
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
