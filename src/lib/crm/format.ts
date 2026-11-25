import type { CampaignType, ClientStatus } from "./types";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
/** "14 850 €" with a regular space (French grouping). */
export const eur = (n: number) => `${nf.format(Math.round(n)).replace(/\u202f|\u00a0/g, " ")} €`;
export const num = (n: number) => nf.format(Math.round(n)).replace(/\u202f|\u00a0/g, " ");
export const signedEur = (n: number) => (n < 0 ? `−${eur(-n)}` : eur(n));

export const initials = (name: string) =>
  name
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";

export const STATUS_LABEL: Record<ClientStatus, string> = {
  actif: "Actif",
  onboarding: "En onboarding",
  pause: "En pause",
  audit: "En audit",
  prospect: "Prospect",
};

export const CAMPAIGNS: { key: CampaignType; label: string }[] = [
  { key: "search", label: "Search" },
  { key: "pmax", label: "Performance Max" },
  { key: "shopping", label: "Shopping" },
  { key: "display", label: "Display" },
  { key: "demandgen", label: "Demand Gen" },
  { key: "remarketing", label: "Remarketing" },
];

export const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const DAYS_SHORT = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

export const dayAbbr = (iso: string) => DAYS[new Date(iso).getDay()]!;
export const dayNum = (iso: string) => new Date(iso).getDate();
export const time = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
export const shortSlot = (iso: string) => {
  const d = new Date(iso);
  const diff = (d.getTime() - Date.now()) / 86400000;
  if (diff < 6) return `${DAYS_SHORT[d.getDay()]} ${time(iso)}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]!.slice(0, 4).toLowerCase()}. ${time(iso)}`;
};
export const frDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};
export const longDate = (iso: string) => {
  const d = new Date(iso);
  const day = d.getDate() === 1 ? "1er" : String(d.getDate());
  return `${day} ${MONTHS[d.getMonth()]!.toLowerCase()} ${d.getFullYear()}`;
};
export const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]!.slice(0, 3).toLowerCase()}.`;
};
export const uid = () => Math.random().toString(36).slice(2, 10);
