import { seededRandom } from "../rng";
import { Channel } from "./products";

const rng = seededRandom(7712);

export const PAYOUT_CYCLE_DAYS: Record<Channel, number> = {
  "Shopify D2C": 2,
  Amazon: 14,
  Myntra: 30,
  Zepto: 7,
  "Nykaa Fashion": 21,
};

export const CHANNEL_TAKE_RATE: Record<Channel, number> = {
  "Shopify D2C": 0.023,
  Amazon: 0.19,
  Myntra: 0.24,
  Zepto: 0.16,
  "Nykaa Fashion": 0.22,
};

export interface CashPoint {
  date: string;
  cashBalance: number;
  inflow: number;
  outflow: number;
}

const MONTH_LABELS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

export const CASH_TREND: CashPoint[] = (() => {
  let balance = 6_400_000;
  return MONTH_LABELS.map((m, i) => {
    const inflow = Math.round(rng.range(4_200_000, 6_800_000) * (1 + i * 0.03));
    const outflow = Math.round(inflow * rng.range(0.82, 1.08));
    balance = balance + inflow - outflow;
    return { date: m, cashBalance: Math.round(balance), inflow, outflow };
  });
})();

export interface Receivable {
  channel: Channel;
  amountDue: number;
  avgCycleDays: number;
  oldestInvoiceDays: number;
  status: "on-time" | "delayed" | "at-risk";
}

export const RECEIVABLES: Receivable[] = [
  { channel: "Amazon", amountDue: 3_180_000, avgCycleDays: 14, oldestInvoiceDays: 11, status: "on-time" },
  { channel: "Myntra", amountDue: 4_920_000, avgCycleDays: 30, oldestInvoiceDays: 42, status: "delayed" },
  { channel: "Nykaa Fashion", amountDue: 1_260_000, avgCycleDays: 21, oldestInvoiceDays: 19, status: "on-time" },
  { channel: "Zepto", amountDue: 640_000, avgCycleDays: 7, oldestInvoiceDays: 9, status: "on-time" },
];

export interface PayableItem {
  vendor: string;
  category: string;
  amount: number;
  dueInDays: number;
  priority: "high" | "medium" | "low";
}

export const PAYABLES: PayableItem[] = [
  { vendor: "Vardhman Fabrics Pvt Ltd", category: "Raw Material – Nylon/Spandex blend", amount: 2_140_000, dueInDays: 6, priority: "high" },
  { vendor: "Surat Knits Co.", category: "Raw Material – Rib fabric", amount: 980_000, dueInDays: 12, priority: "medium" },
  { vendor: "Meta Ads (Facebook/Instagram)", category: "Marketing", amount: 1_420_000, dueInDays: 3, priority: "high" },
  { vendor: "Google Ads", category: "Marketing", amount: 610_000, dueInDays: 3, priority: "medium" },
  { vendor: "Bhiwandi Fulfillment 3PL", category: "Logistics & Warehousing", amount: 730_000, dueInDays: 9, priority: "medium" },
  { vendor: "Shiprocket / Delhivery", category: "Last-mile shipping", amount: 890_000, dueInDays: 5, priority: "high" },
  { vendor: "Studio 9 Stitching Unit", category: "Cut & Sew Manufacturing", amount: 1_760_000, dueInDays: 18, priority: "low" },
];

export function cashSummary() {
  const current = CASH_TREND[CASH_TREND.length - 1].cashBalance;
  const totalReceivables = RECEIVABLES.reduce((s, r) => s + r.amountDue, 0);
  const totalPayables = PAYABLES.reduce((s, p) => s + p.amount, 0);
  const avgMonthlyOutflow =
    CASH_TREND.slice(-3).reduce((s, c) => s + c.outflow, 0) / 3;
  const runwayMonths = current / avgMonthlyOutflow;
  return { current, totalReceivables, totalPayables, avgMonthlyOutflow, runwayMonths };
}
