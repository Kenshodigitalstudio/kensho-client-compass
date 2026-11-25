import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Tableau de bord CRM — Kenshō Studio CRM" }, { name: "description", content: "Tableau de bord CRM du CRM Kenshō Studio." }, { property: "og:title", content: "Tableau de bord CRM — Kenshō Studio CRM" }, { property: "og:description", content: "Tableau de bord CRM du CRM Kenshō Studio." }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Tableau de bord CRM">
      <div className="px-4 py-10 text-[13px] text-muted-foreground sm:px-8">Cette page est en cours de construction.</div>
    </AppShell>
  );
}
