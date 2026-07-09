"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Flame, Play, Search, Swords, Tag } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, ProgressBar, IconTile } from "@/components/ui";
import { formatCompactNumber, formatINR, formatPct } from "@/lib/format";
import { AD_CAMPAIGNS, COMPETITORS, DEALS, REELS, TRENDING_KEYWORDS } from "@/lib/data";

export default function MarketingPage() {
  const totalSpend = AD_CAMPAIGNS.reduce((s, a) => s + a.spend, 0);
  const totalRevenue = AD_CAMPAIGNS.reduce((s, a) => s + a.revenue, 0);
  const blendedRoas = totalRevenue / totalSpend;
  const viralReels = REELS.filter((r) => r.status === "viral").length;
  const deadDeals = DEALS.filter((d) => d.status === "dead" || d.status === "decaying").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Blended ROAS (7 campaigns)" value={`${blendedRoas.toFixed(2)}x`} changePct={4.2} changeLabel="week over week" />
        <StatCard label="Ad spend (30d)" value={formatINR(totalSpend, true)} />
        <StatCard label="Viral / trending reels" value={`${viralReels}`} tone="ok" />
        <StatCard label="Deals decaying or dead" value={`${deadDeals}`} tone="danger" />
      </div>

      <Card>
        <CardHeader title="Trending keywords" subtitle="Search & social demand signals, 8-week trend" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TRENDING_KEYWORDS.map((k) => (
            <div key={k.keyword} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-start justify-between mb-2">
                <IconTile icon={<Search size={15} />} tone={k.changePct >= 0 ? "ok" : "danger"} />
                <span className={`text-xs font-semibold ${k.changePct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]"}`}>{formatPct(k.changePct)}</span>
              </div>
              <div className="text-sm font-medium leading-snug mb-1">{k.keyword}</div>
              <div className="text-[11px] text-[var(--muted)] mb-2">{k.platform}</div>
              <ResponsiveContainer width="100%" height={32}>
                <LineChart data={k.volumeTrend.map((v, i) => ({ i, v }))}>
                  <Line type="monotone" dataKey="v" stroke={k.changePct >= 0 ? "var(--accent)" : "var(--danger)"} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-[11px] text-[var(--muted)] mt-1">
                {k.cavaRanking ? <>CAVA ranks <span className="text-[var(--foreground)] font-medium">#{k.cavaRanking}</span></> : "CAVA not ranking yet"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Reels performance" subtitle="Instagram / Meta content this month" />
          <div className="space-y-3">
            {REELS.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-3">
                <IconTile icon={<Play size={15} />} tone={r.status === "viral" ? "accent" : r.status === "trending" ? "ok" : "default"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium line-clamp-1">{r.caption}</span>
                    <Badge tone={r.status}>{r.status}</Badge>
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {formatCompactNumber(r.views)} views · {formatCompactNumber(r.likes)} likes · {r.engagementRate}% engagement · {r.postedDaysAgo}d ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Ad campaign performance" subtitle="ROAS trend & recommended action" />
          <div className="space-y-3">
            {AD_CAMPAIGNS.map((a) => (
              <div key={a.name} className="flex items-start gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-3">
                <IconTile icon={<Flame size={15} />} tone={a.status === "scaling" ? "ok" : a.status === "healthy" ? "accent" : "danger"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium">{a.name}</span>
                    <Badge tone={a.status}>{a.status}</Badge>
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {a.platform} · {a.roas.toFixed(2)}x ROAS ({formatPct(a.roasChangePct)}) · CTR {a.ctr}% · spend {formatINR(a.spend, true)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Deal / promo performance" subtitle="Conversion rate decay over time — spot dying deals early" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEALS.map((d) => (
            <div key={d.name} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <IconTile icon={<Tag size={15} />} tone={d.status === "performing" ? "ok" : d.status === "decaying" ? "default" : "danger"} />
                <Badge tone={d.status}>{d.status}</Badge>
              </div>
              <div className="text-sm font-medium">{d.name}</div>
              <div className="text-[11px] text-[var(--muted)] mb-2">{d.channel} · {d.discountPct}% off · week {d.weeksLive}</div>
              <ProgressBar
                pct={(d.conversionTrend[d.conversionTrend.length - 1] / Math.max(...d.conversionTrend)) * 100}
                tone={d.status === "performing" ? "ok" : d.status === "decaying" ? "accent" : "danger"}
              />
              <div className="text-[11px] text-[var(--muted)] mt-1.5">
                Conversion: {d.conversionTrend.map((v) => `${v}%`).join(" → ")}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Competitor benchmark" subtitle="Estimated scale, growth & this week's biggest move" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMPETITORS.map((c) => (
            <div key={c.name} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-bold text-sm shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{c.name}</span>
                    <span className={`text-xs font-semibold ${c.igGrowthPct30d >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]"}`}>{formatPct(c.igGrowthPct30d)}</span>
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">{c.positioning}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--muted)] mb-2">
                <span>Est. revenue <span className="text-[var(--foreground)] font-medium">{formatINR(c.estMonthlyRevenueINR, true)}</span>/mo</span>
                <span>Price index <span className="text-[var(--foreground)] font-medium">{c.priceIndexVsCava.toFixed(2)}x</span></span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-[var(--foreground)] bg-[var(--surface)] rounded-lg px-2.5 py-2">
                <Swords size={13} className="text-[var(--accent)] mt-0.5 shrink-0" />
                {c.topMoveThisWeek}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
