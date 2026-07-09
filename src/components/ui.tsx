"use client";

import { cx } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Calendar, Check, ChevronDown, Search } from "lucide-react";
import { ReactNode, useState } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("border border-[var(--border)] bg-[var(--surface)] p-5", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3">
      <div>
        <h3 className="text-[15px] font-medium tracking-tight text-[var(--foreground)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed max-w-2xl">{subtitle}</p>}
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
  caption,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  changePct?: number;
  changeLabel?: string;
  caption?: string;
  icon?: ReactNode;
  tone?: "default" | "danger" | "ok";
}) {
  const positive = (changePct ?? 0) >= 0;
  const valueColor = tone === "danger" ? "text-[var(--danger)]" : tone === "ok" ? "text-[var(--ok)]" : "text-[var(--foreground)]";
  const changeColor = tone === "danger" ? "text-[var(--danger)]" : tone === "ok" ? "text-[var(--ok)]" : positive ? "text-[var(--ok)]" : "text-[var(--danger)]";
  return (
    <div className="border-t border-[var(--ink)] pt-3">
      <div className="flex items-start justify-between gap-2">
        <div className="eyebrow leading-tight">{label}</div>
        {icon && <span className="text-[var(--muted)] shrink-0">{icon}</span>}
      </div>
      <div className={cx("text-[34px] font-normal mt-3 tracking-[-0.035em] tnum leading-none", valueColor)}>{value}</div>
      {changePct !== undefined ? (
        <div className={cx("inline-flex items-center gap-1 mt-3 text-[11px] font-medium tnum", changeColor)}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(changePct).toFixed(1)}% {changeLabel}
        </div>
      ) : caption ? (
        <div className="mt-3 text-[11px] text-[var(--muted)]">{caption}</div>
      ) : null}
    </div>
  );
}

const TONE_OK = "text-[var(--ok)] border-[var(--ok)]/35 bg-[var(--ok)]/8";
const TONE_DANGER = "text-[var(--danger)] border-[var(--danger)]/35 bg-[var(--danger)]/8";
const TONE_WARN = "text-[var(--warning)] border-[var(--warning)]/40 bg-[var(--warning)]/8";
const TONE_ACCENT = "text-[var(--accent)] border-[var(--accent)]/35 bg-[var(--accent-soft)]";
const TONE_NEUTRAL = "text-[var(--muted)] border-[var(--border)] bg-[var(--surface-2)]";

const BADGE_TONES: Record<string, string> = {
  critical: TONE_DANGER,
  low: TONE_WARN,
  healthy: TONE_OK,
  overstock: TONE_WARN,
  "excess-aging": TONE_DANGER,
  surging: TONE_OK,
  stable: TONE_NEUTRAL,
  cooling: TONE_WARN,
  viral: TONE_ACCENT,
  trending: TONE_OK,
  steady: TONE_NEUTRAL,
  underperforming: TONE_DANGER,
  scaling: TONE_OK,
  fatigued: TONE_WARN,
  "paused-recommended": TONE_DANGER,
  performing: TONE_OK,
  decaying: TONE_WARN,
  dead: TONE_DANGER,
  "on-time": TONE_OK,
  delayed: TONE_WARN,
  "at-risk": TONE_DANGER,
  high: TONE_DANGER,
  medium: TONE_WARN,
  "p0 - critical": TONE_DANGER,
  "p1 - high": TONE_WARN,
  "p2 - medium": TONE_WARN,
  crashing: TONE_DANGER,
  deteriorating: TONE_WARN,
  improving: TONE_OK,
  upcoming: TONE_NEUTRAL,
  live: TONE_ACCENT,
  ended: TONE_NEUTRAL,
  positive: TONE_OK,
  negative: TONE_DANGER,
  neutral: TONE_NEUTRAL,
  "new-launch": TONE_ACCENT,
  restocked: TONE_NEUTRAL,
  "price-drop": TONE_OK,
  "price-hike": TONE_WARN,
  stockout: TONE_DANGER,
  fulfilled: TONE_OK,
  processing: TONE_NEUTRAL,
  refunded: TONE_WARN,
  cancelled: TONE_DANGER,
  vip: TONE_ACCENT,
  repeat: TONE_NEUTRAL,
  new: TONE_OK,
};

export function Badge({ tone, children }: { tone: string; children: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
        BADGE_TONES[tone.toLowerCase()] ?? TONE_NEUTRAL
      )}
    >
      {children.includes(" ") ? children : children.replace(/-/g, " ")}
    </span>
  );
}

