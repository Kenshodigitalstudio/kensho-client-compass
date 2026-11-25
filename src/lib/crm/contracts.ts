export interface ContractTemplate {
  id: string;
  name: string;
  prestation: string;
  title: string;
  subtitle: string;
  duration: string;
  fee: number;
  articles: { title: string; text: string }[];
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "ads-tracking",
    name: "Prestation Google Ads & Tracking 3 mois",
    prestation: "Google Ads & Tracking",
    title: "Accord cadre Prestation Google Ads & Tracking (Engagement 3 mois)",
    subtitle: "Google Ads & Tracking — 3 mois",
    duration: "3 mois reconductible",
    fee: 1200,
    articles: [
      { title: "Objet", text: "Création, pilotage et optimisation des campagnes Google Ads et mise en place du suivi des conversions." },
      { title: "Moyens", text: "Accès administrateur aux comptes Ads, Analytics et Tag Manager fournis par le client." },
      { title: "Confidentialité", text: "Les parties s'engagent à ne divulguer aucune donnée échangée pendant et après la mission." },
      { title: "Tarifs", text: "{{fee}} HT par mois, à compter du {{start}}, payables par {{payment}}." },
    ],
  },
  {
    id: "audit-flash",
    name: "Audit Flash Google Ads",
    prestation: "Audit SEA & Stratégie",
    title: "Audit Flash Google Ads & recommandations stratégiques",
    subtitle: "Audit SEA & Stratégie — mission ponctuelle",
    duration: "Mission ponctuelle (2 semaines)",
    fee: 890,
    articles: [
      { title: "Objet", text: "Audit complet du compte Google Ads (structure, enchères, annonces, tracking) et remise d'un plan d'action priorisé." },
      { title: "Livrables", text: "Rapport d'audit et restitution de 45 minutes en visio, budget média prévisionnel recommandé : {{budget}} / mois." },
      { title: "Confidentialité", text: "Les parties s'engagent à ne divulguer aucune donnée échangée pendant et après la mission." },
      { title: "Tarifs", text: "Forfait de {{fee}} HT, à compter du {{start}}, payable par {{payment}}." },
    ],
  },
  {
    id: "social-ads",
    name: "Gestion Réseaux Sociaux & Ads",
    prestation: "Social Ads & Google Ads",
    title: "Gestion Réseaux Sociaux & Ads (Pack Lancement)",
    subtitle: "Social Ads & Google Ads — Pack Lancement",
    duration: "6 mois reconductible",
    fee: 1500,
    articles: [
      { title: "Objet", text: "Lancement et pilotage des campagnes Meta Ads et Google Ads, production des visuels publicitaires et suivi mensuel." },
      { title: "Budget média", text: "Budget média prévisionnel de {{budget}} par mois, réglé directement par le client aux régies." },
      { title: "Confidentialité", text: "Les parties s'engagent à ne divulguer aucune donnée échangée pendant et après la mission." },
      { title: "Tarifs", text: "{{fee}} HT par mois, à compter du {{start}}, payables par {{payment}}." },
    ],
  },
];
