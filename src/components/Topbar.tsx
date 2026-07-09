"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Info, Search, X } from "lucide-react";

interface PageMeta {
  title: string;
  subtitle: string;
  info: string;
}

const TITLES: Record<string, PageMeta> = {
  "/assistant": { title: "Ask AI", subtitle: "Query your data warehouse in plain English", info: "A conversational assistant that reads across every dataset in this warehouse — inventory, sales, cash flow and marketing — and answers plain-English questions. Tap a suggested question or type your own; it returns a written answer grounded in the current numbers. Prototype: answers are sample responses." },
  "/sales/primary-secondary": { title: "Primary & Secondary Sales", subtitle: "Sell-in vs. sell-through, and the gap between them", info: "Primary sales = what you bill into a channel (sell-in). Secondary sales = what the channel actually sells to shoppers (sell-through). When primary grows faster than secondary the gap widens, meaning stock is piling up downstream — an early warning to slow dispatch. The SKU-wise table breaks this down by product with GMV and pre/post-tax NSR." },
  "/sales/daily-report": { title: "Daily Sales Report", subtitle: "MTD performance vs. plan, forecast, LM & LY, plus offtake", info: "Month-to-date sales tracked against Budget Plan (B Plan) and Demand Plan (D Plan), net of returns (RTO) and cancellations, with a forecast for month-end and growth vs. last month (LM) and last year (LY). The offtake table shows consumer sell-through by channel and category, this month vs. the same point last month." },
  "/sales/city-report": { title: "City-Level Sales Report", subtitle: "Gross, NSR, discount, contribution, AOV & COD by city and state", info: "Sales broken down by city and state: gross sales, post-tax Net Sales Realisation (NSR), listing-discount value, Trade Discount % (TD%), contribution margin, average order value (AOV) and cash-on-delivery (COD) order share. Click any city row to expand its top-selling products. Filter by channel, state, city and date range." },
  "/sales/campaign-report": { title: "Campaign Sales Report", subtitle: "Per-campaign users, orders, AOV, discount, NSR & coupon usage", info: "Every sale-driving campaign in one table: users, orders, AOV, discount supplied, gross revenue, net sales revenue (NSR) and revenue lift for each. A companion table shows the coupons each campaign issued and how they redeemed. Use it to see which promo mechanics actually paid off." },
  "/inventory": { title: "Inventory", subtitle: "SKU-level stock health, reorder recommendations", info: "Live stock health for every SKU across every channel: on-hand units, daily sales velocity, days of cover, and a status flag (critical / low / healthy / overstock / aging). Reorder recommendations are auto-generated from velocity vs. cover so you know what to buy before you stock out. Filter by channel, category and SKU." },
  "/forecasting": { title: "Demand Forecasting", subtitle: "Monthly demand plan by channel vs. production capacity", info: "A forward demand plan per SKU, split by channel, compared against monthly production capacity. Where forecast demand runs at or over capacity the planner action flags it (pre-build inventory, add a shift, or top up via 3PL) so you can act before a stockout. The capacity outlook lists the tightest months across all SKUs." },
  "/scm": { title: "SCM", subtitle: "SOH, DOH, on-shelf availability & category RCA", info: "Supply-chain view for quick-commerce and marketplaces: Stock on Hand (SOH), consumption, Days on Hand (DOH), lead time and pipeline by channel — expandable to category. The OSA section flags SKUs whose On-Shelf Availability is slipping (with a priority and trend), and Category RCA compares market share, OSA and share of voice by category." },
  "/pricing": { title: "Pricing Tracker", subtitle: "MRP & SP by platform — own SKUs vs. competitors", info: "Tracks Maximum Retail Price (MRP) and Selling Price (SP) for your SKUs across each platform, alongside competitor pricing, so you can spot where you're over- or under-priced versus the market and where a platform is discounting your listing." },
  "/cashflow": { title: "Cash Flow Management", subtitle: "Payout cycles, receivables, payables & runway", info: "Where your cash actually is. Each channel settles on a different cycle (Shopify ~2 days, Myntra ~30), so this tracks money owed to you (receivables), bills due soon (payables), monthly inflow vs. outflow, and how many months of runway you have at the current burn. It surfaces the gap between profitable-on-paper and cash-in-bank." },
  "/marketing/shopify-analytics": { title: "Shopify Analytics", subtitle: "D2C storefront — revenue, orders, customers, products & funnels", info: "Everything happening on your own D2C storefront: revenue, orders, AOV, repeat rate and discounts; sales by category; top customers and products; recent orders; and the session-to-purchase conversion funnel. The Sales tab drills into discount-code usage eating your margin." },
  "/marketing/google-analytics": { title: "Google Analytics", subtitle: "Traffic, audience, acquisition, behaviour & conversions", info: "GA4-style web analytics for the storefront: traffic and engagement, new vs. returning users, device and browser mix, which channels acquire the most (and best-converting) visitors, top pages, and the full purchase funnel with drop-off at each step." },
  "/marketing/meta-ads": { title: "Ads Manager", subtitle: "Cross-platform campaign performance — Meta & Google Ads", info: "Paid-media performance across Meta (Facebook/Instagram) and Google Ads. See spend, ROAS, the impression-to-purchase funnel, spend by audience/placement/device coloured by return, and a campaign-level breakdown. When blended ROAS drops below 1x you're spending more than you're earning — the alert flags it and points to the winners to shift budget into." },
  "/marketing/events": { title: "Events & Campaigns", subtitle: "Log every growth lever & measure revenue lift vs. baseline", info: "Your brand's memory of every growth lever — sales, drops, creator collabs, email blasts. Each event is measured against its own 14-day pre-event baseline so you see the real revenue lift, not just a spike. Upcoming events show their target; ended events rank by lift. Pull per-event metrics on demand." },
  "/marketing/social-comments": { title: "Social Comments", subtitle: "Every ad comment — read, classified & triaged before it costs a sale", info: "Pulls every comment on your active Meta ads and classifies each by sentiment and purchase intent (across English, Hindi and Hinglish). Buyers asking 'price?' or 'link?' who get no reply are lost sales — the oldest unanswered purchase-intent comment is surfaced first so you reply before it costs you." },
  "/marketing/price-tracker": { title: "Competitor Price Tracker", subtitle: "Track competitor catalogs — price moves, launches & stock-outs", info: "Watches competitors' public catalogs and snapshots price, compare-at price and stock for every product. Each rescan produces a diff — a price drop on their hero SKU, a new variant, or a bestseller going out of stock — so you learn within hours, not next week when your sales dip." },
  "/marketing/new-launches": { title: "New Launch Detector", subtitle: "Know about competitor launches the day they happen", info: "Surfaces any competitor product that appeared since the last scan, ordered by publish date, with its price and stock status. That's your decision window — match the launch, run a comparison ad, or accelerate your own pipeline — before their organic reach kicks in." },
  "/marketing/stockout-sniper": { title: "Stockout Sniper", subtitle: "When a competitor's bestseller runs dry, capture the demand", info: "When a competitor's popular product goes out of stock, their demand has nowhere to go. This flags those open windows (and how long they've been open) so you can aim ads at that product's search terms and capture the switch before they restock." },
  "/marketing/search-gap": { title: "Search Gap Miner", subtitle: "What shoppers searched but couldn't find — a free product roadmap", info: "Every term shoppers typed into your on-site search that returned no matching product. High-volume gaps are demand you're leaving on the table — a free roadmap for what to stock, rename, or create a landing page for. Toggle between unmet gaps only and all searches." },
  "/marketing/code-quality": { title: "Discount Code Quality", subtitle: "Which codes bring loyal customers vs. one-time deal hunters", info: "Not all discount codes are equal. Each code is scored on a Deal-Hunter scale using new-vs-repeat customer share, discount depth and order value — so you can tell a Growth Driver (brings customers who come back) from a Deal Hunter (one-time bargain seekers eating margin). Cap or rotate the deal-hunter codes." },
};

