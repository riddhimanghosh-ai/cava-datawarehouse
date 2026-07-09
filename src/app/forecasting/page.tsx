"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, ChevronDown, ChevronRight, ClipboardList, Info, Layers, MapPin, Megaphone, Store, Table, TrendingUp } from "lucide-react";
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

type Tab = "plan" | "winners" | "whitespace" | "alignment" | "geo";
const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "plan", label: "Demand Plan", icon: <Table size={15} /> },
  { value: "winners", label: "Understocked Winners", icon: <TrendingUp size={15} /> },
  { value: "whitespace", label: "Channel White Space", icon: <Store size={15} /> },
  { value: "alignment", label: "Marketing \u2194 Stock", icon: <Megaphone size={15} /> },
  { value: "geo", label: "Geo Pockets", icon: <MapPin size={15} /> },
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

      {tab === "winners" && (
      <Card>
        <LensHeader
          title="Understocked winners"
          subtitle="High sell-through with thin cover — demand you're physically losing. Restock these before anything else."
          what="SKUs that shoppers keep buying (70%+ sell-through) but that have fewer than 12 days of stock left on a channel. Every day they stay thin, you lose sales you had already won."
          how="For every SKU on every channel we take its sell-through % and days of cover from inventory. If the demand plan also shows the SKU breaching production capacity in a coming month, that warning is attached to the same row."
          example="Black Cross Back Sports Bra on Nykaa Fashion sells through 91% of what's stocked and has only 2.5 days of cover left. Action: order ~117 units (a month of sales, ~₹47K) now — and since the same bra runs at 126% of production capacity in Nov'26, pre-build that batch in October."
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
      )}

      {tab === "whitespace" && (
      <Card>
        <LensHeader
          title="Channel white space"
          subtitle="SKUs earning on their listed channels but absent from others — listing them is the cheapest growth available."
          what="Products already proving themselves on the channels where they're listed, but missing entirely from other channels. No new product, no new ad spend — just a listing you haven't created yet."
          how="For each SKU we compute its monthly revenue per listed channel, then assume a new listing ramps to about 55% of that. Multiplied by the number of missing channels, that's the estimated monthly upside."
          example="The Black Sculptor Jacket sells on Shopify and Myntra but isn't listed on Amazon — if it earns ₹40K/month per listed channel, an Amazon listing is worth roughly ₹22K/month once it ramps. Same logic flags the joggers missing from Nykaa Fashion."
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
      )}

      {tab === "alignment" && (
      <Card>
        <LensHeader
          title="Marketing ↔ stock alignment"
          subtitle="Don't scale ads into a stockout; don't let spend idle on overstock."
          what="Two expensive mismatches between the ads team and the warehouse: scaling a winning ad on a SKU that's about to stock out (the spend converts into out-of-stock pages), and burning budget on a SKU that already has months of unsold stock."
          how="Every ad campaign is joined to its SKU's stock cover. ROAS ≥ 3x with under 12 days of cover → 'restock first'. ROAS under 2x on a SKU with 60+ days of cover → 'shift spend' to the best-performing scaler and clear the stock with a bundle instead."
          example="Hourglass Snug retargeting returns 5.29x, but the legging has just 2.5 days of cover on its thinnest channel — land the restock before adding budget. Meanwhile Plie Skort prospecting returns 1.5x while ~112 days of skort stock sits idle — move that budget to the Hyper Mesh Bra UGC campaign (5.06x)."
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
      )}

      {tab === "geo" && (
      <Card>
        <LensHeader
          title="Geo pockets"
          subtitle="Cities punching above their weight on value but below it on volume — and COD-heavy cities to nudge prepaid."
          what="Two kinds of city-level opportunity: 'underweight cities' where the average order value is higher than your company average but the share of orders is low (rich demand you're not mining), and COD-heavy cities where cash-on-delivery eats margin and drives returns."
          how="From the city-level sales report: a city is underweight when its AOV beats the company average by 5%+ while its order share is under ~85% of an even split. It's COD-heavy when more than 55% of its orders are cash on delivery."
          example="Gurugram buyers spend well above the average order value but the city contributes only a sliver of orders — worth geo-targeted ad spend and a delivery-promise check. Lucknow runs over 55% COD — a ₹50–75 prepaid discount nudge protects margin and cuts RTO risk."
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

// Card header with an info toggle that expands a plain-English explanation of
// the lens: what it shows, how it's computed, and a worked example.
function LensHeader({
  title,
  subtitle,
  what,
  how,
  example,
}: {
  title: string;
  subtitle: string;
  what: string;
  how: string;
  example: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-2">
          <div>
            <h3 className="text-[15px] font-medium tracking-tight text-[var(--foreground)]">{title}</h3>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed max-w-2xl">{subtitle}</p>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={`About ${title}`}
            className={cx(
              "border p-1 mt-0.5 transition-colors shrink-0",
              open ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Info size={13} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {open && (
        <div className="mb-4 border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
          <div>
            <div className="eyebrow mb-1">What it shows</div>
            <p className="text-[13px] text-[var(--ink-2)] leading-relaxed max-w-3xl">{what}</p>
          </div>
          <div>
            <div className="eyebrow mb-1">How it&apos;s computed</div>
            <p className="text-[13px] text-[var(--ink-2)] leading-relaxed max-w-3xl">{how}</p>
          </div>
          <div className="border-l-2 border-[var(--accent)] pl-3">
            <div className="eyebrow mb-1">Example</div>
            <p className="text-[13px] text-[var(--ink-2)] leading-relaxed max-w-3xl">{example}</p>
          </div>
        </div>
      )}
    </>
  );
}
