"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Calendar, Factory, Layers } from "lucide-react";
import { Card, CardHeader, StatCard, FilterBox, FilterRow, MultiSelect, passesFilter } from "@/components/ui";
import { formatNumber, cx } from "@/lib/format";
import { CHANNELS, Channel, DEMAND_PLANS, demandPlanFor, PRODUCTS } from "@/lib/data";

const HORIZONS = [
  { value: "3", label: "3 months forecast" },
  { value: "6", label: "6 months forecast" },
];

const ACTION_TONE_CLASSES: Record<string, string> = {
  ok: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  danger: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function ForecastingPage() {
  const [horizon, setHorizon] = useState("6");
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  const [sku, setSku] = useState(DEMAND_PLANS[0].sku);
  const [months, setMonths] = useState<Set<string>>(new Set());
  const [channels, setChannels] = useState<Set<Channel>>(new Set(CHANNELS));

  const categories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
  const skuOptions = DEMAND_PLANS.filter((p) => passesFilter(categoryFilter, p.category));

  const plan = demandPlanFor(sku);
  const visibleMonths = useMemo(() => {
    const rows = plan.months.slice(0, Number(horizon));
    return months.size === 0 ? rows : rows.filter((r) => months.has(r.month));
  }, [plan, horizon, months]);

  const toggleChannel = (c: Channel) => {
    setChannels((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next.size ? next : prev; // keep at least one selected
    });
  };

  const atRiskCount = plan.months.filter((m) => m.action.tone !== "ok").length;
  const overCapacityCount = DEMAND_PLANS.reduce((s, p) => s + p.months.filter((m) => m.action.tone === "danger").length, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="SKUs tracked" value={`${DEMAND_PLANS.length}`} />
        <StatCard label={`${plan.name.split(" – ")[0]} — months at/over capacity`} value={`${atRiskCount} of ${plan.months.length}`} tone={atRiskCount > 0 ? "danger" : "ok"} />
        <StatCard label="Over-capacity SKU-months (all SKUs)" value={`${overCapacityCount}`} tone={overCapacityCount > 0 ? "danger" : "ok"} />
        <StatCard label="Monthly production capacity" value={`${formatNumber(plan.monthlyCapacity)} units`} />
      </div>

      <Card>
        <FilterRow>
          <FilterBox
            label="Forecast Horizon"
            icon={<Layers size={12} />}
            value={horizon}
            onChange={setHorizon}
            options={HORIZONS}
          />
          <MultiSelect
            label="Category"
            icon={<Layers size={12} />}
            selected={categoryFilter}
            onChange={(n) => {
              setCategoryFilter(n);
              const opts = DEMAND_PLANS.filter((p) => passesFilter(n, p.category));
              if (opts.length && !opts.some((p) => p.sku === sku)) setSku(opts[0].sku);
            }}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <FilterBox
            label="SKU"
            icon={<Boxes size={12} />}
            value={sku}
            onChange={setSku}
            options={skuOptions.map((p) => ({ value: p.sku, label: p.name }))}
          />
          <MultiSelect
            label="Month"
            icon={<Calendar size={12} />}
            selected={months}
            onChange={setMonths}
            options={plan.months.slice(0, Number(horizon)).map((m) => ({ value: m.month, label: m.month }))}
          />
        </FilterRow>

        <CardHeader
          title="Demand Plan by Channel"
          subtitle={`SKU: ${plan.name} · Channels: ${CHANNELS.filter((c) => channels.has(c)).join(", ")} · Capacity: ${formatNumber(plan.monthlyCapacity)} units/mo`}
        />
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CHANNELS.map((c) => (
            <button
              key={c}
              onClick={() => toggleChannel(c)}
              className={cx(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                channels.has(c)
                  ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
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
                <th className="py-2 px-5 font-medium">Month</th>
                <th className="py-2 px-2 font-medium">Total demand</th>
                <th className="py-2 px-2 font-medium">In stock</th>
                <th className="py-2 px-2 font-medium">Need to produce</th>
                {CHANNELS.filter((c) => channels.has(c)).map((c) => (
                  <th key={c} className="py-2 px-2 font-medium">{c}</th>
                ))}
                <th className="py-2 px-5 font-medium">Planner action</th>
              </tr>
            </thead>
            <tbody>
              {visibleMonths.map((m) => {
                const selectedTotal = CHANNELS.filter((c) => channels.has(c)).reduce((s, c) => s + m.byChannel[c], 0);
                return (
                  <tr key={m.month} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                    <td className="py-2.5 px-5 font-semibold">{m.month}</td>
                    <td className="py-2.5 px-2 font-medium">{formatNumber(selectedTotal)}</td>
                    <td className="py-2.5 px-2 text-[var(--muted)]">{formatNumber(m.inStock)}</td>
                    <td className="py-2.5 px-2 font-medium">{formatNumber(m.needToProduce)}</td>
                    {CHANNELS.filter((c) => channels.has(c)).map((c) => (
                      <td key={c} className="py-2.5 px-2 text-[var(--muted)]">{formatNumber(m.byChannel[c])}</td>
                    ))}
                    <td className="py-2.5 px-5">
                      <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap", ACTION_TONE_CLASSES[m.action.tone])}>
                        {m.action.tone !== "ok" && <AlertTriangle size={11} />}
                        {m.action.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Capacity outlook — all SKUs" subtitle="Where production is tight across the next few months" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">SKU</th>
                <th className="py-2 px-2 font-medium">Tightest month</th>
                <th className="py-2 px-2 font-medium text-right">Monthly capacity</th>
                <th className="py-2 px-2 font-medium text-right">Peak load</th>
                <th className="py-2 px-2 font-medium">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {DEMAND_PLANS.filter((p) => p.months.some((m) => m.action.tone !== "ok"))
                .sort((a, b) => Math.max(...b.months.map((m) => m.action.pct)) - Math.max(...a.months.map((m) => m.action.pct)))
                .map((p) => {
                  const worst = p.months.reduce((max, m) => (m.action.pct > max.action.pct ? m : max), p.months[0]);
                  return (
                    <tr key={p.sku} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                      <td className="py-2.5 px-5">
                        <span className="flex items-center gap-2">
                          <span className={cx("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", worst.action.tone === "danger" ? "bg-red-500/15 text-red-400" : "bg-orange-500/15 text-orange-400")}>
                            <Factory size={14} />
                          </span>
                          <span className="font-medium">{p.name}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-[var(--muted)]">{worst.month}</td>
                      <td className="py-2.5 px-2 text-right">{formatNumber(p.monthlyCapacity)}/mo</td>
                      <td className={cx("py-2.5 px-2 text-right font-medium", worst.action.tone === "danger" ? "text-[var(--danger)]" : "text-[var(--warning)]")}>{worst.action.pct}%</td>
                      <td className="py-2.5 px-2">
                        <span className={cx("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", ACTION_TONE_CLASSES[worst.action.tone])}>
                          {worst.action.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
