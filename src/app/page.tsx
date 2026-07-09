"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, StatCard, Badge } from "@/components/ui";
import { formatINR, formatPct } from "@/lib/format";
import {
  CHANNEL_COLORS,
  dailyTotals,
  inventorySummary,
  last30vsPrev30,
  totalRevenueByChannel,
  cashSummary,
  forecastAccuracy,
  AD_CAMPAIGNS,
  REELS,
  COMPETITORS,
} from "@/lib/data";

export default function OverviewPage() {
  const revenueGrowth = last30vsPrev30();
  const daily = dailyTotals(30);
  const byChannel = totalRevenueByChannel(30);
  const inv = inventorySummary();
  const cash = cashSummary();
  const accuracy = forecastAccuracy();
  const scalingAds = AD_CAMPAIGNS.filter((a) => a.status === "scaling").length;
  const fatiguedAds = AD_CAMPAIGNS.filter((a) => a.status === "fatigued" || a.status === "paused-recommended").length;
  const viralReels = REELS.filter((r) => r.status === "viral").length;
  const topGrowthCompetitor = [...COMPETITORS].sort((a, b) => b.igGrowthPct30d - a.igGrowthPct30d)[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue (last 30 days, all channels)"
          value={formatINR(revenueGrowth.last, true)}
          changePct={revenueGrowth.growthPct}
          changeLabel="vs prior 30 days"
        />
        <StatCard
          label="Cash on hand"
          value={formatINR(cash.current, true)}
          changePct={((cash.current - 6_400_000) / 6_400_000) * 100}
          changeLabel="since Feb"
        />
        <StatCard
          label="SKUs at stockout risk"
          value={`${inv.critical + inv.low}`}
          changePct={-((inv.critical + inv.low) / inv.total) * 100}
          changeLabel="of channel-SKU pairs"
          tone="danger"
        />
        <StatCard
          label="Demand forecast accuracy"
          value={`${accuracy}%`}
          changePct={accuracy - 85}
          changeLabel="vs 85% target"
          tone={accuracy >= 85 ? "ok" : "danger"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue trend — last 30 days" subtitle="All channels combined, daily gross revenue" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} interval={4} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => formatINR(v, true)} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                formatter={(v) => formatINR(Number(v))}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Revenue mix by channel" subtitle="Last 30 days" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byChannel}
                dataKey="revenue"
                nameKey="channel"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {byChannel.map((c) => (
                  <Cell key={c.channel} fill={CHANNEL_COLORS[c.channel]} stroke="var(--surface)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                formatter={(v) => formatINR(Number(v))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {byChannel.map((c) => (
              <div key={c.channel} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <span className="h-2 w-2 rounded-full" style={{ background: CHANNEL_COLORS[c.channel] }} />
                {c.channel}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Inventory health" subtitle="Across all channel-SKU listings" />
          <div className="space-y-2.5">
            <Row label="Critical (stockout <5 days)" value={inv.critical} tone="critical" />
            <Row label="Low stock (5–12 days)" value={inv.low} tone="low" />
            <Row label="Healthy" value={inv.healthy} tone="healthy" />
            <Row label="Overstocked" value={inv.overstock} tone="overstock" />
            <Row label="Excess / aging 75d+" value={inv.excess} tone="excess-aging" />
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)] space-y-1">
            <div>Capital stuck in excess stock: <span className="text-[var(--foreground)] font-semibold">{formatINR(inv.capitalStuck, true)}</span></div>
            <div>Est. lost sales from stockouts (14d): <span className="text-[var(--foreground)] font-semibold">{formatINR(inv.potentialLostSales, true)}</span></div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Cash flow snapshot" subtitle="Receivables, payables & runway" />
          <div className="space-y-2.5">
            <Row label="Total receivables" value={formatINR(cash.totalReceivables, true)} tone="on-time" plain />
            <Row label="Total payables due" value={formatINR(cash.totalPayables, true)} tone="delayed" plain />
            <Row label="Avg monthly outflow" value={formatINR(cash.avgMonthlyOutflow, true)} tone="medium" plain />
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-xs text-[var(--muted)] mb-1">Estimated runway at current burn</div>
            <div className="text-xl font-bold">{cash.runwayMonths.toFixed(1)} months</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Marketing pulse" subtitle="This week" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Ad campaigns scaling</span>
              <Badge tone="scaling">{`${scalingAds} scaling`}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Campaigns needing action</span>
              <Badge tone="paused-recommended">{`${fatiguedAds} fatigued`}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Reels gone viral</span>
              <Badge tone="viral">{`${viralReels} viral`}</Badge>
            </div>
            <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
              Fastest-growing competitor: <span className="text-[var(--foreground)] font-medium">{topGrowthCompetitor.name}</span> ({formatPct(topGrowthCompetitor.igGrowthPct30d)} IG growth, 30d)
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Revenue by channel — last 30 days" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byChannel} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => formatINR(v, true)} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="channel" tick={{ fill: "var(--foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
            <Tooltip
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
              formatter={(v) => formatINR(Number(v))}
            />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
              {byChannel.map((c) => (
                <Cell key={c.channel} fill={CHANNEL_COLORS[c.channel]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Row({ label, value, tone, plain }: { label: string; value: number | string; tone: string; plain?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {plain ? (
        <span className="font-semibold">{value}</span>
      ) : (
        <Badge tone={tone}>{`${value}`}</Badge>
      )}
    </div>
  );
}
