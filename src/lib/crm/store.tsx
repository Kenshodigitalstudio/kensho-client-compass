import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Client, CrmData, ClientStatus } from "./types";
import { seedData } from "./seed";

const KEY = "kensho-crm-v1";

export type HeaderFilter = "tous" | "prospect" | "audit" | "actif";

interface Ctx {
  data: CrmData | null;
  update: (fn: (d: CrmData) => CrmData) => void;
  updateClient: (id: string, fn: (c: Client) => Client) => void;
  query: string;
  setQuery: (q: string) => void;
  filter: HeaderFilter;
  setFilter: (f: HeaderFilter) => void;
  newClientOpen: boolean;
  setNewClientOpen: (o: boolean) => void;
  reset: () => void;
}

const CrmContext = createContext<Ctx | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CrmData | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HeaderFilter>("tous");
  const [newClientOpen, setNewClientOpen] = useState(false);

  useEffect(() => {
    let loaded: CrmData | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) loaded = JSON.parse(raw) as CrmData;
    } catch {
      loaded = null;
    }
    setData(loaded ?? seedData());
  }, []);

  useEffect(() => {
    if (data) localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  const update = useCallback((fn: (d: CrmData) => CrmData) => setData((d) => (d ? fn(d) : d)), []);
  const updateClient = useCallback(
    (id: string, fn: (c: Client) => Client) =>
      setData((d) => (d ? { ...d, clients: d.clients.map((c) => (c.id === id ? fn(c) : c)) } : d)),
    [],
  );
  const reset = useCallback(() => setData(seedData()), []);

  const value = useMemo(
    () => ({ data, update, updateClient, query, setQuery, filter, setFilter, newClientOpen, setNewClientOpen, reset }),
    [data, update, updateClient, query, filter, newClientOpen, reset],
  );
  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const c = useContext(CrmContext);
  if (!c) throw new Error("useCrm outside CrmProvider");
  return c;
}

/** Data is loaded from the browser after mount; pages render a calm placeholder until then. */
export function useCrmData() {
  const c = useCrm();
  return c.data;
}

export const matchesFilter = (s: ClientStatus, f: HeaderFilter) =>
  f === "tous" ? true : f === "actif" ? s === "actif" || s === "onboarding" : s === f;
