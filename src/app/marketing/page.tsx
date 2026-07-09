"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Card, CardHeader, StatCard, Badge, ProgressBar } from "@/components/ui";
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
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Keyword</th>
                <th className="py-2 px-2 font-medium">Platform</th>
                <th className="py-2 px-2 font-medium">Trend</th>
                <th className="py-2 px-2 font-medium">Change</th>
                <th className="py-2 px-2 font-medium">CAVA rank</th>
              </tr>
            </thead>
            <tbody>
              {TRENDING_KEYWORDS.map((k) => (
                <tr key={k.keyword} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5 font-medium">{k.keyword}</td>
                  <td className="py-2.5 px-2 text-[var(--muted)]">{k.platform}</td>
                  <td className="py-2.5 px-2 w-28">
                    <ResponsiveContainer width={100} height={28}>
                      <LineChart data={k.volumeTrend.map((v, i) => ({ i, v }))}>
                        <Line type="monotone" dataKey="v" stroke={k.changePct >= 0 ? "var(--accent)" : "var(--danger)"} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </td>
                  <td className={`py-2.5 px-2 font-medium ${k.changePct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]"}`}>{formatPct(k.changePct)}</td>
                  <td className="py-2.5 px-2">{k.cavaRanking ? `#${k.cavaRanking}` : <span className="text-[var(--muted)]">Not ranking</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Reels performance" subtitle="Instagram / Meta content this month" />
          <div className="space-y-3">
            {REELS.map((r) => (
              <div key={r.id} className="rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium line-clamp-1">{r.caption}</span>
                  <Badge tone={r.status}>{r.status}</Badge>
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {formatCompactNumber(r.views)} views · {formatCompactNumber(r.likes)} likes · {r.engagementRate}% engagement · {r.postedDaysAgo}d ago
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Ad campaign performance" subtitle="ROAS trend & recommended action" />
          <div className="space-y-3">
            {AD_CAMPAIGNS.map((a) => (
              <div key={a.name} className="rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium">{a.name}</span>
                  <Badge tone={a.status}>{a.status}</Badge>
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {a.platform} · {a.roas.toFixed(2)}x ROAS ({formatPct(a.roasChangePct)}) · CTR {a.ctr}% · spend {formatINR(a.spend, true)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Deal / promo performance" subtitle="Conversion rate decay over time — spot dying deals early" />
        <div className="space-y-3">
          {DEALS.map((d) => (
            <div key={d.name} className="rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div>
                  <span className="text-sm font-medium">{d.name}</span>
                  <span className="text-[11px] text-[var(--muted)] ml-2">{d.channel} · {d.discountPct}% off · week {d.weeksLive}</span>
                </div>
                <Badge tone={d.status}>{d.status}</Badge>
              </div>
              <ProgressBar
                pct={(d.conversionTrend[d.conversionTrend.length - 1] / Math.max(...d.conversionTrend)) * 100}
                tone={d.status === "performing" ? "ok" : d.status === "decaying" ? "accent" : "danger"}
              />
              <div className="text-[11px] text-[var(--muted)] mt-1">
                Conversion: {d.conversionTrend.map((v) => `${v}%`).join(" → ")}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Competitor benchmark" subtitle="Estimated scale, growth & this week's biggest move" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Competitor</th>
                <th className="py-2 px-2 font-medium">Positioning</th>
                <th className="py-2 px-2 font-medium">Est. monthly revenue</th>
                <th className="py-2 px-2 font-medium">IG growth (30d)</th>
                <th className="py-2 px-2 font-medium">Price index</th>
                <th className="py-2 px-2 font-medium">This week's move</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c) => (
                <tr key={c.name} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60 align-top">
                  <td className="py-2.5 px-5 font-medium whitespace-nowrap">{c.name}</td>
                  <td className="py-2.5 px-2 text-[var(--muted)]">{c.positioning}</td>
                  <td className="py-2.5 px-2">{formatINR(c.estMonthlyRevenueINR, true)}</td>
                  <td className={`py-2.5 px-2 font-medium ${c.igGrowthPct30d >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]"}`}>{formatPct(c.igGrowthPct30d)}</td>
                  <td className="py-2.5 px-2">{c.priceIndexVsCava.toFixed(2)}x</td>
                  <td className="py-2.5 px-2 text-[var(--muted)] max-w-xs">{c.topMoveThisWeek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
