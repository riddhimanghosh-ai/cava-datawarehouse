"use client";

import { useState } from "react";
import { Store, Tag } from "lucide-react";
import { Card, CardHeader, FilterBox, FilterRow, StatCard } from "@/components/ui";
import { formatINR, cx } from "@/lib/format";
import { Channel, PRICING_PLATFORMS, PRICING_TRACKED_SKUS, pricingSeries } from "@/lib/data";

export default function PricingPage() {
  const [metric, setMetric] = useState<"MRP" | "SP">("SP");
  const [platform, setPlatform] = useState<Channel>("Zepto");

  const rows = pricingSeries(metric, platform);
  const first = rows[0].values;
  const last = rows[rows.length - 1].values;

  const cavaSkus = PRICING_TRACKED_SKUS.filter((s) => !s.isCompetitor);
  const competitorSkus = PRICING_TRACKED_SKUS.filter((s) => s.isCompetitor);

  const biggestMoveSku = PRICING_TRACKED_SKUS.map((s) => ({ sku: s, changePct: ((last[s.code] - first[s.code]) / first[s.code]) * 100 })).sort(
    (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)
  )[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tracked SKUs" value={`${PRICING_TRACKED_SKUS.length}`} />
        <StatCard label="Own SKUs" value={`${cavaSkus.length}`} />
        <StatCard label="Competitor reference SKUs" value={`${competitorSkus.length}`} />
        <StatCard label={`Biggest 14d move — ${biggestMoveSku.sku.name.split(" ").slice(0, 2).join(" ")}`} value={`${biggestMoveSku.changePct >= 0 ? "+" : ""}${biggestMoveSku.changePct.toFixed(1)}%`} tone={biggestMoveSku.changePct < 0 ? "danger" : "ok"} />
      </div>

      <Card>
        <FilterRow>
          <FilterBox
            label="Metric"
            icon={<Tag size={12} />}
            value={metric}
            onChange={(v) => setMetric(v as "MRP" | "SP")}
            options={[
              { value: "MRP", label: "MRP (Maximum Retail Price)" },
              { value: "SP", label: "SP (Selling Price)" },
            ]}
          />
          <FilterBox
            label="Platform"
            icon={<Store size={12} />}
            value={platform}
            onChange={(v) => setPlatform(v as Channel)}
            options={PRICING_PLATFORMS.map((p) => ({ value: p, label: p }))}
          />
        </FilterRow>

        <CardHeader
          title={`${platform} — Price Tracker`}
          subtitle={`${metric === "MRP" ? "MRP (Maximum Retail Price)" : "SP (Selling Price)"} · own SKUs vs. competitor reference SKUs, last 14 days`}
        />

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium sticky left-0 bg-[var(--surface)]">Date</th>
                {cavaSkus.map((s) => (
                  <th key={s.code} className="py-2 px-2 font-medium whitespace-nowrap">{s.code}</th>
                ))}
                {competitorSkus.map((s) => (
                  <th key={s.code} className="py-2 px-2 font-medium whitespace-nowrap text-[var(--muted)]/70">{s.code}</th>
                ))}
              </tr>
              <tr className="text-left text-[10px] text-[var(--muted)] border-b border-[var(--border)]">
                <th className="py-1 px-5"></th>
                {cavaSkus.map((s) => (
                  <th key={s.code} className="py-1 px-2 font-normal truncate max-w-[110px]">{s.name}</th>
                ))}
                {competitorSkus.map((s) => (
                  <th key={s.code} className="py-1 px-2 font-normal truncate max-w-[110px] italic">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2 px-5 sticky left-0 bg-[var(--background)] font-medium">
                    {new Date(row.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  {cavaSkus.map((s) => (
                    <td key={s.code} className="py-2 px-2">{formatINR(row.values[s.code])}</td>
                  ))}
                  {competitorSkus.map((s) => (
                    <td key={s.code} className="py-2 px-2 text-[var(--muted)]">{formatINR(row.values[s.code])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="14-day price movement" subtitle="Change from first to last tracked day, this platform & metric" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {PRICING_TRACKED_SKUS.map((s) => {
            const changePct = ((last[s.code] - first[s.code]) / first[s.code]) * 100;
            return (
              <div key={s.code} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={cx("text-sm font-medium truncate", s.isCompetitor && "italic text-[var(--muted)]")}>{s.name}</span>
                  {s.isCompetitor && <span className="text-[10px] text-[var(--muted)] shrink-0 ml-2">competitor</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{formatINR(last[s.code])}</span>
                  <span className={cx("text-xs font-semibold", changePct <= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>
                    {changePct >= 0 ? "+" : ""}{changePct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
