import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/crm/AppShell";
import { useCrm } from "@/lib/crm/store";
import { Panel, SectionTitle, Btn, Avatar, StatusBadge, Field, TextInput, TextArea, EmptyState } from "@/components/crm/kit";
import { eur, initials, frDate, shortSlot, CAMPAIGNS } from "@/lib/crm/format";
import { totalBudget, fillTemplate, mailtoHref } from "@/lib/crm/templates";
import type { CampaignType, ClientStatus } from "@/lib/crm/types";
import { crmHead } from "@/lib/crm/page-head";

export const Route = createFileRoute("/clients/$clientId")({
  head: ({ params }) => crmHead(`Fiche client ${params.clientId}`, "Budgets, notes, contrat et emails personnalisés du client Kenshō Studio."),
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { data, updateClient } = useCrm();

  const [newNote, setNewNote] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("contrat");
  const [copied, setCopied] = useState(false);

  if (!data) return <AppShell title="Fiche Client"><div className="p-8 text-center text-muted-foreground">Chargement…</div></AppShell>;

  const client = data.clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <AppShell title="Client introuvable">
        <div className="p-8 text-center">
          <EmptyState title="Client introuvable" text="Ce client n'existe pas ou a été supprimé." />
          <Link to="/clients" className="mt-4 inline-block"><Btn variant="secondary">Retour aux clients</Btn></Link>
        </div>
      </AppShell>
    );
  }

  const tBudget = totalBudget(client);

  const handleBudgetChange = (type: CampaignType, val: number) => {
    updateClient(client.id, (c) => ({
      ...c,
      budgets: { ...c.budgets, [type]: Math.max(0, val) },
    }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    updateClient(client.id, (c) => ({
      ...c,
      notes: [{ id: Date.now().toString(36), date: new Date().toISOString(), text: newNote.trim() }, ...c.notes],
    }));
    setNewNote("");
  };

  const handleToggleContractStatus = () => {
    if (!client.contract) return;
    const nextStatus = client.contract.status === "signe" ? "a_signer" : "signe";
    updateClient(client.id, (c) => ({
      ...c,
      contract: c.contract ? { ...c.contract, status: nextStatus, signedAt: nextStatus === "signe" ? new Date().toISOString() : "" } : null,
    }));
  };

  const currentTemplate = data.templates.find((t) => t.id === selectedTemplateId) ?? data.templates[0];
  const renderedSubject = currentTemplate ? fillTemplate(currentTemplate.subject, client, data.settings) : "";
  const renderedBody = currentTemplate ? fillTemplate(currentTemplate.body, client, data.settings) : "";

  return (
    <AppShell title={client.name}>
      <div className="space-y-6 px-4 py-6 sm:px-8">
        {/* Entête Fiche Client */}
        <Panel className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar text={initials(client.name)} className="h-12 w-12 text-base" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
                  <StatusBadge status={client.status} />
                </div>
                <p className="text-sm text-muted-foreground">{client.contact} • {client.email} {client.phone && `• ${client.phone}`}</p>
                {client.siret && <p className="text-xs text-muted-foreground">SIRET : {client.siret}</p>}
              </div>
            </div>

            {/* Liens rapides & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {client.links.ads && (
                <a href={client.links.ads} target="_blank" rel="noreferrer">
                  <Btn variant="secondary" className="h-8 text-xs">Google Ads ↗</Btn>
                </a>
              )}
              {client.links.looker && (
                <a href={client.links.looker} target="_blank" rel="noreferrer">
                  <Btn variant="secondary" className="h-8 text-xs">Looker Studio ↗</Btn>
                </a>
              )}
              {client.links.drive && (
                <a href={client.links.drive} target="_blank" rel="noreferrer">
                  <Btn variant="secondary" className="h-8 text-xs">Google Drive ↗</Btn>
                </a>
              )}
              <Link to="/contrats">
                <Btn variant="primary" className="h-8 text-xs">Générer contrat</Btn>
              </Link>
            </div>
          </div>

          {/* Bloc Contrat */}
          {client.contract && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Contrat : {client.contract.title}</span>
                <div className="text-muted-foreground">
                  Honoraires : <strong className="text-primary">{eur(client.contract.fee)} HT/mois</strong> • Début : {frDate(client.contract.startDate)} • Durée : {client.contract.duration}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleContractStatus}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
                    client.contract.status === "signe"
                      ? "bg-primary/15 text-primary hover:bg-primary/25"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25"
                  }`}
                  title="Cliquer pour changer le statut"
                >
                  ● {client.contract.status === "signe" ? "Contrat Signé" : "Contrat À signer"}
                </button>
              </div>
            </div>
          )}
        </Panel>

        {/* Grille 3 colonnes : Campagnes | Notes | RDV & Emails */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne 1 : Budgets Google Ads */}
          <Panel className="p-5">
            <SectionTitle title="Campagnes Google Ads" meta={`Total : ${eur(tBudget)} / mois`} />
            <p className="mt-1 text-xs text-muted-foreground">Ajustez les budgets prévisionnels par typologie de campagne.</p>

            <div className="mt-4 space-y-3">
              {CAMPAIGNS.map((camp) => (
                <div key={camp.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">{camp.label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="100"
                      value={client.budgets[camp.key] || 0}
                      onChange={(e) => handleBudgetChange(camp.key, Number(e.target.value))}
                      className="h-8 w-24 rounded border border-border bg-background px-2 text-right text-xs outline-none focus:border-primary"
                    />
                    <span className="text-muted-foreground">€</span>
                  </div>
                </div>
              ))}

              <div className="mt-4 border-t border-border pt-4 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Budget Média Total</span>
                  <span className="text-primary">{eur(tBudget)}</span>
                </div>
                <div className="mt-2 flex justify-between font-semibold">
                  <span>Honoraires Kenshō HT</span>
                  <span className="text-primary">{eur(client.contract?.fee ?? client.fee)}</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Colonne 2 : Notes de réunion */}
          <Panel className="p-5">
            <SectionTitle title="Notes & Comptes-rendus" meta={`${client.notes.length} note(s)`} />
            
            <form onSubmit={handleAddNote} className="mt-4 space-y-2">
              <TextArea
                rows={3}
                placeholder="Ajouter une note de réunion ou un point d'avancement…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="text-xs"
              />
              <Btn type="submit" variant="primary" className="h-8 text-xs w-full">+ Enregistrer la note</Btn>
            </form>

            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {client.notes.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucune note enregistrée pour ce client.</p>
              ) : (
                client.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border bg-background p-3 text-xs">
                    <div className="text-[11px] font-semibold text-primary">{frDate(n.date)}</div>
                    <div className="mt-1 whitespace-pre-wrap text-foreground">{n.text}</div>
                  </div>
                ))
              )}
            </div>
          </Panel>

          {/* Colonne 3 : Mails & Modèles */}
          <Panel className="p-5">
            <SectionTitle title="Emails & Templates" />
            <p className="mt-1 text-xs text-muted-foreground">Générez un email prérempli avec les variables du client.</p>

            <div className="mt-4 space-y-3">
              <Field label="Modèle de mail">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                >
                  {data.templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>

              <div>
                <label className="text-[11px] text-muted-foreground">Objet :</label>
                <div className="rounded border border-border bg-background p-2 text-xs font-medium text-foreground">{renderedSubject}</div>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Corps du message :</label>
                <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded border border-border bg-background p-2 text-xs text-muted-foreground">
                  {renderedBody}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Btn
                  variant="secondary"
                  className="h-8 flex-1 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(`${renderedSubject}\n\n${renderedBody}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copié !" : "Copier le texte"}
                </Btn>
                <a
                  href={mailtoHref(client.email, renderedSubject, renderedBody)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Btn variant="primary" className="h-8 w-full text-xs">Ouvrir dans Mail</Btn>
                </a>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
