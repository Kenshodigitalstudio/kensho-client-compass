import { describe, expect, it } from "vitest";
import { fillTemplate, mailtoHref } from "./templates";
import { seedData } from "./seed";

describe("Email client personnalisé", () => {
  it("utilise les informations d’agence et les honoraires du contrat", () => {
    const data = seedData();
    const client = data.clients.find((c) => c.id === "atelier-maison");
    const text = fillTemplate("{{entreprise}} / {{contact}} / {{honoraires}} / {{agence}} / {{signataire}}", client,
      { ...data.settings, agencyName: "Agence de test", signatory: "Illya" });
    expect(text).toBe("Atelier Maison / Sarah / 1 200 € / Agence de test / Illya");
  });

  it("encode correctement le destinataire, l’objet et les retours à la ligne", () => {
    expect(mailtoHref("test@example.fr", "Bilan & suivi", "Bonjour,\nÀ bientôt")).toBe("mailto:test%40example.fr?subject=Bilan%20%26%20suivi&body=Bonjour%2C%0A%C3%80%20bient%C3%B4t");
  });
});