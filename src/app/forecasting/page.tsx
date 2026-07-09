"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, ChevronDown, ChevronRight, ClipboardList, Layers, MapPin, Megaphone, Store, Table, TrendingUp } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, Tabs, FilterBox, FilterRow, MultiSelect, passesFilter } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import {
  CHANNELS,
  Channel,
  DEMAND_PLANS,
  DEMAND_PLAN_MONTHS,
  PRODUCTS,
  understockedWinners,
  channelWhiteSpace,
  marketingStockAlignment,
  geoPockets,
} from "@/lib/data";

const HORIZONS = [
  { value: "3", label: "3 months forecast" },
  { value: "6", label: "6 months forecast" },
];

const ACTION_TONE_CLASSES: Record<string, string> = {
  ok: "bg-[var(--ok)]/10 text-[var(--ok)] border-[var(--ok)]/30",
  warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30",
  danger: "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30",
};

type Tab = "plan" | "actions";
const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "plan", label: "Demand Plan", icon: <Table size={15} /> },
  { value: "actions", label: "Planner Actions", icon: <ClipboardList size={15} /> },
];

export default function ForecastingPage() {
  const [tab, setTab] = useState<Tab>("plan");
  const [horizon, setHorizon] = useState("6");
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  const [skus, setSkus] = useState<Set<string>>(new Set());
  const [channels, setChannels] = useState<Set<Channel>>(new Set(CHANNELS));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
  const skuOptions = DEMAND_PLANS.filter((p) => passesFilter(categoryFilter, p.category));

  // Selected plans: honour category + SKU multi-selects (empty = all).
  const selectedPlans = useMemo(
    () => skuOptions.filter((p) => passesFilter(skus, p.sku)),
    [skuOptions, skus]
  );
  const selectedChannels = CHANNELS.filter((c) => channels.has(c));
  const monthLabels = DEMAND_PLAN_MONTHS.slice(0, Number(horizon));

  const toggleChannel = (c: Channel) => {
    setChannels((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next.size ? next : prev;
    });
  };
  const toggleMonth = (m: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  };

  const chanTotal = (byChannel: Record<Channel, number>) => selectedChannels.reduce((s, c) => s + byChannel[c], 0);

  // Aggregate the selected SKUs for one month label.
  const aggregateMonth = (label: string) => {
    const rows = selectedPlans.map((p) => ({ plan: p, m: p.months.find((mm) => mm.month === label)! })).filter((r) => r.m);
    const totalDemand = rows.reduce((s, r) => s + chanTotal(r.m.byChannel), 0);
    const inStock = rows.reduce((s, r) => s + r.m.inStock, 0);
    const needToProduce = rows.reduce((s, r) => s + r.m.needToProduce, 0);
    const byChannel = Object.fromEntries(selectedChannels.map((c) => [c, rows.reduce((s, r) => s + r.m.byChannel[c], 0)])) as Record<Channel, number>;
    const atRisk = rows.filter((r) => r.m.action.tone !== "ok").length;
    const worstTone = rows.some((r) => r.m.action.tone === "danger") ? "danger" : rows.some((r) => r.m.action.tone === "warning") ? "warning" : "ok";
    return { rows, totalDemand, inStock, needToProduce, byChannel, atRisk, worstTone };
  };

  const overCapacityCount = selectedPlans.reduce((s, p) => s + p.months.slice(0, Number(horizon)).filter((m) => m.action.tone === "danger").length, 0);
  const totalCapacity = selectedPlans.reduce((s, p) => s + p.monthlyCapacity, 0);

  // Four opportunity lenses; category/SKU filters apply where they make sense
  // (geo pockets are city-level, so they ignore SKU filters).
  const skuPass = (sku: string) => {
    const p = PRODUCTS.find((pp) => pp.sku === sku);
    return !!p && passesFilter(skus, p.sku) && passesFilter(categoryFilter, p.category);
  };
  const winners = understockedWinners().filter((w) => skuPass(w.sku));
  const whiteSpace = channelWhiteSpace().filter((w) => skuPass(w.sku));
  const alignment = marketingStockAlignment().filter((a) => skuPass(a.sku));
  const pockets = geoPockets();
  const actionCount = winners.length + whiteSpace.length + alignment.length + pockets.length;

  return (
    <div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        <StatCard label="SKUs in view" value={`${selectedPlans.length} of ${DEMAND_PLANS.length}`} />
        <StatCard label="Channels selected" value={`${selectedChannels.length} of ${CHANNELS.length}`} />
        <StatCard label="Actions pending" value={`${actionCount}`} tone={actionCount > 0 ? "danger" : "ok"} caption={`${overCapacityCount} over capacity · 4 lenses`} />
        <StatCard label="Combined monthly capacity" value={`${formatNumber(totalCapacity)} units`} />
      </div>

      <FilterRow>
        <FilterBox label="Forecast Horizon" icon={<Layers size={12} />} value={horizon} onChange={setHorizon} options={HORIZONS} />
        <MultiSelect
          label="Category"
          icon={<Layers size={12} />}
          selected={categoryFilter}
          onChange={(n) => { setCategoryFilter(n); setSkus(new Set()); }}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
        <MultiSelect
          label="SKU Name"
          icon={<Boxes size={12} />}
          selected={skus}
          onChange={setSkus}
          options={skuOptions.map((p) => ({ value: p.sku, label: p.name }))}
        />
      </FilterRow>

      {tab === "plan" && (
      <Card>
        <CardHeader
          title="Demand Plan by Channel"
          subtitle={`${selectedPlans.length} SKU${selectedPlans.length === 1 ? "" : "s"} · ${selectedChannels.join(", ")} · click a month to see the per-SKU split`}
        />
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CHANNELS.map((c) => (
            <button
              key={c}
              onClick={() => toggleChannel(c)}
              className={cx(
                "px-3 py-1 text-xs font-medium border transition-colors",
                channels.has(c) ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)] uppercase tracking-wide">
                <th className="py-2 px-5 font-medium">Month / SKU</th>
                <th className="py-2 px-2 font-medium text-right">Total demand</th>
                <th className="py-2 px-2 font-medium text-right">In stock</th>
                <th className="py-2 px-2 font-medium text-right">Need to produce</th>
                {selectedChannels.map((c) => (
                  <th key={c} className="py-2 px-2 font-medium text-right">{c}</th>
                ))}
                <th className="py-2 px-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {monthLabels.map((label) => {
                const agg = aggregateMonth(label);
                const open = expanded.has(label);
                return (
                  <MonthRows key={label} label={label} agg={agg} open={open} onToggle={() => toggleMonth(label)} selectedChannels={selectedChannels} chanTotal={chanTotal} />
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {tab === "actions" && (
      <>
      <Card>
        <CardHeader
          title="Understocked winners"
          subtitle="High sell-through with thin cover — demand you're physically losing. Restock these before anything else."
        />
        {winners.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-6 text-center">No understocked winners on this filter.</p>
        ) : (
          <div className="space-y-2.5">
            {winners.map((w) => (
              <div key={`${w.sku}-${w.channel}`} className="flex flex-wrap items-center gap-4 border border-[var(--danger)]/30 bg-[var(--danger)]/[0.04] px-4 py-3">
                <div className="h-9 w-9 border border-[var(--danger)]/40 text-[var(--danger)] flex items-center justify-center shrink-0">
                  <TrendingUp size={15} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{w.name} · {w.channel}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">
                    {w.daysOfCover}d cover · {w.sellThroughPct}% sell-through
                    {w.capacityNote ? ` · ${w.capacityNote}` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tnum text-[var(--danger)]">Order {formatNumber(w.suggestedQty)} units</div>
                  <div className="text-[11px] text-[var(--muted)]">est. cost {formatINR(w.estCost, true)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Channel white space"
          subtitle="SKUs earning on their listed channels but absent from others — listing them is the cheapest growth available."
        />
        {whiteSpace.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-6 text-center">No unlisted channel gaps on this filter.</p>
        ) : (
          <div className="space-y-2.5">
            {whiteSpace.map((w) => (
              <div key={w.sku} className="flex flex-wrap items-center gap-4 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <div className="h-9 w-9 border border-[var(--accent)]/50 text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Store size={15} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{w.name}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">
                    Not listed on {w.missingChannels.join(" & ")} · earning {formatINR(w.monthlyRevenuePerListedChannel, true)}/mo per listed channel
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tnum text-[var(--accent)]">+{formatINR(w.estMonthlyUpside, true)}/mo</div>
                  <div className="text-[11px] text-[var(--muted)]">est. upside if listed</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Marketing ↔ stock alignment"
          subtitle="Don't scale ads into a stockout; don't let spend idle on overstock."
        />
        {alignment.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-6 text-center">Ad spend and stock are aligned on this filter.</p>
        ) : (
          <div className="space-y-2.5">
            {alignment.map((a) => (
              <div key={a.campaign} className={cx("flex flex-wrap items-center gap-4 border px-4 py-3", a.kind === "restock-before-scaling" ? "border-[var(--warning)]/30 bg-[var(--warning)]/[0.04]" : "border-[var(--border)] bg-[var(--surface-2)]")}>
                <div className={cx("h-9 w-9 border flex items-center justify-center shrink-0", a.kind === "restock-before-scaling" ? "border-[var(--warning)]/40 text-[var(--warning)]" : "border-[var(--ink)] text-[var(--foreground)]")}>
                  <Megaphone size={15} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{a.campaign}</span>
                    <Badge tone={a.kind === "restock-before-scaling" ? "delayed" : "neutral"}>
                      {a.kind === "restock-before-scaling" ? "restock first" : "shift spend"}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5 max-w-3xl">{a.detail}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={cx("text-sm font-semibold tnum", a.roas >= 1 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{a.roas.toFixed(2)}x ROAS</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Geo pockets"
          subtitle="Cities punching above their weight on value but below it on volume — and COD-heavy cities to nudge prepaid."
        />
        <div className="space-y-2.5">
          {pockets.map((g) => (
            <div key={g.city} className="flex flex-wrap items-center gap-4 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
              <div className="h-9 w-9 border border-[var(--ink)] flex items-center justify-center shrink-0">
                <MapPin size={15} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{g.city}, {g.state}</span>
                  <Badge tone={g.kind === "underweight-city" ? "improving" : "delayed"}>
                    {g.kind === "underweight-city" ? "underweight city" : "COD heavy"}
                  </Badge>
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5 max-w-3xl">{g.detail}</div>
              </div>
              <div className="text-right shrink-0 text-sm font-medium tnum">{g.metric}</div>
            </div>
          ))}
        </div>
      </Card>
      </>
      )}
      </div>
    </div>
  );
}

type Agg = {
  rows: { plan: (typeof DEMAND_PLANS)[number]; m: (typeof DEMAND_PLANS)[number]["months"][number] }[];
  totalDemand: number;
  inStock: number;
  needToProduce: number;
  byChannel: Record<Channel, number>;
  atRisk: number;
  worstTone: string;
};

function MonthRows({
  label,
  agg,
  open,
  onToggle,
  selectedChannels,
  chanTotal,
}: {
  label: string;
  agg: Agg;
  open: boolean;
  onToggle: () => void;
  selectedChannels: Channel[];
  chanTotal: (byChannel: Record<Channel, number>) => number;
}) {
  return (
    <>
      <tr className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60 cursor-pointer" onClick={onToggle}>
        <td className="py-2.5 px-5 font-semibold">
          <span className="flex items-center gap-1.5">
            {open ? <ChevronDown size={14} className="text-[var(--muted)]" /> : <ChevronRight size={14} className="text-[var(--muted)]" />}
            {label}
            <span className="text-[11px] font-normal text-[var(--muted)]">({agg.rows.length} SKU{agg.rows.length === 1 ? "" : "s"})</span>
          </span>
        </td>
        <td className="py-2.5 px-2 text-right font-medium">{formatNumber(agg.totalDemand)}</td>
        <td className="py-2.5 px-2 text-right text-[var(--muted)]">{formatNumber(agg.inStock)}</td>
        <td className="py-2.5 px-2 text-right font-medium">{formatNumber(agg.needToProduce)}</td>
        {selectedChannels.map((c) => (
          <td key={c} className="py-2.5 px-2 text-right text-[var(--muted)]">{formatNumber(agg.byChannel[c])}</td>
        ))}
        <td className="py-2.5 px-5">
          <span className={cx("inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap", ACTION_TONE_CLASSES[agg.worstTone])}>
            {agg.worstTone !== "ok" && <AlertTriangle size={11} />}
            {agg.atRisk > 0 ? `${agg.atRisk} SKU${agg.atRisk === 1 ? "" : "s"} at/over capacity` : "All on track"}
          </span>
        </td>
      </tr>
      {open &&
        agg.rows.map(({ plan, m }) => (
          <tr key={`${label}-${plan.sku}`} className="border-b border-[var(--border)]/40 bg-[var(--surface-2)]/40">
            <td className="py-2 px-5 pl-11 text-[var(--muted)]">{plan.name}</td>
            <td className="py-2 px-2 text-right">{formatNumber(chanTotal(m.byChannel))}</td>
            <td className="py-2 px-2 text-right text-[var(--muted)]">{formatNumber(m.inStock)}</td>
            <td className="py-2 px-2 text-right">{formatNumber(m.needToProduce)}</td>
            {selectedChannels.map((c) => (
              <td key={c} className="py-2 px-2 text-right text-[var(--muted)]">{formatNumber(m.byChannel[c])}</td>
            ))}
            <td className="py-2 px-5">
              <span className={cx("inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", ACTION_TONE_CLASSES[m.action.tone])}>
                {m.action.tone === "ok" ? "On track" : `${m.action.pct}% of capacity — see Planner Actions`}
              </span>
            </td>
          </tr>
        ))}
    </>
  );
}
