import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/crm/AppShell";
import { useCrm } from "@/lib/crm/store";
import { Panel, SectionTitle, Btn, Avatar, StatusBadge, Field, TextInput, TextArea, EmptyState } from "@/components/crm/kit";
import { eur, initials, frDate, CAMPAIGNS, uid } from "@/lib/crm/format";
import { totalBudget, fillTemplate, mailtoHref } from "@/lib/crm/templates";
import type { ActionPriority, ActionStatus, CampaignType, Client, ContractDocStatus } from "@/lib/crm/types";
import { crmHead } from "@/lib/crm/page-head";
import { DOC_STATUS_LABEL, clientTimeline, contractDocStatus, daysUntilEnd, invoiceState, nextPaymentDue } from "@/lib/crm/client-file";

export const Route = createFileRoute("/clients/$clientId")({
  head: ({ params }) => crmHead(`Fiche client ${params.clientId}`, "Budget publicitaire, honoraires, contrat, factures, actions et historique du client Kenshō Studio."),
  component: ClientDetailPage,
});

const PRIORITY_LABEL: Record<ActionPriority, string> = { basse: "Basse", moyenne: "Moyenne", haute: "Haute" };
const ACTION_LABEL: Record<ActionStatus, string> = { a_faire: "À faire", en_cours: "En cours", termine: "Terminé" };
const NEXT_STATUS: Record<ActionStatus, ActionStatus> = { a_faire: "en_cours", en_cours: "termine", termine: "a_faire" };
const DOC_TONE: Record<ContractDocStatus, string> = {
  brouillon: "bg-muted text-muted-foreground",
  attente: "bg-amber-500/15 text-amber-700",
  signe: "bg-primary/15 text-primary",
  expire: "bg-destructive/15 text-destructive",
};
const today = () => new Date().toISOString().slice(0, 10);
const smallInput = "h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-primary";

function ClientDetailPage() {
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { data, updateClient } = useCrm();

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
  const update = (fn: (c: Client) => Client) => updateClient(client.id, fn);

  return (
    <AppShell title={client.name}>
      <div className="space-y-6 px-4 py-6 sm:px-8">
        <HeaderPanel client={client} update={update} />
        <div className="grid gap-6 lg:grid-cols-3">
          <BudgetPanel client={client} update={update} />
          <FinancePanel client={client} update={update} />
          <ContractTermsPanel client={client} update={update} />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <ActionsPanel client={client} update={update} />
          <NotesPanel client={client} update={update} />
          <EmailPanel client={client} update={update} />
        </div>
        <HistoryPanel client={client} />
      </div>
    </AppShell>
  );
}

type P = { client: Client; update: (fn: (c: Client) => Client) => void };

