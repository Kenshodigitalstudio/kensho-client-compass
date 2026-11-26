import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Check, Mail, Plus, Trash2, StickyNote, ListTodo, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/crm/AppShell";
import { useCrm } from "@/lib/crm/store";
import { Btn, TextInput, TextArea, EmptyState } from "@/components/crm/kit";
import { frDate } from "@/lib/crm/format";
import { fillTemplate, mailtoHref } from "@/lib/crm/templates";
import { crmHead } from "@/lib/crm/page-head";
import { dailyAppointments, dueEmails, parisDay } from "@/lib/crm/daily";

export const Route = createFileRoute("/")({
  head: () => crmHead("Ma journée", "Rendez-vous, relances, tâches et mémo personnel pour la journée de travail Kenshō Studio."),
  component: DailyPage,
});

function DailyPage() {
  const { data, update, updateClient } = useCrm();
  const [now, setNow] = useState(() => new Date());
  const [week, setWeek] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  if (!data) return <AppShell title="Tableau de bord" daily><div className="p-8 text-muted-foreground">Chargement…</div></AppShell>;
  const today = parisDay(now);
  const workspace = data.workspace ?? { tasks: [], memo: "" };
  const appointments = dailyAppointments(data.clients, now, week);
  const todaysAppointments = dailyAppointments(data.clients, now);
  const emails = dueEmails(data.clients, now);
  const clientTasks = data.clients.flatMap(client => client.tasks.map(task => ({ ...task, client })));
  const personalTasks = workspace.tasks.filter(task => task.due <= today);
  const remaining = personalTasks.filter(t => !t.done).length + clientTasks.filter(t => !t.done).length;
  const visiblePersonal = personalTasks.filter(t => showCompleted || !t.done);
  const visibleClient = clientTasks.filter(t => showCompleted || !t.done);
  const completed = personalTasks.filter(t => t.done).length + clientTasks.filter(t => t.done).length;
  const updateWorkspace = (fn: (w: typeof workspace) => typeof workspace) => update(d => ({ ...d, workspace: fn(d.workspace ?? { tasks: [], memo: "" }) }));

  return (
    <AppShell title="Tableau de bord" daily>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium capitalize text-muted-foreground">{now.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            <h2 className="mt-2 text-3xl font-bold">Ma journée</h2>
          </div>
          <Link to="/clients" className="inline-flex items-center gap-2 text-[13px] font-medium text-primary">Mes clients <ArrowUpRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-3 gap-3 border-y border-border py-5 sm:gap-6">
          {[
            { label: "Rendez-vous aujourd’hui", value: todaysAppointments.length, icon: CalendarDays },
            { label: "Relances à traiter", value: emails.length, icon: Mail },
            { label: "Tâches à faire", value: remaining, icon: ListTodo },
          ].map(item => <div key={item.label} className="min-w-0"><item.icon size={18} className="mb-3 text-primary" /><p className="text-2xl font-bold">{item.value}</p><p className="mt-1 text-[12px] text-muted-foreground">{item.label}</p></div>)}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-[16px] font-semibold"><CalendarDays size={18} className="text-primary" /> Mon agenda</h3>
              <div className="flex gap-1" role="group" aria-label="Période de l’agenda">
                <Btn variant={!week ? "ink" : "ghost"} aria-pressed={!week} onClick={() => setWeek(false)}>Aujourd’hui</Btn>
                <Btn variant={week ? "ink" : "ghost"} aria-pressed={week} onClick={() => setWeek(true)}>7 jours</Btn>
              </div>
            </div>
            {appointments.length === 0 ? <EmptyState title={week ? "Aucun rendez-vous sur les 7 prochains jours" : "Aucun rendez-vous aujourd’hui"} /> : <div className="divide-y divide-border border-y border-border">{appointments.map(a => <div key={`${a.client.id}-${a.id}`} className="flex gap-4 py-5">
              <div className="w-16 shrink-0"><p className="text-[14px] font-semibold">{new Date(a.date).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" })}</p>{week && <p className="mt-1 text-[11px] text-muted-foreground">{frDate(a.date)}</p>}</div>
              <div className="min-w-0 flex-1"><p className="break-words text-[14px] font-semibold">{a.title}</p><Link to="/clients/$clientId" params={{ clientId: a.client.id }} className="text-[12px] text-primary hover:underline">{a.client.name}</Link><p className="mt-1 break-words text-[12px] text-muted-foreground">{a.place}</p>
                {a.link && /^https?:\/\//i.test(a.link) && <a href={a.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-primary">Rejoindre <ArrowUpRight size={14} /></a>}
              </div>
              <Btn variant="secondary" className="h-8 w-8 px-0" title="Marquer le rendez-vous terminé" aria-label={`Terminer ${a.title}`} onClick={() => updateClient(a.client.id, c => ({ ...c, appointments: c.appointments.map(item => item.id === a.id ? { ...item, done: true } : item) }))}><Check size={16} /></Btn>
            </div>)}</div>}
            <div className="mt-8">
              <h3 className="mb-5 flex items-center gap-2 text-[16px] font-semibold"><Mail size={18} className="text-primary" /> Relances & mails</h3>
              {emails.length === 0 ? <EmptyState title="Aucune relance à traiter aujourd’hui" /> : <div className="divide-y divide-border border-y border-border">{emails.map(m => {
                const template = data.templates.find(t => t.id === m.templateId);
                const subject = template ? fillTemplate(template.subject, m.client, data.settings) : m.title;
                const body = template ? fillTemplate(template.body, m.client, data.settings) : `Bonjour ${m.client.contact},\n\n`;
                return <div key={`${m.client.id}-${m.id}`} className="py-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words text-[14px] font-semibold">{m.title}</p><Link to="/clients/$clientId" params={{ clientId: m.client.id }} className="text-[12px] text-primary hover:underline">{m.client.name}</Link><p className={`mt-1 text-[11px] ${m.due.slice(0, 10) < today ? "text-warning" : "text-muted-foreground"}`}>{m.due.slice(0, 10) < today ? "En retard · " : "À envoyer · "}{frDate(m.due)}</p></div><Btn variant="secondary" className="h-8 w-8 px-0" title="Marquer comme envoyé" aria-label={`Marquer envoyé : ${m.title}`} onClick={() => updateClient(m.client.id, c => ({ ...c, emails: c.emails.map(item => item.id === m.id ? { ...item, sent: true } : item) }))}><Check size={16} /></Btn></div><a href={mailtoHref(m.client.email, subject, body)} className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-primary"><Mail size={14} /> Préparer le mail</a></div>;
              })}</div>}
            </div>
          </section>
          <div className="min-w-0 space-y-8">
            <section>
              <div className="mb-5 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-[16px] font-semibold"><ListTodo size={18} className="text-primary" /> À faire</h3><span className="text-[12px] text-muted-foreground">{remaining} restante(s)</span></div>
              <form className="flex gap-2" onSubmit={e => { e.preventDefault(); const text = taskText.trim(); if (!text) return; updateWorkspace(w => ({ ...w, tasks: [...w.tasks, { id: crypto.randomUUID(), text, due: today, done: false }] })); setTaskText(""); }}>
                <TextInput aria-label="Nouvelle tâche" placeholder="Ajouter une tâche pour aujourd’hui…" value={taskText} onChange={e => setTaskText(e.target.value)} maxLength={500} />
                <Btn type="submit" disabled={!taskText.trim()} className="h-10 w-10 px-0" aria-label="Ajouter la tâche" title="Ajouter la tâche"><Plus size={18} /></Btn>
              </form>
              <div className="mt-4 divide-y divide-border">
                {visiblePersonal.map(t => <div key={t.id} className="flex items-start gap-3 py-3"><input type="checkbox" checked={t.done} aria-label={`Terminer : ${t.text}`} className="mt-1 h-4 w-4 shrink-0 accent-primary" onChange={() => updateWorkspace(w => ({ ...w, tasks: w.tasks.map(item => item.id === t.id ? { ...item, done: !item.done } : item) }))} /><div className="min-w-0 flex-1"><p className={`break-words text-[13px] ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.text}</p><p className="mt-1 text-[11px] text-muted-foreground">Personnel{t.due < today ? ` · Depuis le ${frDate(t.due)}` : ""}</p></div><Btn variant="ghost" className="h-7 w-7 px-0" aria-label={`Supprimer : ${t.text}`} title="Supprimer la tâche" onClick={() => updateWorkspace(w => ({ ...w, tasks: w.tasks.filter(item => item.id !== t.id) }))}><Trash2 size={14} /></Btn></div>)}
                {visibleClient.map(t => <div key={`${t.client.id}-${t.id}`} className="flex items-start gap-3 py-3"><input type="checkbox" checked={t.done} aria-label={`Terminer : ${t.text}`} className="mt-1 h-4 w-4 shrink-0 accent-primary" onChange={() => updateClient(t.client.id, c => ({ ...c, tasks: c.tasks.map(item => item.id === t.id ? { ...item, done: !item.done } : item) }))} /><div className="min-w-0"><p className={`break-words text-[13px] ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.text}</p><Link to="/clients/$clientId" params={{ clientId: t.client.id }} className="text-[11px] text-primary hover:underline">{t.client.name}</Link></div></div>)}
                {visiblePersonal.length + visibleClient.length === 0 && <EmptyState title="Tout est à jour" />}
              </div>
              {completed > 0 && <Btn variant="ghost" className="mt-3 px-0" onClick={() => setShowCompleted(v => !v)}>{showCompleted ? "Masquer les tâches terminées" : `Voir les ${completed} tâche(s) terminée(s)`}</Btn>}
            </section>
            <section className="border-t border-border pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-[16px] font-semibold"><StickyNote size={18} className="text-primary" /> Mon mémo</h3>
              <TextArea aria-label="Mon mémo" placeholder="Une idée, un rappel, un point à ne pas oublier…" rows={6} value={workspace.memo} onChange={e => updateWorkspace(w => ({ ...w, memo: e.target.value }))} />
              <p className="mt-2 text-[11px] text-muted-foreground">Enregistrement automatique · sur cet appareil</p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
