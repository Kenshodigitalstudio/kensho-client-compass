import type { Client, EmailTemplate, Settings } from "./types";
import { eur, longDate } from "./format";

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "contrat",
    name: "Envoi de contrat",
    subject: "Votre contrat Kenshō Studio — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nVous trouverez ci-joint le contrat « {{contrat}} » pour {{entreprise}}.\nHonoraires : {{honoraires}} HT / mois, à compter du {{date_effet}}.\n\nIl ne reste plus qu'à le signer ; je reste disponible pour toute question.\n\nBien à vous,\n{{signataire}}\n{{agence}}",
  },
  {
    id: "compte-rendu",
    name: "Compte-rendu de RDV",
    subject: "Compte-rendu de notre point — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nMerci pour notre échange. Voici ce que nous avons retenu :\n\n{{derniere_note}}\n\nProchain rendez-vous : {{prochain_rdv}}.\n\nBien à vous,\n{{signataire}}",
  },
  {
    id: "rapport",
    name: "Rapport mensuel",
    subject: "Rapport mensuel Google Ads — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nVoici le rapport mensuel de vos campagnes Google Ads.\nBudget média géré ce mois : {{budget}}.\n\nLe détail est disponible sur votre tableau Looker Studio : {{looker}}\n\nBien à vous,\n{{signataire}}",
  },
  {
    id: "acces",
    name: "Demande d'accès",
    subject: "Accès nécessaires pour démarrer — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nPour lancer la mission, pourriez-vous nous donner un accès administrateur à :\n- Google Ads\n- Google Analytics 4\n- Google Tag Manager\n- Merchant Center (si Shopping)\n\nAdresse à inviter : {{email_agence}}\n\nMerci beaucoup,\n{{signataire}}",
  },
  {
    id: "bienvenue",
    name: "Bienvenue & Onboarding",
    subject: "Bienvenue chez Kenshō Studio, {{entreprise}} !",
    body: "Bonjour {{contact}},\n\nRavi de démarrer cette collaboration. Les prochaines étapes :\n1. Partage des accès (Ads, GA4, GTM)\n2. Audit du compte et du tracking\n3. Validation de la stratégie et du budget de {{budget}} / mois\n\nVotre dossier partagé : {{drive}}\n\nÀ très vite,\n{{signataire}}",
  },
  {
    id: "hebdo",
    name: "Compte-rendu de performances hebdomadaire",
    subject: "Point hebdo Google Ads — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nVoici le point de la semaine sur vos campagnes ({{budget}} / mois).\n\nFaits marquants :\n- \n\nActions prévues :\n- \n\nBonne semaine,\n{{signataire}}",
  },
  {
    id: "relance",
    name: "Relance budget / facturation",
    subject: "Petite relance — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nJe me permets de revenir vers vous concernant la facturation des honoraires ({{honoraires}} HT / mois) et la validation du budget média.\n\nMerci de me tenir informé,\n{{signataire}}",
  },
  {
    id: "optim",
    name: "Recommandation d'optimisation",
    subject: "Recommandation pour vos campagnes — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nAprès analyse du compte, nous recommandons :\n- \n\nImpact attendu : \n\nSouhaitez-vous que nous l'appliquions ?\n\nBien à vous,\n{{signataire}}",
  },
];

export const VARIABLES = ["entreprise","contact","email","honoraires","budget","contrat","date_effet","derniere_note","prochain_rdv","looker","drive","signataire","agence","email_agence"];

export function totalBudget(c: Client) {
  return Object.values(c.budgets).reduce((a, b) => a + b, 0);
}

export function fillTemplate(text: string, c: Client | undefined, s: Settings) {
  const next = c?.appointments.filter((a) => !a.done && new Date(a.date) > new Date()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const lastNote = c ? [...c.notes].sort((a, b) => b.date.localeCompare(a.date))[0] : undefined;
  const v: Record<string, string> = {
    entreprise: c?.name ?? "{{entreprise}}",
    contact: c?.contact.split(" ")[0] ?? "{{contact}}",
    email: c?.email ?? "",
    honoraires: c ? eur(c.contract?.fee ?? c.fee) : "{{honoraires}}",
    budget: c ? eur(totalBudget(c)) : "{{budget}}",
    contrat: c?.contract?.title ?? "Prestation Google Ads",
    date_effet: c?.contract ? longDate(c.contract.startDate) : "—",
    derniere_note: lastNote?.text ?? "—",
    prochain_rdv: next ? `${longDate(next.date)} (${next.title})` : "à planifier",
    looker: c?.links.looker || "—",
    drive: c?.links.drive || "—",
    signataire: s.signatory,
    agence: s.agencyName,
    email_agence: s.agencyEmail,
  };
  return text.replace(/\{\{(\w+)\}\}/g, (m, k: string) => v[k] ?? m);
}

export function mailtoHref(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
