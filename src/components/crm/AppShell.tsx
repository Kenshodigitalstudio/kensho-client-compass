import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import logo from "@/assets/kensho-logo.png.asset.json";
import { cn } from "@/lib/utils";
import { useCrm, type HeaderFilter } from "@/lib/crm/store";
import { initials } from "@/lib/crm/format";
import { Avatar, StatusBadge } from "./kit";
import { ClientFormDialog } from "./ClientFormDialog";

const FILTERS: { key: HeaderFilter; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "prospect", label: "Prospects" },
  { key: "audit", label: "En audit" },
  { key: "actif", label: "Clients actifs" },
];

const TABS = [
  { to: "/", label: "Tableau de bord", exact: true },
  { to: "/clients", label: "Clients" },
  { to: "/contrats", label: "Contrats" },
  { to: "/templates", label: "Templates d'emails" },
  { to: "/taxes", label: "Taxes & Bénéfices" },
  { to: "/reglages", label: "Réglages" },
] as const;

function SearchBox() {
  const { data, query, setQuery } = useCrm();
  const [focus, setFocus] = useState(false);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const q = query.trim().toLowerCase();
  const results = q && data ? data.clients.filter((c) => `${c.name} ${c.contact} ${c.email}`.toLowerCase().includes(q)).slice(0, 6) : [];
  return (
    <div className="relative min-w-0 flex-1 xl:w-56 xl:flex-none 2xl:w-64">
      <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 focus-within:border-primary">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-muted-foreground"><circle cx="6" cy="6" r="4.5" /><path d="M10 10l3 3" /></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && path !== "/" && path !== "/clients") navigate({ to: "/clients" });
            if (e.key === "Escape") setQuery("");
          }}
          placeholder="Rechercher un client…"
          aria-label="Rechercher un client"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </label>
      {focus && q && (
        <div className="absolute left-0 right-0 top-11 z-40 overflow-hidden rounded-[14px] border border-border bg-card shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-[13px] text-muted-foreground">Aucun client ne correspond à « {query} ».</p>
          ) : (
            results.map((c) => (
              <Link key={c.id} to="/clients/$clientId" params={{ clientId: c.id }} onClick={() => setQuery("")} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0 hover:bg-background">
                <Avatar text={initials(c.name)} className="h-8 w-8" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{c.name}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{c.contact}</span>
                </span>
                <StatusBadge status={c.status} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FilterPills() {
  const { filter, setFilter } = useCrm();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex shrink-0 rounded-full border border-border bg-card p-1 text-[12px] font-medium" role="group" aria-label="Filtrer par statut">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => {
            setFilter(f.key);
            if (path !== "/" && path !== "/clients") navigate({ to: "/clients" });
          }}
          aria-pressed={filter === f.key}
          className={cn("whitespace-nowrap rounded-full px-3 py-1", filter === f.key ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { newClientOpen, setNewClientOpen } = useCrm();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="print-hide sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-8 xl:gap-6">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Kenshō Digital Studio — Tableau de bord">
            <img src={logo.url} alt="Kenshō Digital Studio" className="h-8 w-auto sm:h-9" />
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold xl:w-auto xl:max-w-[210px] xl:flex-none xl:whitespace-normal xl:leading-tight">{title}</h1>
          <div className="hidden xl:block"><SearchBox /></div>
          <div className="hidden xl:block"><FilterPills /></div>
          <nav className="ml-auto flex items-center gap-5 text-[13px] text-muted-foreground">
            <Link to="/templates" className="hidden leading-tight hover:text-foreground 2xl:block" activeProps={{ className: "text-foreground" }}>Templates d'emails</Link>
            <Link to="/taxes" className="hidden leading-tight hover:text-foreground 2xl:block" activeProps={{ className: "text-foreground" }}>Taxes &amp; Bénéfices</Link>
            <button onClick={() => setNewClientOpen(true)} className="h-9 shrink-0 rounded-full bg-primary px-4 font-semibold text-primary-foreground hover:brightness-95">
              <span className="sm:hidden">+ Client</span>
              <span className="hidden sm:inline">+ Nouveau Client</span>
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3 px-4 pb-3 sm:px-8 xl:hidden">
          <SearchBox />
          <div className="hidden md:block"><FilterPills /></div>
        </div>
        <nav className="flex h-12 items-center gap-1 overflow-x-auto border-t border-border px-4 text-[13px] font-medium sm:px-8" aria-label="Navigation principale">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: "exact" in t }}
              className="grid h-9 shrink-0 place-items-center whitespace-nowrap rounded-full px-4 text-muted-foreground hover:text-foreground"
              activeProps={{ className: "bg-ink !text-ink-foreground" }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <ClientFormDialog open={newClientOpen} onOpenChange={setNewClientOpen} />
    </div>
  );
}

export { FilterPills };
