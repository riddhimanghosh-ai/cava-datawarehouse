"use client";

import { CalendarClock, Target, TrendingUp, Trophy } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, ProgressBar, IconTile } from "@/components/ui";
import { formatINR, formatNumber, cx } from "@/lib/format";
import { BRAND_EVENTS, BrandEvent, eventDurationDays, eventLiftPct, eventsSummary, eventTargetPct } from "@/lib/data";

export default function EventsPage() {
  const summary = eventsSummary();
  const upcoming = BRAND_EVENTS.filter((e) => e.status === "upcoming");
  const ended = [...BRAND_EVENTS.filter((e) => e.status === "ended")].sort((a, b) => eventLiftPct(b) - eventLiftPct(a));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Events logged (ended)" value={`${summary.endedCount}`} />
        <StatCard label="Avg revenue lift vs baseline" value={`${summary.avgLift >= 0 ? "+" : ""}${summary.avgLift}%`} tone={summary.avgLift >= 0 ? "ok" : "danger"} />
        <StatCard label="Best lever" value={summary.bestEvent.name.split(" — ")[0].split(" / ")[0]} changePct={eventLiftPct(summary.bestEvent)} changeLabel="lift" tone="ok" />
        <StatCard label="Upcoming events" value={`${summary.upcomingCount}`} tone="ok" />
      </div>

      <Card>
        <CardHeader title="Upcoming — targets set before launch" subtitle="So the team is aligned on the goal before spend goes out" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcoming.map((e) => (
            <div key={e.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-start gap-3 mb-2">
                <IconTile icon={<CalendarClock size={16} />} tone="accent" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{e.name}</span>
                    <Badge tone="upcoming">upcoming</Badge>
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">{e.type} · {e.channelsLabel}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                <span>{fmtRange(e)}</span>
                <span className="flex items-center gap-1"><Target size={11} /> Target {formatINR(e.revenueTarget ?? 0, true)}</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">{e.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Event ROI — ranked by real revenue lift" subtitle="Each event measured against its own 14-day pre-event baseline daily run-rate" />
        <div className="space-y-3">
          {ended.map((e, idx) => {
            const lift = eventLiftPct(e);
            const targetPct = eventTargetPct(e);
            return (
              <div key={e.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cx("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold", idx === 0 ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--surface)] text-[var(--muted)]")}>
                      {idx === 0 ? <Trophy size={16} /> : `#${idx + 1}`}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{e.name}</span>
                        <Badge tone="ended">{e.type}</Badge>
                      </div>
                      <div className="text-[11px] text-[var(--muted)]">{fmtRange(e)} · {eventDurationDays(e)} days · {e.channelsLabel}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cx("text-lg font-bold flex items-center gap-1 justify-end", lift >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>
                      <TrendingUp size={15} />
                      {lift >= 0 ? "+" : ""}{lift}%
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">revenue lift</div>
                  </div>
                </div>

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
                <p className="text-[11px] text-[var(--muted)] mt-2.5">{e.note}</p>
              </div>
            );
          })}
        </div>
      </Card>
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

function fmtRange(e: BrandEvent) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return `${new Date(e.startDate).toLocaleDateString("en-GB", opts)} – ${new Date(e.endDate).toLocaleDateString("en-GB", opts)}`;
}
