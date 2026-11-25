import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";

export const Route = createFileRoute("/taxes")({
  head: () => ({ meta: [{ title: "Taxes & Bénéfices — Kenshō Studio CRM" }, { name: "description", content: "Taxes & Bénéfices du CRM Kenshō Studio." }, { property: "og:title", content: "Taxes & Bénéfices — Kenshō Studio CRM" }, { property: "og:description", content: "Taxes & Bénéfices du CRM Kenshō Studio." }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Taxes & Bénéfices">
      <div className="px-4 py-10 text-[13px] text-muted-foreground sm:px-8">Cette page est en cours de construction.</div>
    </AppShell>
  );
}
