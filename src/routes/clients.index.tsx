import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";

export const Route = createFileRoute("/clients/")({
  head: () => ({ meta: [{ title: "Clients — Kenshō Studio CRM" }, { name: "description", content: "Clients du CRM Kenshō Studio." }, { property: "og:title", content: "Clients — Kenshō Studio CRM" }, { property: "og:description", content: "Clients du CRM Kenshō Studio." }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Clients">
      <div className="px-4 py-10 text-[13px] text-muted-foreground sm:px-8">Cette page est en cours de construction.</div>
    </AppShell>
  );
}
