"use client";

import { useState } from "react";
import { BarChart3, Users, Globe, MousePointerClick, Target } from "lucide-react";
import { Card, CardHeader, StatCard, Tabs, ProgressBar, LabelledBar , DateRangeBar } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import {
  GA_TRAFFIC_KPIS,
  GA_ECOMMERCE_KPIS,
  GA_NEW_VS_RETURNING,
  GA_DEVICE_CATEGORY,
  GA_BROWSERS,
  GA_ACQUISITION,
  GA_BEHAVIOR_PAGES,
  GA_SESSION_FUNNEL,
  GA_PRODUCT_FUNNEL,
  FunnelStage,
} from "@/lib/data";

type Tab = "overview" | "audience" | "acquisition" | "behavior" | "conversions";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
  { value: "audience", label: "Audience", icon: <Users size={15} /> },
  { value: "acquisition", label: "Acquisition", icon: <Globe size={15} /> },
  { value: "behavior", label: "Behavior", icon: <MousePointerClick size={15} /> },
  { value: "conversions", label: "Conversions", icon: <Target size={15} /> },
];

export default function GoogleAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const maxAcq = Math.max(...GA_ACQUISITION.map((a) => a.sessions));

  return (
    <div>
      <DateRangeBar />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Traffic & Engagement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {GA_TRAFFIC_KPIS.map((k) => (
                <StatCard key={k.label} {...k} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">E-Commerce Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {GA_ECOMMERCE_KPIS.map((k) => (
                <StatCard key={k.label} {...k} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "audience" && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="New vs Returning users" subtitle="Sessions, share, purchases & revenue by user type" />
            <div className="space-y-4 mb-5">
              {GA_NEW_VS_RETURNING.map((u, i) => (
                <LabelledBar key={u.type} label={u.type} value={`${formatNumber(u.sessions)} sessions · ${u.sharePct}%`} pct={u.sharePct} tone={i === 0 ? "accent" : "ok"} />
              ))}
            </div>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                    <th className="py-2 px-5 font-medium">User type</th>
                    <th className="py-2 px-2 font-medium">Sessions</th>
                    <th className="py-2 px-2 font-medium">Share</th>
                    <th className="py-2 px-2 font-medium">Purchases</th>
                    <th className="py-2 px-2 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {GA_NEW_VS_RETURNING.map((u) => (
                    <tr key={u.type} className="border-b border-[var(--border)]/60">
                      <td className="py-2.5 px-5 font-medium">{u.type}</td>
                      <td className="py-2.5 px-2">{formatNumber(u.sessions)}</td>
                      <td className="py-2.5 px-2">{u.sharePct}%</td>
                      <td className="py-2.5 px-2">{formatNumber(u.purchases)}</td>
                      <td className="py-2.5 px-2 font-medium">{formatINR(u.revenue, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Device category" subtitle="Sessions by device type" />
              <div className="space-y-4">
                {GA_DEVICE_CATEGORY.map((d) => (
                  <LabelledBar key={d.label} label={d.label} value={`${formatNumber(d.value)} (${d.sharePct}%)`} pct={d.sharePct} />
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Browsers" subtitle="Sessions by browser" />
              <div className="space-y-4">
                {GA_BROWSERS.map((b) => (
                  <LabelledBar key={b.label} label={b.label} value={`${formatNumber(b.value)} (${b.sharePct}%)`} pct={b.sharePct} tone="ok" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "acquisition" && (
        <Card>
          <CardHeader title="Acquisition channels" subtitle="Where sessions come from — and which convert" />
          <div className="space-y-3">
            {GA_ACQUISITION.map((a) => (
              <div key={a.channel} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{a.channel}</span>
                  <span className="text-sm font-semibold">{formatINR(a.revenue, true)}</span>
                </div>
                <ProgressBar pct={(a.sessions / maxAcq) * 100} tone={a.convRate >= 2 ? "ok" : "accent"} />
                <div className="flex items-center gap-4 text-[11px] text-[var(--muted)] mt-2">
                  <span>{formatNumber(a.sessions)} sessions</span>
                  <span>{formatNumber(a.newUsers)} new users</span>
                  <span className={cx(a.convRate >= 2 ? "text-[var(--ok)]" : "")}>{a.convRate}% conversion</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "behavior" && (
        <Card>
          <CardHeader title="Top pages" subtitle="Pageviews, average time on page & bounce rate" />
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                  <th className="py-2 px-5 font-medium">Page</th>
                  <th className="py-2 px-2 font-medium">Pageviews</th>
                  <th className="py-2 px-2 font-medium">Avg time</th>
                  <th className="py-2 px-2 font-medium">Bounce rate</th>
                </tr>
              </thead>
              <tbody>
                {GA_BEHAVIOR_PAGES.map((p) => (
                  <tr key={p.page} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                    <td className="py-2.5 px-5 font-mono text-[13px]">{p.page}</td>
                    <td className="py-2.5 px-2">{formatNumber(p.pageviews)}</td>
                    <td className="py-2.5 px-2">{p.avgTime}</td>
                    <td className={cx("py-2.5 px-2", p.bouncePct > 40 ? "text-[var(--warning)]" : "text-[var(--ok)]")}>{p.bouncePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "conversions" && (
        <div className="space-y-4">
          <FunnelCard title="Sessions → Purchase" subtitle="Full-funnel drop-off from session to completed order" stages={GA_SESSION_FUNNEL} />
          <FunnelCard title="Product View → Purchase" subtitle="Discovery-to-purchase drop-off via product pages" stages={GA_PRODUCT_FUNNEL} />
        </div>
      )}
    </div>
  );
}

function FunnelCard({ title, subtitle, stages }: { title: string; subtitle: string; stages: FunnelStage[] }) {
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
                  <span className="h-5 w-5 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
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
                    <span className={cx("rounded-md px-1.5 py-0.5 text-[11px] font-medium", s.dropOffPct > 60 ? "bg-[var(--danger)]/10 text-[var(--danger)]" : s.dropOffPct > 0 ? "bg-[var(--warning)]/10 text-[var(--warning)]" : "bg-[var(--ok)]/10 text-[var(--ok)]")}>
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
