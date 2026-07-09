"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, StatCard, Pills, ProgressBar, Badge , DateRangeBar } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import { SEARCH_TERMS, searchGapSummary } from "@/lib/data";

export default function SearchGapPage() {
  const summary = searchGapSummary();
  const [view, setView] = useState<"gaps" | "all">("gaps");

  const rows = useMemo(() => {
    const list = view === "gaps" ? SEARCH_TERMS.filter((t) => !t.matched) : [...SEARCH_TERMS];
    return list.sort((a, b) => b.count - a.count);
  }, [view]);

  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <DateRangeBar />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
        <StatCard label="Total Searches" value={formatNumber(summary.totalSearches)} caption="in the selected period" />
        <StatCard label="Unique Terms" value={formatNumber(summary.uniqueTerms)} caption="distinct search queries" />
        <StatCard label="Unmet Gaps" value={formatNumber(summary.unmetGaps)} caption="searches with no product match" tone="danger" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardHeader
            title={view === "gaps" ? "Searches with no matching product" : "All on-site searches"}
            subtitle="High-volume gaps = demand you're leaving on the table — a free product roadmap"
          />
          <Pills
            options={[
              { value: "gaps", label: `Gaps only (${summary.unmetGaps})` },
              { value: "all", label: "All searches" },
            ]}
            value={view}
            onChange={(v) => setView(v as "gaps" | "all")}
          />
        </div>

        <div className="space-y-2.5">
          {rows.map((r, i) => {
            const pct = (r.count / summary.totalSearches) * 100;
            return (
              <div key={r.term} className="flex items-center gap-4">
                <span className="w-6 text-right text-xs text-[var(--muted)] tnum shrink-0">{i + 1}</span>
                <div className="w-44 shrink-0">
                  <div className="text-sm font-medium truncate">{r.term}</div>
                  <div className="mt-0.5">
                    {r.matched ? <Badge tone="ok">matched</Badge> : <Badge tone="danger">no match</Badge>}
                  </div>
                </div>
                <div className="flex-1">
                  <ProgressBar pct={(r.count / maxCount) * 100} tone={r.matched ? "ok" : "danger"} />
                </div>
                <span className="w-8 text-right text-sm font-medium tnum shrink-0">{r.count}</span>
                <span className="w-12 text-right text-xs text-[var(--muted)] tnum shrink-0">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
