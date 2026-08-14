import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#servicios", label: "Servicios" },
  { href: "#equipo", label: "Equipo" },
  { href: "#recursos", label: "Recursos" },
  { href: "#contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-ceadi.png"
            alt="CEADI Inclúyeme"
            width={1024}
            height={1024}
            className="h-14 w-14 object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button size="sm" render={<Link href="/login">Portal</Link>} />
      </div>
    </header>
  );
}
