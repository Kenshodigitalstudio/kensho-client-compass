
import type { Client, EmailTemplate, Settings } from "./types";
import { eur, longDate } from "./format";

const googleAdsHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gestion mensuelle Google Ads — Kenshō Studio</title>
</head>
<body style="margin:0;padding:0;background:#f3f0eb;font-family:Arial,Helvetica,sans-serif;color:#242321;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f0eb;padding:35px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fffdfa;border-radius:18px;overflow:hidden;">
<tr><td style="padding:38px 38px 22px;">
<p style="font-size:13px;letter-spacing:4px;font-weight:bold;color:#8d7b72;margin:0;">KENSHŌ STUDIO</p>
<div style="height:1px;background:#e9e2dc;margin:24px 0;"></div>
<p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a18b82;">Google Ads · Accompagnement mensuel</p>
<h1 style="font-size:34px;line-height:1.2;margin:14px 0;color:#242321;">Faites de votre visibilité un véritable levier de croissance.</h1>
<p style="font-size:16px;line-height:1.8;color:#68615c;">Bonjour {{contact}},</p>
<p style="font-size:16px;line-height:1.8;color:#68615c;">Chez Kenshō Studio, nous accompagnons les entreprises dans la gestion et l'optimisation de leurs campagnes Google Ads. L'objectif : attirer les bons prospects, maîtriser votre budget et améliorer vos résultats dans la durée.</p>
</td></tr>
<tr><td style="padding:8px 38px 30px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4eee9;border-radius:14px;">
<tr><td style="padding:24px;">
<h2 style="font-size:19px;margin:0 0 16px;">Un accompagnement complet</h2>
<p style="font-size:14px;line-height:1.8;color:#625b56;margin:0;">✓ Suivi régulier de vos campagnes<br>✓ Optimisation des annonces et des mots-clés<br>✓ Analyse des performances et des conversions<br>✓ Ajustement des budgets et des stratégies<br>✓ Recommandations concrètes et reporting</p>
</td></tr></table>
<h2 style="font-size:21px;margin:30px 0 10px;">Une gestion pensée sur le long terme.</h2>
<p style="font-size:15px;line-height:1.8;color:#68615c;">Nous ne nous contentons pas de lancer vos campagnes. Nous analysons leurs performances, identifions les opportunités et faisons évoluer votre stratégie en fonction de vos objectifs.</p>
<div style="background:#242321;border-radius:14px;padding:25px;margin-top:25px;color:#fff;">
<p style="font-size:12px;letter-spacing:2px;color:#d8c7bd;margin:0 0 10px;">PROCHAINE ÉTAPE</p>
<h2 style="font-size:22px;margin:0 0 12px;color:#fff;">Parlons de votre projet.</h2>
<p style="font-size:14px;line-height:1.7;color:#e5dfda;margin:0;">Nous vous proposons un premier échange gratuit pour comprendre vos objectifs et identifier les possibilités d'amélioration de votre acquisition.</p>
</div>
<p style="font-size:15px;line-height:1.8;color:#68615c;margin-top:28px;">Au plaisir d'échanger avec vous,<br><strong style="color:#242321;">{{signataire}}</strong><br>{{agence}}</p>
</td></tr>
<tr><td style="padding:22px 38px;background:#eee9e3;">
<p style="font-size:12px;color:#827a73;margin:0;">{{agence}} · {{email_agence}}</p>
<p style="font-size:11px;color:#a39a92;margin:8px 0 0;">Stratégie digitale · Google Ads · Performance</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

const socialMediaHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gestion des réseaux sociaux — Kenshō Studio</title>
</head>
<body style="margin:0;padding:0;background:#f3f0eb;font-family:Arial,Helvetica,sans-serif;color:#242321;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f0eb;padding:35px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fffdfa;border-radius:18px;overflow:hidden;">
<tr><td style="padding:38px 38px 22px;">
<p style="font-size:13px;letter-spacing:4px;font-weight:bold;color:#8d7b72;margin:0;">KENSHŌ STUDIO</p>
<div style="height:1px;background:#e9e2dc;margin:24px 0;"></div>
<p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a18b82;">Social Media · 2027</p>
<h1 style="font-size:34px;line-height:1.2;margin:14px 0;color:#242321;">Votre marque mérite une présence qui se remarque.</h1>
<p style="font-size:16px;line-height:1.8;color:#68615c;">Bonjour {{contact}},</p>
<p style="font-size:16px;line-height:1.8;color:#68615c;">Les réseaux sociaux sont devenus essentiels pour développer une marque, créer une relation avec son audience et renforcer sa visibilité. Mais publier régulièrement ne suffit pas : il faut une véritable stratégie.</p>
</td></tr>
<tr><td style="padding:8px 38px 30px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0eaf0;border-radius:14px;">
<tr><td style="padding:24px;">
<h2 style="font-size:19px;margin:0 0 16px;">Notre accompagnement</h2>
<p style="font-size:14px;line-height:1.8;color:#625b56;margin:0;">✓ Définition de votre stratégie éditoriale<br>✓ Création de contenus et visuels<br>✓ Préparation du calendrier de publication<br>✓ Gestion et animation de vos réseaux<br>✓ Analyse des résultats et recommandations</p>
</td></tr></table>
<h2 style="font-size:21px;margin:30px 0 10px;">Une communication cohérente, créative et durable.</h2>
<p style="font-size:15px;line-height:1.8;color:#68615c;">Nous construisons une présence digitale alignée avec votre identité, vos objectifs commerciaux et votre audience. Chaque contenu doit avoir un rôle : informer, engager ou convertir.</p>
<div style="background:#242321;border-radius:14px;padding:25px;margin-top:25px;color:#fff;">
<p style="font-size:12px;letter-spacing:2px;color:#d8c7bd;margin:0 0 10px;">LANCEMENT 2027</p>
<h2 style="font-size:22px;margin:0 0 12px;color:#fff;">Préparons votre présence digitale.</h2>
<p style="font-size:14px;line-height:1.7;color:#e5dfda;margin:0;">Notre service de gestion des réseaux sociaux sera disponible à partir de 2027. Échangeons dès maintenant sur vos besoins et vos ambitions.</p>
</div>
<p style="font-size:15px;line-height:1.8;color:#68615c;margin-top:28px;">Au plaisir d'échanger avec vous,<br><strong style="color:#242321;">{{signataire}}</strong><br>{{agence}}</p>
</td></tr>
<tr><td style="padding:22px 38px;background:#eee9e3;">
<p style="font-size:12px;color:#827a73;margin:0;">{{agence}} · {{email_agence}}</p>
<p style="font-size:11px;color:#a39a92;margin:8px 0 0;">Stratégie digitale · Social Media · Création</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

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
  {
    id: "service-google-ads",
    name: "Présentation — Gestion mensuelle Google Ads",
    subject: "Développons votre acquisition avec Google Ads — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nDécouvrez notre accompagnement en gestion mensuelle Google Ads.",
    html: googleAdsHtml,
  },
  {
    id: "service-social-media",
    name: "Présentation — Gestion des réseaux sociaux",
    subject: "Développons votre présence sur les réseaux sociaux — {{entreprise}}",
    body: "Bonjour {{contact}},\n\nDécouvrez notre futur accompagnement Social Media, disponible à partir de 2027.",
    html: socialMediaHtml,
  },
];

export const VARIABLES = [
  "entreprise",
  "contact",
  "email",
  "honoraires",
  "budget",
  "contrat",
  "date_effet",
  "derniere_note",
  "prochain_rdv",
  "looker",
  "drive",
  "signataire",
  "agence",
  "email_agence",
];

export function totalBudget(c: Client) {
  return Object.values(c.budgets).reduce((a, b) => a + b, 0);
}

export function fillTemplate(text: string, c: Client | undefined, s: Settings) {
  const next = c?.appointments
    .filter((a) => !a.done && new Date(a.date) > new Date())
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const lastNote = c
    ? [...c.notes].sort((a, b) => b.date.localeCompare(a.date))[0]
    : undefined;

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
