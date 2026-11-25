# Kensho CRM

je veux créer un crm pour mes clients kensho studio (https://kenshostudio.fr), agence de croissance digitale spécialisée en Google Ads et acquisition. Le CRM doit inclure :
- Tableau de bord principal avec clients, métriques clés, prochains RDV, relances et emails à envoyer.
- Fiches clients détaillées avec informations entreprise, budgets Google Ads par typologie de campagne (Search, Performance Max, Shopping, Display, Demand Gen/YouTube, Remarketing), notes de meeting, RDV prévus et de suivi, espace emails avec modèles/templates, et statut de contrat (bulle "À signer" ou "Signé").
- Espace Contrats & Générateur avec modèles de contrats vierges, sélection d'un client enregistré avec préremplissage automatique des données d'entreprise et contrat prêt à être exporté/envoyé.
- Page Taxes & Bénéfices avec calcul du CA encaissé, calcul automatique des cotisations/taxes (URSSAF, impôts, frais) selon le régime fiscal et bénéfice net réel restant, plus simulateur.
- Logo officiel Kenshō Digital Studio intégré en haut à gauche dans le header.

## Locked
- **Identité visuelle & direction**: Direction "Ivoire & Sauge" fidèle à l'univers de Kenshō Studio (https://kenshostudio.fr).
  - Palette : Fond ivoire / sable clair doux (`#F8F6F0`, `#FAF8F5`, `#FFFFFF`), vert sauge profond en marque et accent principal (`#4A6B5B`, `#3D5A4C`, touches douces `#E8EFEA`, `#D6E3DB`), typographie et éléments sombres en anthracite (`#1C2421`, `#2D3748`), gris neutres chauds pour les bordures (`#E5E7EB`, `#E2E8F0`).
  - Typographie : Plus Jakarta Sans (ou Inter / sans-serif géométrique moderne et épuré), hiérarchie claire, sentiment haut de gamme et calme.
  - Logo : Logo Kenshō Digital Studio fourni en pièce jointe (`kensho-logo-transparent.png`), affiché en haut à gauche de la navigation principale.
- **Pages et fonctionnalités arrêtées**:
  1. **Tableau de bord principal** (`crm-dashboard-ivory`) :
     - En-tête avec logo Kenshō Studio, navigation fluide (Dashboard, Clients, Contrats, Taxes & Bénéfices, Paramètres).
     - Métriques clés (KPIs) : Total clients actifs, Budget publicitaire total géré, RDV de la semaine, Relances prioritaires.
     - Barre de recherche de clients, filtres par statut (Actif, En onboarding, En pause, Prospect) et bouton "+ Nouveau client".
     - Liste/tableau complet des clients avec contact, campagnes actives, prochain point et actions.
     - Blocs d'action latérale : Prochains rendez-vous avec dates et liens, Relances à faire & emails prêts à envoyer.
  2. **Fiche client détaillée** (`client-detail`) :
     - Bloc identité : Nom du client, contact principal, email, téléphone, SIREN/SIRET, adresse, site web, liens rapides (Google Ads, Looker Studio, Google Drive).
     - Gestion des campagnes Google Ads et budgets : Cartes ou tableau détaillant les budgets mensuels par typologie (Search, Performance Max, Shopping, Display, Demand Gen / YouTube, Remarketing), calcul automatique du total budget média et des honoraires de gestion d'agence.
     - Notes de réunion : Historique des comptes-rendus datés avec ajout rapide de nouvelle note.
     - Calendrier des rendez-vous : RDV prévus et points de suivi programmés.
     - Section Mails & Templates : Modèles préconçus d'emails (Bienvenue & Onboarding, Compte-rendu de performances hebdomadaire, Relance budget/facturation, Recommandation d'optimisation) avec insertion automatique des données du client et bouton pour copier ou ouvrir dans le client mail.
     - Espace Contrat du client : Affichage du contrat en cours avec badge interactif "À signer" (orange/jaune doux) ou "Signé" (vert sauge), montant de la prestation, date d'effet, et accès au document.
  3. **Espace Contrats & Générateur** (`contracts-generator`) :
     - Bibliothèque de modèles vierges : Gestion de campagnes Google Ads mensuelle, Audit SEA & Stratégie, Pack Lancement.
     - Sélecteur de client existant qui préremplit instantanément toutes les variables du contrat (Raison sociale, représentant, adresse, SIRET, budget média prévisionnel, honoraires mensuels).
     - Éditeur/prévisualisation du contrat complet prêt à imprimer ou télécharger en PDF / imprimer.
  4. **Page Taxes & Bénéfices** (`taxes-benefits`) :
     - Sélecteur de période (Mois en cours, Trimestre, Année, Personnalisé) et sélecteur de régime fiscal (Auto-entrepreneur / Micro-entreprise prestation de services BNC ~21,1% à 23,1% URSSAF + versement libératoire, Société SASU/EURL avec charges et IS).
     - Cartes de synthèse financière : Chiffre d'affaires encaissé (honoraires d'agence), Total cotisations et taxes prévisionnelles, Bénéfice net disponible.
     - Ventilation claire des prélèvements : Cotisations sociales URSSAF, CFP (Contribution Formation), Impôt / Acompte fiscal.
     - Simulateur de rentabilité en temps réel : slider ou champ "Si j'encaisse X € d'honoraires, combien me reste-t-il après taxes et cotisations ?".
     - Graphique ou tableau de l'historique mensuel des encaissements, cotisations et net.

