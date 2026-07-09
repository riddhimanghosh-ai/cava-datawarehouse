"use client";

import { Fragment, useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, MapPin, Map as MapIcon, Store, Trophy } from "lucide-react";
import { Card, CardHeader, StatCard, ProgressBar, MultiSelect, FilterBox, FilterRow } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import {
  CHANNELS,
  CITY_STATE_LIST,
  STATE_LIST,
  aggregateCitySales,
  citySalesTotals,
  topProductsForCity,
} from "@/lib/data";

const DATE_RANGES = [
  { value: "mtd", label: "This month (MTD)" },
  { value: "30", label: "Last 30 days" },
  { value: "qtd", label: "This quarter" },
  { value: "prev", label: "Last month" },
];

export default function CityReportPage() {
  const [dateRange, setDateRange] = useState("mtd");
  const [channels, setChannels] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Set<string>>(new Set());
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  // City options respect the selected states.
  const cityOptions = CITY_STATE_LIST.filter((c) => states.size === 0 || states.has(c.state)).map((c) => ({ value: c.city, label: c.city }));

  const rows = useMemo(() => aggregateCitySales({ channels, states, cities }), [channels, states, cities]);
  const totals = citySalesTotals(rows);
  const maxGross = Math.max(...rows.map((r) => r.grossSales), 1);

  return (
    <div className="space-y-6">
      <FilterRow>
        <FilterBox label="Date range" icon={<Calendar size={12} />} value={dateRange} onChange={setDateRange} options={DATE_RANGES} />
        <MultiSelect label="Channel" icon={<Store size={12} />} selected={channels} onChange={setChannels} options={CHANNELS.map((c) => ({ value: c, label: c }))} />
        <MultiSelect label="State" icon={<MapIcon size={12} />} selected={states} onChange={(n) => { setStates(n); setCities(new Set()); }} options={STATE_LIST.map((s) => ({ value: s, label: s }))} />
        <MultiSelect label="City" icon={<MapPin size={12} />} selected={cities} onChange={setCities} options={cityOptions} />
      </FilterRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gross Total Sales" value={formatINR(totals.gross, true)} caption={`${formatNumber(totals.orders)} orders`} />
        <StatCard label="Post-Tax NSR (Net Sales Realisation)" value={formatINR(totals.postTaxNsr, true)} caption={`${Math.round((totals.postTaxNsr / totals.gross) * 100)}% of gross`} />
        <StatCard label="Listing Discount Value" value={formatINR(totals.listingDiscount, true)} tone="danger" caption={`${totals.tdPct}% TD (Trade Discount)`} />
        <StatCard label="Contribution" value={formatINR(totals.contribution, true)} tone="ok" caption={`${Math.round((totals.contribution / totals.postTaxNsr) * 100)}% of NSR`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="AOV (Average Order Value)" value={formatINR(totals.aov)} />
        <StatCard label="COD (Cash on Delivery) Orders" value={formatNumber(totals.codOrders)} caption={`${totals.codSharePct}% of orders`} />
        <StatCard label="Cities in view" value={`${rows.length}`} caption="click a row for top products" />
      </div>

      <Card>
        <CardHeader
          title="City-level sales report"
          subtitle="Gross sales, post-tax NSR, listing discount, TD%, contribution, AOV & COD by city. Click a city for its top-selling products."
        />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">City</th>
                <th className="py-2 px-2 font-medium">State</th>
                <th className="py-2 px-2 font-medium text-right">Gross Sales</th>
                <th className="py-2 px-2 font-medium text-right">Post-Tax NSR</th>
                <th className="py-2 px-2 font-medium text-right">Listing Disc.</th>
                <th className="py-2 px-2 font-medium text-right">TD%</th>
                <th className="py-2 px-2 font-medium text-right">Contribution</th>
                <th className="py-2 px-2 font-medium text-right">AOV</th>
                <th className="py-2 px-2 font-medium text-right">Orders</th>
                <th className="py-2 px-2 font-medium text-right">COD</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const open = expanded === r.city;
                return (
                  <Fragment key={r.city}>
                    <tr
                      onClick={() => setExpanded(open ? null : r.city)}
                      className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60 cursor-pointer"
                    >
                      <td className="py-2.5 px-5 font-medium">
                        <span className="flex items-center gap-1.5">
                          {open ? <ChevronDown size={14} className="text-[var(--muted)]" /> : <ChevronRight size={14} className="text-[var(--muted)]" />}
                          {r.city}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-[var(--muted)]">{r.state}</td>
                      <td className="py-2.5 px-2 text-right font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <span>{formatINR(r.grossSales, true)}</span>
                          <span className="w-16"><ProgressBar pct={(r.grossSales / maxGross) * 100} /></span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right">{formatINR(r.postTaxNsr, true)}</td>
                      <td className="py-2.5 px-2 text-right text-[var(--danger)]">{formatINR(r.listingDiscount, true)}</td>
                      <td className="py-2.5 px-2 text-right">{r.tdPct}%</td>
                      <td className="py-2.5 px-2 text-right text-[var(--ok)]">{formatINR(r.contribution, true)}</td>
                      <td className="py-2.5 px-2 text-right">{formatINR(r.aov)}</td>
                      <td className="py-2.5 px-2 text-right">{formatNumber(r.orders)}</td>
                      <td className="py-2.5 px-2 text-right text-[var(--muted)]">{formatNumber(r.codOrders)}</td>
                    </tr>
                    {open && (
                      <tr className="bg-[var(--surface-2)]/40">
                        <td colSpan={10} className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
                            <Trophy size={13} className="text-[var(--accent)]" /> Top-selling products — {r.city}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                            {topProductsForCity(r.city).map((p, i) => (
                              <div key={p.sku} className="flex items-center gap-3 rounded-lg bg-[var(--surface)] px-3 py-2">
                                <span className="h-6 w-6 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[13px] font-medium truncate">{p.name}</div>
                                  <div className="text-[11px] text-[var(--muted)]">{formatNumber(p.units)} units</div>
                                </div>
                                <span className="text-[13px] font-semibold">{formatINR(p.revenue, true)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={10} className="py-6 text-center text-[var(--muted)]">No cities match these filters.</td></tr>
              )}
              {rows.length > 0 && (
                <tr className="font-semibold border-t border-[var(--border)]">
                  <td className="py-2.5 px-5">Total</td>
                  <td className="py-2.5 px-2" />
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.gross, true)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.postTaxNsr, true)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.listingDiscount, true)}</td>
                  <td className="py-2.5 px-2 text-right">{totals.tdPct}%</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.contribution, true)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(totals.aov)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(totals.orders)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(totals.codOrders)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
