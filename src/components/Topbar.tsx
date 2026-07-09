"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Overview", subtitle: "Cross-channel health at a glance" },
  "/assistant": { title: "Ask AI", subtitle: "Query your data warehouse in plain English" },
  "/sales/primary-secondary": { title: "Primary & Secondary Sales", subtitle: "Sell-in vs. sell-through, and the gap between them" },
  "/sales/daily-report": { title: "Daily Sales Report", subtitle: "MTD performance vs. plan, forecast, LM & LY, plus offtake" },
  "/inventory": { title: "Inventory", subtitle: "SKU-level stock health, reorder recommendations" },
  "/forecasting": { title: "Demand Forecasting", subtitle: "Monthly demand plan by channel vs. production capacity" },
  "/scm": { title: "SCM", subtitle: "SOH, DOH, on-shelf availability & category RCA" },
  "/pricing": { title: "Pricing Tracker", subtitle: "MRP & SP by platform — own SKUs vs. competitors" },
  "/cashflow": { title: "Cash Flow Management", subtitle: "Payout cycles, receivables, payables & runway" },
  "/marketing/shopify-analytics": { title: "Shopify Analytics", subtitle: "D2C storefront — revenue, orders, customers, products & funnels" },
  "/marketing/google-analytics": { title: "Google Analytics", subtitle: "Traffic, audience, acquisition, behaviour & conversions" },
  "/marketing/events": { title: "Events & Campaigns", subtitle: "Log every growth lever & measure revenue lift vs. baseline" },
  "/marketing/social-comments": { title: "Social Comments", subtitle: "Every ad comment — read, classified & triaged before it costs a sale" },
  "/marketing/price-tracker": { title: "Competitor Price Tracker", subtitle: "Track competitor Shopify catalogs — price moves, launches & stock-outs" },
  "/marketing/new-launches": { title: "New Launch Detector", subtitle: "Know about competitor launches the day they happen" },
  "/marketing/stockout-sniper": { title: "Stockout Sniper", subtitle: "When a competitor's bestseller runs dry, capture the demand" },
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
