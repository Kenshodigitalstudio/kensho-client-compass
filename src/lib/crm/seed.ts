import type { Client, CrmData, MonthFinance } from "./types";
import { DEFAULT_TEMPLATES } from "./templates";

const at = (days: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const ago = (days: number) => at(-days, 10);
const B = (search = 0, pmax = 0, shopping = 0, display = 0, demandgen = 0, remarketing = 0) => ({ search, pmax, shopping, display, demandgen, remarketing });

function client(p: Partial<Client> & Pick<Client, "id" | "name" | "contact">): Client {
  return {
    legalName: `${p.name} SAS`,
    representative: p.contact,
    email: "",
    phone: "",
    siret: "",
    address: "",
    website: "",
    links: { ads: "https://ads.google.com", looker: "https://lookerstudio.google.com", drive: "https://drive.google.com" },
    status: "actif",
    formule: "Google Ads Pro",
    channel: "google",
    budgets: B(),
    fee: 900,
    contract: null,
    notes: [],
    appointments: [],
    tasks: [],
    emails: [],
    createdAt: ago(120),
    ...p,
  };
}

export function seedClients(): Client[] {
  return [
    client({
      id: "atelier-maison", name: "Atelier Maison", legalName: "Atelier Maison SAS", contact: "Sarah M.", representative: "Claire Dumontel",
      email: "sarah@ateliermaison.fr", phone: "06 42 18 77 05", siret: "852 431 907 00024", address: "14 rue des Tanneurs, 69002 Lyon",
      website: "https://ateliermaison.fr", formule: "Google Ads Pro", budgets: B(1800, 1500, 0, 400, 500, 0), fee: 1200,
      contract: { id: "c1", templateId: "ads-tracking", title: "Accord cadre Prestation Google Ads & Tracking (Engagement 3 mois)", status: "a_signer", startDate: at(5, 9), duration: "3 mois reconductible", fee: 1200, payment: "Virement à 30 jours", prestation: "Google Ads & Tracking", createdAt: ago(3), sentAt: ago(3) },
      notes: [{ id: "n1", date: ago(14), text: "Sarah veut pousser la collection hiver dès novembre. Relancer Shopping avec le flux corrigé, baisser le Display de 100 €." }],
      appointments: [
        { id: "a1", date: at(1, 14), title: "Revue PMax", place: "Google Meet", link: "https://meet.google.com" },
        { id: "a2", date: at(6, 10, 30), title: "Audit tracking GA4", place: "Atelier" },
      ],
      tasks: [
        { id: "t1", text: "Envoyer bilan septembre", done: false },
        { id: "t2", text: "Accès Merchant Center", done: false },
        { id: "t3", text: "Valider budget Q4", done: true },
      ],
      emails: [
        { id: "e1", templateId: "contrat", title: "Relance signature contrat", due: "Avant le 18 oct.", sent: false },
        { id: "e2", templateId: "rapport", title: "Rapport mensuel Ads", due: "Fin de mois", sent: false },
      ],
    }),
    client({
      id: "maison-alba", name: "Maison Alba", contact: "Claire Morel", email: "claire@maisonalba.fr", phone: "06 12 45 78 90",
      siret: "901 224 118 00015", address: "8 rue Oberkampf, 75011 Paris", website: "https://maisonalba.fr", budgets: B(3200, 2800, 1400, 300, 500, 0), fee: 1600,
      contract: { id: "c2", templateId: "ads-tracking", title: "Accord cadre Prestation Google Ads & Tracking (Engagement 3 mois)", status: "signe", signedAt: ago(40), startDate: ago(35), duration: "3 mois reconductible", fee: 1600, payment: "Virement à 30 jours", prestation: "Google Ads & Tracking", createdAt: ago(45) },
      appointments: [{ id: "a3", date: at(2, 14), title: "Bilan mensuel", place: "Visio", link: "https://meet.google.com" }],
      notes: [{ id: "n2", date: ago(20), text: "Très bon ROAS sur PMax (5,2). Tester une campagne Demand Gen sur la nouvelle collection." }],
    }),
    client({
      id: "oree", name: "Orée Cosmétiques", contact: "Julien Faure", email: "julien@oree-cosmetiques.fr", phone: "07 81 22 63 10",
      siret: "844 310 552 00031", address: "22 cours Mirabeau, 13100 Aix-en-Provence", formule: "Social Ads", channel: "social", budgets: B(0, 0, 0, 1200, 4200, 0), fee: 1300,
      appointments: [{ id: "a4", date: at(3, 10, 30), title: "Stratégie Social", place: "Bureau" }],
    }),
    client({
      id: "atelier-tisse", name: "Atelier Tissé", contact: "Inès Benali", email: "ines@ateliertisse.fr", phone: "06 55 01 44 82",
      siret: "879 662 013 00012", address: "5 place du Change, 44000 Nantes", formule: "Google Ads Essentiel", budgets: B(1600, 1000, 500, 0, 0, 0), fee: 750,
      appointments: [{ id: "a5", date: at(4, 16), title: "Point performances", place: "Visio" }],
      emails: [{ id: "e3", templateId: "relance", title: "Relance devis", due: "Cette semaine", sent: false }],
    }),
    client({
      id: "velo-bocage", name: "Vélo Bocage", contact: "Thomas Lenoir", email: "thomas@velobocage.fr", phone: "06 90 33 12 07",
      address: "3 rue du Port, 50100 Cherbourg", status: "audit", formule: "Audit", fee: 890,
      appointments: [{ id: "a6", date: at(5, 9), title: "Restitution audit", place: "Visio" }],
      tasks: [{ id: "t4", text: "Envoyer la proposition", done: false }],
    }),
    client({
      id: "les-sources", name: "Les Sources", contact: "Anaïs Roux", email: "anais@lessources.fr", phone: "06 21 70 59 14",
      siret: "812 004 776 00027", address: "41 allée des Thermes, 33120 Arcachon", budgets: B(2400, 2600, 0, 400, 600, 800), fee: 1400,
      appointments: [{ id: "a7", date: at(8, 11), title: "Revue trimestrielle", place: "Visio" }],
      emails: [{ id: "e4", templateId: "rapport", title: "Rapport mai", due: "Aujourd'hui", sent: false }],
    }),
    client({
      id: "lumina", name: "Lumina Optics", contact: "Marc Delaunay", email: "marc@lumina-optics.fr", status: "audit", formule: "Audit flash", budgets: B(900, 600), fee: 890,
    }),
    client({
      id: "zenskin", name: "ZenSkin Care", contact: "Léa Martin", email: "lea@zenskin.fr", status: "onboarding", formule: "Google Ads Pro", budgets: B(2500, 3000, 1300), fee: 1500,
      emails: [{ id: "e5", templateId: "bienvenue", title: "Bienvenue & accès", due: "Demain", sent: false }],
    }),
    client({
      id: "horizon", name: "Horizon B2B", contact: "Paul Girard", email: "paul@horizon-b2b.fr", status: "prospect", formule: "—", fee: 0,
      tasks: [{ id: "t5", text: "Relancer après la démo", done: false }],
    }),
  ];
}

const HIST: [number, number][] = [
  [9400, 420], [10200, 420], [11750, 430], [12300, 430], [10900, 440], [13400, 440],
  [8600, 440], [7200, 450], [12950, 450], [13800, 450], [14850, 450],
];

export function seedFinances(): MonthFinance[] {
  const now = new Date();
  const year = now.getFullYear();
  const cur = now.getMonth();
  return HIST.map(([ca, frais], i) => {
    // anchor the last row to the current month
    const offset = HIST.length - 1 - i;
    const d = new Date(year, cur - offset, 1);
    return { month: d.getMonth(), year: d.getFullYear(), ca, frais, declared: offset > 0 };
  });
}

export function seedData(): CrmData {
  return {
    clients: seedClients(),
    templates: DEFAULT_TEMPLATES,
    finances: seedFinances(),
    settings: {
      agencyName: "Kenshō Studio",
      signatory: "Y. Kenshō",
      agencyEmail: "contact@kenshostudio.fr",
      agencyAddress: "France",
      agencySiret: "",
      urssafRate: 21.2,
      cfpRate: 0.2,
      vlRate: 1.8,
      isRate: 15,
      monthlyTools: 450,
      regime: "micro",
    },
  };
}
