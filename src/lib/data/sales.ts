import { seededRandom } from "../rng";
import { CHANNELS, Channel } from "./products";

const rng = seededRandom(4471);

export interface DailyChannelPoint {
  date: string;
  channel: Channel;
  revenue: number;
  orders: number;
}

// Base daily revenue weight per channel (INR, roughly reflects real mix for a
// mid-size D2C athleisure brand: Shopify is the anchor, marketplaces add reach,
// Zepto is a smaller/newer quick-commerce play).
const BASE_REVENUE: Record<Channel, number> = {
  "Shopify D2C": 210000,
  Amazon: 145000,
  Myntra: 118000,
  "Nykaa Fashion": 52000,
  Zepto: 31000,
};

const BASE_AOV: Record<Channel, number> = {
  "Shopify D2C": 2350,
  Amazon: 1890,
  Myntra: 1720,
  "Nykaa Fashion": 1980,
  Zepto: 1150,
};

const DAYS = 90;

function dateNDaysAgo(n: number): string {
  // Fixed anchor date so the dataset reads as "current" without relying on
  // a live Date.now() call (kept deterministic on purpose).
  const anchor = new Date("2026-07-09T00:00:00Z");
  const d = new Date(anchor);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export const DAILY_SALES: DailyChannelPoint[] = [];

for (let i = DAYS - 1; i >= 0; i--) {
  const date = dateNDaysAgo(i);
  const dow = new Date(date).getUTCDay();
  const weekendBoost = dow === 0 || dow === 6 ? 1.18 : 1;
  // Payday bump around 1st-3rd of month
  const dayOfMonth = Number(date.slice(8, 10));
  const paydayBoost = dayOfMonth <= 3 ? 1.15 : 1;
  // Mild upward trend over the 90-day window + weekly seasonality noise
  const trend = 1 + ((DAYS - i) / DAYS) * 0.12;

  for (const channel of CHANNELS) {
    const noise = rng.range(0.82, 1.2);
    // Zepto ramping fast (quick commerce growth story), Myntra flattish/declining slightly
    const channelTrendAdj =
      channel === "Zepto" ? 1 + ((DAYS - i) / DAYS) * 0.55 :
      channel === "Myntra" ? 1 - ((DAYS - i) / DAYS) * 0.08 :
      1;

    const revenue = Math.round(
      BASE_REVENUE[channel] * weekendBoost * paydayBoost * trend * channelTrendAdj * noise
    );
    const aov = BASE_AOV[channel] * rng.range(0.94, 1.06);
    const orders = Math.max(3, Math.round(revenue / aov));

    DAILY_SALES.push({ date, channel, revenue, orders });
  }
}

export function totalRevenueByChannel(days = DAYS) {
  const cutoffIdx = DAILY_SALES.length - days * CHANNELS.length;
  const slice = DAILY_SALES.slice(Math.max(0, cutoffIdx));
  const map = new Map<Channel, number>();
  for (const row of slice) {
    map.set(row.channel, (map.get(row.channel) ?? 0) + row.revenue);
  }
  return CHANNELS.map((c) => ({ channel: c, revenue: map.get(c) ?? 0 }));
}

export function dailyTotals(days = DAYS) {
  const byDate = new Map<string, { date: string; revenue: number; orders: number }>();
  for (const row of DAILY_SALES) {
    const cur = byDate.get(row.date) ?? { date: row.date, revenue: 0, orders: 0 };
    cur.revenue += row.revenue;
    cur.orders += row.orders;
    byDate.set(row.date, cur);
  }
  return Array.from(byDate.values()).slice(-days);
}

export function last30vsPrev30() {
  const days30 = 30;
  const chLen = CHANNELS.length;
  const last30 = DAILY_SALES.slice(-days30 * chLen);
  const prev30 = DAILY_SALES.slice(-days30 * 2 * chLen, -days30 * chLen);
  const sum = (arr: DailyChannelPoint[]) => arr.reduce((s, r) => s + r.revenue, 0);
  const last = sum(last30);
  const prev = sum(prev30);
  return { last, prev, growthPct: ((last - prev) / prev) * 100 };
}
