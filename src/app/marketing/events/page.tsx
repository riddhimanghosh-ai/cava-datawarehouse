"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarClock, ChevronDown, Plus, Target, TrendingUp, Trophy, X } from "lucide-react";
import { Card, CardHeader, Badge, ProgressBar } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import { BRAND_EVENTS, BrandEvent, EventType, eventDurationDays, eventLiftPct, eventMetrics, eventTargetPct } from "@/lib/data";

const TODAY = new Date("2026-07-09T00:00:00Z");

const TYPE_COLOR: Record<EventType, string> = {
  Sale: "#C084FC",
  "Product Drop": "#4ADE80",
  "Influencer Collab": "#60A5FA",
  "Email Blast": "#94A3B8",
  "Flash Discount": "#FBBF24",
  "Marketplace Event": "#F472B6",
};

const EVENT_TYPES: EventType[] = ["Sale", "Product Drop", "Influencer Collab", "Email Blast", "Flash Discount", "Marketplace Event"];

type StatusFilter = "all" | "live" | "upcoming" | "ended";
const STATUS_LABEL: Record<Exclude<StatusFilter, "all">, string> = { live: "Active", upcoming: "Upcoming", ended: "Past" };
const STATUS_DOT: Record<StatusFilter, string> = { all: "#3B82F6", live: "#22C55E", upcoming: "#3B82F6", ended: "#4B5563" };

function ts(d: string) {
  return new Date(d).getTime();
}

export default function EventsPage() {
  const [events, setEvents] = useState<BrandEvent[]>(BRAND_EVENTS);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [showForm, setShowForm] = useState(false);

  const counts = {
    all: events.length,
    live: events.filter((e) => e.status === "live").length,
    upcoming: events.filter((e) => e.status === "upcoming").length,
    ended: events.filter((e) => e.status === "ended").length,
  };

  const filtered = useMemo(
    () => events.filter((e) => filter === "all" || e.status === filter),
    [events, filter]
  );

  const bounds = useMemo(() => {
    const starts = events.map((e) => ts(e.startDate));
    const ends = events.map((e) => ts(e.endDate));
    return { min: Math.min(...starts), max: Math.max(...ends, TODAY.getTime()) };
  }, [events]);

  const span = bounds.max - bounds.min || 1;
  const pos = (t: number) => ((t - bounds.min) / span) * 100;

  const addEvent = (e: BrandEvent) => {
    setEvents((prev) => [e, ...prev]);
    setShowForm(false);
    setFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <Card>
        <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-4">
          Event Timeline — {fmt(bounds.min)} → {fmt(bounds.max)}
        </div>
        <div className="relative" style={{ minHeight: events.length * 34 + 24 }}>
          {/* TODAY marker */}
          <div className="absolute top-0 bottom-6 w-px bg-[var(--accent)]" style={{ left: `${pos(TODAY.getTime())}%` }}>
            <span className="absolute -top-0.5 left-1 text-[10px] font-semibold text-[var(--accent)] whitespace-nowrap">TODAY</span>
          </div>
          {[...events]
            .sort((a, b) => ts(a.startDate) - ts(b.startDate))
            .map((e, i) => {
              const left = pos(ts(e.startDate));
              const width = Math.max(4, pos(ts(e.endDate)) - left);
              const color = TYPE_COLOR[e.type];
              return (
                <div key={e.id} className="absolute h-7 flex items-center" style={{ top: i * 34, left: `${left}%`, width: `${width}%` }}>
                  <div
                    className="h-full w-full rounded-md px-2 flex items-center text-[11px] font-medium text-black/85 truncate"
                    style={{ background: color }}
                    title={`${e.name} · ${fmtRange(e)}`}
                  >
                    {e.name}
                  </div>
                </div>
              );
            })}
          {/* Axis labels */}
          <div className="absolute bottom-0 left-0 text-[11px] text-[var(--muted)]">{fmt(bounds.min)}</div>
          <div className="absolute bottom-0 right-0 text-[11px] text-[var(--muted)]">{fmt(bounds.max)}</div>
        </div>
      </Card>

      {/* Add button + form */}
      <div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium hover:border-[var(--accent)]/50 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} className="text-[var(--accent)]" />}
          {showForm ? "Cancel" : "Add Event or Campaign"}
        </button>
        {showForm && <NewEventForm onAdd={addEvent} />}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "live", "upcoming", "ended"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cx(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
              filter === s ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_DOT[s] }} />
            {s === "all" ? "All" : STATUS_LABEL[s]} ({s === "all" ? counts.all : counts[s]})
          </button>
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-[var(--muted)] py-6 text-center">No events in this status.</p>}
        {[...filtered]
          .sort((a, b) => (a.status === "ended" && b.status === "ended" ? eventLiftPct(b) - eventLiftPct(a) : ts(b.startDate) - ts(a.startDate)))
          .map((e) => (
            <EventCard key={e.id} e={e} rank={e.status === "ended" ? rankOf(events, e) : null} />
          ))}
      </div>
    </div>
  );
}

