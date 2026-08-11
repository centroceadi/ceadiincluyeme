import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/lib/actions/auth";
import type { Profile } from "@/lib/supabase/dal";
import { NAV_ITEMS, ROLE_LABEL } from "@/components/portal/nav-items";

export function PortalShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const items = NAV_ITEMS[profile.role];

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 p-4 md:flex">
        <Link href="/portal" className="mb-6 px-2 text-lg font-semibold">
          CeadiPortal
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <Badge variant="secondary">{ROLE_LABEL[profile.role]}</Badge>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {profile.full_name ?? "Sin nombre"}
            </span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Salir
              </Button>
            </form>
          </div>
        </header>

        <Separator className="md:hidden" />

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
