"use client";

import { useState } from "react";
import { Layers, Sparkles, Store } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, MultiSelect, passesFilter, FilterRow, FilterBox, IconTile , DateRangeBar } from "@/components/ui";
import { formatINR } from "@/lib/format";
import { allNewLaunches, COMPETITOR_STORES } from "@/lib/data";

const HORIZONS = [
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
];

export default function NewLaunchesPage() {
  const [store, setStore] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [horizon, setHorizon] = useState("30");
  const categories = Array.from(new Set(COMPETITOR_STORES.flatMap((s) => s.products.map((p) => p.category))));
  const launches = allNewLaunches(Number(horizon))
    .filter((l) => passesFilter(store, l.store))
    .filter((l) => passesFilter(category, l.product.category));
  const last7 = allNewLaunches(7).length;

  return (
    <div className="space-y-6">
      <DateRangeBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New launches (last 7 days)" value={`${last7}`} tone="ok" />
        <StatCard label={`New launches (last ${horizon} days)`} value={`${allNewLaunches(Number(horizon)).length}`} />
        <StatCard label="Stores watched" value={`${COMPETITOR_STORES.length}`} />
        <StatCard label="Already in stock" value={`${launches.filter((l) => l.product.stock === "in-stock").length}`} />
      </div>

      <Card>
        <FilterRow>
          <FilterBox label="Window" value={horizon} onChange={setHorizon} options={HORIZONS} />
          <MultiSelect label="Store" icon={<Store size={12} />} selected={store} onChange={setStore} options={COMPETITOR_STORES.map((s) => ({ value: s.name, label: s.name }))} />
          <MultiSelect label="Category" icon={<Layers size={12} />} selected={category} onChange={setCategory} options={categories.map((c) => ({ value: c, label: c }))} />
        </FilterRow>
        <CardHeader title="New Launch Detector" subtitle="Products that appeared since the last scan, by published_at — your decision window before their organic reach kicks in" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {launches.map((l) => (
            <div key={l.product.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-start gap-3 mb-2">
                <IconTile icon={<Sparkles size={15} />} tone="accent" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">{l.product.title}</div>
                  <div className="text-[11px] text-[var(--muted)]">{l.store} · {l.product.category}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold">{formatINR(l.product.price)}</span>
                <div className="flex items-center gap-2">
                  <Badge tone={l.product.stock === "in-stock" ? "positive" : "stockout"}>{l.product.stock === "in-stock" ? "in stock" : "listed, OOS"}</Badge>
                  <span className="text-[11px] text-[var(--muted)]">{l.product.publishedDaysAgo}d ago</span>
                </div>
              </div>
            </div>
          ))}
          {launches.length === 0 && <p className="text-sm text-[var(--muted)] py-6 text-center col-span-full">No new launches on this filter.</p>}
        </div>
      </Card>
    </div>
  );
}
