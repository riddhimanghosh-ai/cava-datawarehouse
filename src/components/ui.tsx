"use client";

import { cx } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  changePct,
  changeLabel,
  tone = "default",
}: {
  label: string;
  value: string;
  changePct?: number;
  changeLabel?: string;
  tone?: "default" | "danger" | "ok";
}) {
  const positive = (changePct ?? 0) >= 0;
  return (
    <Card>
      <div className="text-xs text-[var(--muted)] font-medium">{label}</div>
      <div className="text-2xl font-bold mt-2 tracking-tight">{value}</div>
      {changePct !== undefined && (
        <div
          className={cx(
            "flex items-center gap-1 mt-2 text-xs font-medium",
            tone === "danger" ? "text-[var(--danger)]" : tone === "ok" ? "text-[var(--ok)]" : positive ? "text-[var(--ok)]" : "text-[var(--danger)]"
          )}
        >
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(changePct).toFixed(1)}% {changeLabel}
        </div>
      )}
    </Card>
  );
}

const BADGE_TONES: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  low: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  healthy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overstock: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "excess-aging": "bg-red-500/15 text-red-400 border-red-500/30",
  surging: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  stable: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  cooling: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  viral: "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/40",
  trending: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  steady: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  underperforming: "bg-red-500/15 text-red-400 border-red-500/30",
  scaling: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  fatigued: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "paused-recommended": "bg-red-500/15 text-red-400 border-red-500/30",
  performing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  decaying: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  dead: "bg-red-500/15 text-red-400 border-red-500/30",
  "on-time": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  delayed: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "at-risk": "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "p0 - critical": "bg-red-500/15 text-red-400 border-red-500/30",
  "p1 - high": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "p2 - medium": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  crashing: "bg-red-500/15 text-red-400 border-red-500/30",
  deteriorating: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  improving: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  upcoming: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  live: "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/40",
  ended: "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]",
  positive: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  negative: "bg-red-500/15 text-red-400 border-red-500/30",
  neutral: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "new-launch": "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/40",
  restocked: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "price-drop": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "price-hike": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  stockout: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function Badge({ tone, children }: { tone: string; children: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize whitespace-nowrap",
        BADGE_TONES[tone.toLowerCase()] ?? "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]"
      )}
    >
      {children.includes(" ") ? children : children.replace(/-/g, " ")}
    </span>
  );
}

export function ProgressBar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "danger" | "ok" | "warning" }) {
  const color = tone === "danger" ? "bg-[var(--danger)]" : tone === "ok" ? "bg-[var(--ok)]" : tone === "warning" ? "bg-[var(--warning)]" : "bg-[var(--accent)]";
  return (
    <div className="w-full h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
      <div className={cx("h-full rounded-full", color)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function SwatchDot({ color, size = 30 }: { color: string; size?: number }) {
  return (
    <span
      className="rounded-full border border-white/10 shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
}

export function RingProgress({
  pct,
  size = 56,
  stroke = 6,
  tone = "accent",
  label,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  tone?: "accent" | "danger" | "ok" | "warning";
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, pct));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const color =
    tone === "danger" ? "var(--danger)" : tone === "ok" ? "var(--ok)" : tone === "warning" ? "var(--warning)" : "var(--accent)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">{label}</div>
      )}
    </div>
  );
}

export function IconTile({ icon, tone = "default" }: { icon: ReactNode; tone?: "default" | "danger" | "ok" | "accent" }) {
  const bg =
    tone === "danger" ? "bg-red-500/15 text-red-400" : tone === "ok" ? "bg-emerald-500/15 text-emerald-400" : tone === "accent" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--surface-2)] text-[var(--muted)]";
  return <div className={cx("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", bg)}>{icon}</div>;
}

export function FilterBox({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 min-w-[180px]">
      <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] mb-1">
        {icon}
        {label}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent text-sm font-medium outline-none pr-5 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[var(--surface)] text-[var(--foreground)]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
      </div>
    </div>
  );
}

export function FilterRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-stretch gap-3 mb-6">{children}</div>;
}

// Multi-select checkbox dropdown. `selected` is the set of chosen values;
// an empty set is treated as "All". Used for channel / category / SKU filters.
export function MultiSelect({
  label,
  icon,
  options,
  selected,
  onChange,
  allLabel = "All",
}: {
  label: string;
  icon?: ReactNode;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const isAll = selected.size === 0 || selected.size === options.length;
  const display = isAll
    ? allLabel
    : selected.size === 1
    ? options.find((o) => selected.has(o.value))?.label ?? `${selected.size} selected`
    : `${selected.size} selected`;

  const toggle = (v: string) => {
    const next = new Set(selected);
    next.has(v) ? next.delete(v) : next.add(v);
    onChange(next);
  };

  return (
    <div className="relative min-w-[180px]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5"
      >
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] mb-1">
          {icon}
          {label}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">{display}</span>
          <ChevronDown size={13} className="text-[var(--muted)] shrink-0 ml-2" />
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 mt-1 w-full min-w-[200px] max-h-72 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1 shadow-xl">
            <button
              onClick={() => onChange(new Set())}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--surface)]"
            >
              <span className={cx("h-4 w-4 rounded border flex items-center justify-center", isAll ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)]")}>
                {isAll && <Check size={11} className="text-black" />}
              </span>
              {allLabel}
            </button>
            {options.map((o) => {
              const checked = !isAll && selected.has(o.value);
              return (
                <button
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-[var(--surface)]"
                >
                  <span className={cx("h-4 w-4 rounded border flex items-center justify-center shrink-0", checked ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)]")}>
                    {checked && <Check size={11} className="text-black" />}
                  </span>
                  <span className="truncate text-left">{o.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Helper: does a row's value pass a multi-select filter? Empty set = all.
export function passesFilter(selected: Set<string>, value: string): boolean {
  return selected.size === 0 || selected.has(value);
}

export function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-full px-3 py-1 text-xs font-medium capitalize border transition-colors",
            value === o.value
              ? "bg-[var(--accent)] text-black border-[var(--accent)]"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
