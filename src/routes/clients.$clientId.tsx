import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";

export const Route = createFileRoute("/clients/$clientId")({
  head: () => ({ meta: [{ title: "Fiche client — Kenshō Studio CRM" }, { name: "description", content: "Fiche client du CRM Kenshō Studio." }, { property: "og:title", content: "Fiche client — Kenshō Studio CRM" }, { property: "og:description", content: "Fiche client du CRM Kenshō Studio." }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Fiche client">
      <div className="px-4 py-10 text-[13px] text-muted-foreground sm:px-8">Cette page est en cours de construction.</div>
    </AppShell>
  );
}
