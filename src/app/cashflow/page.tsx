"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertOctagon, Banknote, Clock, ShieldAlert } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, RingProgress, IconTile } from "@/components/ui";
import { formatINR } from "@/lib/format";
import { CASH_TREND, cashSummary, PAYABLES, PAYOUT_CYCLE_DAYS, CHANNEL_TAKE_RATE, RECEIVABLES } from "@/lib/data";

export default function CashflowPage() {
  const summary = cashSummary();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cash on hand" value={formatINR(summary.current, true)} />
        <StatCard label="Total receivables" value={formatINR(summary.totalReceivables, true)} />
        <StatCard label="Total payables due" value={formatINR(summary.totalPayables, true)} tone="danger" />
        <StatCard label="Runway at current burn" value={`${summary.runwayMonths.toFixed(1)} months`} tone={summary.runwayMonths > 6 ? "ok" : "danger"} />
      </div>

      <Card>
        <CardHeader title="Cash balance trend" subtitle="Monthly closing cash position, inflow vs outflow" />
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={CASH_TREND}>
            <defs>
              <linearGradient id="cash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => formatINR(v, true)} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} formatter={(v) => formatINR(Number(v))} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="cashBalance" name="Closing cash balance" stroke="var(--accent)" strokeWidth={2.5} fill="url(#cash)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Monthly inflow vs outflow" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CASH_TREND}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => formatINR(v, true)} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} formatter={(v) => formatINR(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="inflow" name="Inflow" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" name="Outflow" fill="#ff5d5d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Channel payout cycles" subtitle="Days to receive settlement + marketplace commission" />
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PAYOUT_CYCLE_DAYS).map(([channel, days]) => (
              <div key={channel} className="flex items-center gap-3 rounded-lg bg-[var(--surface-2)] px-3 py-3">
                <RingProgress pct={(days / 30) * 100} size={46} stroke={5} tone={days > 21 ? "danger" : "accent"} label={`${days}d`} />
                <div>
                  <div className="text-sm font-medium leading-tight">{channel}</div>
                  <div className="text-[11px] text-[var(--muted)]">{(CHANNEL_TAKE_RATE[channel as keyof typeof CHANNEL_TAKE_RATE] * 100).toFixed(1)}% take rate</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Receivables by channel" subtitle="Outstanding settlement amounts" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RECEIVABLES.map((r) => (
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
          </div>
        </Card>

        <Card>
          <CardHeader title="Upcoming payables" subtitle="Prioritized by urgency" />
          <div className="space-y-2.5">
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
      </div>

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
  );
}
