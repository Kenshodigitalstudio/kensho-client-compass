import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/crm/AppShell";
import { useCrm } from "@/lib/crm/store";
import { Panel, SectionTitle, Field, TextInput, SelectInput } from "@/components/crm/kit";
import { eur, formatRate } from "@/lib/crm/format";
import { computeTaxes } from "@/lib/crm/tax";
import type { Regime } from "@/lib/crm/types";

export const Route = createFileRoute("/taxes")({
  component: TaxesPage,
});

function TaxesPage() {
  const { data } = useCrm();

  const [regime, setRegime] = useState<Regime>(data?.settings.regime ?? "micro");
  const [simulationCa, setSimulationCa] = useState(6000);

  if (!data) return <AppShell title="Taxes & Bénéfices"><div className="p-8 text-center text-muted-foreground">Chargement…</div></AppShell>;

  // CA mensuel actuel issu des honoraires des clients actifs
  const activeClients = data.clients.filter((c) => c.status === "actif" || c.status === "onboarding");
  const currentMonthlyCa = activeClients.reduce((acc, c) => acc + (c.contract?.fee ?? c.fee), 0);
  const currentFrais = data.settings.monthlyTools;

  const currentTaxes = computeTaxes(currentMonthlyCa, currentFrais, regime, data.settings);
  const currentNet = Math.max(0, currentMonthlyCa - currentTaxes.total - currentFrais);

  const simTaxes = computeTaxes(simulationCa, currentFrais, regime, data.settings);
  const simNet = Math.max(0, simulationCa - simTaxes.total - currentFrais);

  return (
    <AppShell title="Taxes & Bénéfices">
      <div className="space-y-6 px-4 py-6 sm:px-8">
        {/* En-tête avec sélecteur de régime fiscal */}
        <Panel className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Gestion Fiscale & Rentabilité</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Calcul prévisionnel des cotisations sociales, taxes et bénéfices nets disponibles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Régime fiscal :</span>
              <SelectInput
                value={regime}
                onChange={(e) => setRegime(e.target.value as Regime)}
                className="w-56 text-xs"
              >
                <option value="micro">Micro-entreprise (BNC / Services)</option>
                <option value="sasu">Société (SASU / EURL avec IS)</option>
              </SelectInput>
            </div>
          </div>
        </Panel>

        {/* Synthèse du mois en cours */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Panel className="p-5">
            <span className="text-xs font-medium text-muted-foreground">CA Mensuel Encaissé (Honoraires)</span>
            <div className="mt-1 text-2xl font-bold text-foreground">{eur(currentMonthlyCa)}</div>
            <span className="text-[11px] text-muted-foreground">{activeClients.length} clients facturés ce mois</span>
          </Panel>
          <Panel className="p-5">
            <span className="text-xs font-medium text-muted-foreground">Cotisations & Taxes Estimées</span>
            <div className="mt-1 text-2xl font-bold text-warning">{eur(currentTaxes.total)}</div>
            <span className="text-[11px] text-muted-foreground">Taux effectif : {formatRate(currentTaxes.rate)}</span>
          </Panel>
          <Panel className="p-5">
            <span className="text-xs font-medium text-muted-foreground">Bénéfice Net Réel Disponible</span>
            <div className="mt-1 text-2xl font-bold text-primary">{eur(currentNet)}</div>
            <span className="text-[11px] text-primary">Après taxes et {eur(currentFrais)} d'outils</span>
          </Panel>
        </div>

        {/* Grille : Ventilation détaillée & Simulateur */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ventilation des prélèvements */}
          <Panel className="p-6">
            <SectionTitle title="Ventilation détaillée des charges" meta={regime === "micro" ? "Régime Micro-BNC" : "Régime Société"} />
            <div className="mt-4 divide-y divide-border text-xs">
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Cotisations sociales (URSSAF / SSI)</span>
                <span className="font-semibold text-foreground">{eur(currentTaxes.social)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Formation professionnelle (CFP)</span>
                <span className="font-semibold text-foreground">{eur(currentTaxes.cfp)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">{regime === "micro" ? "Versement libératoire / Impôt" : "Impôt sur les sociétés (IS) & dividende"}</span>
                <span className="font-semibold text-foreground">{eur(currentTaxes.impot)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Abonnements & outils logiciels récurrents</span>
                <span className="font-semibold text-foreground">{eur(currentFrais)}</span>
              </div>
              <div className="flex justify-between py-3 font-bold text-sm">
                <span>Reste net pour vous</span>
                <span className="text-primary">{eur(currentNet)}</span>
              </div>
            </div>
          </Panel>

          {/* Simulateur de rentabilité */}
          <Panel className="p-6">
            <SectionTitle title="Simulateur d'encaissement" />
            <p className="mt-1 text-xs text-muted-foreground">
              Estimez votre reste net selon le chiffre d'affaires mensuel visé.
            </p>

            <div className="mt-6 space-y-4">
              <Field label="Chiffre d'affaires mensuel testé (€)">
                <TextInput
                  type="number"
                  step="500"
                  value={simulationCa}
                  onChange={(e) => setSimulationCa(Number(e.target.value))}
                />
              </Field>

              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={simulationCa}
                onChange={(e) => setSimulationCa(Number(e.target.value))}
                className="w-full accent-primary"
              />

              <div className="rounded-xl border border-border bg-background p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chiffre d'affaires :</span>
                  <span className="font-semibold">{eur(simulationCa)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes prévisionnelles ({formatRate(simTaxes.rate)}) :</span>
                  <span className="font-semibold text-warning">−{eur(simTaxes.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais fixes estimés :</span>
                  <span className="font-semibold">−{eur(currentFrais)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
                  <span>Bénéfice net estimé :</span>
                  <span className="text-primary text-base">{eur(simNet)}</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
