"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, Pills, IconTile } from "@/components/ui";
import { formatINR } from "@/lib/format";
import { allNewLaunches, COMPETITOR_STORES } from "@/lib/data";

export default function NewLaunchesPage() {
  const [store, setStore] = useState<string>("All");
  const launches = allNewLaunches(21).filter((l) => store === "All" || l.store === store);
  const last7 = allNewLaunches(7).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New launches (last 7 days)" value={`${last7}`} tone="ok" />
        <StatCard label="New launches (last 21 days)" value={`${allNewLaunches(21).length}`} />
        <StatCard label="Stores watched" value={`${COMPETITOR_STORES.length}`} />
        <StatCard label="Already in stock" value={`${launches.filter((l) => l.product.stock === "in-stock").length}`} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardHeader title="New Launch Detector" subtitle="Products that appeared since the last scan, by published_at — your decision window before their organic reach kicks in" />
          <Pills
            options={[{ value: "All", label: "All stores" }, ...COMPETITOR_STORES.map((s) => ({ value: s.name, label: s.name }))]}
            value={store}
            onChange={setStore}
          />
        </div>
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