function HeaderPanel({ client, update }: P) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const status = client.contract ? contractDocStatus(client.contract, new Date()) : null;

  const onFile = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (f.type !== "application/pdf") return setError("Merci de choisir un fichier PDF.");
    if (f.size > 2_000_000) return setError("Le PDF dépasse 2 Mo, trop lourd pour être conservé.");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        update((c) => ({ ...c, contractPdf: { name: f.name, dataUrl: String(reader.result), uploadedAt: new Date().toISOString() } }));
      } catch {
        setError("Impossible d'enregistrer ce PDF.");
      }
    };
    reader.readAsDataURL(f);
  };

  const setDocStatus = (s: ContractDocStatus) =>
    update((c) => c.contract ? {
      ...c,
      contract: {
        ...c.contract,
        docStatus: s,
        status: s === "signe" ? "signe" : "a_signer",
        signedAt: s === "signe" ? (c.contract.signedAt || new Date().toISOString()) : (c.contract.signedAt ?? ""),
        sentAt: s === "attente" ? (c.contract.sentAt || new Date().toISOString()) : (c.contract.sentAt ?? ""),
      },
    } : c);

  return (
    <Panel className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar text={initials(client.name)} className="h-12 w-12 text-base" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
              <StatusBadge status={client.status} />
            </div>
            <p className="break-words text-sm text-muted-foreground">{client.contact} • {client.email} {client.phone && `• ${client.phone}`}</p>
            {client.siret && <p className="text-xs text-muted-foreground">SIRET : {client.siret}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {client.contractPdf ? (
            <>
              <a href={client.contractPdf.dataUrl} download={client.contractPdf.name}>
                <Btn variant="primary" className="h-8 text-xs">Contrat PDF ↓</Btn>
              </a>
              <Btn variant="secondary" className="h-8 text-xs" onClick={() => fileRef.current?.click()}>Remplacer</Btn>
            </>
          ) : (
            <Btn variant="primary" className="h-8 text-xs" onClick={() => fileRef.current?.click()}>Ajouter le contrat PDF</Btn>
          )}
          <Link to="/contrats"><Btn variant="secondary" className="h-8 text-xs">Générer contrat</Btn></Link>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" aria-label="Fichier PDF du contrat"
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {client.contract && status && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-foreground">Contrat : {client.contract.title}</span>
            <div className="text-muted-foreground">
              {client.contractPdf ? `Fichier : ${client.contractPdf.name}` : "Aucun PDF joint pour l'instant"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 font-semibold ${DOC_TONE[status]}`}>● {DOC_STATUS_LABEL[status]}</span>
            <select aria-label="Statut du contrat" value={status} onChange={(e) => setDocStatus(e.target.value as ContractDocStatus)} className={smallInput}>
              {(Object.keys(DOC_STATUS_LABEL) as ContractDocStatus[]).map((s) => <option key={s} value={s}>{DOC_STATUS_LABEL[s]}</option>)}
            </select>
          </div>
        </div>
      )}
    </Panel>
  );
}

function BudgetPanel({ client, update }: P) {
  const tBudget = totalBudget(client);
  const start = useRef<number | null>(null);
  const setBudget = (type: CampaignType, val: number) =>
    update((c) => ({ ...c, budgets: { ...c.budgets, [type]: Math.max(0, val) } }));
  const logChange = (label: string, before: number, after: number) => {
    if (before === after) return;
    update((c) => ({ ...c, history: [{ id: uid(), date: new Date().toISOString(), kind: "budget", text: `Budget ${label} : ${eur(before)} → ${eur(after)}` }, ...(c.history ?? [])] }));
  };
  const fee = client.contract?.fee ?? client.fee;

  return (
    <Panel className="p-5">
      <SectionTitle title="Répartition du budget publicitaire" meta={`${eur(tBudget)} / mois`} />
      <p className="mt-1 text-xs text-muted-foreground">Enveloppe média dépensée par le client directement auprès de Google.</p>
      <div className="mt-4 space-y-3">
        {CAMPAIGNS.map((camp) => (
          <div key={camp.key} className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-foreground">{camp.label}</span>
            <div className="flex items-center gap-1">
              <input type="number" step="100" aria-label={`Budget ${camp.label}`} value={client.budgets[camp.key] || 0}
                onFocus={() => { start.current = client.budgets[camp.key] || 0; }}
                onBlur={(e) => { logChange(camp.label, start.current ?? 0, Math.max(0, Number(e.target.value))); start.current = null; }}
                onChange={(e) => setBudget(camp.key, Number(e.target.value))}
                className="h-8 w-24 rounded border border-border bg-background px-2 text-right text-xs outline-none focus:border-primary" />
              <span className="text-muted-foreground">€</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-3 text-xs font-semibold">
          <span>Budget média mensuel (Google)</span><span>{eur(tBudget)}</span>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-accent p-3 text-xs">
        <div className="flex justify-between font-semibold text-foreground">
          <span>Honoraires Kenshō HT</span><span className="text-primary">{eur(fee)} / mois</span>
        </div>
        <p className="mt-1 text-muted-foreground">Forfait fixe, indépendant du budget média.</p>
      </div>
    </Panel>
  );
}

function FinancePanel({ client, update }: P) {
  const invoices = client.invoices ?? [];
  const now = new Date();
  const [open, setOpen] = useState(false);
  const fee = client.contract?.fee ?? client.fee;
  const [form, setForm] = useState({ number: "", amount: String(fee), issuedAt: today(), dueAt: today() });
  const next = nextPaymentDue(invoices);
  const counts = { payee: 0, attente: 0, retard: 0 };
  invoices.forEach((i) => { counts[invoiceState(i, now)] += 1; });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number.trim() || !form.dueAt) return;
    update((c) => ({ ...c, invoices: [{ id: uid(), number: form.number.trim(), amount: Math.max(0, Number(form.amount) || 0), issuedAt: form.issuedAt, dueAt: form.dueAt }, ...(c.invoices ?? [])] }));
    setForm({ number: "", amount: String(fee), issuedAt: today(), dueAt: today() });
    setOpen(false);
  };
  const togglePaid = (id: string) => update((c) => ({ ...c, invoices: (c.invoices ?? []).map((i) => i.id === id ? (i.paidAt ? { id: i.id, number: i.number, amount: i.amount, issuedAt: i.issuedAt, dueAt: i.dueAt } : { ...i, paidAt: new Date().toISOString() }) : i) }));
  const remove = (id: string) => { if (confirm("Supprimer cette facture ?")) update((c) => ({ ...c, invoices: (c.invoices ?? []).filter((i) => i.id !== id) })); };
  const tone = { payee: "text-primary", attente: "text-amber-700", retard: "text-destructive" };
  const label = { payee: "Payée", attente: "En attente", retard: "En retard" };

  return (
    <Panel className="p-5">
      <SectionTitle title="Suivi financier" meta={`${eur(fee)} HT / mois`} />
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg border border-border p-2"><div className="text-base font-bold">{invoices.length}</div>Émises</div>
        <div className="rounded-lg border border-border p-2"><div className="text-base font-bold text-primary">{counts.payee}</div>Payées</div>
        <div className="rounded-lg border border-border p-2"><div className={`text-base font-bold ${counts.retard ? "text-destructive" : ""}`}>{counts.attente + counts.retard}</div>{counts.retard ? `dont ${counts.retard} en retard` : "En attente"}</div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Prochaine échéance : {next ? <strong className="text-foreground">{frDate(next.dueAt)} — {eur(next.amount)} ({next.number})</strong> : "aucune facture à encaisser"}
      </p>
      {open ? (
        <form onSubmit={add} className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border p-3">
          <Field label="N° facture" className="col-span-2"><TextInput required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="F-2026-001" /></Field>
          <Field label="Montant HT"><TextInput type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="Émise le"><TextInput type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} /></Field>
          <Field label="Échéance" className="col-span-2"><TextInput type="date" required value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></Field>
          <Btn type="button" variant="secondary" className="h-8 text-xs" onClick={() => setOpen(false)}>Annuler</Btn>
          <Btn type="submit" className="h-8 text-xs">Enregistrer</Btn>
        </form>
      ) : (
        <Btn variant="secondary" className="mt-3 h-8 w-full text-xs" onClick={() => setOpen(true)}>+ Ajouter une facture</Btn>
      )}
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {invoices.length === 0 ? <p className="text-xs text-muted-foreground">Aucune facture enregistrée pour ce client.</p> :
          invoices.map((i) => {
            const s = invoiceState(i, now);
            return (
              <div key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold">{i.number} · {eur(i.amount)}</div>
                  <div className="text-muted-foreground">Échéance {frDate(i.dueAt)} · <span className={`font-semibold ${tone[s]}`}>{label[s]}</span></div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => togglePaid(i.id)} className="rounded-md border border-border px-2 py-1 hover:bg-accent">{i.paidAt ? "Annuler paiement" : "Marquer payée"}</button>
                  <button type="button" onClick={() => remove(i.id)} aria-label="Supprimer la facture" className="rounded-md px-2 py-1 text-muted-foreground hover:text-destructive">✕</button>
                </div>
              </div>
            );
          })}
      </div>
    </Panel>
  );
}

function ContractTermsPanel({ client, update }: P) {
  const c = client.contract;
  if (!c) {
    return (
      <Panel className="p-5">
        <SectionTitle title="Échéances contractuelles" />
        <EmptyState title="Pas encore de contrat" text="Générez un contrat pour suivre ses dates." action={<Link to="/contrats"><Btn className="h-8 text-xs">Générer contrat</Btn></Link>} />
      </Panel>
    );
  }
  const days = daysUntilEnd(c, new Date());
  const set = (patch: Partial<NonNullable<Client["contract"]>>) => update((cl) => cl.contract ? { ...cl, contract: { ...cl.contract, ...patch } } : cl);
  return (
    <Panel className="p-5">
      <SectionTitle title="Échéances contractuelles" />
      {days !== null && days <= 30 && (
        <div className={`mt-3 rounded-lg p-3 text-xs font-medium ${days < 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-700"}`}>
          {days < 0
            ? (c.autoRenew ? `Échéance passée de ${-days} j — pensez à mettre à jour la date de renouvellement.` : `Contrat terminé depuis ${-days} jour(s).`)
            : `${c.autoRenew ? "Renouvellement" : "Fin du contrat"} dans ${days} jour(s).`}
        </div>
      )}
      <div className="mt-4 space-y-3 text-xs">
        <Field label="Date de début"><TextInput type="date" value={c.startDate.slice(0, 10)} onChange={(e) => e.target.value && set({ startDate: e.target.value })} /></Field>
        <Field label="Date de fin ou de renouvellement"><TextInput type="date" value={c.endDate?.slice(0, 10) ?? ""} onChange={(e) => set({ endDate: e.target.value })} /></Field>
        <Field label="Durée"><TextInput value={c.duration} onChange={(e) => set({ duration: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-foreground">
          <input type="checkbox" checked={!!c.autoRenew} onChange={(e) => set({ autoRenew: e.target.checked })} className="accent-primary" />
          Reconduction tacite
        </label>
        <p className="text-muted-foreground">Prochaine échéance : <strong className="text-foreground">{c.endDate ? frDate(c.endDate) : "date de fin à renseigner"}</strong></p>
      </div>
    </Panel>
  );
}

function ActionsPanel({ client, update }: P) {
  const actions = client.actions ?? [];
  const [text, setText] = useState("");
  const [due, setDue] = useState(today());
  const [priority, setPriority] = useState<ActionPriority>("moyenne");
  const [showDone, setShowDone] = useState(false);
  const open = actions.filter((a) => a.status !== "termine").sort((a, b) => a.due.localeCompare(b.due));
  const done = actions.filter((a) => a.status === "termine").sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    update((c) => ({ ...c, actions: [...(c.actions ?? []), { id: uid(), text: text.trim(), due, priority, status: "a_faire", createdAt: new Date().toISOString() }] }));
    setText("");
  };
  const cycle = (id: string) => update((c) => ({
    ...c,
    actions: (c.actions ?? []).map((a) => {
      if (a.id !== id) return a;
      const status = NEXT_STATUS[a.status];
      const { doneAt: _d, ...rest } = a;
      return status === "termine" ? { ...rest, status, doneAt: new Date().toISOString() } : { ...rest, status };
    }),
  }));
  const remove = (id: string) => update((c) => ({ ...c, actions: (c.actions ?? []).filter((a) => a.id !== id) }));
  const pTone = { haute: "text-destructive", moyenne: "text-amber-700", basse: "text-muted-foreground" };

  return (
    <Panel className="p-5">
      <SectionTitle title="Actions à effectuer" meta={`${open.length} en cours`} />
      <form onSubmit={add} className="mt-4 space-y-2">
        <TextInput placeholder="Nouvelle action…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Nouvelle action" />
        <div className="flex gap-2">
          <input type="date" aria-label="Date limite" value={due} onChange={(e) => setDue(e.target.value)} className={`${smallInput} flex-1`} />
          <select aria-label="Priorité" value={priority} onChange={(e) => setPriority(e.target.value as ActionPriority)} className={smallInput}>
            {(Object.keys(PRIORITY_LABEL) as ActionPriority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
          </select>
        </div>
        <Btn type="submit" className="h-8 w-full text-xs">+ Ajouter l'action</Btn>
      </form>
      <div className="mt-4 space-y-2">
        {open.length === 0 && <p className="text-xs text-muted-foreground">Rien à faire pour ce client, tout est à jour.</p>}
        {open.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-background p-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-foreground">{a.text}</span>
              <button type="button" onClick={() => remove(a.id)} aria-label="Supprimer l'action" className="text-muted-foreground hover:text-destructive">✕</button>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
              <span className={a.due < today() ? "font-semibold text-destructive" : ""}>Avant le {frDate(a.due)}</span>
              <span className={`font-semibold ${pTone[a.priority]}`}>{PRIORITY_LABEL[a.priority]}</span>
              <button type="button" onClick={() => cycle(a.id)} className="ml-auto rounded-full bg-accent px-2 py-0.5 font-semibold text-foreground hover:bg-primary/15" title="Passer au statut suivant">
                {ACTION_LABEL[a.status]} →
              </button>
            </div>
          </div>
        ))}
      </div>
      {done.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <button type="button" onClick={() => setShowDone(!showDone)} className="text-xs font-semibold text-primary">
            {showDone ? "Masquer" : "Voir"} l'historique des tâches terminées ({done.length})
          </button>
          {showDone && done.map((a) => (
            <div key={a.id} className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="line-through">{a.text}</span>
              <button type="button" onClick={() => cycle(a.id)} className="shrink-0 hover:text-foreground">{a.doneAt ? frDate(a.doneAt) : ""} · Rouvrir</button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function NotesPanel({ client, update }: P) {
  const [newNote, setNewNote] = useState("");
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    update((c) => ({ ...c, notes: [{ id: Date.now().toString(36), date: new Date().toISOString(), text: newNote.trim() }, ...c.notes] }));
    setNewNote("");
  };
  return (
    <Panel className="p-5">
      <SectionTitle title="Notes & Comptes-rendus" meta={`${client.notes.length} note(s)`} />
      <form onSubmit={add} className="mt-4 space-y-2">
        <TextArea rows={3} placeholder="Ajouter une note de réunion ou un point d'avancement…" value={newNote} onChange={(e) => setNewNote(e.target.value)} className="text-xs" />
        <Btn type="submit" variant="primary" className="h-8 w-full text-xs">+ Enregistrer la note</Btn>
      </form>
      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
        {client.notes.length === 0 ? <p className="text-xs text-muted-foreground">Aucune note enregistrée pour ce client.</p> :
          client.notes.map((n) => (
            <div key={n.id} className="rounded-lg border border-border bg-background p-3 text-xs">
              <div className="text-[11px] font-semibold text-primary">{frDate(n.date)}</div>
              <div className="mt-1 whitespace-pre-wrap text-foreground">{n.text}</div>
            </div>
          ))}
      </div>
    </Panel>
  );
}

function EmailPanel({ client, update }: P) {
  const { data } = useCrm();
  const [selectedTemplateId, setSelectedTemplateId] = useState("contrat");
  const [copied, setCopied] = useState(false);
  if (!data) return null;
  const tpl = data.templates.find((t) => t.id === selectedTemplateId) ?? data.templates[0];
  const subject = tpl ? fillTemplate(tpl.subject, client, data.settings) : "";
  const body = tpl ? fillTemplate(tpl.body, client, data.settings) : "";
  const log = () => tpl && update((c) => ({ ...c, history: [{ id: uid(), date: new Date().toISOString(), kind: "email", text: `Email généré : ${tpl.name}` }, ...(c.history ?? [])] }));

  return (
    <Panel className="p-5">
      <SectionTitle title="Emails & Templates" />
      <p className="mt-1 text-xs text-muted-foreground">Générez un email prérempli avec les variables du client.</p>
      <div className="mt-4 space-y-3">
        <Field label="Modèle de mail">
          <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary">
            {data.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <div>
          <label className="text-[11px] text-muted-foreground">Objet :</label>
          <div className="rounded border border-border bg-background p-2 text-xs font-medium text-foreground">{subject}</div>
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">Corps du message :</label>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded border border-border bg-background p-2 text-xs text-muted-foreground">{body}</div>
        </div>
        <div className="flex gap-2 pt-2">
          <Btn variant="secondary" className="h-8 flex-1 text-xs" onClick={() => {
            navigator.clipboard.writeText(`${subject}\n\n${body}`);
            log(); setCopied(true); setTimeout(() => setCopied(false), 2000);
          }}>{copied ? "Copié !" : "Copier le texte"}</Btn>
          <a href={mailtoHref(client.email, subject, body)} target="_blank" rel="noreferrer" className="flex-1" onClick={log}>
            <Btn variant="primary" className="h-8 w-full text-xs">Ouvrir dans Mail</Btn>
          </a>
        </div>
      </div>
    </Panel>
  );
}

function HistoryPanel({ client }: { client: Client }) {
  const items = clientTimeline(client);
  return (
    <Panel className="p-5">
      <SectionTitle title="Historique client" meta={`${items.length} événement(s)`} />
      {items.length === 0 ? <p className="mt-3 text-xs text-muted-foreground">L'historique se remplira au fil des contrats, factures, emails et notes.</p> : (
        <ol className="mt-4 max-h-96 space-y-3 overflow-y-auto border-l border-border pl-4">
          {items.map((i) => (
            <li key={i.id} className="relative text-xs">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="text-[11px] text-muted-foreground">{frDate(i.date)} · <span className="font-semibold text-primary">{i.label}</span></div>
              <div className="mt-0.5 line-clamp-3 whitespace-pre-wrap text-foreground">{i.text}</div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
