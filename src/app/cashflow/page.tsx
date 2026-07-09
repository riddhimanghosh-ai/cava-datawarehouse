"use client";

import { useState } from "react";
import { AlertOctagon, Banknote, Calendar, Clock, ShieldAlert, Store, Wallet } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, RingProgress, IconTile, ProgressBar, Tabs, FilterRow, FilterBox, MultiSelect, passesFilter } from "@/components/ui";
import { formatINR, cx } from "@/lib/format";
import { CASH_TREND, cashSummary, PAYABLES, PAYOUT_CYCLE_DAYS, CHANNEL_TAKE_RATE, RECEIVABLES, CHANNELS } from "@/lib/data";

const MONTH_RANGES = [
  { value: "6", label: "Last 6 months" },
  { value: "3", label: "Last 3 months" },
];

type Tab = "balance" | "payables" | "receivables";
const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "balance", label: "Cash Balance, Inflow & Outflow", icon: <Wallet size={15} /> },
  { value: "payables", label: "Upcoming Payables", icon: <Banknote size={15} /> },
  { value: "receivables", label: "Receivables", icon: <Clock size={15} /> },
];

export default function CashflowPage() {
  const summary = cashSummary();
  const [tab, setTab] = useState<Tab>("balance");
  const [range, setRange] = useState("6");
  const [channels, setChannels] = useState<Set<string>>(new Set());

  const trend = CASH_TREND.slice(-Number(range));
  const receivables = RECEIVABLES.filter((r) => passesFilter(channels, r.channel));
  const payoutChannels = CHANNELS.filter((c) => passesFilter(channels, c));

  return (
    <div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div className="space-y-6">
      <FilterRow>
        <FilterBox label="Date range" icon={<Calendar size={12} />} value={range} onChange={setRange} options={MONTH_RANGES} />
        <MultiSelect label="Channel" icon={<Store size={12} />} options={CHANNELS.map((c) => ({ value: c, label: c }))} selected={channels} onChange={setChannels} />
      </FilterRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cash on hand" value={formatINR(summary.current, true)} />
        <StatCard label="Total receivables" value={formatINR(summary.totalReceivables, true)} />
        <StatCard label="Total payables due" value={formatINR(summary.totalPayables, true)} tone="danger" />
        <StatCard label="Runway at current burn" value={`${summary.runwayMonths.toFixed(1)} months`} tone={summary.runwayMonths > 6 ? "ok" : "danger"} />
      </div>

      {tab === "balance" && (
      <Card>
        <CardHeader title="Cash balance, inflow & outflow" subtitle="Monthly — closing cash position with in/out breakdown" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-[var(--muted)] text-xs border-b border-[var(--border)]">
                <th className="py-2 px-5 font-medium">Month</th>
                <th className="py-2 px-2 font-medium">Inflow</th>
                <th className="py-2 px-2 font-medium">Outflow</th>
                <th className="py-2 px-2 font-medium">Net</th>
                <th className="py-2 px-2 font-medium">Closing balance</th>
                <th className="py-2 px-2 font-medium w-40">Balance trend</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((c) => {
                const net = c.inflow - c.outflow;
                const maxBal = Math.max(...trend.map((t) => t.cashBalance), 1);
                return (
                  <tr key={c.date} className="border-b border-[var(--border)]/60 hover:bg-[var(--surface-2)]/60">
                    <td className="py-2.5 px-5 font-medium">{c.date}</td>
                    <td className="py-2.5 px-2 text-[var(--ok)]">{formatINR(c.inflow, true)}</td>
                    <td className="py-2.5 px-2 text-[var(--danger)]">{formatINR(c.outflow, true)}</td>
                    <td className={cx("py-2.5 px-2 font-medium", net >= 0 ? "text-[var(--ok)]" : "text-[var(--danger)]")}>{net >= 0 ? "+" : ""}{formatINR(net, true)}</td>
                    <td className="py-2.5 px-2 font-semibold">{formatINR(c.cashBalance, true)}</td>
                    <td className="py-2.5 px-2"><ProgressBar pct={(c.cashBalance / maxBal) * 100} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {tab === "receivables" && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Channel payout cycles" subtitle="Days to receive settlement + marketplace commission" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {payoutChannels.map((channel) => {
              const days = PAYOUT_CYCLE_DAYS[channel];
              return (
                <div key={channel} className="flex items-center gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-3">
                  <RingProgress pct={(days / 30) * 100} size={46} stroke={5} tone={days > 21 ? "danger" : "accent"} label={`${days}d`} />
                  <div>
                    <div className="text-sm font-medium leading-tight">{channel}</div>
                    <div className="text-[11px] text-[var(--muted)]">{(CHANNEL_TAKE_RATE[channel] * 100).toFixed(1)}% take rate</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Receivables by channel" subtitle="Outstanding settlement amounts" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {receivables.map((r) => (
              <div key={r.channel} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-start justify-between mb-2">
                  <IconTile icon={<Clock size={16} />} tone={r.status === "on-time" ? "ok" : r.status === "delayed" ? "default" : "danger"} />
                  <Badge tone={r.status}>{r.status}</Badge>
                </div>
                <div className="text-sm font-medium">{r.channel}</div>
                <div className="text-lg font-bold mt-0.5">{formatINR(r.amountDue, true)}</div>
                <div className="text-[11px] text-[var(--muted)] mt-1">Oldest invoice {r.oldestInvoiceDays}d · {r.avgCycleDays}d cycle</div>
              </div>
            ))}
            {receivables.length === 0 && <p className="text-sm text-[var(--muted)] py-4 col-span-full text-center">No receivables for this channel filter.</p>}
          </div>
        </Card>
      </div>
      )}

      {tab === "payables" && (
      <Card>
        <CardHeader title="Upcoming payables" subtitle="Prioritized by urgency" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[...PAYABLES].sort((a, b) => a.dueInDays - b.dueInDays).map((p) => (
            <div key={p.vendor} className="flex items-center gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
              <IconTile icon={p.priority === "high" ? <AlertOctagon size={16} /> : <Banknote size={16} />} tone={p.priority === "high" ? "danger" : "default"} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.vendor}</div>
                <div className="text-[11px] text-[var(--muted)]">{p.category} · due in {p.dueInDays}d</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold">{formatINR(p.amount, true)}</div>
                <Badge tone={p.priority}>{p.priority}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
      )}

      {summary.runwayMonths < 8 && (
        <Card className="border-[var(--warning)]/40 bg-[var(--warning)]/5">
          <div className="flex items-start gap-3">
            <IconTile icon={<ShieldAlert size={18} />} tone="danger" />
            <div className="text-sm">
              <div className="font-medium mb-1">Watch the Myntra payout lag</div>
              <p className="text-[var(--muted)] text-xs">
                ₹49L is sitting in Myntra receivables with the oldest invoice overdue by 12 days beyond its normal 30-day cycle, while ₹14.2L in Meta ad spend is due in 3 days — plan a short-term draw if the gap doesn&apos;t close.
              </p>
            </div>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}
