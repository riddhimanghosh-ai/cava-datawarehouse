"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, StatCard, Badge, ProgressBar } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import { CHANNELS, Channel, INVENTORY, inventorySummary, PRODUCTS } from "@/lib/data";

const STATUS_ORDER = ["critical", "low", "healthy", "overstock", "excess-aging"] as const;

export default function InventoryPage() {
  const [channelFilter, setChannelFilter] = useState<Channel | "All">("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const summary = inventorySummary();

  const rows = useMemo(() => {
    return INVENTORY.filter((r) => (channelFilter === "All" || r.channel === channelFilter) && (statusFilter === "All" || r.status === statusFilter)).sort(
      (a, b) => a.daysOfCover - b.daysOfCover
    );
  }, [channelFilter, statusFilter]);

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
          <CardHeader title="Channel-SKU inventory ledger" subtitle={`${rows.length} of ${INVENTORY.length} listings`} action={null} />
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <FilterChip label="All channels" active={channelFilter === "All"} onClick={() => setChannelFilter("All")} />
          {CHANNELS.map((c) => (
            <FilterChip key={c} label={c} active={channelFilter === c} onClick={() => setChannelFilter(c)} />
          ))}
          <div className="w-px bg-[var(--border)] mx-1" />
          <FilterChip label="All statuses" active={statusFilter === "All"} onClick={() => setStatusFilter("All")} />
          {STATUS_ORDER.map((s) => (
            <FilterChip key={s} label={s.replace("-", " ")} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">SKU</th>
                <th className="py-2 px-2 font-medium">Channel</th>
                <th className="py-2 px-2 font-medium">On hand</th>
                <th className="py-2 px-2 font-medium">Daily sales</th>
                <th className="py-2 px-2 font-medium">Days of cover</th>
                <th className="py-2 px-2 font-medium">Sell-through</th>
                <th className="py-2 px-2 font-medium">Incoming</th>
                <th className="py-2 px-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.sku}-${r.channel}`} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[11px] text-[var(--muted)]">{r.sku} · {r.warehouse}</div>
                  </td>
                  <td className="py-2.5 px-2 text-[var(--muted)]">{r.channel}</td>
                  <td className="py-2.5 px-2">{formatNumber(r.onHand)}</td>
                  <td className="py-2.5 px-2">{r.avgDailySales}/day</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2 w-28">
                      <span className={cx("w-8 text-right", r.daysOfCover < 12 && "text-[var(--danger)]")}>{r.daysOfCover}d</span>
                      <ProgressBar pct={(r.daysOfCover / 90) * 100} tone={r.daysOfCover < 12 ? "danger" : r.daysOfCover > 60 ? "ok" : "accent"} />
                    </div>
                  </td>
                  <td className="py-2.5 px-2">{r.sellThroughPct}%</td>
                  <td className="py-2.5 px-2 text-[var(--muted)]">{r.incoming > 0 ? `${formatNumber(r.incoming)} in ${r.incomingEta}` : "—"}</td>
                  <td className="py-2.5 px-2">
                    <Badge tone={r.status}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Reorder recommendations" subtitle="Auto-generated from sell-through velocity vs. on-hand cover" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVENTORY.filter((r) => r.status === "critical").slice(0, 6).map((r) => {
            const product = PRODUCTS.find((p) => p.sku === r.sku)!;
            const suggestedQty = Math.round(r.avgDailySales * 30);
            return (
              <div key={`${r.sku}-${r.channel}-reco`} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{r.name}</div>
                  <Badge tone="critical">critical</Badge>
                </div>
                <div className="text-xs text-[var(--muted)] mb-2">{r.channel} · {r.daysOfCover}d cover left · {r.warehouse}</div>
                <div className="text-sm">
                  Order <span className="font-semibold text-[var(--accent)]">{formatNumber(suggestedQty)} units</span> now to avoid stockout before restock lands ({r.incomingEta}) · est. cost {formatINR(suggestedQty * product.cost, true)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-full px-3 py-1 text-xs font-medium capitalize border transition-colors",
        active ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30"
      )}
    >
      {label}
    </button>
  );
}
