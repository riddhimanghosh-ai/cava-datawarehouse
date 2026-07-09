"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowDownRight, Boxes, Flame, PackageX, TrendingUp, Wallet } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, IconTile, RingProgress } from "@/components/ui";
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
          <div className="flex items-center gap-4 mb-4">
            <RingProgress
              pct={(inv.healthy / inv.total) * 100}
              size={64}
              tone="ok"
              label={`${Math.round((inv.healthy / inv.total) * 100)}%`}
            />
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
          <CardHeader title="Marketing pulse" subtitle="This week" />
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
