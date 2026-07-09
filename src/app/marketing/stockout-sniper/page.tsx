"use client";

import { useState } from "react";
import { Crosshair, Target } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, Pills, IconTile, ProgressBar } from "@/components/ui";
import { formatINR, cx } from "@/lib/format";
import { allStockouts, COMPETITOR_STORES } from "@/lib/data";

export default function StockoutSniperPage() {
  const [store, setStore] = useState<string>("All");
  const stockouts = allStockouts().filter((s) => store === "All" || s.store === store);
  const freshWindows = allStockouts().filter((s) => (s.product.outOfStockDays ?? 0) <= 5).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Competitor SKUs out of stock" value={`${allStockouts().length}`} tone="danger" />
        <StatCard label="Fresh windows (≤5 days)" value={`${freshWindows}`} tone="ok" />
        <StatCard label="Stores watched" value={`${COMPETITOR_STORES.length}`} />
        <StatCard label="Avg days out" value={`${Math.round(allStockouts().reduce((s, r) => s + (r.product.outOfStockDays ?? 0), 0) / allStockouts().length)}d`} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardHeader title="Stockout Sniper" subtitle="When a competitor's product runs dry, their demand has nowhere to go but you — run a comparison ad against these while the window is open" />
          <Pills
            options={[{ value: "All", label: "All stores" }, ...COMPETITOR_STORES.map((s) => ({ value: s.name, label: s.name }))]}
            value={store}
            onChange={setStore}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {stockouts.map((s) => {
            const days = s.product.outOfStockDays ?? 0;
            const fresh = days <= 5;
            return (
              <div key={s.product.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-start gap-3 mb-2">
                  <IconTile icon={<Crosshair size={15} />} tone={fresh ? "ok" : "danger"} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight">{s.product.title}</div>
                    <div className="text-[11px] text-[var(--muted)]">{s.store} · {s.product.category}</div>
                  </div>
                  <Badge tone={fresh ? "positive" : "stockout"}>{fresh ? "fresh window" : "aging"}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                  <span>Out {days}d · last listed at {formatINR(s.product.price)}</span>
                </div>
                <ProgressBar pct={Math.min(100, (days / 21) * 100)} tone={fresh ? "ok" : "danger"} />
                <div className={cx("flex items-center gap-1 text-[11px] mt-2", fresh ? "text-[var(--ok)]" : "text-[var(--muted)]")}>
                  <Target size={11} />
                  {fresh ? "Launch a comparison ad now — window still open" : "Window aging — competitor may restock soon"}
                </div>
              </div>
            );
          })}
          {stockouts.length === 0 && <p className="text-sm text-[var(--muted)] py-6 text-center col-span-full">No competitor stockouts on this filter.</p>}
        </div>
      </Card>
    </div>
  );
}
