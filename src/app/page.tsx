import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { HeroCarousel } from "@/components/site/hero-carousel";

const SERVICIOS = [
  {
    title: "Terapia clínica",
    description: "Acompañamiento individual con especialistas del centro.",
  },
  {
    title: "Evaluación psicopedagógica",
    description: "Diagnóstico y seguimiento del proceso de aprendizaje.",
  },
  {
    title: "Seguimiento familiar",
    description: "Tutores con visibilidad del progreso, en todo momento.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroCarousel />

        <section id="servicios" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold">Servicios</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {SERVICIOS.map((servicio) => (
              <Card key={servicio.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{servicio.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {servicio.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="equipo" className="border-t bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-4 text-2xl font-semibold">Equipo</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              El listado del equipo se administra desde el portal (Fase 5) y
              se publica acá automáticamente.
            </p>
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-4 text-2xl font-semibold">Recursos</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Material y recursos para familias y pacientes — próximamente.
          </p>
        </section>

        <section id="contacto" className="border-t bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-4 text-2xl font-semibold">Contacto</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Formulario de contacto — próximamente.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
