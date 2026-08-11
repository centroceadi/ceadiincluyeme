import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type QuickLink = {
  href: string;
  title: string;
  description: string;
};

export function QuickLinks({ links }: { links: QuickLink[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle className="text-base">{link.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
