import { describe, expect, it } from "vitest";
import { computeTaxes } from "./tax";

const rates = { urssafRate: 21.2, cfpRate: 0.2, vlRate: 1.8, isRate: 15 };

describe("micro-BNC 23,2 %", () => {
  it("14 850 € encaissés → 3 445 € de prélèvements, ventilés 3 148 / 29 / 268", () => {
    expect(computeTaxes(14850, 450, "micro", rates)).toMatchObject({ total: 3445, social: 3148, cfp: 29, impot: 268 });
  });
  it("simulateur : 2 500 € → 580 € de taxes, 1 920 € net", () => {
    const t = computeTaxes(2500, 0, "micro", rates);
    expect(t.total).toBe(580);
    expect(2500 - t.total).toBe(1920);
  });
});

describe("SASU / IS", () => {
  it("IS 15 % sur le bénéfice puis flat tax 30 % sur le reste", () => {
    // profit 10 000 → IS 1 500, distribué 8 500 → sociaux 1 462, impôt 1 500 + 1 088
    expect(computeTaxes(10450, 450, "sasu", rates)).toMatchObject({ social: 1462, impot: 2588, cfp: 10 });
  });
});
