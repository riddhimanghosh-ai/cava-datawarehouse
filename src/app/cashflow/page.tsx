"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, StatCard, Badge, ProgressBar } from "@/components/ui";
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
          <div className="space-y-3">
            {Object.entries(PAYOUT_CYCLE_DAYS).map(([channel, days]) => (
              <div key={channel}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{channel}</span>
                  <span className="text-[var(--muted)]">{days}d cycle · {(CHANNEL_TAKE_RATE[channel as keyof typeof CHANNEL_TAKE_RATE] * 100).toFixed(1)}% take rate</span>
                </div>
                <ProgressBar pct={(days / 30) * 100} tone={days > 21 ? "danger" : "accent"} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Receivables by channel" subtitle="Outstanding settlement amounts" />
          <div className="space-y-3">
            {RECEIVABLES.map((r) => (
              <div key={r.channel} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">{r.channel}</div>
                  <div className="text-[11px] text-[var(--muted)]">Oldest invoice: {r.oldestInvoiceDays}d · cycle {r.avgCycleDays}d</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatINR(r.amountDue, true)}</div>
                  <Badge tone={r.status}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Upcoming payables" subtitle="Prioritized by urgency" />
          <div className="space-y-2.5">
            {[...PAYABLES].sort((a, b) => a.dueInDays - b.dueInDays).map((p) => (
              <div key={p.vendor} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">{p.vendor}</div>
                  <div className="text-[11px] text-[var(--muted)]">{p.category} · due in {p.dueInDays}d</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatINR(p.amount, true)}</div>
                  <Badge tone={p.priority}>{p.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
