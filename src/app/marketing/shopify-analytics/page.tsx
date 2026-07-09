"use client";

import { useState } from "react";
import { BarChart3, Users, Package, ShoppingBag, Filter as FunnelIcon, IndianRupee } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, Tabs, ProgressBar, LabelledBar } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import {
  SHOPIFY_OVERVIEW_KPIS,
  SHOPIFY_SALES_BY_CATEGORY,
  SHOPIFY_TOP_CUSTOMERS,
  SHOPIFY_TOP_PRODUCTS,
  SHOPIFY_RECENT_ORDERS,
  SHOPIFY_FUNNEL,
  SHOPIFY_DISCOUNT_SUMMARY,
  SHOPIFY_DISCOUNT_CODES,
  SHOPIFY_ORDERS_BY_DOW,
  SHOPIFY_PEAK_HOURS,
  SHOPIFY_SALES_CHANNELS,
} from "@/lib/data";

type Tab = "overview" | "sales" | "customers" | "products" | "orders" | "funnels";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
  { value: "sales", label: "Sales", icon: <IndianRupee size={15} /> },
  { value: "customers", label: "Customers", icon: <Users size={15} /> },
  { value: "products", label: "Products", icon: <Package size={15} /> },
  { value: "orders", label: "Orders", icon: <ShoppingBag size={15} /> },
  { value: "funnels", label: "Funnels", icon: <FunnelIcon size={15} /> },
];