function rankOf(events: BrandEvent[], e: BrandEvent) {
  const ended = [...events.filter((x) => x.status === "ended")].sort((a, b) => eventLiftPct(b) - eventLiftPct(a));
  return ended.findIndex((x) => x.id === e.id);
}

function EventCard({ e, rank }: { e: BrandEvent; rank: number | null }) {
  const lift = eventLiftPct(e);
  const targetPct = eventTargetPct(e);
  const isPast = e.status === "ended";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cx("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold", rank === 0 ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--surface)] text-[var(--muted)]")}
          >
            {rank === 0 ? <Trophy size={16} /> : isPast && rank !== null ? `#${rank + 1}` : <CalendarClock size={16} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{e.name}</span>
              <Badge tone={e.status}>{e.status === "live" ? "active" : e.status === "ended" ? "ended" : "upcoming"}</Badge>
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
                <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLOR[e.type] }} />
                {e.type}
              </span>
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">{fmtRange(e)} · {eventDurationDays(e)} days · {e.channelsLabel}</div>
          </div>
        </div>
        {isPast ? (
          <div className="text-right shrink-0">
            <div className={cx("text-lg font-bold flex items-center gap-1 justify-end", lift >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>
              <TrendingUp size={15} />
              {lift >= 0 ? "+" : ""}{lift}%
            </div>
            <div className="text-[11px] text-[var(--muted)]">revenue lift</div>
          </div>
        ) : (
          <div className="text-right shrink-0">
            <div className="text-sm font-semibold flex items-center gap-1 justify-end"><Target size={13} /> {formatINR(e.revenueTarget ?? 0, true)}</div>
            <div className="text-[11px] text-[var(--muted)]">revenue target</div>
          </div>
        )}
      </div>

      {isPast && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <Metric label="Baseline / day" value={formatINR(e.baselineDailyRevenue, true)} />
            <Metric label="During event / day" value={formatINR(e.eventDailyRevenue, true)} />
            <Metric label="Orders driven" value={formatNumber(e.ordersDriven)} />
            <Metric label="Total revenue" value={formatINR(e.actualRevenue, true)} />
          </div>
          {targetPct !== null && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)] mb-1">
                <span>Target achievement</span>
                <span className={cx("font-medium", targetPct >= 100 ? "text-[var(--ok)]" : "text-[var(--warning)]")}>{targetPct}% of {formatINR(e.revenueTarget ?? 0, true)}</span>
              </div>
              <ProgressBar pct={targetPct} tone={targetPct >= 100 ? "ok" : targetPct >= 80 ? "accent" : "danger"} />
            </div>
          )}
          <PullEventMetrics e={e} />
        </>
      )}
      <p className="text-[11px] text-[var(--muted)] mt-2.5">{e.note}</p>
    </div>
  );
}

type MetricKey = "revenue" | "ordersAov" | "topProducts" | "cvrAtc" | "funnel" | "engagement";

const SALES_METRICS: { key: MetricKey; label: string }[] = [
  { key: "revenue", label: "💰 Revenue" },
  { key: "ordersAov", label: "📦 Orders & AOV" },
  { key: "topProducts", label: "🏆 Top Products" },
];
const SESSION_METRICS: { key: MetricKey; label: string }[] = [
  { key: "cvrAtc", label: "🛒 CVR & ATC" },
  { key: "funnel", label: "🔀 Full Funnel" },
  { key: "engagement", label: "📊 Engagement" },
];

function PullEventMetrics({ e }: { e: BrandEvent }) {
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const m = eventMetrics(e);

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] px-3 py-1.5 text-xs font-medium"
      >
        <BarChart3 size={13} /> Pull Event Metrics
        <ChevronDown size={13} className={cx("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-1.5">Sales</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SALES_METRICS.map((mt) => (
              <MetricPill key={mt.key} label={mt.label} active={metric === mt.key} onClick={() => setMetric(mt.key)} />
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-1.5">Sessions</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {SESSION_METRICS.map((mt) => (
              <MetricPill key={mt.key} label={mt.label} active={metric === mt.key} onClick={() => setMetric(mt.key)} />
            ))}
          </div>

          <div className="text-[11px] text-[var(--muted)] italic mb-2">Showing data for {fmtRange(e)}</div>
          <MetricPanel metric={metric} m={m} />
        </div>
      )}
    </div>
  );
}

function MetricPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
        active ? "bg-[var(--accent)]/20 border-[var(--accent)]/40 text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
      )}
    >
      {label}
    </button>
  );
}

