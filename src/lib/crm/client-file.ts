import type { Client, Contract, ContractDocStatus, Invoice, InvoiceState } from "./types";
import { parisDay } from "./daily";

export const DOC_STATUS_LABEL: Record<ContractDocStatus, string> = {
  brouillon: "Brouillon",
  attente: "En attente de signature",
  signe: "Signé",
  expire: "Expiré",
};

/** Statut affiché du contrat : expiré si la date de fin est passée sans reconduction. */
export function contractDocStatus(contract: Contract, now: Date): ContractDocStatus {
  if (contract.endDate && !contract.autoRenew && contract.endDate.slice(0, 10) < parisDay(now)) return "expire";
  if (contract.docStatus) return contract.docStatus;
  if (contract.status === "signe") return "signe";
  return contract.sentAt ? "attente" : "brouillon";
}

/** Jours restants avant la fin du contrat (null si aucune date de fin). */
export function daysUntilEnd(contract: Contract, now: Date): number | null {
  if (!contract.endDate) return null;
  const end = Date.parse(contract.endDate.slice(0, 10) + "T00:00:00Z");
  const today = Date.parse(parisDay(now) + "T00:00:00Z");
  return Math.round((end - today) / 86400000);
}

export function invoiceState(inv: Invoice, now: Date): InvoiceState {
  if (inv.paidAt) return "payee";
  return inv.dueAt.slice(0, 10) < parisDay(now) ? "retard" : "attente";
}

export function nextPaymentDue(invoices: Invoice[]): Invoice | null {
  return [...invoices].filter((i) => !i.paidAt).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0] ?? null;
}

export interface TimelineItem { id: string; date: string; label: string; text: string }

/** Journal chronologique du client, du plus récent au plus ancien. */
export function clientTimeline(c: Client): TimelineItem[] {
  const items: TimelineItem[] = [];
  if (c.contract) {
    items.push({ id: "ct-c", date: c.contract.createdAt, label: "Contrat", text: `Contrat créé : ${c.contract.title}` });
    if (c.contract.signedAt) items.push({ id: "ct-s", date: c.contract.signedAt, label: "Contrat", text: "Contrat signé" });
  }
  if (c.contractPdf) items.push({ id: "pdf", date: c.contractPdf.uploadedAt, label: "Contrat", text: `PDF ajouté : ${c.contractPdf.name}` });
  for (const i of c.invoices ?? []) {
    items.push({ id: `i-${i.id}`, date: i.issuedAt, label: "Facture", text: `Facture ${i.number} émise` });
    if (i.paidAt) items.push({ id: `p-${i.id}`, date: i.paidAt, label: "Paiement", text: `Facture ${i.number} payée` });
  }
  for (const n of c.notes) items.push({ id: `n-${n.id}`, date: n.date, label: "Note", text: n.text });
  for (const a of c.appointments) if (a.done) items.push({ id: `a-${a.id}`, date: a.date, label: "RDV", text: `RDV effectué : ${a.title}` });
  for (const a of c.actions ?? []) if (a.doneAt) items.push({ id: `t-${a.id}`, date: a.doneAt, label: "Tâche", text: `Tâche terminée : ${a.text}` });
  for (const h of c.history ?? []) items.push({ id: `h-${h.id}`, date: h.date, label: h.kind === "email" ? "Email" : "Budget", text: h.text });
  return items.filter((i) => i.date).sort((a, b) => b.date.localeCompare(a.date));
}
