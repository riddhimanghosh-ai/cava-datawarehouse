"use client";

import { useMemo, useState } from "react";
import { Boxes, Calendar, Layers, PackageCheck, RefreshCw, Store, TrendingDown } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, ProgressBar, Pills, Tabs, MultiSelect, passesFilter, FilterRow, FilterBox, SwatchDot, IconTile } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import { CHANNELS, INVENTORY, inventorySummary, PRODUCTS } from "@/lib/data";

const STATUS_TABS: { value: "attention" | "All"; label: string }[] = [
  { value: "attention", label: "Needs attention" },
  { value: "All", label: "All listings" },
];

type Tab = "inventory" | "reorder";
const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "inventory", label: "Inventory", icon: <Boxes size={15} /> },
  { value: "reorder", label: "Reorder recommendations", icon: <RefreshCw size={15} /> },
];

const DATE_RANGES = [{ value: "today", label: "As of today" }, { value: "7", label: "As of last week" }];

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("inventory");
  const [range, setRange] = useState("today");
  const [channelFilter, setChannelFilter] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  const [skuFilter, setSkuFilter] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"attention" | "All">("attention");
  const summary = inventorySummary();

  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
  const skuOptions = PRODUCTS.filter((p) => passesFilter(categoryFilter, p.category));

  const rows = useMemo(() => {
    return INVENTORY.filter((r) => {
      if (!passesFilter(channelFilter, r.channel)) return false;
      if (!passesFilter(categoryFilter, r.category)) return false;
      if (!passesFilter(skuFilter, r.sku)) return false;
      if (view === "attention") return r.status !== "healthy";
      return true;
    }).sort((a, b) => a.daysOfCover - b.daysOfCover);
  }, [channelFilter, categoryFilter, skuFilter, view]);

  return (
    <div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "inventory" && (
      <div className="space-y-6">
      <FilterRow>
        <FilterBox label="Date" icon={<Calendar size={12} />} value={range} onChange={setRange} options={DATE_RANGES} />
        <MultiSelect label="Channel" icon={<Store size={12} />} selected={channelFilter} onChange={setChannelFilter} options={CHANNELS.map((c) => ({ value: c, label: c }))} />
        <MultiSelect label="Category" icon={<Layers size={12} />} selected={categoryFilter} onChange={(n) => { setCategoryFilter(n); setSkuFilter(new Set()); }} options={categories.map((c) => ({ value: c, label: c }))} />
        <MultiSelect label="SKU Name" icon={<Boxes size={12} />} selected={skuFilter} onChange={setSkuFilter} options={skuOptions.map((p) => ({ value: p.sku, label: p.name }))} />
      </FilterRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
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

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <PackageCheck className="text-[var(--ok)]" size={28} />
            <p className="text-sm text-[var(--muted)]">Nothing needs attention on this filter — all listings are healthy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[920px]">
              <thead>
                <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                  <th className="py-2 px-5 font-medium">SKU</th>
                  <th className="py-2 px-2 font-medium">Channel</th>
                  <th className="py-2 px-2 font-medium">Status</th>
                  <th className="py-2 px-2 font-medium w-40">Days of cover</th>
                  <th className="py-2 px-2 font-medium text-right">On hand</th>
                  <th className="py-2 px-2 font-medium text-right">Daily sales</th>
                  <th className="py-2 px-2 font-medium text-right">Sell-through</th>
                  <th className="py-2 px-2 font-medium">Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const product = PRODUCTS.find((p) => p.sku === r.sku)!;
                  const coverPct = Math.min(100, (r.daysOfCover / 90) * 100);
                  const tone = r.daysOfCover < 12 ? "danger" : r.daysOfCover > 60 ? "ok" : "accent";
                  return (
                    <tr key={`${r.sku}-${r.channel}`} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                      <td className="py-2.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <SwatchDot color={product.heroColor} size={22} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{r.name}</div>
                            <div className="text-[11px] text-[var(--muted)]">{r.sku} · {r.warehouse.split(" ")[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-[var(--muted)]">{r.channel}</td>
                      <td className="py-2.5 px-2"><Badge tone={r.status}>{r.status}</Badge></td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <span className={cx("w-10 text-right", r.daysOfCover < 12 && "text-[var(--danger)] font-medium")}>{r.daysOfCover}d</span>
                          <ProgressBar pct={coverPct} tone={tone} />
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right">{formatNumber(r.onHand)}</td>
                      <td className="py-2.5 px-2 text-right">{r.avgDailySales}/day</td>
                      <td className="py-2.5 px-2 text-right">{r.sellThroughPct}%</td>
                      <td className="py-2.5 px-2 text-[var(--muted)] text-xs">
                        {r.incoming > 0 ? `${formatNumber(r.incoming)} in ${r.incomingEta}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </div>
      )}

      {tab === "reorder" && (
      <Card>
        <CardHeader title="Reorder recommendations" subtitle="Auto-generated from sell-through velocity vs. on-hand cover" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">SKU</th>
                <th className="py-2 px-2 font-medium">Channel</th>
                <th className="py-2 px-2 font-medium text-right">Cover left</th>
                <th className="py-2 px-2 font-medium text-right">Suggested qty</th>
                <th className="py-2 px-2 font-medium text-right">Est. cost</th>
                <th className="py-2 px-2 font-medium">Restock ETA</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.filter((r) => r.status === "critical").slice(0, 8).map((r) => {
                const product = PRODUCTS.find((p) => p.sku === r.sku)!;
                const suggestedQty = Math.round(r.avgDailySales * 30);
                return (
                  <tr key={`${r.sku}-${r.channel}-reco`} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                    <td className="py-2.5 px-5">
                      <span className="flex items-center gap-2">
                        <IconTile icon={<TrendingDown size={14} />} tone="danger" />
                        <span className="font-medium">{r.name}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[var(--muted)]">{r.channel}</td>
                    <td className="py-2.5 px-2 text-right text-[var(--danger)] font-medium">{r.daysOfCover}d</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-[var(--accent)]">{formatNumber(suggestedQty)} units</td>
                    <td className="py-2.5 px-2 text-right">{formatINR(suggestedQty * product.cost, true)}</td>
                    <td className="py-2.5 px-2 text-[var(--muted)]">{r.incoming > 0 ? `lands in ${r.incomingEta}` : "not scheduled"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}
