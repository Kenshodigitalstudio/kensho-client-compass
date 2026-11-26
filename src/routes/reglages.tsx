import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";
import { useState } from "react";
import { Save, X } from "lucide-react";
import { Btn, Field, PageLoading, SelectInput, TextInput } from "@/components/crm/kit";
import { useCrm } from "@/lib/crm/store";
import { crmHead } from "@/lib/crm/page-head";
import type { Settings } from "@/lib/crm/types";

export const Route = createFileRoute("/reglages")({
  head: () => crmHead("Réglages", "Informations d’agence, signataire et paramètres fiscaux Kenshō Studio."),
  component: Page,
});

function Page() {
  const { data, update } = useCrm();
  const [draft, setDraft] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  if (!data) return <AppShell title="Réglages"><PageLoading /></AppShell>;
  const settings = draft ?? data.settings;
  const change = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft({ ...settings, [key]: value }); setSaved(false);
  };
  const agencyFields = [
    ["agencyName", "Nom de l’agence"], ["signatory", "Signataire"], ["agencyEmail", "Email de l’agence"],
    ["agencyAddress", "Adresse"], ["agencySiret", "SIRET"],
  ] as const;
  const rates = [["urssafRate", "Cotisations sociales URSSAF (%)"], ["cfpRate", "Formation professionnelle CFP (%)"], ["vlRate", "Versement libératoire (%)"], ["isRate", "Impôt sur les sociétés (%)"]] as const;
  return (
    <AppShell title="Réglages">
      <form className="px-4 py-6 sm:px-8" onSubmit={(e) => { e.preventDefault(); if (!draft) return; update((d) => ({ ...d, settings: draft })); setDraft(null); setSaved(true); }}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-bold">Réglages</h1><div className="flex gap-2"><Btn type="button" variant="secondary" disabled={!draft} onClick={() => { setDraft(null); setSaved(false); }}><X size={15} />Annuler</Btn><Btn type="submit" disabled={!draft}><Save size={15} />Enregistrer</Btn></div></div>
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-5"><h2 className="border-b border-border pb-3 text-[15px] font-semibold">Informations de l’agence</h2>
            {agencyFields.map(([key, label]) => <Field key={key} label={label}><TextInput value={settings[key]} required={key === "agencyName" || key === "signatory" || key === "agencyEmail"} type={key === "agencyEmail" ? "email" : "text"} onChange={(e) => change(key, e.target.value)} /></Field>)}
          </section>
          <section className="space-y-5"><h2 className="border-b border-border pb-3 text-[15px] font-semibold">Fiscalité & frais récurrents</h2>
            <Field label="Régime fiscal par défaut"><SelectInput value={settings.regime} onChange={(e) => change("regime", e.target.value === "sasu" ? "sasu" : "micro")}><option value="micro">Micro-entreprise (BNC / Services)</option><option value="sasu">Société avec IS</option></SelectInput></Field>
            <div className="grid gap-5 sm:grid-cols-2">{rates.map(([key, label]) => <Field key={key} label={label}><TextInput type="number" required min="0" max="100" step="0.1" value={settings[key]} onChange={(e) => change(key, Number(e.target.value))} /></Field>)}</div>
            <Field label="Abonnements & outils mensuels (€)"><TextInput type="number" required min="0" step="0.01" value={settings.monthlyTools} onChange={(e) => change("monthlyTools", Number(e.target.value))} /></Field>
            <p className="text-xs text-muted-foreground">Estimations fiscales à valider selon votre situation avec votre comptable.</p>
          </section>
        </div>
        <div className="mt-8 border-t border-border pt-4"><p role="status" className="text-xs text-primary">{saved ? "Réglages enregistrés." : draft ? "Modifications non enregistrées." : ""}</p><p className="mt-2 text-xs text-muted-foreground">Les données sont conservées uniquement dans ce navigateur, sans synchronisation entre appareils.</p></div>
      </form>
    </AppShell>
  );
}
