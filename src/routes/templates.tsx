import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [{ title: "Templates d'emails — Kenshō Studio CRM" }, { name: "description", content: "Templates d'emails du CRM Kenshō Studio." }, { property: "og:title", content: "Templates d'emails — Kenshō Studio CRM" }, { property: "og:description", content: "Templates d'emails du CRM Kenshō Studio." }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Templates d'emails">
      <div className="px-4 py-10 text-[13px] text-muted-foreground sm:px-8">Cette page est en cours de construction.</div>
    </AppShell>
  );
}
