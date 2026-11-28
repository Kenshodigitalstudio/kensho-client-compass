
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";
import { useEffect, useState } from "react";
import { Copy, Mail, Plus, Save, Trash2, X, Monitor, Smartphone, Code2, Eye } from "lucide-react";
import { useCrm } from "@/lib/crm/store";
import { Btn, EmptyState, Field, PageLoading, SelectInput, TextArea, TextInput } from "@/components/crm/kit";
import { fillTemplate, mailtoHref, VARIABLES, DEFAULT_TEMPLATES } from "@/lib/crm/templates";
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
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Ajoute les nouveaux modèles par défaut sans supprimer les modèles existants.
  useEffect(() => {
    if (!data) return;
    const existingIds = new Set(data.templates.map((t) => t.id));
    const missing = DEFAULT_TEMPLATES.filter((t) => !existingIds.has(t.id));
    if (missing.length > 0) {
      update((d) => ({ ...d, templates: [...d.templates, ...missing] }));
    }
  }, [data, update]);

  if (!data) return <AppShell title="Templates d'emails"><PageLoading /></AppShell>;

  const selected = data.templates.find((t) => t.id === selectedId)
    ?? (selectedId === null ? data.templates[0] : undefined);
  const template = draft ?? selected;
  const client = data.clients.find((c) => c.id === clientId) ?? data.clients[0];

  const subject = template ? fillTemplate(template.subject, client, data.settings) : "";
  const body = template ? fillTemplate(template.body, client, data.settings) : "";
  const html = template?.html ? fillTemplate(template.html, client, data.settings) : "";

  const change = (key: "name" | "subject" | "body" | "html", value: string) => {
    if (template) setDraft({ ...template, [key]: value });
    setMessage("");
  };

  const choose = (id: string) => {
    if (draft && !window.confirm("Abandonner les modifications non enregistrées ?")) return;
    setSelectedId(id);
    setDraft(null);
    setDeleting(false);
    setMessage("");
  };

  const createTemplate = () => {
    if (draft && !window.confirm("Abandonner les modifications non enregistrées ?")) return;
    const fresh: EmailTemplate = {
      id: crypto.randomUUID(),
      name: "Nouveau modèle",
      subject: "",
      body: "Bonjour {{contact}},\n\n\n\nBien à vous,\n{{signataire}}",
    };
    setDraft(fresh);
    setSelectedId(fresh.id);
    setEditorMode("visual");
    setDeleting(false);
    setMessage("");
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!template || !template.name.trim() || !template.subject.trim()) return;
    if (!template.body.trim() && !template.html?.trim()) return;

    const saved = { ...template, name: template.name.trim() };
    update((d) => ({
      ...d,
      templates: d.templates.some((t) => t.id === saved.id)
        ? d.templates.map((t) => t.id === saved.id ? saved : t)
        : [...d.templates, saved],
    }));
    setSelectedId(saved.id);
    setDraft(null);
    setMessage("Modèle enregistré.");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setMessage("Email copié.");
    } catch {
      setMessage("Copie indisponible.");
    }
  };

  const copyHtml = async () => {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      setMessage("Code HTML copié.");
    } catch {
      setMessage("Copie indisponible.");
    }
  };

  return (
    <AppShell title="Templates d'emails">
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Templates d’emails</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.templates.length} modèles enregistrés
            </p>
          </div>
          <Btn onClick={createTemplate}>
            <Plus size={15} /> Nouveau modèle
          </Btn>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="lg:hidden">
            <Field label="Modèle sélectionné">
              <SelectInput
                value={template?.id ?? ""}
                onChange={(e) => choose(e.target.value)}
              >
                {data.templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </SelectInput>
            </Field>
          </div>

          <nav aria-label="Modèles d’emails" className="hidden space-y-1 border-r border-border pr-5 lg:block">
            {data.templates.map((t) => (
              <Btn
                key={t.id}
                variant="ghost"
                onClick={() => choose(t.id)}
                aria-pressed={template?.id === t.id}
                className={`h-auto min-h-10 w-full justify-start whitespace-normal rounded-lg px-3 py-3 text-left ${
                  template?.id === t.id ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <Mail size={15} className="shrink-0" />
                <span className="text-left">{t.name}</span>
              </Btn>
            ))}
          </nav>

          {template ? (
            <div className="min-w-0 space-y-6">
              <form onSubmit={save} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[15px] font-semibold">
                    Modifier le modèle
                    {draft && <span className="ml-2 text-xs text-warning">• Non enregistré</span>}
                  </h2>
                  <div className="flex gap-2">
                    <Btn type="submit" disabled={!draft}>
                      <Save size={15} /> Enregistrer
                    </Btn>
                    <Btn
                      type="button"
                      variant="secondary"
                      disabled={!draft}
                      onClick={() => {
                        setDraft(null);
                        setSelectedId(selected?.id ?? null);
                        setMessage("");
                      }}
                    >
                      <X size={15} /> Annuler
                    </Btn>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nom du modèle">
                    <TextInput
                      required
                      value={template.name}
                      onChange={(e) => change("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Objet de l'email">
                    <TextInput
                      required
                      value={template.subject}
                      onChange={(e) => change("subject", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-semibold">Éditeur de contenu</h3>
                    <p className="text-xs text-muted-foreground">Modifie le texte ou le code HTML de ton email.</p>
                  </div>
                  <div className="flex gap-2">
                    <Btn
                      type="button"
                      size="sm"
                      variant={editorMode === "visual" ? "primary" : "secondary"}
                      onClick={() => setEditorMode("visual")}
                    >
                      <Eye size={14} /> Texte
                    </Btn>
                    <Btn
                      type="button"
                      size="sm"
                      variant={editorMode === "html" ? "primary" : "secondary"}
                      onClick={() => setEditorMode("html")}
                    >
                      <Code2 size={14} /> HTML
                    </Btn>
                  </div>
                </div>

                {editorMode === "visual" ? (
                  <Field label="Contenu du message">
                    <TextArea
                      aria-label="Contenu du message"
                      rows={12}
                      value={template.body}
                      onChange={(e) => change("body", e.target.value)}
                    />
                  </Field>
                ) : (
                  <Field label="Code HTML complet">
                    <textarea
                      aria-label="Code HTML"
                      spellCheck={false}
                      rows={22}
                      value={template.html ?? ""}
                      onChange={(e) => change("html", e.target.value)}
                      placeholder="Colle ici ton code HTML complet..."
                      className="w-full rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary"
                    />
                  </Field>
                )}

                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Variables disponibles</summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {VARIABLES.map((v) => (
                      <code key={v} className="break-all rounded bg-muted px-2 py-1">
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </div>
                </details>

                <p role="status" className="text-xs text-primary">{message}</p>
              </form>

              <div className="border-t border-border pt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold">Aperçu de l'email</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Visualise le rendu avant de copier ton email.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Btn
                      type="button"
                      size="sm"
                      variant={previewMode === "desktop" ? "primary" : "secondary"}
                      onClick={() => setPreviewMode("desktop")}
                    >
                      <Monitor size={14} /> Desktop
                    </Btn>
                    <Btn
                      type="button"
                      size="sm"
                      variant={previewMode === "mobile" ? "primary" : "secondary"}
                      onClick={() => setPreviewMode("mobile")}
                    >
                      <Smartphone size={14} /> Mobile
                    </Btn>
                  </div>
                </div>

                <Field label="Client pour personnaliser l'aperçu">
                  <SelectInput
                    value={client?.id ?? ""}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    {data.clients.length === 0 && <option value="">Aucun client</option>}
                    {data.clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </SelectInput>
                </Field>

                <div className="mt-4 overflow-auto rounded-xl border border-border bg-[#e9e7e3] p-3 sm:p-5">
                  {template.html ? (
                    <div
                      className="mx-auto overflow-hidden rounded-lg bg-white shadow-sm transition-all"
                      style={{ width: previewMode === "mobile" ? "375px" : "100%", maxWidth: "100%" }}
                    >
                      <iframe
                        title="Aperçu de l'email HTML"
                        srcDoc={html}
                        sandbox=""
                        className="block h-[760px] w-full border-0 bg-white"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto rounded-lg border border-border bg-card p-5 text-[13px] shadow-sm" style={{ maxWidth: previewMode === "mobile" ? "375px" : "680px" }}>
                      <p className="break-words text-xs text-muted-foreground">
                        À : {client?.email || "—"}
                      </p>
                      <h3 className="mt-3 break-words border-b border-border pb-4 font-semibold">
                        {subject}
                      </h3>
                      <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed">
                        {body}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn type="button" variant="secondary" onClick={copyText}>
                    <Copy size={15} /> Copier le texte
                  </Btn>
                  {template.html && (
                    <Btn type="button" variant="secondary" onClick={copyHtml}>
                      <Code2 size={15} /> Copier le HTML
                    </Btn>
                  )}
                  {!template.html && (
                    <Btn
                      type="button"
                      disabled={!client?.email}
                      onClick={() => {
                        if (client?.email) window.location.href = mailtoHref(client.email, subject, body);
                      }}
                    >
                      <Mail size={15} /> Ouvrir dans Mail
                    </Btn>
                  )}
                </div>
                {template.html && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pour envoyer cet email HTML, copie le code et utilise ton outil d'envoi d'emails. Le bouton Mail classique ne conserve pas la mise en page HTML.
                  </p>
                )}
              </div>

              {selected && (
                <div className="border-t border-border pt-4">
                  {!deleting ? (
                    <Btn type="button" variant="danger" onClick={() => setDeleting(true)}>
                      <Trash2 size={15} /> Supprimer ce modèle
                    </Btn>
                  ) : (
                    <div className="rounded-lg border border-border p-4 text-sm">
                      <p>Supprimer « {selected.name} » ?</p>
                      <div className="mt-3 flex gap-2">
                        <Btn
                          type="button"
                          variant="danger"
                          onClick={() => {
                            update((d) => ({
                              ...d,
                              templates: d.templates.filter((t) => t.id !== selected.id),
                            }));
                            setDraft(null);
                            setSelectedId(null);
                            setDeleting(false);
                            setMessage("Modèle supprimé.");
                          }}
                        >
                          Confirmer la suppression
                        </Btn>
                        <Btn type="button" variant="ghost" onClick={() => setDeleting(false)}>
                          Annuler
                        </Btn>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="Aucun modèle"
              action={<Btn onClick={createTemplate}><Plus size={15} /> Nouveau modèle</Btn>}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
