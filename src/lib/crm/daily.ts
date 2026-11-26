import type { Client } from "./types";

export function parisDay(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));
}

export function dailyAppointments(clients: Client[], now: Date, week = false) {
  const today = parisDay(now);
  const end = parisDay(new Date(now.getTime() + 6 * 86400000));
  return clients.flatMap(client => client.appointments.map(appointment => ({ ...appointment, client })))
    .filter(a => !a.done && parisDay(a.date) >= today && parisDay(a.date) <= (week ? end : today))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function dueEmails(clients: Client[], now: Date) {
  return clients.flatMap(client => client.emails.map(email => ({ ...email, client })))
    .filter(email => !email.sent && email.due.slice(0, 10) <= parisDay(now))
    .sort((a, b) => a.due.localeCompare(b.due));
}