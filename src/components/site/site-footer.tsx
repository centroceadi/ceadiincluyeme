export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} CEADI — Centro de Aprendizaje y Cambio.</p>
        <p>República Dominicana</p>
      </div>
    </footer>
  );
}