## Open
- Architecture de données et persistance locale/mock dynamique : Stocker les clients, contrats, notes, rendez-vous et données financières avec état persistant (ex: LocalStorage / état React fluide) pour que l'utilisateur puisse créer, modifier et supprimer des clients et des notes immédiatement.
- Modales d'ajout : Formulaire d'ajout d'un nouveau client avec toutes les données requises, formulaire d'ajout de note de réunion, programmation d'un RDV.
- États vides bienveillants et soignés pour chaque section (aucun client trouvé, aucune relance urgente, aucun contrat créé).
- Responsive design irréprochable (Mobile, Tablette et Desktop).

build a real working app, not a clickable prototype; the screen and kit files show layout, content and look (a wireframe's, structure only) and are never code to copy. The screens are the moments the user designed, not the whole product. Before building, walk through each flow as its user would and design what the pictures leave out, as a product designer would for this product: the steps a flow needs to finish and how the app responds to what the user does, including the moments its users will actually run into, like waiting on something or finding nothing yet. Add nothing a user of this product would never meet, and keep an app the user wants simple, simple. Never leave a step the product's core flows need as "coming soon", unless the brief says the user chose to. Where such a step needs an outside service, build every part up to it and say in your reply what's left to connect. Fill product gaps only, never a look the design set: an added step reuses the UI kit's tokens, chrome and parts and the nearest designed screen's layout, with no new visual direction. Look at every screen's picture before writing code; design.md says which picture or sheet holds each screen. Open the UI kit's shells and parts HTML for the header, tab bar, composer and components, not only its tokens. Use each finished screen's copy exactly as design.md lists it; never invent copy for one. A wireframe under design.md's Wireframes gives structure only: build it in the design's look, as design.md says. The screens' photos are placeholders for the mockups only: replace every photo design.md lists with the user's own upload for it, else as design.md says (a photo without people re-composed with imagegen--edit_image from it as a reference, a photo of people generated from its brief and never from the photo), and ship no set photo or its URL. Build and check each screen at the canvas it was drawn at: phone 393×764, tablet landscape 1133×744, tablet portrait 744×1133, desktop 1280×832. After building, screenshot the app at those sizes and states, compare each finished screen with its picture, and fix every visual difference you didn't choose; check a wireframe's screen against its structure, never its grey look. End your reply with "Changed from the mockups": each deliberate change and why, and "Added beyond the mockups": each step, state or interaction you built that no screen shows.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kensho-client-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df78c9e4-7396-4df4-a286-0a517123fada).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