function MetricPanel({ metric, m }: { metric: MetricKey; m: ReturnType<typeof eventMetrics> }) {
  if (metric === "topProducts") {
    return (
      <div className="space-y-2">
        {m.topProducts.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2">
            <span className="text-sm">{i + 1}. {p.name}</span>
            <span className="text-sm font-semibold">{formatINR(p.revenue, true)}</span>
          </div>
        ))}
      </div>
    );
  }
  const cells: { label: string; value: string; tone?: "danger" }[] =
    metric === "revenue"
      ? [
          { label: "Gross Revenue", value: formatINR(m.revenue.gross) },
          { label: "Net Revenue", value: formatINR(m.revenue.net) },
          { label: "Returns", value: formatINR(m.revenue.returns), tone: "danger" },
        ]
      : metric === "ordersAov"
      ? [
          { label: "Orders", value: formatNumber(m.ordersAov.orders) },
          { label: "AOV", value: formatINR(m.ordersAov.aov) },
          { label: "Units Sold", value: formatNumber(m.ordersAov.units) },
        ]
      : metric === "cvrAtc"
      ? [
          { label: "Conversion Rate", value: `${m.cvrAtc.cvrPct}%` },
          { label: "Add to Carts", value: formatNumber(m.cvrAtc.addToCarts) },
          { label: "Checkouts", value: formatNumber(m.cvrAtc.checkouts) },
        ]
      : metric === "funnel"
      ? [
          { label: "Sessions", value: formatNumber(m.funnel.sessions) },
          { label: "Add to Cart", value: formatNumber(m.funnel.addToCart) },
          { label: "Checkout", value: formatNumber(m.funnel.checkout) },
          { label: "Purchase", value: formatNumber(m.funnel.purchase) },
        ]
      : [
          { label: "Sessions", value: formatNumber(m.engagement.sessions) },
          { label: "Avg Duration", value: m.engagement.avgDuration },
          { label: "Bounce Rate", value: `${m.engagement.bouncePct}%` },
          { label: "Pageviews", value: formatNumber(m.engagement.pageviews) },
        ];
  return (
    <div className={cx("grid gap-3", cells.length === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
      {cells.map((c) => (
        <div key={c.label} className="rounded-lg bg-[var(--surface)] px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">{c.label}</div>
          <div className={cx("text-lg font-bold mt-1", c.tone === "danger" && "text-[var(--danger)]")}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface)] px-3 py-2">
      <div className="text-[11px] text-[var(--muted)]">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function NewEventForm({ onAdd }: { onAdd: (e: BrandEvent) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("Sale");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountUnit, setDiscountUnit] = useState("%");
  const [target, setTarget] = useState("");
  const [audience, setAudience] = useState("All Users");
  const [channels, setChannels] = useState("");

  const submit = () => {
    if (!title || !start || !end) return;
    const now = TODAY.getTime();
    const status: BrandEvent["status"] = ts(start) > now ? "upcoming" : ts(end) < now ? "ended" : "live";
    const noteBits = [desc || `${discount || ""}${discount ? discountUnit : ""} ${type}`.trim(), `Audience: ${audience}`].filter(Boolean);
    onAdd({
      id: `ev-${title.toLowerCase().replace(/\s+/g, "-").slice(0, 16)}-${start}`,
      name: title,
      type,
      status,
      startDate: start,
      endDate: end,
      channelsLabel: channels || "All channels",
      baselineDailyRevenue: 572000,
      eventDailyRevenue: 0,
      ordersDriven: 0,
      revenueTarget: target ? Number(target) : null,
      actualRevenue: 0,
      note: noteBits.join(" · "),
    });
  };

  return (
    <Card className="mt-3">
      <CardHeader title="New Event" subtitle="Fill in the details below to log this campaign" />

      <Section label="Basic Info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Event Title *">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Buy 1 Get 1 Free – Leggings" className={inputCls} />
          </Field>
          <Field label="Event Type">
            <select value={type} onChange={(e) => setType(e.target.value as EventType)} className={inputCls}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[var(--surface)]">{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description / offer details">
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="e.g. Buy any 2 leggings, get 1 sports bra free. Applies to all colours." className={inputCls} />
        </Field>
      </Section>

      <Section label="Schedule">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="🟢 Start date *">
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
          </Field>
          <Field label="🔴 End date *">
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section label="Offer Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Discount value">
            <div className="flex gap-2">
              <input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="e.g. 20" className={inputCls} />
              <select value={discountUnit} onChange={(e) => setDiscountUnit(e.target.value)} className={cx(inputCls, "w-20 shrink-0")}>
                <option className="bg-[var(--surface)]">%</option>
                <option className="bg-[var(--surface)]">₹</option>
              </select>
            </div>
          </Field>
          <Field label="Revenue target (₹)">
            <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 500000" className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section label="Targeting">
        <Field label="Target audience">
          <div className="flex flex-wrap gap-2">
            {["All Users", "Campaign Users", "Specific Segment"].map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                  audience === a ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Channels">
          <input value={channels} onChange={(e) => setChannels(e.target.value)} placeholder="e.g. Shopify D2C · Instagram · Amazon" className={inputCls} />
        </Field>
      </Section>

      <div className="flex gap-2 mt-4">
        <button onClick={submit} disabled={!title || !start || !end} className="rounded-xl bg-[var(--accent)] text-black font-medium px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          Log Event
        </button>
      </div>
    </Card>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-3">{label}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--muted)] mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function fmt(t: number) {
  return new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function fmtRange(e: BrandEvent) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return `${new Date(e.startDate).toLocaleDateString("en-GB", opts)} → ${new Date(e.endDate).toLocaleDateString("en-GB", opts)}`;
}
