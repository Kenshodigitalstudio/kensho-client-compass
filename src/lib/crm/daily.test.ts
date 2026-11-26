import { describe, expect, it } from "vitest";
import { seedData } from "./seed";
import { dailyAppointments, dueEmails, parisDay } from "./daily";

describe("Travail du jour", () => {
  const now = new Date("2026-11-26T12:00:00Z");
  const first = seedData().clients[0];
  if (!first) throw new Error("Client de test manquant");
  const client = { ...first, appointments: [
    { id: "today", date: "2026-11-26T08:00:00Z", title: "Point", place: "Visio" },
    { id: "tomorrow", date: "2026-11-27T08:00:00Z", title: "Point", place: "Visio" },
    { id: "done", date: "2026-11-26T08:00:00Z", title: "Point", place: "Visio", done: true },
    { id: "past", date: "2026-11-25T08:00:00Z", title: "Point", place: "Visio" },
  ], emails: [
    { id: "late", templateId: "rapport", title: "Rapport", due: "2026-11-25", sent: false },
    { id: "today", templateId: "rapport", title: "Rapport", due: "2026-11-26", sent: false },
    { id: "future", templateId: "rapport", title: "Rapport", due: "2026-11-27", sent: false },
    { id: "sent", templateId: "rapport", title: "Rapport", due: "2026-11-26", sent: true },
  ] };
  it("ne montre que les rendez-vous non terminés du jour, même si l’heure est passée", () => {
    expect(dailyAppointments([client], now).map(a => a.id)).toEqual(["today"]);
  });
  it("étend l’agenda aux sept prochains jours", () => {
    expect(dailyAppointments([client], now, true).map(a => a.id)).toEqual(["today", "tomorrow"]);
  });
  it("inclut les relances en retard et du jour, pas celles envoyées ou futures", () => {
    expect(dueEmails([client], now).map(a => a.id)).toEqual(["late", "today"]);
  });
  it("utilise la date de Paris aux changements de jour", () => {
    expect(parisDay("2026-11-25T23:30:00Z")).toBe("2026-11-26");
  });
});