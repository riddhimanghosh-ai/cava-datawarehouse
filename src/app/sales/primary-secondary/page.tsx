"use client";

import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, StatCard } from "@/components/ui";
import { formatINR } from "@/lib/format";
import { PRIMARY_SECONDARY, primarySecondarySummary } from "@/lib/data";

function lakh(v: number) {
  return formatINR(v * 100000, true);
}

export default function PrimarySecondaryPage() {
  const ps = primarySecondarySummary();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Primary sales (this month)" value={lakh(ps.latest.primarySalesLakh)} changePct={ps.primaryGrowthPct} changeLabel="vs last month" />
        <StatCard label="Secondary sales (this month)" value={lakh(ps.latest.secondarySalesLakh)} changePct={ps.secondaryGrowthPct} changeLabel="vs last month" />
        <StatCard label="Primary − Secondary gap" value={lakh(ps.gapLakh)} tone={ps.gapLakh > 15 ? "danger" : "ok"} />
        <StatCard label="Primary delta MoM" value={lakh(ps.primaryDeltaLakh)} changePct={ps.primaryGrowthPct} changeLabel="growth" />
      </div>

      <Card>
        <CardHeader
          title="Primary vs. secondary sales"
          subtitle="Primary = brand billing into channels (sell-in). Secondary = actual consumer sell-through. A widening gap means stock is piling up downstream."
        />
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={PRIMARY_SECONDARY}>
            <defs>
              <linearGradient id="primary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v) => lakh(Number(v))} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} formatter={(v) => lakh(Number(v))} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="primarySalesLakh" name="Primary (sell-in)" stroke="var(--accent)" strokeWidth={2.5} fill="url(#primary)" />
            <Line type="monotone" dataKey="secondarySalesLakh" name="Secondary (sell-through)" stroke="#8A2BE2" strokeWidth={2.5} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