export default function ShopifyAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const maxCatRev = Math.max(...SHOPIFY_SALES_BY_CATEGORY.map((c) => c.revenue));

  return (
    <div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-6">
            {SHOPIFY_OVERVIEW_KPIS.map((k) => (
              <StatCard key={k.label} {...k} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Orders by day of week" subtitle="Where the week's demand concentrates" />
              <div className="space-y-3">
                {(() => {
                  const max = Math.max(...SHOPIFY_ORDERS_BY_DOW.map((d) => d.value));
                  return SHOPIFY_ORDERS_BY_DOW.map((d) => (
                    <LabelledBar key={d.label} label={d.label} value={formatNumber(d.value)} pct={(d.value / max) * 100} tone={d.value === max ? "accent" : "ok"} />
                  ));
                })()}
              </div>
            </Card>
            <Card>
              <CardHeader title="Peak shopping hours" subtitle="Order volume by time of day — peak 3–6PM" />
              <div className="space-y-3">
                {(() => {
                  const max = Math.max(...SHOPIFY_PEAK_HOURS.map((d) => d.value));
                  return SHOPIFY_PEAK_HOURS.map((d) => (
                    <LabelledBar key={d.label} label={d.label} value={`${formatNumber(d.value)}${d.caption ? ` · ${d.caption}` : ""}`} pct={(d.value / max) * 100} tone={d.caption === "peak" ? "accent" : "ok"} />
                  ));
                })()}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Sales channels" subtitle="Revenue by traffic source into the storefront" />
              <div className="space-y-3">
                {(() => {
                  const max = Math.max(...SHOPIFY_SALES_CHANNELS.map((d) => d.value));
                  return SHOPIFY_SALES_CHANNELS.map((d) => (
                    <LabelledBar key={d.label} label={d.label} value={`${formatINR(d.value, true)}${d.caption ? ` · ${d.caption}` : ""}`} pct={(d.value / max) * 100} />
                  ));
                })()}
              </div>
            </Card>
            <FunnelCard title="Conversion funnel" subtitle="Session → purchase for the selected period" stages={SHOPIFY_FUNNEL} single />
          </div>
        </div>
      )}

      {tab === "sales" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Discount Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Discount Rate" value={`${SHOPIFY_DISCOUNT_SUMMARY.discountRatePct}%`} caption="of orders used a code" tone="danger" />
              <StatCard label="Total Discounts Given" value={formatINR(SHOPIFY_DISCOUNT_SUMMARY.totalDiscountsGiven, true)} caption="last 30 days" />
              <StatCard label="Avg Discount / Order" value={formatINR(SHOPIFY_DISCOUNT_SUMMARY.avgDiscountPerOrder)} caption="across discounted orders" />
            </div>
          </div>

          <Card>
            <CardHeader title="Top discount codes" subtitle="Which codes are eating margin — by uses & total discount" />
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                    <th className="py-2 px-5 font-medium">Code</th>
                    <th className="py-2 px-2 font-medium">Uses</th>
                    <th className="py-2 px-2 font-medium">Total discount</th>
                    <th className="py-2 px-2 font-medium">Avg discount</th>
                  </tr>
                </thead>
                <tbody>
                  {[...SHOPIFY_DISCOUNT_CODES].sort((a, b) => b.totalDiscount - a.totalDiscount).map((d) => (
                    <tr key={d.code} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                      <td className="py-2.5 px-5 font-mono text-[13px] font-medium">{d.code}</td>
                      <td className="py-2.5 px-2">{formatNumber(d.uses)}</td>
                      <td className="py-2.5 px-2 font-medium">{formatINR(d.totalDiscount, true)}</td>
                      <td className="py-2.5 px-2 text-[var(--muted)]">{formatINR(d.avgDiscount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Sales by category" subtitle="Revenue, orders, units & discount depth — Shopify D2C, last 30 days" />
            <div className="space-y-3">
              {SHOPIFY_SALES_BY_CATEGORY.map((c) => (
                <div key={c.category} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{c.category}</span>
                    <span className="text-sm font-semibold">{formatINR(c.revenue, true)}</span>
                  </div>
                  <ProgressBar pct={(c.revenue / maxCatRev) * 100} />
                  <div className="flex items-center gap-4 text-[11px] text-[var(--muted)] mt-2">
                    <span>{formatNumber(c.orders)} orders</span>
                    <span>{formatNumber(c.units)} units</span>
                    <span>{c.discountPct}% avg discount</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "customers" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Repeat Customer Rate" value="31.4%" tone="ok" caption="of all customers" />
            <StatCard label="New Customer Revenue" value="₹28.1L" caption="66% of total" />
            <StatCard label="Customer LTV (est.)" value="₹2,151" caption="per customer" />
          </div>
          <Card>
            <CardHeader title="Top customers" subtitle="Highest lifetime spend" />
            <div className="space-y-2.5">
              {SHOPIFY_TOP_CUSTOMERS.map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-[11px] text-[var(--muted)]">{c.orders} orders · last order {c.lastOrderDays}d ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatINR(c.spend)}</span>
                    <Badge tone={c.segment}>{c.segment}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "products" && (() => {
        const totalRev = SHOPIFY_TOP_PRODUCTS.reduce((s, p) => s + p.revenue, 0);
        const maxRev = Math.max(...SHOPIFY_TOP_PRODUCTS.map((p) => p.revenue));
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Top products by revenue" subtitle="Units, orders, avg price, refund rate & revenue share" />
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm min-w-[860px]">
                  <thead>
                    <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                      <th className="py-2 px-5 font-medium">#</th>
                      <th className="py-2 px-2 font-medium">Product</th>
                      <th className="py-2 px-2 font-medium text-right">Revenue</th>
                      <th className="py-2 px-2 font-medium text-right">Units</th>
                      <th className="py-2 px-2 font-medium text-right">Orders</th>
                      <th className="py-2 px-2 font-medium text-right">Avg price</th>
                      <th className="py-2 px-2 font-medium w-40">Revenue share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHOPIFY_TOP_PRODUCTS.map((p, i) => {
                      const orders = Math.max(1, Math.round(p.units / 1.3));
                      const avgPrice = Math.round(p.revenue / p.units);
                      const share = (p.revenue / totalRev) * 100;
                      return (
                        <tr key={p.sku} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                          <td className="py-2.5 px-5 text-[var(--muted)]">{i + 1}</td>
                          <td className="py-2.5 px-2">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-[11px] text-[var(--muted)]">{p.sku}</div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-medium">{formatINR(p.revenue, true)}</td>
                          <td className="py-2.5 px-2 text-right">{formatNumber(p.units)}</td>
                          <td className="py-2.5 px-2 text-right">{formatNumber(orders)}</td>
                          <td className="py-2.5 px-2 text-right">{formatINR(avgPrice)}</td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <span className="w-10 text-right text-xs">{share.toFixed(1)}%</span>
                              <ProgressBar pct={share} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader title="Product revenue distribution" subtitle="Revenue by product" />
              <div className="space-y-3">
                {SHOPIFY_TOP_PRODUCTS.map((p) => (
                  <LabelledBar key={p.sku} label={p.name} value={formatINR(p.revenue, true)} pct={(p.revenue / maxRev) * 100} />
                ))}
              </div>
            </Card>
          </div>
        );
      })()}

      {tab === "orders" && (
        <Card>
          <CardHeader title="Recent orders" subtitle="Latest Shopify D2C orders & fulfilment status" />
          <div className="space-y-2">
            {SHOPIFY_RECENT_ORDERS.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">{o.id} · {o.customer}</div>
                  <div className="text-[11px] text-[var(--muted)]">{o.items} item{o.items > 1 ? "s" : ""} · {o.ageHours}h ago</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatINR(o.total)}</span>
                  <Badge tone={o.status}>{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "funnels" && <FunnelCard title="Sessions → Purchase" subtitle="Full-funnel drop-off from session to completed order" stages={SHOPIFY_FUNNEL} />}
    </div>
  );
}

function FunnelCard({ title, subtitle, stages, single }: { title: string; subtitle: string; stages: typeof SHOPIFY_FUNNEL; single?: boolean }) {
  const top = stages[0].count;
  const funnel = (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="space-y-4">
        {stages.map((s, i) => (
          <div key={s.stage}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                {s.stage}
              </span>
              <span className="text-[var(--muted)]">
                {formatNumber(s.count)}
                {s.pctOfPrevious !== null && <span className="ml-2 text-[var(--foreground)]">↳ {s.pctOfPrevious}% retained</span>}
              </span>
            </div>
            <ProgressBar pct={(s.count / top) * 100} tone={i === stages.length - 1 ? "ok" : "accent"} />
          </div>
        ))}
      </div>
    </Card>
  );
  if (single) return funnel;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {funnel}
      <Card>
        <CardHeader title="Stage details" subtitle="Drop-off at each step" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Stage</th>
                <th className="py-2 px-2 font-medium">Count</th>
                <th className="py-2 px-2 font-medium">% of prev</th>
                <th className="py-2 px-2 font-medium">Drop-off</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s) => (
                <tr key={s.stage} className="border-b border-[var(--border)]/60">
                  <td className="py-2.5 px-5 font-medium">{s.stage}</td>
                  <td className="py-2.5 px-2">{formatNumber(s.count)}</td>
                  <td className="py-2.5 px-2">{s.pctOfPrevious === null ? "—" : `${s.pctOfPrevious}%`}</td>
                  <td className="py-2.5 px-2">
                    <span className={cx("rounded-md px-1.5 py-0.5 text-[11px] font-medium", s.dropOffPct > 60 ? "bg-[var(--danger)]/10 text-[var(--danger)]" : s.dropOffPct > 0 ? "bg-[var(--warning)]/10 text-[var(--warning)]" : "bg-[var(--ok)]/10 text-[var(--ok)]")}>
                      {s.dropOffPct}% drop-off
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
