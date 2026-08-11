import { requireRole } from "@/lib/supabase/dal";
import { QuickLinks } from "@/components/portal/quick-links";

export default async function TutorPage() {
  const profile = await requireRole(["tutor"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "tutor"}
      </h1>
      <QuickLinks
        links={[
          {
            href: "/portal/tutor/hijos",
            title: "Mis hijos/as",
            description: "Citas y seguimiento de cada paciente a tu cargo.",
          },
        ]}
      />
    </div>
  );
}
