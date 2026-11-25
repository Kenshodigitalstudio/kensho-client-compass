import type { Regime, Settings } from "./types";

export interface TaxBreakdown {
  total: number;
  social: number; // URSSAF / cotisations sociales (micro) or prélèvements sociaux (SASU)
  cfp: number;
  impot: number; // versement libératoire (micro) or IS + impôt sur dividendes (SASU)
  rate: number; // effective % of CA
}

type Rates = Pick<Settings, "urssafRate" | "cfpRate" | "vlRate" | "isRate">;

/**
 * Micro-BNC: every rate applies to CA encaissé. Total is rounded once, then
 * URSSAF and CFP are rounded and the impôt line takes the remainder so lines always add up.
 * SASU/IS: IS on profit (CA − frais), then flat tax on the distributed remainder
 * (17,2 % prélèvements sociaux + 12,8 % impôt), CFP on CA.
 */
export function computeTaxes(ca: number, frais: number, regime: Regime, r: Rates): TaxBreakdown {
  if (ca <= 0) return { total: 0, social: 0, cfp: 0, impot: 0, rate: 0 };
  if (regime === "micro") {
    const rate = r.urssafRate + r.cfpRate + r.vlRate;
    const total = Math.round((ca * rate) / 100);
    const social = Math.round((ca * r.urssafRate) / 100);
    const cfp = Math.floor((ca * r.cfpRate) / 100);
    return { total, social, cfp, impot: total - social - cfp, rate };
  }
  const profit = Math.max(0, ca - frais);
  const is = profit * (r.isRate / 100);
  const distributed = profit - is;
  const social = Math.round(distributed * 0.172);
  const cfp = Math.floor(ca * 0.001);
  const impot = Math.round(is + distributed * 0.128);
  const total = social + cfp + impot;
  return { total, social, cfp, impot, rate: Math.round((total / ca) * 1000) / 10 };
}

export const formatRate = (n: number) => `${String(Math.round(n * 10) / 10).replace(".", ",")}%`;
