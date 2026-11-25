import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";

export const Route = createFileRoute("/reglages")({
  head: () => ({ meta: [{ title: "Réglages — Kenshō Studio CRM" }, { name: "description", content: "Réglages du CRM Kenshō Studio." }, { property: "og:title", content: "Réglages — Kenshō Studio CRM" }, { property: "og:description", content: "Réglages du CRM Kenshō Studio." }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Réglages">
      <div className="px-4 py-10 text-[13px] text-muted-foreground sm:px-8">Cette page est en cours de construction.</div>
    </AppShell>
  );
}
