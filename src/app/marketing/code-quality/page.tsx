"use client";

import { useMemo, useState } from "react";
import { Card, Badge, ProgressBar , DateRangeBar } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import { CODE_QUALITY, codeQualityCounts, CodeClass } from "@/lib/data";

type Filter = "all" | CodeClass;

const CLASS_TONE: Record<CodeClass, string> = {
  "Growth Driver": "improving",
  "Deal Hunters": "critical",
  Mixed: "medium",
  "Low Volume": "neutral",
};

export default function CodeQualityPage() {
  const counts = codeQualityCounts();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () => (filter === "all" ? CODE_QUALITY : CODE_QUALITY.filter((c) => c.klass === filter)).slice().sort((a, b) => b.orders - a.orders),
    [filter]
  );

  const PILLS: { value: Filter; label: string }[] = [
    { value: "all", label: `All Codes (${counts.all})` },
    { value: "Growth Driver", label: `Growth Driver (${counts["Growth Driver"]})` },
    { value: "Deal Hunters", label: `Deal Hunters (${counts["Deal Hunters"]})` },
    { value: "Mixed", label: `Mixed (${counts.Mixed})` },
    { value: "Low Volume", label: `Low Volume (${counts["Low Volume"]})` },
  ];

  return (
    <div className="space-y-6">
      <DateRangeBar />
      <div className="flex flex-wrap gap-2">
        {PILLS.map((p) => (
          <button
            key={p.value}
            onClick={() => setFilter(p.value)}
            className={cx(
              "border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === p.value ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {rows.map((c) => {
          const scoreTone = c.dealHunterScore >= 70 ? "danger" : c.dealHunterScore >= 50 ? "warning" : "ok";
          const lowVol = c.klass === "Low Volume";
          return (
            <Card key={c.code} className={cx("border-l-2", c.klass === "Deal Hunters" ? "border-l-[var(--danger)]" : c.klass === "Growth Driver" ? "border-l-[var(--ok)]" : c.klass === "Mixed" ? "border-l-[var(--warning)]" : "border-l-[var(--border)]")}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[15px] font-medium tracking-tight">{c.code}</span>
                  <Badge tone={CLASS_TONE[c.klass]}>{c.klass}</Badge>
                </div>
                <div className="text-right w-44">
                  <div className="eyebrow mb-1">Deal-Hunter Score</div>
                  <div className="flex items-center gap-2">
                    <ProgressBar pct={c.dealHunterScore} tone={scoreTone} />
                    <span className="text-sm font-medium tnum w-14 text-right">{c.dealHunterScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
                <Metric label="Orders" value={formatNumber(c.orders)} />
                <Metric label="Revenue" value={formatINR(c.revenue, true)} />
                <Metric label="AOV" value={formatINR(c.aov)} />
                <Metric label="Discount Given" value={formatINR(c.discountGiven, true)} />
                <Metric label="New Cust. Share" value={`${c.newCustSharePct}%`} tone="warning" />
                <Metric label="Repeat Share" value={`${c.repeatSharePct}%`} tone={c.repeatSharePct >= 50 ? "ok" : "default"} />
              </div>

              <div className={cx("mt-4 px-3 py-2.5 text-xs leading-relaxed", lowVol ? "bg-[var(--surface-2)] text-[var(--muted)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]")}>
                {c.insight}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "ok" | "warning" }) {
  const color = tone === "ok" ? "text-[var(--ok)]" : tone === "warning" ? "text-[var(--warning)]" : "text-[var(--foreground)]";
  return (
    <div>
      <div className="text-lg font-medium tnum leading-none">
        <span className={color}>{value}</span>
      </div>
      <div className="eyebrow mt-1.5">{label}</div>
    </div>
  );
}
