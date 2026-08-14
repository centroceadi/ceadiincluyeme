import { requireRole } from "@/lib/supabase/dal";
import { QuickLinks } from "@/components/portal/quick-links";

export default async function TerapeutaPage() {
  const profile = await requireRole(["terapeuta"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "terapeuta"}
      </h1>
      <QuickLinks
        links={[
          {
            href: "/portal/terapeuta/agenda",
            title: "Mi agenda",
            description: "Tus citas y su estado.",
          },
          {
            href: "/portal/terapeuta/pacientes",
            title: "Mis pacientes",
            description: "Expedientes clínicos y psicopedagógicos.",
          },
          {
            href: "/portal/terapeuta/ganancias",
            title: "Mis ganancias",
            description: "Recibos y pagos correspondientes a tus servicios.",
          },
        ]}
      />
    </div>
  );
}
