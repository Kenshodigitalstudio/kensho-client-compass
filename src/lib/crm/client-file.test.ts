import { describe, expect, it } from "vitest";
import { contractDocStatus, daysUntilEnd, invoiceState, nextPaymentDue } from "./client-file";
import type { Contract, Invoice } from "./types";

const base: Contract = { id: "c", templateId: "t", title: "T", status: "a_signer", startDate: "2026-01-01", duration: "3 mois", fee: 1000, payment: "", prestation: "", createdAt: "2026-01-01" };
const now = new Date("2026-11-27T12:00:00Z");

describe("fiche client", () => {
  it("contrat expiré quand la date de fin est passée sans reconduction", () => {
    expect(contractDocStatus({ ...base, status: "signe", endDate: "2026-11-01" }, now)).toBe("expire");
    expect(contractDocStatus({ ...base, status: "signe", endDate: "2026-11-01", autoRenew: true }, now)).toBe("signe");
  });
  it("brouillon tant que le contrat n'est pas envoyé", () => {
    expect(contractDocStatus(base, now)).toBe("brouillon");
    expect(contractDocStatus({ ...base, sentAt: "2026-11-01" }, now)).toBe("attente");
  });
  it("jours avant fin de contrat", () => {
    expect(daysUntilEnd({ ...base, endDate: "2026-12-07" }, now)).toBe(10);
  });
  it("facture en retard, en attente ou payée", () => {
    const inv: Invoice = { id: "1", number: "F1", amount: 1000, issuedAt: "2026-10-01", dueAt: "2026-11-20" };
    expect(invoiceState(inv, now)).toBe("retard");
    expect(invoiceState({ ...inv, dueAt: "2026-12-01" }, now)).toBe("attente");
    expect(invoiceState({ ...inv, paidAt: "2026-11-10" }, now)).toBe("payee");
  });
  it("prochaine échéance = facture impayée la plus proche", () => {
    const a: Invoice = { id: "a", number: "A", amount: 1, issuedAt: "", dueAt: "2026-12-10" };
    const b: Invoice = { id: "b", number: "B", amount: 1, issuedAt: "", dueAt: "2026-12-05" };
    expect(nextPaymentDue([a, b, { ...b, id: "c", dueAt: "2026-11-01", paidAt: "x" }])?.id).toBe("b");
  });
});