export function ProgressBar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "danger" | "ok" | "warning" }) {
  const color = tone === "danger" ? "bg-[var(--danger)]" : tone === "ok" ? "bg-[var(--ok)]" : tone === "warning" ? "bg-[var(--warning)]" : "bg-[var(--accent)]";
  return (
    <div className="w-full h-1.5 bg-[var(--surface-3)] overflow-hidden">
      <div className={cx("h-full", color)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function SwatchDot({ color, size = 30 }: { color: string; size?: number }) {
  return (
    <span
      className="rounded-full border border-[var(--border)] shrink-0"
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
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-3)" strokeWidth={stroke} fill="none" />
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
  // Doctrine: square, 1px border, no fill, icon inherits colour.
  const style =
    tone === "danger" ? "border-[var(--danger)]/40 text-[var(--danger)]" : tone === "ok" ? "border-[var(--ok)]/40 text-[var(--ok)]" : tone === "accent" ? "border-[var(--accent)]/50 text-[var(--accent)]" : "border-[var(--ink)] text-[var(--foreground)]";
  return <div className={cx("h-9 w-9 border flex items-center justify-center shrink-0", style)}>{icon}</div>;
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

// Date-range filter: Last 7 / 30 / 90 days presets + a custom from/to picker.
// Self-contained; anchored to a fixed "today" so the prototype stays stable.
const RANGE_TODAY = "2026-07-09";

function isoDaysAgo(days: number): string {
  const d = new Date(RANGE_TODAY + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function DateRangeBar() {
  const PRESETS = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "custom", label: "Custom" },
  ];
  const [preset, setPreset] = useState("30");
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(RANGE_TODAY);

  const effectiveFrom = preset === "custom" ? from : isoDaysAgo(Number(preset));
  const effectiveTo = preset === "custom" ? to : RANGE_TODAY;
  const fmt = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-0 border border-[var(--border)] w-fit">
        {PRESETS.map((p, i) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={cx(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              i > 0 && "border-l border-[var(--border)]",
              preset === p.value ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" ? (
        <div className="flex items-center gap-2 text-xs">
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 outline-none focus:border-[var(--accent)]/50" />
          <span className="text-[var(--muted)]">to</span>
          <input type="date" value={to} min={from} max={RANGE_TODAY} onChange={(e) => setTo(e.target.value)} className="border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 outline-none focus:border-[var(--accent)]/50" />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)]">
          <Calendar size={13} strokeWidth={1.5} />
          {fmt(effectiveFrom)} — {fmt(effectiveTo)}
        </div>
      )}
    </div>
  );
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
  const [query, setQuery] = useState("");
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

  // Show a search box for long option lists (e.g. SKU filters).
  const searchable = options.length > 8;
  const filtered = searchable && query.trim() ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) : options;

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
          <div className="fixed inset-0 z-20" onClick={() => { setOpen(false); setQuery(""); }} />
          <div className="absolute z-30 mt-1 w-full min-w-[220px] max-h-80 overflow-y-auto border border-[var(--border)] bg-[var(--surface)] p-1">
            {searchable && (
              <div className="sticky top-0 bg-[var(--surface)] p-1 pb-1.5">
                <div className="flex items-center gap-2 border border-[var(--border)] px-2.5 py-1.5">
                  <Search size={13} className="text-[var(--muted)] shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${label.toLowerCase()}…`}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => onChange(new Set())}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              <span className={cx("h-4 w-4 rounded border flex items-center justify-center", isAll ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)]")}>
                {isAll && <Check size={11} className="text-white" />}
              </span>
              {allLabel}
            </button>
            {filtered.length === 0 && <div className="px-2.5 py-2 text-xs text-[var(--muted)]">No matches</div>}
            {filtered.map((o) => {
              const checked = !isAll && selected.has(o.value);
              return (
                <button
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-sm hover:bg-[var(--surface-2)]"
                >
                  <span className={cx("h-4 w-4 rounded border flex items-center justify-center shrink-0", checked ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)]")}>
                    {checked && <Check size={11} className="text-white" />}
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
    <div className="flex flex-wrap gap-0 border border-[var(--border)] w-fit">
      {options.map((o, i) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "px-3 py-1.5 text-xs font-medium transition-colors",
            i > 0 && "border-l border-[var(--border)]",
            value === o.value
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Underlined tab bar for in-page sections (Shopify / GA style).
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--border)] mb-6">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cx(
            "flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            value === t.value
              ? "border-[var(--accent)] text-[var(--foreground)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Horizontal labelled bar (device / browser / funnel style).
export function LabelledBar({
  label,
  value,
  pct,
  tone = "accent",
}: {
  label: string;
  value: string;
  pct: number;
  tone?: "accent" | "danger" | "ok" | "warning";
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-[var(--muted)]">{value}</span>
      </div>
      <ProgressBar pct={pct} tone={tone} />
    </div>
  );
}
