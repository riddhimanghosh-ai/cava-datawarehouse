"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Gauge, Radar, TrendingDown } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Card, CardHeader, StatCard, Badge, ProgressBar, Pills, SwatchDot, IconTile } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import {
  CHANNELS,
  Channel,
  INVENTORY,
  inventorySummary,
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

export default function InventoryPage() {
  const summary = inventorySummary();
  const osaSum = osaSummary();
  const [expanded, setExpanded] = useState<Set<Channel>>(new Set());
  const total = sohTotal();

  const toggle = (c: Channel) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SOH (units)" value={formatNumber(total.totalSoh)} />
        <StatCard label="Blended DOH" value={`${total.doh}d`} tone={dohTone(total.doh) === "ok" ? "ok" : "danger"} />
        <StatCard label="Avg on-shelf availability (7d)" value={`${osaSum.avgOsa}%`} tone={osaSum.avgOsa >= 80 ? "ok" : "danger"} />
        <StatCard label="P0 critical OSA listings" value={`${osaSum.p0}`} tone="danger" />
      </div>

      <Card>
        <CardHeader title="Stock on hand — by channel" subtitle="Total SOH, trailing consumption, days-of-hand & pipeline. Click a channel to see its category split." />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Channel</th>
                <th className="py-2 px-2 font-medium">Total SOH</th>
                <th className="py-2 px-2 font-medium">Consumption (30d)</th>
                <th className="py-2 px-2 font-medium">DOH</th>
                <th className="py-2 px-2 font-medium">DOH (LD)</th>
                <th className="py-2 px-2 font-medium">Avg lead time</th>
                <th className="py-2 px-2 font-medium">Open orders</th>
                <th className="py-2 px-2 font-medium">In transit</th>
                <th className="py-2 px-2 font-medium">Avg MRP</th>
              </tr>
            </thead>
            <tbody>
              {sohByChannel().map((row) => (
                <ChannelRows key={row.key} row={row} channel={row.key as Channel} expanded={expanded.has(row.key as Channel)} onToggle={() => toggle(row.key as Channel)} />
              ))}
              <SohRow row={total} bold />
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardHeader title="On-shelf availability — needs attention" subtitle="SKUs below 85% 7-day OSA, sorted by priority" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {OSA.filter((r) => r.priority !== "Healthy")
            .sort((a, b) => a.last7DayOsa - b.last7DayOsa)
            .slice(0, 9)
            .map((r) => {
              const product = PRODUCTS.find((p) => p.sku === r.sku)!;
              return (
                <div key={`${r.sku}-${r.channel}`} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <SwatchDot color={product.heroColor} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-tight truncate">{r.name}</div>
                      <div className="text-[11px] text-[var(--muted)] mt-0.5">{r.channel}</div>
                    </div>
                    <Badge tone={r.priority}>{r.priority}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                    <span>7d OSA: <span className="text-[var(--foreground)] font-semibold">{r.last7DayOsa}%</span></span>
                    <Badge tone={r.trend}>{r.trend}</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={30}>
                    <LineChart data={r.dailySeries.map((v, i) => ({ i, v }))}>
                      <Line type="monotone" dataKey="v" stroke={r.trend === "CRASHING" ? "var(--danger)" : r.trend === "Improving" ? "var(--ok)" : "var(--warning)"} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-[11px] text-[var(--muted)] mt-1">15d avg: {r.last15DayOsa}%</div>
                </div>
              );
            })}
        </div>
      </Card>

      <CategoryRcaCard />

      <Card>
        <CardHeader title="Reorder recommendations" subtitle="Auto-generated from sell-through velocity vs. on-hand cover" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVENTORY.filter((r) => r.status === "critical").slice(0, 6).map((r) => {
            const product = PRODUCTS.find((p) => p.sku === r.sku)!;
            const suggestedQty = Math.round(r.avgDailySales * 30);
            return (
              <div key={`${r.sku}-${r.channel}-reco`} className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <IconTile icon={<TrendingDown size={16} />} tone="danger" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-sm">{r.name}</div>
                    <Badge tone="critical">critical</Badge>
                  </div>
                  <div className="text-xs text-[var(--muted)] mb-2">{r.channel} · {r.daysOfCover}d cover left · {r.warehouse}</div>
                  <div className="text-sm">
                    Order <span className="font-semibold text-[var(--accent)]">{formatNumber(suggestedQty)} units</span> now to avoid stockout before restock lands ({r.incomingEta}) · est. cost {formatINR(suggestedQty * product.cost, true)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
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

function CategoryRcaCard() {
  const months = Array.from(new Set(CATEGORY_RCA.map((r) => r.month)));
  const [month, setMonth] = useState(months[months.length - 1]);
  const rows = CATEGORY_RCA.filter((r) => r.month === month);
  const categories = Array.from(new Set(rows.map((r) => r.category)));

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <CardHeader title="Category RCA" subtitle="Market share, on-shelf availability & share of voice by category" />
        <Pills options={months.map((m) => ({ value: m, label: m }))} value={month} onChange={setMonth} />
      </div>
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
              <th className="py-2 px-5 font-medium">Category</th>
              {CHANNELS.filter((c) => rows.some((r) => r.channel === c)).map((c) => (
                <th key={c} className="py-2 px-2 font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                <td className="py-2.5 px-5 font-medium">{cat}</td>
                {CHANNELS.filter((c) => rows.some((r) => r.channel === c)).map((c) => {
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
          </tbody>
        </table>
      </div>
    </Card>
  );
}
