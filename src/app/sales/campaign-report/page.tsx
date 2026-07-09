"use client";

import { useMemo, useState } from "react";
import { Calendar, Layers, Ticket } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, MultiSelect, FilterBox, FilterRow, passesFilter } from "@/components/ui";
import { formatINR, formatNumber, formatPct, cx } from "@/lib/format";
import { campaignSalesRows, campaignSalesTotals, CAMPAIGN_COUPONS } from "@/lib/data";

const DATE_RANGES = [
  { value: "all", label: "All time" },
  { value: "180", label: "Last 6 months" },
  { value: "90", label: "Last 90 days" },
];

const TODAY = new Date("2026-07-09T00:00:00Z").getTime();

export default function CampaignReportPage() {
  const allRows = campaignSalesRows();
  const eventTypes = Array.from(new Set(allRows.map((r) => r.type)));

  const [range, setRange] = useState("all");
  const [types, setTypes] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    return allRows
      .filter((r) => passesFilter(types, r.type))
      .filter((r) => range === "all" || (TODAY - new Date(r.startDate).getTime()) / 86400000 <= Number(range))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [allRows, types, range]);

  const totals = campaignSalesTotals(rows);
  const visibleCampaignNames = new Set(rows.map((r) => r.name));
  const coupons = CAMPAIGN_COUPONS.filter((c) => visibleCampaignNames.size === 0 || visibleCampaignNames.has(c.campaign));

  return (
    <div className="space-y-6">
      <FilterRow>
        <FilterBox label="Date range" icon={<Calendar size={12} />} value={range} onChange={setRange} options={DATE_RANGES} />
        <MultiSelect label="Event type" icon={<Layers size={12} />} selected={types} onChange={setTypes} options={eventTypes.map((t) => ({ value: t, label: t }))} />
      </FilterRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders (campaigns)" value={formatNumber(totals.orders)} caption={`${formatNumber(totals.users)} users`} />
        <StatCard label="NSR (Net Sales Revenue)" value={formatINR(totals.nsr, true)} caption={`of ${formatINR(totals.gross, true)} gross`} />
        <StatCard label="Discount Supplied" value={formatINR(totals.discount, true)} tone="danger" caption={`${totals.discountPct}% of gross`} />
        <StatCard label="Blended AOV (Average Order Value)" value={formatINR(totals.aov)} />
      </div>

      <Card>
        <CardHeader
          title="Campaign / event sales report"
          subtitle="Per-campaign performance across the run window — users, orders, AOV, discount supplied & net sales revenue"
        />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[1040px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Campaign</th>
                <th className="py-2 px-2 font-medium">Date range</th>
                <th className="py-2 px-2 font-medium text-right">Users</th>
                <th className="py-2 px-2 font-medium text-right">Orders</th>
                <th className="py-2 px-2 font-medium text-right">AOV</th>
                <th className="py-2 px-2 font-medium text-right">Discount Supplied</th>
                <th className="py-2 px-2 font-medium text-right">Gross Revenue</th>
                <th className="py-2 px-2 font-medium text-right">NSR</th>
                <th className="py-2 px-2 font-medium text-right">Lift</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5">
                    <div className="font-medium">{r.name}</div>
                    <div className="mt-0.5"><Badge tone="ended">{r.type}</Badge></div>
                  </td>
                  <td className="py-2.5 px-2 text-[var(--muted)] whitespace-nowrap">{fmtRange(r.startDate, r.endDate)}<div className="text-[11px]">{r.days} days</div></td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(r.users)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(r.orders)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(r.aov)}</td>
                  <td className="py-2.5 px-2 text-right text-[var(--danger)]">{formatINR(r.discountSupplied, true)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(r.grossRevenue, true)}</td>
                  <td className="py-2.5 px-2 text-right font-medium">{formatINR(r.nsr, true)}</td>
                  <td className={cx("py-2.5 px-2 text-right font-medium", r.liftPct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{formatPct(r.liftPct)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="py-6 text-center text-[var(--muted)]">No campaigns match these filters.</td></tr>
              )}
              {rows.length > 0 && (
                <tr className="font-semibold border-t border-[var(--border)]">
                  <td className="py-2.5 px-5">Total</td>
                  <td className="py-2.5 px-2" />
                  <td className="py-2.5 px-2 text-right">{formatNumber(totals.users)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(totals.orders)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.aov)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.discount, true)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.gross, true)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.nsr, true)}</td>
                  <td className="py-2.5 px-2" />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Coupons used" subtitle="Coupon-level redemption across the campaigns in view" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Coupon</th>
                <th className="py-2 px-2 font-medium">Campaign</th>
                <th className="py-2 px-2 font-medium text-right">Uses</th>
                <th className="py-2 px-2 font-medium text-right">Total Discount</th>
                <th className="py-2 px-2 font-medium text-right">Avg Discount</th>
                <th className="py-2 px-2 font-medium text-right">Redemption Rate</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[13px] font-medium">
                      <Ticket size={13} className="text-[var(--accent)]" /> {c.code}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-[var(--muted)]">{c.campaign}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(c.uses)}</td>
                  <td className="py-2.5 px-2 text-right text-[var(--danger)]">{formatINR(c.totalDiscount, true)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(c.avgDiscount)}</td>
                  <td className="py-2.5 px-2 text-right">{c.redemptionRatePct}%</td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-[var(--muted)]">No coupons for the campaigns in view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function fmtRange(start: string, end: string) {
  const o: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "2-digit" };
  return `${new Date(start).toLocaleDateString("en-GB", o)} – ${new Date(end).toLocaleDateString("en-GB", o)}`;
}
