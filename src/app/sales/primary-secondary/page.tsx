"use client";

import { useState } from "react";
import { Calendar, Store } from "lucide-react";
import { Card, CardHeader, StatCard, ProgressBar, FilterRow, FilterBox, MultiSelect } from "@/components/ui";
import { formatINR, cx } from "@/lib/format";
import { PRIMARY_SECONDARY, primarySecondarySummary, CHANNELS } from "@/lib/data";

function lakh(v: number) {
  return formatINR(v * 100000, true);
}

const RANGES = [
  { value: "6", label: "Last 6 months" },
  { value: "3", label: "Last 3 months" },
];

export default function PrimarySecondaryPage() {
  const ps = primarySecondarySummary();
  const [range, setRange] = useState("6");
  const [channels, setChannels] = useState<Set<string>>(new Set());

  const rows = PRIMARY_SECONDARY.slice(-Number(range));
  const maxVal = Math.max(...rows.map((r) => Math.max(r.primarySalesLakh, r.secondarySalesLakh)), 1);

  return (
    <div className="space-y-6">
      <FilterRow>
        <FilterBox label="Date range" icon={<Calendar size={12} />} value={range} onChange={setRange} options={RANGES} />
        <MultiSelect label="Channel" icon={<Store size={12} />} options={CHANNELS.map((c) => ({ value: c, label: c }))} selected={channels} onChange={setChannels} />
      </FilterRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Primary sales (this month)" value={lakh(ps.latest.primarySalesLakh)} changePct={ps.primaryGrowthPct} changeLabel="vs last month" />
        <StatCard label="Secondary sales (this month)" value={lakh(ps.latest.secondarySalesLakh)} changePct={ps.secondaryGrowthPct} changeLabel="vs last month" />
        <StatCard label="Primary − Secondary gap" value={lakh(ps.gapLakh)} tone={ps.gapLakh > 15 ? "danger" : "ok"} />
        <StatCard label="Primary delta MoM" value={lakh(ps.primaryDeltaLakh)} changePct={ps.primaryGrowthPct} changeLabel="growth" />
      </div>

      <Card>
        <CardHeader
          title="Primary vs. secondary sales"
          subtitle="Primary = brand billing into channels (sell-in). Secondary = actual consumer sell-through. A widening gap means stock is piling up downstream."
        />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Month</th>
                <th className="py-2 px-2 font-medium">Primary (sell-in)</th>
                <th className="py-2 px-2 font-medium">Secondary (sell-through)</th>
                <th className="py-2 px-2 font-medium">Gap</th>
                <th className="py-2 px-2 font-medium w-48">Primary vs secondary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const gap = Math.round((r.primarySalesLakh - r.secondarySalesLakh) * 10) / 10;
                return (
                  <tr key={r.month} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                    <td className="py-2.5 px-5 font-medium">{r.month}</td>
                    <td className="py-2.5 px-2">{lakh(r.primarySalesLakh)}</td>
                    <td className="py-2.5 px-2">{lakh(r.secondarySalesLakh)}</td>
                    <td className={cx("py-2.5 px-2 font-medium", gap > 12 ? "text-[var(--danger)]" : "text-[var(--muted)]")}>{lakh(gap)}</td>
                    <td className="py-2.5 px-2">
                      <div className="space-y-1">
                        <ProgressBar pct={(r.primarySalesLakh / maxVal) * 100} tone="accent" />
                        <ProgressBar pct={(r.secondarySalesLakh / maxVal) * 100} tone="ok" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px] text-[var(--muted)]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[var(--accent)]" /> Primary (sell-in)</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[var(--ok)]" /> Secondary (sell-through)</span>
        </div>
      </Card>
    </div>
  );
}
