"use client";

import { useMemo, useState } from "react";
import { Boxes, Calendar, ChevronDown, ChevronRight, Gauge, Layers, Radar, Store, Tag } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, ProgressBar, Pills, FilterBox, FilterRow, MultiSelect, passesFilter, SwatchDot, IconTile } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import {
  CHANNELS,
  Channel,
  PRODUCTS,
  sohByChannel,
  sohByCategoryForChannel,
  sohTotal,
  SohSummaryRow,
  OSA,
  osaSummary,
  CATEGORY_RCA,
} from "@/lib/data";

function dohTone(doh: number): "danger" | "warning" | "ok" | "accent" {
  if (doh < 10 || doh > 60) return "danger";
  if (doh < 15 || doh > 40) return "warning";
  return "ok";
}

export default function ScmPage() {
  const osaSum = osaSummary();
  const [expanded, setExpanded] = useState<Set<Channel>>(new Set());
  const [channelFilter, setChannelFilter] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  const [skuFilter, setSkuFilter] = useState<Set<string>>(new Set());
  const total = sohTotal();

  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
  const skuOptions = PRODUCTS.filter((p) => passesFilter(categoryFilter, p.category));

  const channelRows = sohByChannel().filter((r) => passesFilter(channelFilter, r.key));

  const toggle = (c: Channel) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const osaRows = useMemo(() => {
    return OSA.filter((r) => r.priority !== "Healthy")
      .filter((r) => passesFilter(channelFilter, r.channel))
      .filter((r) => passesFilter(skuFilter, r.sku))
      .filter((r) => passesFilter(categoryFilter, PRODUCTS.find((p) => p.sku === r.sku)?.category ?? ""))
      .sort((a, b) => a.last7DayOsa - b.last7DayOsa);
  }, [channelFilter, categoryFilter, skuFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SOH (Stock on Hand, units)" value={formatNumber(total.totalSoh)} />
        <StatCard label="Blended DOH (Days on Hand)" value={`${total.doh}d`} tone={dohTone(total.doh) === "ok" ? "ok" : "danger"} />
        <StatCard label="Avg OSA (On-Shelf Availability, 7d)" value={`${osaSum.avgOsa}%`} tone={osaSum.avgOsa >= 80 ? "ok" : "danger"} />
        <StatCard label="P0 critical OSA listings" value={`${osaSum.p0}`} tone="danger" />
      </div>

      <Card>
        <FilterRow>
          <FilterBox label="Date" icon={<Calendar size={12} />} value="09/07/26" onChange={() => {}} options={[{ value: "09/07/26", label: "09/07/2026" }]} />
          <MultiSelect label="Channel" icon={<Store size={12} />} selected={channelFilter} onChange={setChannelFilter} options={CHANNELS.map((c) => ({ value: c, label: c }))} />
          <MultiSelect
            label="Category"
            icon={<Layers size={12} />}
            selected={categoryFilter}
            onChange={(next) => {
              setCategoryFilter(next);
              setSkuFilter(new Set());
            }}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <MultiSelect label="SKU Name" icon={<Boxes size={12} />} selected={skuFilter} onChange={setSkuFilter} options={skuOptions.map((p) => ({ value: p.sku, label: p.name }))} />
        </FilterRow>

        <CardHeader title="SCM Qcomm SOH" subtitle="Total SOH, trailing consumption, DOH & pipeline. Click a channel to see its category split." />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Channel</th>
                <th className="py-2 px-2 font-medium">SOH (Stock on Hand)</th>
                <th className="py-2 px-2 font-medium">Consumption (30d)</th>
                <th className="py-2 px-2 font-medium">DOH (Days on Hand)</th>
                <th className="py-2 px-2 font-medium">DOH LD (Last Day)</th>
                <th className="py-2 px-2 font-medium">Avg Shelf Life</th>
                <th className="py-2 px-2 font-medium">Open orders</th>
                <th className="py-2 px-2 font-medium">In transit</th>
                <th className="py-2 px-2 font-medium">Avg MRP</th>
              </tr>
            </thead>
            <tbody>
              {channelRows.map((row) => (
                <ChannelRows key={row.key} row={row} channel={row.key as Channel} expanded={expanded.has(row.key as Channel)} onToggle={() => toggle(row.key as Channel)} />
              ))}
              <SohRow row={total} bold />
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="OSA (On-Shelf Availability) — needs attention" subtitle="SKUs below 85% 7-day OSA, sorted by priority · matches active filters above" />
        {osaRows.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-6 text-center">No listings match this filter.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                  <th className="py-2 px-5 font-medium">SKU</th>
                  <th className="py-2 px-2 font-medium">Channel</th>
                  <th className="py-2 px-2 font-medium">Priority</th>
                  <th className="py-2 px-2 font-medium text-right">7-day OSA</th>
                  <th className="py-2 px-2 font-medium text-right">15-day OSA</th>
                  <th className="py-2 px-2 font-medium">Trend</th>
                  <th className="py-2 px-2 font-medium">Last 6 days</th>
                </tr>
              </thead>
              <tbody>
                {osaRows.map((r) => {
                  const product = PRODUCTS.find((p) => p.sku === r.sku)!;
                  const recent = r.dailySeries.slice(-6);
                  return (
                    <tr key={`${r.sku}-${r.channel}`} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                      <td className="py-2.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <SwatchDot color={product.heroColor} size={22} />
                          <span className="font-medium truncate">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-[var(--muted)]">{r.channel}</td>
                      <td className="py-2.5 px-2"><Badge tone={r.priority}>{r.priority}</Badge></td>
                      <td className="py-2.5 px-2 text-right font-semibold">{r.last7DayOsa}%</td>
                      <td className="py-2.5 px-2 text-right text-[var(--muted)]">{r.last15DayOsa}%</td>
                      <td className="py-2.5 px-2"><Badge tone={r.trend}>{r.trend}</Badge></td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1 w-40">
                          {recent.map((v, i) => (
                            <span
                              key={i}
                              className={cx(
                                "flex-1 text-center rounded py-1 text-[10px] font-medium",
                                v < 55 ? "bg-red-500/15 text-red-400" : v < 72 ? "bg-orange-500/15 text-orange-400" : v < 85 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                              )}
                            >
                              {v.toFixed(0)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CategoryRcaCard channelFilter={channelFilter} categoryFilter={categoryFilter} />
    </div>
  );
}

function ChannelRows({ row, channel, expanded, onToggle }: { row: SohSummaryRow; channel: Channel; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60 cursor-pointer" onClick={onToggle}>
        <td className="py-2.5 px-5 font-medium flex items-center gap-1.5">
          {expanded ? <ChevronDown size={14} className="text-[var(--muted)]" /> : <ChevronRight size={14} className="text-[var(--muted)]" />}
          {channel}
        </td>
        <SohCells row={row} />
      </tr>
      {expanded &&
        sohByCategoryForChannel(channel).map((catRow) => (
          <tr key={catRow.key} className="border-b border-[var(--border)]/40 bg-[var(--surface-2)]/40">
            <td className="py-2 px-5 pl-10 text-[var(--muted)]">{catRow.label}</td>
            <SohCells row={catRow} muted />
          </tr>
        ))}
    </>
  );
}

function SohRow({ row, bold }: { row: SohSummaryRow; bold?: boolean }) {
  return (
    <tr className={cx("border-t border-[var(--border)]", bold && "font-semibold")}>
      <td className="py-2.5 px-5">{row.label}</td>
      <SohCells row={row} />
    </tr>
  );
}

function SohCells({ row, muted }: { row: SohSummaryRow; muted?: boolean }) {
  const tone = dohTone(row.doh);
  return (
    <>
      <td className={cx("py-2.5 px-2", muted && "text-[var(--muted)]")}>{formatNumber(row.totalSoh)}</td>
      <td className={cx("py-2.5 px-2", muted && "text-[var(--muted)]")}>{formatNumber(row.totalConsumption)}</td>
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-2 w-24">
          <span className="w-8 text-right">{row.doh}d</span>
          <ProgressBar pct={(row.doh / 90) * 100} tone={tone} />
        </div>
      </td>
      <td className={cx("py-2.5 px-2", muted && "text-[var(--muted)]")}>{row.dohLastDay}d</td>
      <td className={cx("py-2.5 px-2", muted && "text-[var(--muted)]")}>{row.avgLeadTimeDays}d</td>
      <td className={cx("py-2.5 px-2", muted && "text-[var(--muted)]")}>{formatNumber(row.totalOpenOrders)}</td>
      <td className={cx("py-2.5 px-2", muted && "text-[var(--muted)]")}>{formatNumber(row.totalInTransit)}</td>
      <td className={cx("py-2.5 px-2", muted && "text-[var(--muted)]")}>{formatINR(row.avgMrp)}</td>
    </>
  );
}

function CategoryRcaCard({ channelFilter, categoryFilter }: { channelFilter: Set<string>; categoryFilter: Set<string> }) {
  const months = Array.from(new Set(CATEGORY_RCA.map((r) => r.month)));
  const [month, setMonth] = useState(months[months.length - 1]);
  const rows = CATEGORY_RCA.filter((r) => r.month === month)
    .filter((r) => passesFilter(channelFilter, r.channel))
    .filter((r) => passesFilter(categoryFilter, r.category));
  const categories = Array.from(new Set(rows.map((r) => r.category)));
  const rcaChannels = Array.from(new Set(rows.map((r) => r.channel)));

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <CardHeader title="Category RCA (Root Cause Analysis)" subtitle="MS (Market Share) · OSA (On-Shelf Availability) · SOV (Share of Voice) by category" />
        <Pills options={months.map((m) => ({ value: m, label: m }))} value={month} onChange={setMonth} />
      </div>
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
              <th className="py-2 px-5 font-medium">Category</th>
              {rcaChannels.map((c) => (
                <th key={c} className="py-2 px-2 font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                <td className="py-2.5 px-5 font-medium">{cat}</td>
                {rcaChannels.map((c) => {
                  const cell = rows.find((r) => r.category === cat && r.channel === c);
                  if (!cell) return <td key={c} className="py-2.5 px-2 text-[var(--muted)]">—</td>;
                  return (
                    <td key={c} className="py-2.5 px-2">
                      <div className="flex items-center gap-1 text-xs">
                        <IconTile icon={<Gauge size={12} />} tone={cell.osaPct >= 75 ? "ok" : "danger"} />
                        <div>
                          <div className="font-medium">{cell.marketSharePct}% MS</div>
                          <div className="text-[var(--muted)] flex items-center gap-1">
                            {cell.osaPct}% OSA · <Radar size={10} /> {cell.sovPct}% SOV
                          </div>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={rcaChannels.length + 1} className="py-6 text-center text-[var(--muted)]">
                  <Tag size={14} className="inline mr-1.5" /> No data for this filter combination.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
