import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/crm/AppShell";
import { useCrm } from "@/lib/crm/store";
import { Panel, SectionTitle, Btn, Field, TextInput, SelectInput } from "@/components/crm/kit";
import { CONTRACT_TEMPLATES } from "@/lib/crm/contracts";
import { eur, frDate } from "@/lib/crm/format";
import { totalBudget } from "@/lib/crm/templates";
import { crmHead } from "@/lib/crm/page-head";

export const Route = createFileRoute("/contrats")({
  head: () => crmHead("Contrats", "Création et impression des contrats de prestation Kenshō Studio."),
  component: ContratsPage,
});

function ContratsPage() {
  const { data, updateClient } = useCrm();

  const [selectedTemplateId, setSelectedTemplateId] = useState(CONTRACT_TEMPLATES[0]?.id ?? "");
  const [selectedClientId, setSelectedClientId] = useState(data?.clients[0]?.id ?? "");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [feeOverride, setFee] = useState<number | null>(null);
  const [assigned, setAssigned] = useState(false);

  if (!data) return <AppShell title="Contrats"><div className="p-8 text-center text-muted-foreground">Chargement…</div></AppShell>;

  const template = CONTRACT_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? CONTRACT_TEMPLATES[0];
  const client = data.clients.find((c) => c.id === selectedClientId) ?? data.clients[0];
  if (!template) return <AppShell title="Contrats"><p className="p-8">Aucun modèle de contrat disponible.</p></AppShell>;
  const fee = feeOverride ?? client?.contract?.fee ?? client?.fee ?? template.fee;

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    const c = data.clients.find((item) => item.id === id);
    if (c) {
      if (c.contract?.fee) setFee(c.contract.fee);
      else if (c.fee) setFee(c.fee);
    }
  };

  const handleAssignToClient = () => {
    if (!client) return;
    updateClient(client.id, (c) => ({
      ...c,
      contract: {
        id: Date.now().toString(36),
        templateId: template.id,
        title: template.title,
        status: "a_signer",
        startDate,
        duration: template.duration,
        fee,
        payment: "virement bancaire ou prélèvement mensuel",
        prestation: template.prestation,
        createdAt: new Date().toISOString(),
      },
    }));
    setAssigned(true);
    setTimeout(() => setAssigned(false), 3000);
  };

  return (
    <AppShell title="Contrats & Générateur">
      <div className="grid gap-6 px-4 py-6 lg:grid-cols-3 sm:px-8">
        {/* Paramètres du contrat */}
        <Panel className="p-5 space-y-4">
          <SectionTitle title="Paramètres du contrat" />
          
          <Field label="Modèle vierge">
            <SelectInput value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
              {CONTRACT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Client existant (préremplissage)">
            <SelectInput value={selectedClientId} onChange={(e) => handleSelectClient(e.target.value)}>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.contact})</option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Date de démarrage">
            <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>

          <Field label="Honoraires d'agence HT / mois">
            <TextInput type="number" step="50" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
          </Field>

          <div className="pt-2 space-y-2">
            <Btn variant="primary" className="w-full text-xs" disabled={!client || !startDate || !Number.isFinite(fee) || fee < 0} onClick={handleAssignToClient}>
              {assigned ? "✓ Contrat associé au client !" : "Associer ce contrat au client"}
            </Btn>
            <Btn variant="secondary" className="w-full text-xs" onClick={() => window.print()}>
              Imprimer / Exporter en PDF ↗
            </Btn>
          </div>
        </Panel>

        {/* Aperçu du document */}
        <div id="contract-print" className="min-w-0 lg:col-span-2"><Panel className="p-4 sm:p-8 bg-card text-foreground print:border-none print:shadow-none">
          <div className="border-b border-border pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-primary">KENSHŌ DIGITAL STUDIO</h2>
                <p className="text-xs text-muted-foreground">{data.settings.agencyAddress} • SIRET : {data.settings.agencySiret}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Date : {frDate(new Date().toISOString())}</p>
                <p>Réf. : CTR-{template.id.toUpperCase()}-{client?.id?.slice(0, 4)}</p>
              </div>
            </div>
          </div>

          <div className="py-6">
            <h3 className="text-lg font-bold">{template.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">Durée : {template.duration} à compter du {frDate(startDate)}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-border bg-background p-4 text-xs">
              <div>
                <strong className="text-primary">PRESTATAIRE :</strong>
                <p className="mt-1 font-semibold">{data.settings.agencyName}</p>
                <p className="text-muted-foreground">Représenté par {data.settings.signatory}</p>
              </div>
              <div>
                <strong className="text-primary">CLIENT :</strong>
                <p className="mt-1 font-semibold">{client?.legalName || client?.name}</p>
                <p className="text-muted-foreground">Représenté par {client?.representative || client?.contact}</p>
                <p className="text-muted-foreground">{client?.address} {client?.siret && `• SIRET : ${client.siret}`}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-xs leading-relaxed">
              {template.articles.map((art, idx) => {
                const text = art.text
                  .replace("{{fee}}", eur(fee))
                  .replace("{{start}}", frDate(startDate))
                  .replace("{{payment}}", "virement bancaire mensuel")
                  .replace("{{budget}}", client ? eur(totalBudget(client)) : "selon accord");
                return (
                  <div key={idx}>
                    <h4 className="font-semibold text-foreground">Article {idx + 1} — {art.title}</h4>
                    <p className="text-muted-foreground mt-0.5">{text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-6 text-xs">
              <div className="h-24">
                <p className="font-semibold">Pour Kenshō Digital Studio :</p>
                <p className="mt-8 text-muted-foreground italic">Signature du prestataire</p>
              </div>
              <div className="h-24">
                <p className="font-semibold">Pour le Client ({client?.name}) :</p>
                <p className="mt-8 text-muted-foreground italic">Bon pour accord et signature</p>
              </div>
            </div>
          </div>
        </Panel></div>
      </div>
    </AppShell>
  );
}
