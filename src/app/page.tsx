import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { listHeroSlides, listResources, listTeamMembers } from "@/lib/queries/content";

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

export default async function LandingPage() {
  const [slides, team, resources] = await Promise.all([
    listHeroSlides(),
    listTeamMembers(),
    listResources(),
  ]);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroCarousel slides={slides.length > 0 ? slides : undefined} />

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
            <h2 className="mb-8 text-2xl font-semibold">Equipo</h2>
            {team.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center gap-4">
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        className="size-16 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-16 shrink-0 rounded-full bg-muted" />
                    )}
                    <div>
                      <p className="font-medium">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role_title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="max-w-2xl text-sm text-muted-foreground">
                Presentamos a nuestro equipo próximamente.
              </p>
            )}
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold">Recursos</h2>
          {resources.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {resource.description && (
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    )}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Ver más ↗
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="max-w-2xl text-sm text-muted-foreground">
              Material y recursos para familias y pacientes — próximamente.
            </p>
          )}
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
