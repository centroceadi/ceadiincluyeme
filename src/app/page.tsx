import {
  PhoneIcon,
  MessageCircleIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { ContactForm } from "@/components/site/contact-form";
import { listHeroSlides, listResources, listTeamMembers } from "@/lib/queries/content";

// Copy tomado del sitio real de CEADI (centroceadi.net) — mismos títulos
// de sección y servicios que la versión anterior (entidad `Service` del
// portal viejo).
const SERVICIOS = [
  {
    title: "Neuropsicología Clínica",
    description:
      "Evaluación y rehabilitación de funciones cognitivas como atención, memoria, lenguaje y funciones ejecutivas en niños y adolescentes.",
  },
  {
    title: "Evaluación del Neurodesarrollo",
    description: "Diagnóstico temprano para intervenir a tiempo.",
  },
  {
    title: "Logopedia",
    description:
      "Tratamiento de dificultades del habla, lenguaje y comunicación en niños y adolescentes.",
  },
  {
    title: "Terapia Familiar",
    description:
      "Acompañamiento a la familia como parte activa del proceso terapéutico de cada niño.",
  },
  {
    title: "Intervención Psicopedagógica",
    description:
      "Apoyo a dificultades de aprendizaje para un mejor desempeño escolar.",
  },
  {
    title: "Psicología Clínica Infantil",
    description:
      "Acompañamiento individual con especialistas en el desarrollo emocional de niños y adolescentes.",
  },
];

const SEDES = [
  {
    name: "Sede Villa Marina",
    address: "Calle 6 No.13, Villa Marina, D.N.",
  },
  {
    name: "Sede Villa Mella",
    address: "C/ Principal Urb. del Edén #9, Santo Domingo Norte",
  },
  {
    name: "Sucursal Independencia",
    address:
      "Calle Mercado No. 48, Peatón 7, Sector Invi, próximo a la Av. Independencia, Distrito Nacional.",
  },
];

const VALORES = [
  {
    title: "Enfoque familiar",
    description:
      "Comprendemos las preocupaciones de cada familia y las acompañamos con calidez y respeto.",
  },
  {
    title: "Equipo especializado",
    description:
      "Formado en neuropsicología, logopedia y desarrollo infantil, con enfoque basado en evidencia.",
  },
  {
    title: "Seguridad y privacidad",
    description:
      "La información de cada familia se maneja con los más altos estándares de seguridad y confidencialidad.",
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
          <h2 className="mb-8 font-serif text-2xl font-semibold md:text-3xl">
            Nuestros Servicios
          </h2>
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

        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-8 font-serif text-2xl font-semibold md:text-3xl">
              Nuestros Valores
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {VALORES.map((valor) => (
                <div key={valor.title}>
                  <h3 className="mb-2 font-medium text-primary">
                    {valor.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {valor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="equipo" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 font-serif text-2xl font-semibold md:text-3xl">
            Conoce Nuestro Equipo
          </h2>
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
              Profesionales especializados comprometidos con el desarrollo y
              bienestar de cada niño y su familia — presentamos a nuestro
              equipo próximamente.
            </p>
          )}
        </section>

        <section id="recursos" className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-2 font-serif text-2xl font-semibold md:text-3xl">
              Recursos para Familias
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Artículos y videos seleccionados por nuestro equipo sobre
              neurodesarrollo, crianza y bienestar emocional.
            </p>
            {resources.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {resources.map((resource) => {
                  const href =
                    resource.resource_type === "articulo" && resource.slug
                      ? `/recursos/${resource.slug}`
                      : resource.url;
                  const isExternal = resource.resource_type === "video";

                  return (
                    <Card key={resource.id} className="overflow-hidden">
                      {resource.cover_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resource.cover_image_url}
                          alt={resource.title}
                          className="aspect-video w-full object-cover"
                        />
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        {resource.description && (
                          <p className="line-clamp-3 text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        )}
                        {href && (
                          <a
                            href={href}
                            {...(isExternal
                              ? { target: "_blank", rel: "noreferrer" }
                              : {})}
                            className="text-sm text-primary hover:underline"
                          >
                            {resource.resource_type === "video"
                              ? "Ver video ↗"
                              : "Leer más →"}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="max-w-2xl text-sm text-muted-foreground">
                Material y recursos para familias y pacientes — próximamente.
              </p>
            )}
          </div>
        </section>

        <section id="contacto" className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-2 font-serif text-2xl font-semibold md:text-3xl">
              Contacto
            </h2>
            <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
              Escribinos y te contactamos a la brevedad para coordinar tu
              cita.
            </p>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Información de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5 text-sm">
                    <div className="flex flex-col gap-3">
                      <a
                        href="tel:+18096690431"
                        className="flex items-center gap-3 hover:underline"
                      >
                        <PhoneIcon className="size-5 shrink-0" />
                        809.669.0431
                      </a>
                      <a
                        href="https://wa.me/18495170431"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 hover:underline"
                      >
                        <MessageCircleIcon className="size-5 shrink-0" />
                        WhatsApp: +1 849 517 0431
                      </a>
                      <a
                        href="mailto:centroceadi@hotmail.com"
                        className="flex items-center gap-3 hover:underline"
                      >
                        <MailIcon className="size-5 shrink-0" />
                        centroceadi@hotmail.com
                      </a>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-primary-foreground/20 pt-4">
                      {SEDES.map((sede) => (
                        <div key={sede.name} className="flex gap-3">
                          <MapPinIcon className="mt-0.5 size-5 shrink-0" />
                          <div>
                            <p className="font-medium">{sede.name}</p>
                            <p className="text-primary-foreground/80">
                              {sede.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ClockIcon className="size-5" />
                      Horario de Atención
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <p>Lunes a Viernes: 8:00 AM – 6:00 PM</p>
                    <p>Sábados: 8:00 AM – 1:00 PM</p>
                  </CardContent>
                </Card>
              </div>

              <ContactForm servicios={SERVICIOS.map((s) => s.title)} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
