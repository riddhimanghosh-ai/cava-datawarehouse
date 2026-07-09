"use client";

import { useState } from "react";
import { ArrowRightLeft, Calendar, Layers, Network, Package, ShoppingBag, Store } from "lucide-react";
import { Card, CardHeader, StatCard, IconTile, Pills, ProgressBar, MultiSelect, passesFilter, FilterRow, FilterBox } from "@/components/ui";
import { formatINR, formatPct, cx } from "@/lib/format";
import {
  DSR_CHANNEL_GROUPS,
  dsrTotals,
  OFFTAKE_CURRENT,
  OFFTAKE_PREVIOUS,
  OFFTAKE_CATEGORY_LIST,
  ChannelGroup,
} from "@/lib/data";

const GROUP_ICON: Record<ChannelGroup, React.ReactNode> = {
  QComm: <Package size={16} />,
  Marketplaces: <ShoppingBag size={16} />,
  D2C: <Store size={16} />,
};

const MONTH_OPTS = [
  { value: "jul", label: "Jul'26 (MTD)" },
  { value: "jun", label: "Jun'26" },
];

function lakh(v: number) {
  return formatINR(v * 100000, true);
}

export default function DailySalesReportPage() {
  const allTotals = dsrTotals();
  const [month, setMonth] = useState("jul");
  const [groups, setGroups] = useState<Set<string>>(new Set());

  const dsrGroups = DSR_CHANNEL_GROUPS.filter((g) => passesFilter(groups, g.group));
  const totals = allTotals;

  return (
    <div className="space-y-6">
      <FilterRow>
        <FilterBox label="Month" icon={<Calendar size={12} />} value={month} onChange={setMonth} options={MONTH_OPTS} />
        <MultiSelect label="Channel group" icon={<Network size={12} />} selected={groups} onChange={setGroups} options={DSR_CHANNEL_GROUPS.map((g) => ({ value: g.group, label: g.group }))} />
      </FilterRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="MTD (Month to Date) Net — all channels" value={lakh(totals.mtdNet)} />
        <StatCard label="MTD (Month to Date) net achieved" value={`${totals.pctAchieved}%`} tone={totals.pctAchieved >= 90 ? "ok" : "danger"} />
        <StatCard label="F GOLM (Forecast Growth over Last Month)" value={formatPct(totals.fGolmPct)} tone={totals.fGolmPct >= 0 ? "ok" : "danger"} />
        <StatCard label="F GOLY (Forecast Growth over Last Year)" value={formatPct(totals.fGolyPct)} tone={totals.fGolyPct >= 0 ? "ok" : "danger"} />
      </div>

      <Card>
        <CardHeader title="Daily Sales Report — channel tracking" subtitle="MTD (Month to Date) performance vs. plan, forecast, LM (Last Month) & LY (Last Year)" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Channel group</th>
                <th className="py-2 px-2 font-medium">B Plan (Budget Plan)</th>
                <th className="py-2 px-2 font-medium">D Plan (Demand Plan)</th>
                <th className="py-2 px-2 font-medium">MTD (Month to Date) Gross</th>
                <th className="py-2 px-2 font-medium">RTO (Return to Origin)</th>
                <th className="py-2 px-2 font-medium">Cancelled</th>
                <th className="py-2 px-2 font-medium">MTD (Month to Date) Net</th>
                <th className="py-2 px-2 font-medium">% Achieved</th>
                <th className="py-2 px-2 font-medium">Forecast</th>
                <th className="py-2 px-2 font-medium">F GOLM (Forecast Growth over Last Month)</th>
                <th className="py-2 px-2 font-medium">F GOLY (Forecast Growth over Last Year)</th>
              </tr>
            </thead>
            <tbody>
              {dsrGroups.map((g) => (
                <tr key={g.group} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5 font-medium flex items-center gap-2">
                    <IconTile icon={GROUP_ICON[g.group]} tone="default" />
                    {g.group}
                  </td>
                  <td className="py-2.5 px-2">{lakh(g.bPlan)}</td>
                  <td className="py-2.5 px-2">{lakh(g.dPlan)}</td>
                  <td className="py-2.5 px-2">{lakh(g.mtdGross)}</td>
                  <td className="py-2.5 px-2 text-[var(--danger)]">{lakh(g.rto)}</td>
                  <td className="py-2.5 px-2 text-[var(--danger)]">{lakh(g.cancelled)}</td>
                  <td className="py-2.5 px-2 font-medium">{lakh(g.mtdNet)}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2 w-24">
                      <span className="w-9 text-right">{g.pctAchieved}%</span>
                      <ProgressBar pct={g.pctAchieved} tone={g.pctAchieved >= 90 ? "ok" : g.pctAchieved >= 70 ? "accent" : "danger"} />
                    </div>
                  </td>
                  <td className="py-2.5 px-2">{lakh(g.forecast)}</td>
                  <td className={cx("py-2.5 px-2 font-medium", g.fGolmPct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{formatPct(g.fGolmPct)}</td>
                  <td className={cx("py-2.5 px-2 font-medium", g.fGolyPct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{formatPct(g.fGolyPct)}</td>
                </tr>
              ))}
              <tr className="font-semibold border-t border-[var(--border)]">
                <td className="py-2.5 px-5">Total</td>
                <td className="py-2.5 px-2">{lakh(totals.bPlan)}</td>
                <td className="py-2.5 px-2">{lakh(totals.dPlan)}</td>
                <td className="py-2.5 px-2">{lakh(totals.mtdGross)}</td>
                <td className="py-2.5 px-2 text-[var(--danger)]">{lakh(totals.rto)}</td>
                <td className="py-2.5 px-2 text-[var(--danger)]">{lakh(totals.cancelled)}</td>
                <td className="py-2.5 px-2">{lakh(totals.mtdNet)}</td>
                <td className="py-2.5 px-2">{totals.pctAchieved}%</td>
                <td className="py-2.5 px-2">{lakh(totals.forecast)}</td>
                <td className={cx("py-2.5 px-2", totals.fGolmPct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{formatPct(totals.fGolmPct)}</td>
                <td className={cx("py-2.5 px-2", totals.fGolyPct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{formatPct(totals.fGolyPct)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <OfftakeCard />
    </div>
  );
}

function OfftakeCard() {
  const [tillView, setTillView] = useState<"current" | "previous">("current");
  const rows = tillView === "current" ? OFFTAKE_CURRENT : OFFTAKE_PREVIOUS;
  const compareRows = tillView === "current" ? OFFTAKE_PREVIOUS : OFFTAKE_CURRENT;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <CardHeader title="Offtake report" subtitle={`${rows[0]?.tillLabel} · consumer offtake by channel & category, INR`} />
        <Pills
          options={[
            { value: "current", label: OFFTAKE_CURRENT[0].tillLabel },
            { value: "previous", label: OFFTAKE_PREVIOUS[0].tillLabel },
          ]}
          value={tillView}
          onChange={(v) => setTillView(v as "current" | "previous")}
        />
      </div>
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
              <th className="py-2 px-5 font-medium">Channel</th>
              {OFFTAKE_CATEGORY_LIST.map((c) => (
                <th key={c} className="py-2 px-2 font-medium">{c}</th>
              ))}
              <th className="py-2 px-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const compare = compareRows[idx];
              const deltaPct = ((r.total - compare.total) / compare.total) * 100;
              return (
                <tr key={r.channel} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5 font-medium">{r.channel}</td>
                  {OFFTAKE_CATEGORY_LIST.map((c) => (
                    <td key={c} className="py-2.5 px-2 text-[var(--muted)]">{formatINR(r.byCategory[c], true)}</td>
                  ))}
                  <td className="py-2.5 px-2 font-medium flex items-center gap-1.5">
                    {formatINR(r.total, true)}
                    <span className={cx("text-[11px] flex items-center gap-0.5", deltaPct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>
                      <ArrowRightLeft size={10} />
                      {formatPct(deltaPct)}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr className="font-semibold border-t border-[var(--border)]">
              <td className="py-2.5 px-5">Total</td>
              {OFFTAKE_CATEGORY_LIST.map((c) => (
                <td key={c} className="py-2.5 px-2">{formatINR(rows.reduce((s, r) => s + r.byCategory[c], 0), true)}</td>
              ))}
              <td className="py-2.5 px-2">{formatINR(rows.reduce((s, r) => s + r.total, 0), true)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
