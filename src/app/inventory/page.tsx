"use client";

import { useMemo, useState } from "react";
import { PackageCheck, TrendingDown } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, ProgressBar, Pills, SwatchDot, IconTile } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import { CHANNELS, Channel, INVENTORY, InventoryRow, inventorySummary, PRODUCTS } from "@/lib/data";

const STATUS_TABS: { value: "attention" | "All"; label: string }[] = [
  { value: "attention", label: "Needs attention" },
  { value: "All", label: "All listings" },
];

export default function InventoryPage() {
  const [channelFilter, setChannelFilter] = useState<Channel | "All">("All");
  const [view, setView] = useState<"attention" | "All">("attention");
  const summary = inventorySummary();

  const rows = useMemo(() => {
    return INVENTORY.filter((r) => {
      if (channelFilter !== "All" && r.channel !== channelFilter) return false;
      if (view === "attention") return r.status !== "healthy";
      return true;
    }).sort((a, b) => a.daysOfCover - b.daysOfCover);
  }, [channelFilter, view]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Critical stockouts" value={`${summary.critical} listings`} tone="danger" />
        <StatCard label="Low stock" value={`${summary.low} listings`} />
        <StatCard label="Overstock + aging" value={`${summary.overstock + summary.excess} listings`} />
        <StatCard label="Capital stuck in excess stock" value={formatINR(summary.capitalStuck, true)} tone="danger" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardHeader title="Inventory across channels" subtitle={`Showing ${rows.length} of ${INVENTORY.length} listings`} />
          <Pills options={STATUS_TABS} value={view} onChange={setView} />
        </div>
        <div className="mb-5">
          <Pills
            options={[{ value: "All" as const, label: "All channels" }, ...CHANNELS.map((c) => ({ value: c, label: c }))]}
            value={channelFilter}
            onChange={setChannelFilter}
          />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <PackageCheck className="text-[var(--ok)]" size={28} />
            <p className="text-sm text-[var(--muted)]">Nothing needs attention on this filter — all listings are healthy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {rows.map((r) => (
              <InventoryCard key={`${r.sku}-${r.channel}`} row={r} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Reorder recommendations" subtitle="Auto-generated from sell-through velocity vs. on-hand cover" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVENTORY.filter((r) => r.status === "critical").slice(0, 6).map((r) => {
            const product = PRODUCTS.find((p) => p.sku === r.sku)!;
            const suggestedQty = Math.round(r.avgDailySales * 30);
            return (
              <div key={`${r.sku}-${r.channel}-reco`} className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <IconTile icon={<TrendingDown size={16} />} tone="danger" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-sm">{r.name}</div>
                    <Badge tone="critical">critical</Badge>
                  </div>
                  <div className="text-xs text-[var(--muted)] mb-2">{r.channel} · {r.daysOfCover}d cover left · {r.warehouse}</div>
                  <div className="text-sm">
                    Order <span className="font-semibold text-[var(--accent)]">{formatNumber(suggestedQty)} units</span> now to avoid stockout before restock lands ({r.incomingEta}) · est. cost {formatINR(suggestedQty * product.cost, true)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function InventoryCard({ row }: { row: InventoryRow }) {
  const product = PRODUCTS.find((p) => p.sku === row.sku)!;
  const coverPct = Math.min(100, (row.daysOfCover / 90) * 100);
  const tone = row.daysOfCover < 12 ? "danger" : row.daysOfCover > 60 ? "ok" : "accent";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-start gap-3 mb-3">
        <SwatchDot color={product.heroColor} />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm leading-tight truncate">{row.name}</div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">{row.channel} · {row.sku}</div>
        </div>
        <Badge tone={row.status}>{row.status}</Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
        <span className={cx(row.daysOfCover < 12 && "text-[var(--danger)] font-medium")}>{row.daysOfCover}d of cover</span>
        <span>{formatNumber(row.onHand)} on hand · {row.avgDailySales}/day</span>
      </div>
      <ProgressBar pct={coverPct} tone={tone} />

      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-[var(--muted)]">
          {row.status === "critical" || row.status === "low" ? (
            row.incoming > 0 ? `${formatNumber(row.incoming)} incoming in ${row.incomingEta}` : "No restock scheduled"
          ) : (
            `${row.sellThroughPct}% sell-through`
          )}
        </div>
        <span className="text-[var(--muted)]">{row.warehouse.split(" ")[0]}</span>
      </div>
    </div>
  );
}
