"use client";

import { useState } from "react";
import { ArrowRightLeft, Boxes, Layers, Package, ShoppingBag, Store } from "lucide-react";
import { Card, CardHeader, StatCard, IconTile, Pills, ProgressBar, MultiSelect, passesFilter, FilterRow } from "@/components/ui";
import { formatINR, formatPct, cx } from "@/lib/format";
import {
  DSR_CHANNEL_GROUPS,
  dsrTotals,
  OFFTAKE_CURRENT,
  OFFTAKE_PREVIOUS,
  OFFTAKE_CATEGORY_LIST,
  CHANNEL_GROUP_MAP,
  ChannelGroup,
  CHANNELS,
  PRODUCTS,
} from "@/lib/data";

const GROUP_ICON: Record<ChannelGroup, React.ReactNode> = {
  QComm: <Package size={16} />,
  Marketplaces: <ShoppingBag size={16} />,
  D2C: <Store size={16} />,
};

function lakh(v: number) {
  return formatINR(v * 100000, true);
}

export default function DailySalesReportPage() {
  const allTotals = dsrTotals();
  const [channels, setChannels] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [sku, setSku] = useState<Set<string>>(new Set());

  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
  const skuOptions = PRODUCTS.filter((p) => passesFilter(category, p.category));

  // Map the selected exact channels up to their channel groups so the
  // group-level DSR table reflects the channel filter.
  const selectedGroups = new Set<string>();
  if (channels.size > 0) {
    (Object.keys(CHANNEL_GROUP_MAP) as ChannelGroup[]).forEach((g) => {
      if (CHANNEL_GROUP_MAP[g].some((c) => channels.has(c))) selectedGroups.add(g);
    });
  }
  const dsrGroups = DSR_CHANNEL_GROUPS.filter((g) => passesFilter(selectedGroups, g.group));
  const totals = allTotals;

  return (
    <div className="space-y-6">
      <FilterRow>
        <MultiSelect label="Channel" icon={<Store size={12} />} selected={channels} onChange={setChannels} options={CHANNELS.map((c) => ({ value: c, label: c }))} />
        <MultiSelect label="Category" icon={<Layers size={12} />} selected={category} onChange={(n) => { setCategory(n); setSku(new Set()); }} options={categories.map((c) => ({ value: c, label: c }))} />
        <MultiSelect label="SKU Name" icon={<Boxes size={12} />} selected={sku} onChange={setSku} options={skuOptions.map((p) => ({ value: p.sku, label: p.name }))} />
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

      <OfftakeCard channels={channels} categoryFilter={category} />
    </div>
  );
}

function OfftakeCard({ channels, categoryFilter }: { channels: Set<string>; categoryFilter: Set<string> }) {
  const [tillView, setTillView] = useState<"current" | "previous">("current");
  const rowsAll = tillView === "current" ? OFFTAKE_CURRENT : OFFTAKE_PREVIOUS;
  const compareAll = tillView === "current" ? OFFTAKE_PREVIOUS : OFFTAKE_CURRENT;
  const rows = rowsAll.filter((r) => passesFilter(channels, r.channel));
  const compareRows = compareAll.filter((r) => passesFilter(channels, r.channel));
  const cats = OFFTAKE_CATEGORY_LIST.filter((c) => passesFilter(categoryFilter, c));

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <CardHeader title="Offtake report" subtitle="Consumer offtake by channel & category (INR) — month-to-date vs. same point last month" />
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
              {cats.map((c) => (
                <th key={c} className="py-2 px-2 font-medium">{c}</th>
              ))}
              <th className="py-2 px-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rowTotal = cats.reduce((s, c) => s + r.byCategory[c], 0);
              const compare = compareRows.find((cr) => cr.channel === r.channel);
              const compareTotal = compare ? cats.reduce((s, c) => s + compare.byCategory[c], 0) : rowTotal;
              const deltaPct = compareTotal ? ((rowTotal - compareTotal) / compareTotal) * 100 : 0;
              return (
                <tr key={r.channel} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                  <td className="py-2.5 px-5 font-medium">{r.channel}</td>
                  {cats.map((c) => (
                    <td key={c} className="py-2.5 px-2 text-[var(--muted)]">{formatINR(r.byCategory[c], true)}</td>
                  ))}
                  <td className="py-2.5 px-2 font-medium flex items-center gap-1.5">
                    {formatINR(rowTotal, true)}
                    <span className={cx("text-[11px] flex items-center gap-0.5", deltaPct >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>
                      <ArrowRightLeft size={10} />
                      {formatPct(deltaPct)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={cats.length + 2} className="py-6 text-center text-[var(--muted)]">No channels match this filter.</td></tr>
            )}
            <tr className="font-semibold border-t border-[var(--border)]">
              <td className="py-2.5 px-5">Total</td>
              {cats.map((c) => (
                <td key={c} className="py-2.5 px-2">{formatINR(rows.reduce((s, r) => s + r.byCategory[c], 0), true)}</td>
              ))}
              <td className="py-2.5 px-2">{formatINR(rows.reduce((s, r) => s + cats.reduce((a, c) => a + r.byCategory[c], 0), 0), true)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
