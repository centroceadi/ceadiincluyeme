export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-serif text-base font-semibold">
            CEADI Inclúyeme
          </p>
          <p className="mt-1 max-w-xs text-secondary-foreground/70">
            Centro de Evaluación, Atención al Desarrollo e Inclusión.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-secondary-foreground/80">
          <a href="tel:+18096690431" className="hover:text-secondary-foreground">
            809.669.0431
          </a>
          <a
            href="mailto:centroceadi@hotmail.com"
            className="hover:text-secondary-foreground"
          >
            centroceadi@hotmail.com
          </a>
          <a
            href="https://instagram.com/centro_ceadi"
            target="_blank"
            rel="noreferrer"
            className="hover:text-secondary-foreground"
          >
            @centro_ceadi
          </a>
        </div>

        <div className="text-secondary-foreground/70">
          <p>© {new Date().getFullYear()} CEADI Inclúyeme</p>
          <p>República Dominicana</p>
        </div>
      </div>
    </footer>
  );
}
