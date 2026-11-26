import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";
import { useCrm, matchesFilter } from "@/lib/crm/store";
import { Panel, SectionTitle, Btn, Avatar, StatusBadge, EmptyState } from "@/components/crm/kit";
import { eur, initials, shortSlot, frDate } from "@/lib/crm/format";
import { totalBudget, mailtoHref } from "@/lib/crm/templates";
import { crmHead } from "@/lib/crm/page-head";

export const Route = createFileRoute("/")({
  head: () => crmHead("Tableau de bord", "Clients, budgets publicitaires, rendez-vous et relances Kenshō Studio."),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, query, filter, setNewClientOpen, updateClient } = useCrm();

  if (!data) return <AppShell title="Tableau de bord"><div className="p-8 text-center text-muted-foreground">Chargement…</div></AppShell>;

  const activeClients = data.clients.filter((c) => c.status === "actif" || c.status === "onboarding");
  const totalAdsBudget = activeClients.reduce((acc, c) => acc + totalBudget(c), 0);
  const totalFees = activeClients.reduce((acc, c) => acc + (c.contract?.fee ?? c.fee), 0);

  // Prochains rendez-vous
  const allAppointments = data.clients
    .flatMap((c) => c.appointments.map((a) => ({ ...a, client: c })))
    .filter((a) => !a.done && new Date(a.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Relances et emails en attente
  const pendingEmails = data.clients
    .flatMap((c) => c.emails.map((m) => ({ ...m, client: c })))
    .filter((m) => !m.sent)
    .slice(0, 5);

  // Clients filtrés
  const q = query.trim().toLowerCase();
  const clients = data.clients.filter((c) => {
    if (!matchesFilter(c.status, filter)) return false;
    if (!q) return true;
    return `${c.name} ${c.contact} ${c.email}`.toLowerCase().includes(q);
  });

  return (
    <AppShell title="Tableau de bord">
      <div className="grid gap-6 px-4 py-6 sm:px-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Panel className="p-4">
            <span className="text-[12px] font-medium text-muted-foreground">Clients actifs</span>
            <div className="mt-1 text-2xl font-bold text-foreground">{activeClients.length}</div>
            <span className="text-[11px] text-primary">{data.clients.length} au total dans le CRM</span>
          </Panel>
          <Panel className="p-4">
            <span className="text-[12px] font-medium text-muted-foreground">Budget Ads géré / mois</span>
            <div className="mt-1 text-2xl font-bold text-foreground">{eur(totalAdsBudget)}</div>
            <span className="text-[11px] text-muted-foreground">Dépenses médias cumulées</span>
          </Panel>
          <Panel className="p-4">
            <span className="text-[12px] font-medium text-muted-foreground">Honoraires agence / mois</span>
            <div className="mt-1 text-2xl font-bold text-primary">{eur(totalFees)}</div>
            <span className="text-[11px] text-muted-foreground">Prestations récurrentes HT</span>
          </Panel>
          <Panel className="p-4">
            <span className="text-[12px] font-medium text-muted-foreground">RDV prévus</span>
            <div className="mt-1 text-2xl font-bold text-foreground">{allAppointments.length}</div>
            <span className="text-[11px] text-warning">{pendingEmails.length} email(s) à envoyer</span>
          </Panel>
        </div>

        {/* Contenu principal en 2 colonnes */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Liste des clients */}
          <Panel className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between pb-4">
              <SectionTitle title="Clients & Campagnes en cours" meta={`${clients.length} affiché(s)`} />
              <Btn variant="primary" onClick={() => setNewClientOpen(true)}>+ Nouveau client</Btn>
            </div>

            {clients.length === 0 ? (
              <EmptyState title="Aucun client trouvé" text="Modifiez vos critères de recherche ou ajoutez un nouveau client." />
            ) : (
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {clients.map((c) => {
                  const bTotal = totalBudget(c);
                  return (
                    <div key={c.id} className="flex flex-col gap-3 p-4 transition sm:flex-row sm:items-center sm:justify-between hover:bg-background/60">
                      <div className="flex items-center gap-3">
                        <Avatar text={initials(c.name)} />
                        <div>
                          <Link to="/clients/$clientId" params={{ clientId: c.id }} className="font-semibold text-foreground hover:text-primary">
                            {c.name}
                          </Link>
                          <div className="text-[12px] text-muted-foreground">{c.contact} • {c.email}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[13px]">
                        <div className="text-right">
                          <span className="block font-medium text-foreground">{bTotal > 0 ? eur(bTotal) : "—"}</span>
                          <span className="block text-[11px] text-muted-foreground">Budget Ads</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-semibold text-primary">{eur(c.contract?.fee ?? c.fee)}</span>
                          <span className="block text-[11px] text-muted-foreground">Honoraires</span>
                        </div>
                        <StatusBadge status={c.status} />
                        <Link to="/clients/$clientId" params={{ clientId: c.id }}>
                          <Btn variant="secondary" className="h-8 text-xs">Ouvrir fiche</Btn>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Colonne latérale : RDV et Relances */}
          <div className="space-y-6">
            <Panel className="p-5">
              <SectionTitle title="Prochains rendez-vous" meta={`${allAppointments.length} prévus`} />
              <div className="mt-4 space-y-3">
                {allAppointments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun rendez-vous à venir.</p>
                ) : (
                  allAppointments.map((a) => (
                    <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3 text-xs">
                      <div>
                        <div className="font-semibold text-foreground">{a.title}</div>
                        <div className="text-muted-foreground">{a.client.name} • {shortSlot(a.date)}</div>
                        <div className="text-[11px] text-primary">{a.place}</div>
                      </div>
                      <Link to="/clients/$clientId" params={{ clientId: a.client.id }}>
                        <Btn variant="ghost" className="h-7 px-2 text-[11px]">Voir</Btn>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionTitle title="Relances & Emails à envoyer" meta={`${pendingEmails.length} en attente`} />
              <div className="mt-4 space-y-3">
                {pendingEmails.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Toutes les relances sont à jour.</p>
                ) : (
                  pendingEmails.map((m) => (
                    <div key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground truncate">{m.title}</div>
                        <div className="text-muted-foreground truncate">{m.client.name} • Échéance : {frDate(m.due)}</div>
                      </div>
                      <a href={mailtoHref(m.client.email, m.title, `Bonjour ${m.client.contact},\n\n`)} target="_blank" rel="noreferrer">
                        <Btn variant="secondary" className="h-7 px-2 text-[11px]">Envoyer</Btn>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
