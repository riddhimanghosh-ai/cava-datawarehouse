"use client";

import { useState } from "react";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { Card, CardHeader, StatCard, Tabs, ProgressBar, LabelledBar } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import {
  META_KPIS,
  META_FUNNEL,
  META_AGE_GENDER,
  META_DEVICES,
  META_PLACEMENT_PERF,
  META_PLACEMENT_MIX,
  META_COUNTRIES,
  META_REACH_FREQ,
  META_CAMPAIGNS,
  MetaBar,
  GOOGLE_ADS_KPIS,
  GOOGLE_ADS_CAMPAIGNS,
} from "@/lib/data";

type Tab = "meta" | "google";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "meta", label: "Meta Ads", icon: <BarChart3 size={15} /> },
  { value: "google", label: "Google Ads", icon: <BarChart3 size={15} /> },
];

// ROAS band → doctrine tone for spend bars.
function roasTone(roas: number): "ok" | "warning" | "danger" {
  if (roas >= 1.5) return "ok";
  if (roas >= 1) return "warning";
  return "danger";
}

export default function MetaAdsPage() {
  const [tab, setTab] = useState<Tab>("meta");
  return (
    <div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "meta" ? <MetaAds /> : <GoogleAds />}
    </div>
  );
}

function SpendBars({ rows }: { rows: MetaBar[] }) {
  const max = Math.max(...rows.map((r) => r.spend));
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <LabelledBar
          key={r.label}
          label={r.label}
          value={`${formatINR(r.spend, true)} · ${r.roas.toFixed(2)}x`}
          pct={(r.spend / max) * 100}
          tone={roasTone(r.roas)}
        />
      ))}
      <div className="eyebrow pt-1">Bars coloured by ROAS · ≥1.5x ok · 1–1.5x watch · &lt;1x loss</div>
    </div>
  );
}

