import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";
import { useState } from "react";
import { Copy, Mail, Plus, Save, Trash2, X } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { Btn, EmptyState, Field, PageLoading, SelectInput, TextArea, TextInput } from "@/components/crm/kit";
import { fillTemplate, mailtoHref, VARIABLES } from "@/lib/crm/templates";
import { crmHead } from "@/lib/crm/page-head";
import type { EmailTemplate } from "@/lib/crm/types";

export const Route = createFileRoute("/templates")({
  head: () => crmHead("Templates d’emails", "Modèles d’emails personnalisés et aperçus pour les clients Kenshō Studio."),
  component: Page,
});

function Page() {
  const { data, update } = useCrm();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const [clientId, setClientId] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  if (!data) return <AppShell title="Templates d'emails"><PageLoading /></AppShell>;
  const selected = data.templates.find((t) => t.id === selectedId) ?? (selectedId === null ? data.templates[0] : undefined);
  const template = draft ?? selected;
  const client = data.clients.find((c) => c.id === clientId) ?? data.clients[0];
  const subject = template ? fillTemplate(template.subject, client, data.settings) : "";
  const body = template ? fillTemplate(template.body, client, data.settings) : "";
  const change = (key: "name" | "subject" | "body", value: string) => {
    if (template) setDraft({ ...template, [key]: value });
    setMessage("");
  };
  const choose = (id: string) => {
    if (draft && !window.confirm("Abandonner les modifications non enregistrées ?")) return;
    setSelectedId(id); setDraft(null); setDeleting(false); setMessage("");
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!template || !template.name.trim() || !template.subject.trim() || !template.body.trim()) return;
    const saved = { ...template, name: template.name.trim() };
    update((d) => ({ ...d, templates: d.templates.some((t) => t.id === saved.id)
      ? d.templates.map((t) => t.id === saved.id ? saved : t) : [...d.templates, saved] }));
    setSelectedId(saved.id); setDraft(null); setMessage("Modèle enregistré.");
  };
  return (
    <AppShell title="Templates d'emails">
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold">Templates d’emails</h1><p className="mt-1 text-xs text-muted-foreground">{data.templates.length} modèles enregistrés</p></div>
          <Btn onClick={() => {
            if (draft && !window.confirm("Abandonner les modifications non enregistrées ?")) return;
            setDraft({ id: crypto.randomUUID(), name: "Nouveau modèle", subject: "", body: "Bonjour {{contact}},\n\n\n\nBien à vous,\n{{signataire}}" });
            setSelectedId(""); setDeleting(false); setMessage("");
          }}><Plus size={15} /> Nouveau modèle</Btn>
        </div>
        <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="lg:hidden"><Field label="Modèle sélectionné"><SelectInput value={template?.id ?? ""} onChange={(e) => choose(e.target.value)}>{draft && !selected && <option value={draft.id}>Nouveau modèle</option>}{data.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</SelectInput></Field></div>
          <nav aria-label="Modèles d’emails" className="hidden space-y-1 border-r border-border pr-5 lg:block">
            {data.templates.map((t) => <Btn key={t.id} variant="ghost" onClick={() => choose(t.id)} aria-pressed={template?.id === t.id}
              className={`h-auto min-h-10 w-full justify-start whitespace-normal rounded-lg px-3 py-3 text-left ${template?.id === t.id ? "bg-accent text-accent-foreground" : ""}`}><Mail size={15} className="shrink-0" />{t.name}</Btn>)}
          </nav>
          {template ? <>
            <form onSubmit={save} className="min-w-0 space-y-4">
              <h2 className="text-[15px] font-semibold">Modifier le modèle {draft && <span className="text-xs text-warning">• Non enregistré</span>}</h2>
              <Field label="Nom du modèle"><TextInput required value={template.name} onChange={(e) => change("name", e.target.value)} /></Field>
              <Field label="Objet"><TextInput required value={template.subject} onChange={(e) => change("subject", e.target.value)} /></Field>
              <Field label="Message"><TextArea aria-label="Message" required rows={12} value={template.body} onChange={(e) => change("body", e.target.value)} /></Field>
              <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Variables disponibles</summary><div className="mt-2 flex flex-wrap gap-2">{VARIABLES.map((v) => <code key={v} className="break-all">{`{{${v}}}`}</code>)}</div></details>
              <div className="flex flex-wrap gap-2"><Btn type="submit" disabled={!draft}><Save size={15} />Enregistrer</Btn><Btn type="button" variant="secondary" disabled={!draft} onClick={() => { setDraft(null); setSelectedId(selected?.id ?? null); setMessage(""); }}><X size={15} />Annuler</Btn>
                {selected && <Btn type="button" variant="danger" aria-label="Supprimer le modèle" title="Supprimer le modèle" onClick={() => setDeleting(true)}><Trash2 size={15} /></Btn>}
              </div>
              {deleting && <div className="border-t border-border pt-4 text-xs"><p>Supprimer « {selected?.name} » ? Les emails en attente ne seront pas supprimés.</p><div className="mt-3 flex gap-2"><Btn type="button" variant="danger" onClick={() => {
                update((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== selected?.id) })); setDraft(null); setSelectedId(null); setDeleting(false); setMessage("Modèle supprimé.");
              }}>Confirmer la suppression</Btn><Btn type="button" variant="ghost" onClick={() => setDeleting(false)}>Annuler</Btn></div></div>}
              <p role="status" className="text-xs text-primary">{message}</p>
            </form>
            <section className="min-w-0 space-y-4 border-t border-border pt-5 lg:border-t-0 lg:pt-0">
              <h2 className="text-[15px] font-semibold">Aperçu client</h2>
              <Field label="Client"><SelectInput value={client?.id ?? ""} onChange={(e) => setClientId(e.target.value)}>{data.clients.length === 0 && <option value="">Aucun client</option>}{data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectInput></Field>
              <div className="rounded-lg border border-border bg-card p-5 text-[13px]">
                <p className="break-words text-xs text-muted-foreground">À : {client?.email || "—"}</p><h3 className="mt-3 break-words border-b border-border pb-4 font-semibold">{subject}</h3><p className="mt-4 whitespace-pre-wrap break-words leading-relaxed">{body}</p>
              </div>
              <div className="flex flex-wrap gap-2"><Btn variant="secondary" onClick={async () => {
                try { await navigator.clipboard.writeText(`${subject}\n\n${body}`); setMessage("Email copié."); } catch { setMessage("Copie indisponible. Sélectionnez le texte de l’aperçu."); }
              }}><Copy size={15} />Copier</Btn><Btn disabled={!client?.email} onClick={() => { if (client?.email) window.location.href = mailtoHref(client.email, subject, body); }}><Mail size={15} />Ouvrir dans Mail</Btn></div>
            </section>
          </> : <EmptyState title="Aucun modèle" action={<Btn onClick={() => setDraft({ id: crypto.randomUUID(), name: "Nouveau modèle", subject: "", body: "" })}><Plus size={15} />Nouveau modèle</Btn>} />}
        </div>
      </div>
    </AppShell>
  );
}
