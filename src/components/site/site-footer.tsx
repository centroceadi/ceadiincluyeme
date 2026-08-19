import { MailIcon, MessageCircleIcon } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

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

        <div className="flex flex-col gap-2 text-secondary-foreground/80">
          <a
            href="https://wa.me/18495170431"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-secondary-foreground"
          >
            <MessageCircleIcon className="size-4 shrink-0" />
            WhatsApp: +1 849 517 0431
          </a>
          <a
            href="mailto:centroceadi@hotmail.com"
            className="flex items-center gap-2 hover:text-secondary-foreground"
          >
            <MailIcon className="size-4 shrink-0" />
            centroceadi@hotmail.com
          </a>
          <a
            href="https://instagram.com/centro_ceadi"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-secondary-foreground"
          >
            <InstagramIcon className="size-4 shrink-0" />
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
