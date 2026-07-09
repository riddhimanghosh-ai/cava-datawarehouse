"use client";

import { useState } from "react";
import { BarChart3, Users, Package, ShoppingBag, Filter as FunnelIcon, IndianRupee } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, Tabs, ProgressBar } from "@/components/ui";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SHOPIFY_OVERVIEW_KPIS.map((k) => (
            <StatCard key={k.label} {...k} />
          ))}
        </div>
      )}

      {tab === "sales" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">🏷️ Discount Analysis</h3>
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

      {tab === "products" && (
        <Card>
          <CardHeader title="Top products" subtitle="By revenue — with refund rate & product-page conversion" />
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                  <th className="py-2 px-5 font-medium">Product</th>
                  <th className="py-2 px-2 font-medium">Revenue</th>
                  <th className="py-2 px-2 font-medium">Units</th>
                  <th className="py-2 px-2 font-medium">Refund rate</th>
                  <th className="py-2 px-2 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {SHOPIFY_TOP_PRODUCTS.map((p) => (
                  <tr key={p.sku} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                    <td className="py-2.5 px-5">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-[var(--muted)]">{p.sku}</div>
                    </td>
                    <td className="py-2.5 px-2 font-medium">{formatINR(p.revenue, true)}</td>
                    <td className="py-2.5 px-2">{formatNumber(p.units)}</td>
                    <td className={cx("py-2.5 px-2", p.refundRate > 3 ? "text-[var(--danger)]" : "")}>{p.refundRate}%</td>
                    <td className="py-2.5 px-2">{p.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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

function FunnelCard({ title, subtitle, stages }: { title: string; subtitle: string; stages: typeof SHOPIFY_FUNNEL }) {
  const top = stages[0].count;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader title={title} subtitle={subtitle} />
        <div className="space-y-4">
          {stages.map((s, i) => (
            <div key={s.stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[var(--accent)] text-black text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
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
                    <span className={cx("rounded-md px-1.5 py-0.5 text-[11px] font-medium", s.dropOffPct > 60 ? "bg-red-500/10 text-red-400" : s.dropOffPct > 0 ? "bg-orange-500/10 text-orange-400" : "bg-emerald-500/10 text-emerald-400")}>
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