export function Topbar() {
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? { title: "CAVA Data Warehouse", subtitle: "Cross-channel intelligence", info: "A cross-channel data warehouse prototype for CAVA Athleisure." };
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-xl font-medium tracking-[-0.02em]">{meta.title}</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{meta.subtitle}</p>
          </div>
          <button
            onClick={() => setShowInfo((v) => !v)}
            aria-label="What is this page"
            className={`border p-1 transition-colors ${showInfo ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            <Info size={14} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--muted)]">
            <Search size={14} strokeWidth={1.5} />
            <span className="text-xs">Search SKU, channel, keyword</span>
          </div>
          <button className="relative border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)]">
            <Bell size={16} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
          </button>
          <div className="h-8 w-8 border border-[var(--ink)] flex items-center justify-center text-xs font-medium">DS</div>
        </div>
      </header>

      {showInfo && (
        <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
          <div className="max-w-[1500px] mx-auto flex items-start gap-3">
            <div className="h-7 w-7 border border-[var(--accent)]/50 text-[var(--accent)] flex items-center justify-center shrink-0">
              <Info size={14} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="eyebrow mb-1">About this page — {meta.title}</div>
              <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-3xl">{meta.info}</p>
            </div>
            <button onClick={() => setShowInfo(false)} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--foreground)] shrink-0">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
