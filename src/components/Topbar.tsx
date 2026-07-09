"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Overview", subtitle: "Cross-channel health at a glance" },
  "/inventory": { title: "Inventory Management", subtitle: "SOH, DOH, on-shelf availability & category RCA" },
  "/sales": { title: "Sales", subtitle: "Primary vs secondary, daily sales report & offtake" },
  "/forecasting": { title: "Demand Forecasting", subtitle: "What to buy, restock, or pull back on — and why" },
  "/cashflow": { title: "Cash Flow Management", subtitle: "Payout cycles, receivables, payables & runway" },
  "/marketing": { title: "Marketing Pulse", subtitle: "Trends, reels, ads, deals & competitor moves" },
};

export function Topbar() {
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? TITLES["/"];

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur px-6 py-4 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{meta.title}</h1>
        <p className="text-xs text-[var(--muted)]">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--muted)]">
          <Search size={14} />
          <span className="text-xs">Search SKU, channel, keyword…</span>
        </div>
        <button className="relative rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)]">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
        </button>
        <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold">
          DS
        </div>
      </div>
    </header>
  );
}
