"use client";

import { useState } from "react";
import { Layers, RefreshCw, Shirt, Store, Target } from "lucide-react";
import { Card, MultiSelect, passesFilter, FilterRow } from "@/components/ui";
import { formatINR, cx } from "@/lib/format";
import { allStockouts, COMPETITOR_STORES } from "@/lib/data";

export default function StockoutSniperPage() {
  const [store, setStore] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<Set<string>>(new Set());
  const categories = Array.from(new Set(COMPETITOR_STORES.flatMap((s) => s.products.map((p) => p.category))));

  const stockouts = allStockouts()
    .filter((s) => passesFilter(store, s.store))
    .filter((s) => passesFilter(category, s.product.category));

  const productsWatched = COMPETITOR_STORES.reduce((n, s) => n + s.products.length, 0);
  const storesWatched = store.size === 0 ? COMPETITOR_STORES.length : store.size;
  const lastScan = Math.min(...COMPETITOR_STORES.map((s) => s.lastScannedDaysAgo));

  return (
    <div className="space-y-6">
      <FilterRow>
        <MultiSelect label="Store" icon={<Store size={12} />} selected={store} onChange={setStore} options={COMPETITOR_STORES.map((s) => ({ value: s.name, label: s.name }))} />
        <MultiSelect label="Category" icon={<Layers size={12} />} selected={category} onChange={setCategory} options={categories.map((c) => ({ value: c, label: c }))} />
      </FilterRow>

      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[var(--muted)]">
          <span className="text-[var(--foreground)] font-semibold">{productsWatched}</span> products watched across{" "}
          <span className="text-[var(--foreground)] font-semibold">{storesWatched}</span> store{storesWatched > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">Last scan {lastScan}d ago</span>
          <button className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] text-white font-medium px-3.5 py-2 text-sm">
            <RefreshCw size={13} /> Scan all stores
          </button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Target size={16} className="text-[var(--accent)]" />
          <h3 className="text-base font-semibold">{stockouts.length} Competitor Stockouts — Open Windows</h3>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-medium mb-4">
          Their demand has nowhere to go. Aim your ads at these products now.
        </p>

        <div className="space-y-2.5">
          {stockouts.map((s) => {
            const days = s.product.outOfStockDays ?? 0;
            const fresh = days <= 5;
            return (
              <div
                key={s.product.id}
                className="flex items-center gap-4 border border-[var(--warning)]/25 bg-[var(--warning)]/[0.05] px-4 py-3"
              >
                <div className="h-12 w-12 shrink-0 flex items-center justify-center border border-[var(--ink)] text-[var(--foreground)]">
                  <Shirt size={18} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight truncate">{s.product.title}</div>
                  <div className="text-[12px] mt-0.5">
                    <span className="text-[var(--warning)] font-medium">{s.store}</span>
                    <span className="text-[var(--muted)]"> · currently out of stock</span>
                    <span className="text-[var(--muted)]"> · {days}d</span>
                    {fresh && <span className="text-[var(--ok)] font-medium"> · fresh window</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold">{formatINR(s.product.price)}</div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--warning)]">Sold Out</div>
                </div>
              </div>
            );
          })}
          {stockouts.length === 0 && (
            <p className="text-sm text-[var(--muted)] py-6 text-center">No competitor stockouts on this filter.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
