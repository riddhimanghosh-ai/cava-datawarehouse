"use client";

import { useState } from "react";
import { RefreshCw, Sparkles, RotateCw, ArrowDown, ArrowUp, PackageX } from "lucide-react";
import { Card, StatCard, Badge, IconTile } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import { COMPETITOR_STORES, CompetitorStore, RecentChange, storeStats } from "@/lib/data";

const CHANGE_ICON: Record<RecentChange["type"], React.ReactNode> = {
  "new-launch": <Sparkles size={13} />,
  restocked: <RotateCw size={13} />,
  "price-drop": <ArrowDown size={13} />,
  "price-hike": <ArrowUp size={13} />,
  stockout: <PackageX size={13} />,
};

export default function PriceTrackerPage() {
  const totalTracked = COMPETITOR_STORES.reduce((s, st) => s + st.products.length, 0);
  const totalOnSale = COMPETITOR_STORES.reduce((s, st) => s + storeStats(st).onSale, 0);
  const totalSoldOut = COMPETITOR_STORES.reduce((s, st) => s + storeStats(st).soldOut, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Competitor stores tracked" value={`${COMPETITOR_STORES.length}`} />
        <StatCard label="Products in watch list" value={formatNumber(totalTracked)} />
        <StatCard label="Currently on sale" value={formatNumber(totalOnSale)} tone="ok" />
        <StatCard label="Currently sold out" value={formatNumber(totalSoldOut)} tone="danger" />
      </div>

      <Card>
        <div className="flex flex-wrap gap-3">
          <input
            disabled
            placeholder="https://competitor-store.com"
            className="flex-1 min-w-[240px] rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--muted)]"
          />
          <input
            disabled
            placeholder="Label (optional)"
            className="w-40 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--muted)]"
          />
          <button className="rounded-xl bg-[var(--accent)] text-white font-medium px-4 py-2.5 text-sm">+ Track Store</button>
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-2">
          Pulls the store&apos;s live catalog from its public <code className="text-[var(--foreground)]">/products.json</code> — title, price, compare-at & stock. Each rescan diffs against the last snapshot.
        </p>
      </Card>

      {COMPETITOR_STORES.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}

function StoreCard({ store }: { store: CompetitorStore }) {
  const [expanded, setExpanded] = useState(false);
  const stats = storeStats(store);
  const shown = expanded ? store.recentChanges : store.recentChanges.slice(0, 7);

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold">{store.name}</h3>
          <div className="text-xs text-[var(--muted)]">{store.url}</div>
          <div className="text-[11px] text-[var(--muted)] mt-0.5">Last scanned: {store.lastScannedDaysAgo}d ago</div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
          <RefreshCw size={12} /> Rescan
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-full bg-[var(--surface-2)] border border-[var(--border)] px-3 py-1 text-xs"><span className="text-[var(--foreground)] font-medium">{stats.productCount}</span> <span className="text-[var(--muted)]">products</span></span>
        <span className="rounded-full bg-[var(--surface-2)] border border-[var(--border)] px-3 py-1 text-xs"><span className="text-[var(--muted)]">Avg</span> <span className="text-[var(--foreground)] font-medium">{formatINR(stats.avgPrice)}</span></span>
        <span className="rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/30 px-3 py-1 text-xs text-[var(--warning)] font-medium">{stats.onSale} on sale</span>
        <span className="rounded-full bg-[var(--danger)]/10 border border-[var(--danger)]/30 px-3 py-1 text-xs text-[var(--danger)] font-medium">{stats.soldOut} sold out</span>
      </div>

      <div className="text-[11px] text-[var(--muted)] uppercase tracking-wide mb-2">Recent changes ({store.recentChanges.length})</div>
      <div className="space-y-1.5">
        {shown.map((c, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm">
            <span className={cx(
              "flex items-center gap-1 shrink-0 w-28 text-[11px] font-medium uppercase",
              c.type === "new-launch" ? "text-[var(--accent)]" : c.type === "restocked" ? "text-[var(--muted)]" : c.type === "price-drop" ? "text-[var(--ok)]" : c.type === "price-hike" ? "text-[var(--warning)]" : "text-[var(--danger)]"
            )}>
              {CHANGE_ICON[c.type]}
              {c.type.replace("-", " ")}
            </span>
            <span className="flex-1 min-w-0 truncate">{c.productTitle}</span>
            {c.priceDelta !== null && (
              <span className={cx("text-[11px]", c.priceDelta < 0 ? "text-[var(--ok)]" : "text-[var(--warning)]")}>
                {c.priceDelta < 0 ? "" : "+"}{formatINR(c.priceDelta)}
              </span>
            )}
            <span className="text-sm font-medium w-16 text-right">{formatINR(c.price)}</span>
            <span className="text-[11px] text-[var(--muted)] w-14 text-right">{c.daysAgo}d ago</span>
          </div>
        ))}
      </div>
      {store.recentChanges.length > 7 && (
        <button onClick={() => setExpanded((v) => !v)} className="mt-3 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
          {expanded ? "Show less" : `View catalog (${stats.productCount})`}
        </button>
      )}
    </Card>
  );
}
