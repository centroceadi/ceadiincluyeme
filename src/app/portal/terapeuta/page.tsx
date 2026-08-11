import { requireRole } from "@/lib/supabase/dal";
import { ComingSoon } from "@/components/portal/coming-soon";

export default async function TerapeutaPage() {
  const profile = await requireRole(["terapeuta"]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        Hola, {profile.full_name ?? "terapeuta"}
      </h1>
      <ComingSoon
        title="Tu agenda y expedientes"
        description="Citas propias, expedientes clínicos/psicopedagógicos de tus pacientes y 'Mis Ganancias' llegan en las Fases 2–4."
      />
    </div>
  );
}
