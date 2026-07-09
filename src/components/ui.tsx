import { cx } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

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
};

export function Badge({ tone, children }: { tone: string; children: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize whitespace-nowrap",
        BADGE_TONES[tone] ?? "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]"
      )}
    >
      {children.replace(/-/g, " ")}
    </span>
  );
}

export function ProgressBar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "danger" | "ok" }) {
  const color = tone === "danger" ? "bg-[var(--danger)]" : tone === "ok" ? "bg-[var(--ok)]" : "bg-[var(--accent)]";
  return (
    <div className="w-full h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
      <div className={cx("h-full rounded-full", color)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}