function MetaAds() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        {META_KPIS.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="border-[var(--danger)]/40 bg-[var(--danger)]/[0.05]">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 border border-[var(--danger)]/40 text-[var(--danger)] flex items-center justify-center shrink-0">
            <AlertTriangle size={18} strokeWidth={1.5} />
          </div>
          <div className="text-sm">
            <div className="font-medium mb-0.5">ROAS below 1x — spending more than earning</div>
            <p className="text-[var(--muted)] text-xs">
              Meta attributes ₹0.76 in purchase revenue per ₹1 spent. Check the campaign breakdown below — pause the underperformers and shift budget to the ROAS &gt; 1x campaigns (PW-MOF-BAU at 3.71x, CV_DCO_June at 1.46x).
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Conversion funnel" subtitle="From impression to purchase — with drop-off at each step" />
        <div className="space-y-3">
          {META_FUNNEL.map((s, i) => (
            <div key={s.stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                  {s.stage}
                </span>
                <span className="text-[var(--muted)]">
                  {formatNumber(s.count)}
                  {s.pctOfPrevious !== null && <span className="ml-2 text-[var(--foreground)]">{s.pctOfPrevious}% of prev · {s.pctOfTop}% of top</span>}
                </span>
              </div>
              <ProgressBar pct={Math.max(0.4, s.pctOfTop)} tone={i === META_FUNNEL.length - 1 ? "ok" : "accent"} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Age × gender" subtitle="Spend distribution by demographic — coloured by ROAS" />
          <SpendBars rows={META_AGE_GENDER} />
        </Card>
        <Card>
          <CardHeader title="Placement mix" subtitle="Spend share across FB / IG · feed / stories / reels" />
          <div className="space-y-3">
            {META_PLACEMENT_MIX.map((p) => (
              <LabelledBar key={p.label} label={p.label} value={`${p.pct}%`} pct={p.pct} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Devices" subtitle="Spend by device — iPhone, Android, desktop" />
          <SpendBars rows={META_DEVICES} />
        </Card>
        <Card>
          <CardHeader title="Placement performance" subtitle="Where your spend converts best" />
          <SpendBars rows={META_PLACEMENT_PERF} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Top countries" subtitle="Spend distribution by country — coloured by ROAS" />
          <SpendBars rows={META_COUNTRIES} />
        </Card>
        <Card>
          <CardHeader title="Reach & frequency" subtitle="How many unique people saw your ads and how often" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Metric label="Unique reach" value={META_REACH_FREQ.uniqueReach} />
            <Metric label="Impressions" value={META_REACH_FREQ.impressions} />
            <Metric label="CPM" value={META_REACH_FREQ.cpm} />
          </div>
          <LabelledBar label={`Avg frequency — ${META_REACH_FREQ.avgFrequency}x (healthy)`} value={`${META_REACH_FREQ.avgFrequency}x`} pct={(META_REACH_FREQ.avgFrequency / 5) * 100} tone="ok" />
          <div className="mt-4">
            <LabelledBar label="Video completion rate" value={`${META_REACH_FREQ.videoCompletionPct}%`} pct={META_REACH_FREQ.videoCompletionPct} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Performance breakdown" subtitle="Campaign-level spend, funnel & ROAS" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[1080px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Campaign</th>
                <th className="py-2 px-2 font-medium text-right">Spend</th>
                <th className="py-2 px-2 font-medium text-right">Reach</th>
                <th className="py-2 px-2 font-medium text-right">Impr.</th>
                <th className="py-2 px-2 font-medium text-right">Clicks</th>
                <th className="py-2 px-2 font-medium text-right">CTR</th>
                <th className="py-2 px-2 font-medium text-right">ATC</th>
                <th className="py-2 px-2 font-medium text-right">IC</th>
                <th className="py-2 px-2 font-medium text-right">Purch.</th>
                <th className="py-2 px-2 font-medium text-right">Revenue</th>
                <th className="py-2 px-2 font-medium text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {META_CAMPAIGNS.map((c) => (
                <tr key={c.campaign} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5 font-medium whitespace-nowrap">{c.campaign}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(c.spend, true)}</td>
                  <td className="py-2.5 px-2 text-right text-[var(--muted)]">{formatNumber(c.reach)}</td>
                  <td className="py-2.5 px-2 text-right text-[var(--muted)]">{formatNumber(c.impressions)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(c.linkClicks)}</td>
                  <td className="py-2.5 px-2 text-right">{c.ctr}%</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(c.atc)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(c.ic)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(c.purchases)}</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(c.revenue, true)}</td>
                  <td className={cx("py-2.5 px-2 text-right font-medium", c.roas >= 1 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{c.roas.toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function GoogleAds() {
  const maxSpend = Math.max(...GOOGLE_ADS_CAMPAIGNS.map((c) => c.spend));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-8 gap-y-6">
        {GOOGLE_ADS_KPIS.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card>
        <CardHeader title="Spend by campaign" subtitle="Daily Google Ads spend concentrated in the top PMax & Brand-Search campaigns" />
        <div className="space-y-3">
          {[...GOOGLE_ADS_CAMPAIGNS].sort((a, b) => b.spend - a.spend).map((c) => (
            <LabelledBar
              key={c.campaign}
              label={c.campaign}
              value={`${formatINR(c.spend, true)} · ${c.roas.toFixed(2)}x`}
              pct={(c.spend / maxSpend) * 100}
              tone={c.roas >= 1.5 ? "ok" : c.roas >= 1 ? "warning" : "danger"}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Campaign performance" subtitle="Status, spend, funnel & return by campaign" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[920px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Campaign</th>
                <th className="py-2 px-2 font-medium">Status</th>
                <th className="py-2 px-2 font-medium text-right">Spend</th>
                <th className="py-2 px-2 font-medium text-right">Impr.</th>
                <th className="py-2 px-2 font-medium text-right">Clicks</th>
                <th className="py-2 px-2 font-medium text-right">CTR</th>
                <th className="py-2 px-2 font-medium text-right">Avg CPC</th>
                <th className="py-2 px-2 font-medium text-right">Conv.</th>
                <th className="py-2 px-2 font-medium text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {GOOGLE_ADS_CAMPAIGNS.map((c) => (
                <tr key={c.campaign} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5 font-medium whitespace-nowrap">{c.campaign}</td>
                  <td className="py-2.5 px-2">
                    <span className={cx("inline-flex items-center border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", c.status === "ENABLED" ? "text-[var(--ok)] border-[var(--ok)]/35 bg-[var(--ok)]/8" : "text-[var(--muted)] border-[var(--border)] bg-[var(--surface-2)]")}>
                      {c.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">{formatINR(c.spend, true)}</td>
                  <td className="py-2.5 px-2 text-right text-[var(--muted)]">{formatNumber(c.impressions)}</td>
                  <td className="py-2.5 px-2 text-right">{formatNumber(c.clicks)}</td>
                  <td className="py-2.5 px-2 text-right">{c.ctr}%</td>
                  <td className="py-2.5 px-2 text-right">{formatINR(c.avgCpc)}</td>
                  <td className="py-2.5 px-2 text-right">{c.conversions.toFixed(1)}</td>
                  <td className={cx("py-2.5 px-2 text-right font-medium", c.roas >= 1 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{c.roas.toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
      <div className="eyebrow">{label}</div>
      <div className="text-lg font-medium mt-1 tnum">{value}</div>
    </div>
  );
}
