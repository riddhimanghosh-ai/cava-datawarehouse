"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, Boxes, Calendar, Flame, PackageX, Store, TrendingUp, Wallet } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, IconTile, RingProgress, ProgressBar, FilterRow, FilterBox, MultiSelect } from "@/components/ui";
import { formatINR, formatPct, formatNumber } from "@/lib/format";
import {
  CHANNELS,
  CHANNEL_COLORS,
  dailyTotalsFiltered,
  inventorySummary,
  last30vsPrev30Filtered,
  totalRevenueByChannel,
  cashSummary,
  forecastAccuracy,
  AD_CAMPAIGNS,
  REELS,
  COMPETITORS,
} from "@/lib/data";

const DATE_RANGES = [
  { value: "30", label: "Last 30 days" },
  { value: "14", label: "Last 14 days" },
  { value: "7", label: "Last 7 days" },
];

export default function OverviewPage() {
  const [range, setRange] = useState("30");
  const [channels, setChannels] = useState<Set<string>>(new Set());

  const days = Number(range);
  const revenueGrowth = last30vsPrev30Filtered(channels);
  const daily = dailyTotalsFiltered(channels, days);
  const byChannel = useMemo(() => {
    const all = totalRevenueByChannel(days);
    const filtered = channels.size === 0 ? all : all.filter((c) => channels.has(c.channel));
    const total = filtered.reduce((s, c) => s + c.revenue, 0);
    return filtered
      .map((c) => ({ ...c, share: total > 0 ? (c.revenue / total) * 100 : 0 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [days, channels]);

  const inv = inventorySummary();
  const cash = cashSummary();
  const accuracy = forecastAccuracy();
  const scalingAds = AD_CAMPAIGNS.filter((a) => a.status === "scaling").length;
  const fatiguedAds = AD_CAMPAIGNS.filter((a) => a.status === "fatigued" || a.status === "paused-recommended").length;
  const viralReels = REELS.filter((r) => r.status === "viral").length;
  const topGrowthCompetitor = [...COMPETITORS].sort((a, b) => b.igGrowthPct30d - a.igGrowthPct30d)[0];

  const recentDays = daily.slice(-7);
  const maxDayRev = Math.max(...recentDays.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <FilterRow>
        <FilterBox label="Date range" icon={<Calendar size={12} />} value={range} onChange={setRange} options={DATE_RANGES} />
        <MultiSelect label="Channel" icon={<Store size={12} />} options={CHANNELS.map((c) => ({ value: c, label: c }))} selected={channels} onChange={setChannels} />
      </FilterRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`Revenue (last 30 days${channels.size ? ", filtered" : ", all channels"})`} value={formatINR(revenueGrowth.last, true)} changePct={revenueGrowth.growthPct} changeLabel="vs prior 30 days" />
        <StatCard label="Cash on hand" value={formatINR(cash.current, true)} changePct={((cash.current - 6_400_000) / 6_400_000) * 100} changeLabel="since Feb" />
        <StatCard label="SKUs at stockout risk" value={`${inv.critical + inv.low}`} changePct={-((inv.critical + inv.low) / inv.total) * 100} changeLabel="of channel-SKU pairs" tone="danger" />
        <StatCard label="Demand forecast accuracy" value={`${accuracy}%`} changePct={accuracy - 85} changeLabel="vs 85% target" tone={accuracy >= 85 ? "ok" : "danger"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title={`Revenue — last ${days} days`} subtitle="Daily gross revenue for the selected channels" />
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                  <th className="py-2 px-5 font-medium">Date (last 7 shown)</th>
                  <th className="py-2 px-2 font-medium">Revenue</th>
                  <th className="py-2 px-2 font-medium">Orders</th>
                  <th className="py-2 px-2 font-medium w-40">Share of peak day</th>
                </tr>
              </thead>
              <tbody>
                {recentDays.map((d) => (
                  <tr key={d.date} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                    <td className="py-2.5 px-5 font-medium">{new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                    <td className="py-2.5 px-2">{formatINR(d.revenue, true)}</td>
                    <td className="py-2.5 px-2 text-[var(--muted)]">{formatNumber(d.orders)}</td>
                    <td className="py-2.5 px-2"><ProgressBar pct={(d.revenue / maxDayRev) * 100} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Revenue mix by channel" subtitle={`Last ${days} days`} />
          <div className="space-y-3">
            {byChannel.map((c) => (
              <div key={c.channel}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHANNEL_COLORS[c.channel] }} />
                    {c.channel}
                  </span>
                  <span className="text-[var(--muted)]">{formatINR(c.revenue, true)} · {c.share.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.share}%`, background: CHANNEL_COLORS[c.channel] }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Inventory health" subtitle="Across all channel-SKU listings" />
          <div className="flex items-center gap-4 mb-4">
            <RingProgress pct={(inv.healthy / inv.total) * 100} size={64} tone="ok" label={`${Math.round((inv.healthy / inv.total) * 100)}%`} />
            <div className="text-xs text-[var(--muted)]">
              <span className="text-[var(--foreground)] font-semibold">{inv.healthy}</span> of {inv.total} listings are at a healthy stock level. The rest need action below.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat icon={<PackageX size={15} />} tone="danger" value={inv.critical} label="Critical" />
            <MiniStat icon={<AlertTriangle size={15} />} tone="default" value={inv.low} label="Low stock" />
            <MiniStat icon={<Boxes size={15} />} tone="default" value={inv.overstock} label="Overstocked" />
            <MiniStat icon={<Boxes size={15} />} tone="danger" value={inv.excess} label="Excess/aging" />
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)] space-y-1">
            <div>Capital stuck in excess stock: <span className="text-[var(--foreground)] font-semibold">{formatINR(inv.capitalStuck, true)}</span></div>
            <div>Est. lost sales from stockouts (14d): <span className="text-[var(--foreground)] font-semibold">{formatINR(inv.potentialLostSales, true)}</span></div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Cash flow snapshot" subtitle="Receivables, payables & runway" />
          <div className="flex items-center gap-4 mb-4">
            <IconTile icon={<Wallet size={18} />} tone="accent" />
            <div>
              <div className="text-xs text-[var(--muted)]">Estimated runway at current burn</div>
              <div className="text-xl font-bold">{cash.runwayMonths.toFixed(1)} months</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
              <div className="text-[11px] text-[var(--muted)]">Receivables</div>
              <div className="font-semibold">{formatINR(cash.totalReceivables, true)}</div>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
              <div className="text-[11px] text-[var(--muted)]">Payables due</div>
              <div className="font-semibold">{formatINR(cash.totalPayables, true)}</div>
            </div>
          </div>
          <div className="mt-2.5 rounded-lg bg-[var(--surface-2)] px-3 py-2.5 text-sm">
            <div className="text-[11px] text-[var(--muted)]">Avg monthly outflow</div>
            <div className="font-semibold">{formatINR(cash.avgMonthlyOutflow, true)}</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Marketing" subtitle="This week" />
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <MiniStat icon={<TrendingUp size={15} />} tone="ok" value={scalingAds} label="Scaling ads" />
            <MiniStat icon={<ArrowDownRight size={15} />} tone="danger" value={fatiguedAds} label="Need action" />
            <MiniStat icon={<Flame size={15} />} tone="accent" value={viralReels} label="Viral reels" />
          </div>
          <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2.5 text-xs text-[var(--muted)]">
            Fastest-growing competitor: <span className="text-[var(--foreground)] font-medium">{topGrowthCompetitor.name}</span> — {formatPct(topGrowthCompetitor.igGrowthPct30d)} IG growth (30d)
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: "danger" | "ok" | "accent" | "default" }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
      <IconTile icon={icon} tone={tone} />
      <div>
        <div className="text-base font-bold leading-none">{value}</div>
        <div className="text-[11px] text-[var(--muted)] leading-none mt-1">{label}</div>
      </div>
    </div>
  );
}
