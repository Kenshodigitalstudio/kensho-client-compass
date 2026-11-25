import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/lib/crm/types";
import { STATUS_LABEL } from "@/lib/crm/format";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-[14px] border border-border bg-card", className)}>{children}</section>;
}

export function SectionTitle({ title, meta, className }: { title: ReactNode; meta?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {meta !== undefined && <span className="shrink-0 text-[12px] text-muted-foreground">{meta}</span>}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ink" | "ghost" | "danger" };
export function Btn({ variant = "primary", className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] transition disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary font-semibold text-primary-foreground hover:brightness-95",
        variant === "secondary" && "border border-border bg-card font-medium text-foreground hover:border-primary hover:text-primary",
        variant === "ink" && "bg-ink font-semibold text-ink-foreground hover:opacity-90",
        variant === "ghost" && "font-medium text-muted-foreground hover:text-foreground",
        variant === "danger" && "border border-border bg-card font-medium text-destructive hover:border-destructive",
        className,
      )}
    />
  );
}

export function Avatar({ text, dark, className }: { text: string; dark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold",
        dark ? "bg-ink text-ink-foreground" : "bg-primary/12 text-primary",
        className,
      )}
    >
      {text}
    </span>
  );
}

export function SoftBadge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary", className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: ClientStatus }) {
  const active = status === "actif" || status === "onboarding";
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium",
        active ? "bg-primary/12 text-primary" : status === "prospect" ? "bg-warning-soft text-warning" : "bg-border text-muted-foreground",
      )}
    >
      {active ? "● " : ""}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[12px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "h-10 w-full rounded-[10px] border border-border bg-card px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
export function TextInput(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(inputCls, p.className)} />;
}
export function SelectInput(p: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn(inputCls, "appearance-auto", p.className)} />;
}
export function TextArea(p: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn(inputCls, "h-auto min-h-24 py-2.5 leading-relaxed", p.className)} />;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/12 text-primary">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /><path d="M5.5 8.5l1.8 1.8L11 6.5" strokeLinecap="round" /></svg>
      </span>
      <p className="text-[14px] font-semibold">{title}</p>
      {text && <p className="max-w-xs text-[12px] text-muted-foreground">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function DateTile({ day, num, active }: { day: string; num: number; active?: boolean }) {
  return (
    <span className={cn("flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] leading-none", active ? "bg-primary/12 text-primary" : "border border-border bg-card text-muted-foreground")}>
      <span className="text-[10px] font-medium">{day}</span>
      <span className="mt-1 text-[13px] font-bold text-foreground">{num}</span>
    </span>
  );
}

export function PageLoading() {
  return (
    <div className="grid gap-4 px-4 py-6 sm:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-[14px] border border-border bg-card" />)}
      </div>
      <div className="h-80 animate-pulse rounded-[14px] border border-border bg-card" />
    </div>
  );
}
