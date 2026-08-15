import { requireRole } from "@/lib/supabase/dal";
import { listContactRequests } from "@/lib/queries/content";
import { ContactRequestsSection } from "@/components/portal/contact-requests-section";

export default async function AdminSolicitudesPage() {
  await requireRole(["admin"]);
  const requests = await listContactRequests();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Solicitudes de contacto</h1>
      <p className="text-sm text-muted-foreground">
        Mensajes enviados desde el formulario de contacto de la landing
        pública.
      </p>
      <ContactRequestsSection requests={requests} />
    </div>
  );
}
