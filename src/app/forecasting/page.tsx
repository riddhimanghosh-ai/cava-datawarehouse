"use client";

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, StatCard, Badge } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import { DEMAND_FORECAST, forecastAccuracy, SKU_FORECASTS } from "@/lib/data";

export default function ForecastingPage() {
  const accuracy = forecastAccuracy();
  const surging = SKU_FORECASTS.filter((s) => s.currentSellability === "surging").length;
  const cooling = SKU_FORECASTS.filter((s) => s.currentSellability === "cooling").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="8-week forecast accuracy (MAPE-based)" value={`${accuracy}%`} tone={accuracy >= 85 ? "ok" : "danger"} />
        <StatCard label="SKUs surging" value={`${surging}`} tone="ok" />
        <StatCard label="SKUs cooling" value={`${cooling}`} tone="danger" />
        <StatCard label="Next 4-week unit demand (all SKUs)" value={formatNumber(SKU_FORECASTS.reduce((s, r) => s + r.next4WeekDemand, 0))} />
      </div>

      <Card>
        <CardHeader title="Demand: actual vs. forecast" subtitle="Weekly units, all channels combined — last 8 weeks + 4-week forward forecast" />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={DEMAND_FORECAST}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="actual" name="Actual demand" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#8A2BE2" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardHeader title="SKU-level forecast & recommended action" subtitle="What's driving demand shifts this month" />
        <div className="space-y-3">
          {SKU_FORECASTS.map((s) => (
            <div key={s.sku} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div>
                  <span className="font-medium text-sm">{s.name}</span>
                  <span className="text-[11px] text-[var(--muted)] ml-2">{s.sku}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={s.currentSellability}>{s.currentSellability}</Badge>
                  <span className="text-xs text-[var(--muted)]">{formatNumber(s.next4WeekDemand)} units / 4wk</span>
                </div>
              </div>
              <p className="text-xs text-[var(--muted)] mb-1.5">{s.driverNote}</p>
              <p className="text-xs text-[var(--foreground)]">
                <span className="text-[var(--accent)] font-medium">Recommended: </span>
                {s.recommendedAction}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
