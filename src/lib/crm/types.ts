
export type ClientStatus = "actif" | "onboarding" | "pause" | "audit" | "prospect";
export type CampaignType = "search" | "pmax" | "shopping" | "display" | "demandgen" | "remarketing";
export type ContractStatus = "a_signer" | "signe";

export interface Note {
  id: string;
  date: string;
  text: string;
}

export interface Appointment {
  id: string;
  date: string;
  title: string;
  place: string;
  link?: string;
  done?: boolean;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface PendingEmail {
  id: string;
  templateId: string;
  title: string;
  due: string;
  sent: boolean;
}

export interface Contract {
  id: string;
  templateId: string;
  title: string;
  status: ContractStatus;
  signedAt?: string;
  sentAt?: string;
  startDate: string;
  duration: string;
  fee: number;
  payment: string;
  prestation: string;
  createdAt: string;
  docStatus?: ContractDocStatus;
  endDate?: string;
  autoRenew?: boolean;
}

export type ContractDocStatus = "brouillon" | "attente" | "signe" | "expire";
export type InvoiceState = "payee" | "attente" | "retard";
export type ActionPriority = "basse" | "moyenne" | "haute";
export type ActionStatus = "a_faire" | "en_cours" | "termine";

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
}

export interface ClientAction {
  id: string;
  text: string;
  due: string;
  priority: ActionPriority;
  status: ActionStatus;
  createdAt: string;
  doneAt?: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  kind: "email" | "budget";
  text: string;
}

export interface ContractPdf {
  name: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface Client {
  id: string;
  name: string;
  legalName: string;
  contact: string;
  representative: string;
  contactRole?: string;
  email: string;
  phone: string;
  siret: string;
  address: string;
  website: string;
  links: {
    ads: string;
    looker: string;
    drive: string;
  };
  status: ClientStatus;
  formule: string;
  channel: "google" | "social";
  budgets: Record<CampaignType, number>;
  fee: number;
  contract: Contract | null;
  notes: Note[];
  appointments: Appointment[];
  tasks: Task[];
  emails: PendingEmail[];
  createdAt: string;
  invoices?: Invoice[];
  actions?: ClientAction[];
  history?: HistoryEvent[];
  contractPdf?: ContractPdf;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  html?: string;
}

export interface MonthFinance {
  month: number;
  year: number;
  ca: number;
  frais: number;
  declared: boolean;
}

export type Regime = "micro" | "sasu";

export interface Settings {
  agencyName: string;
  signatory: string;
  agencyEmail: string;
  agencyAddress: string;
  agencySiret: string;
  urssafRate: number;
  cfpRate: number;
  vlRate: number;
  isRate: number;
  monthlyTools: number;
  regime: Regime;
}

export interface CrmData {
  workspace?: {
    tasks: (Task & { due: string })[];
    memo: string;
  };
  clients: Client[];
  templates: EmailTemplate[];
  finances: MonthFinance[];
  settings: Settings;
}
