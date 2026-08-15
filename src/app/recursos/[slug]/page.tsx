import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { getResourceBySlug } from "@/lib/queries/content";
import { formatDate } from "@/lib/format";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  // RLS ya filtró: si no existe o no está activo, getResourceBySlug da null.
  if (!resource || resource.resource_type !== "articulo") notFound();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12">
          <Link
            href="/#recursos"
            className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver a Recursos
          </Link>

          {resource.category && (
            <Badge variant="outline" className="mb-3">
              {resource.category}
            </Badge>
          )}

          <h1 className="font-serif text-3xl font-semibold text-balance md:text-4xl">
            {resource.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {resource.author && <span>{resource.author}</span>}
            {resource.author && <span aria-hidden>·</span>}
            <span>{formatDate(resource.created_at)}</span>
          </div>

          {resource.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resource.cover_image_url}
              alt={resource.title}
              className="mt-6 aspect-video w-full rounded-lg object-cover"
            />
          )}

          {resource.content && (
            <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {resource.content}
            </div>
          )}

          {resource.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
