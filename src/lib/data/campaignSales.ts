import { BRAND_EVENTS, BrandEvent, EventType, eventDurationDays, eventLiftPct, eventMetrics } from "./events";

// How much of gross was given back as discount, by event type.
const DISCOUNT_RATE: Record<EventType, number> = {
  Sale: 0.34,
  "Flash Discount": 0.2,
  "Marketplace Event": 0.25,
  "Product Drop": 0.05,
  "Influencer Collab": 0.1,
  "Email Blast": 0.15,
};

export interface CampaignSalesRow {
  id: string;
  name: string;
  type: EventType;
  status: BrandEvent["status"];
  startDate: string;
  endDate: string;
  days: number;
  users: number;
  orders: number;
  aov: number;
  discountSupplied: number;
  grossRevenue: number;
  nsr: number;
  liftPct: number;
}

export function campaignSalesRows(): CampaignSalesRow[] {
  return BRAND_EVENTS.filter((e) => e.status !== "upcoming").map((e) => {
    const m = eventMetrics(e);
    const discountSupplied = Math.round(m.revenue.gross * DISCOUNT_RATE[e.type]);
    // Unique users ≈ sessions that converted plus a browse multiple; keep it
    // simple: distinct buyers a touch below orders (repeat rate ~1.17).
    const users = Math.round(m.ordersAov.orders / 1.17);
    return {
      id: e.id,
      name: e.name,
      type: e.type,
      status: e.status,
      startDate: e.startDate,
      endDate: e.endDate,
      days: eventDurationDays(e),
      users,
      orders: m.ordersAov.orders,
      aov: m.ordersAov.aov,
      discountSupplied,
      grossRevenue: m.revenue.gross,
      nsr: m.revenue.net,
      liftPct: eventLiftPct(e),
    };
  });
}

export interface CampaignCoupon {
  code: string;
  campaign: string;
  uses: number;
  totalDiscount: number;
  avgDiscount: number;
  redemptionRatePct: number;
}

// Coupons used, tied to the campaign that issued them.
export const CAMPAIGN_COUPONS: CampaignCoupon[] = [
  { code: "FESTIVE40", campaign: "Diwali Festive Sale — Flat 40%", uses: 3120, totalDiscount: 2140600, avgDiscount: 686, redemptionRatePct: 42.1 },
  { code: "BFCM", campaign: "Black Friday / Cyber Monday", uses: 2740, totalDiscount: 1880400, avgDiscount: 686, redemptionRatePct: 38.6 },
  { code: "MESH15", campaign: "Hyper Mesh Collection Drop", uses: 1180, totalDiscount: 148500, avgDiscount: 126, redemptionRatePct: 19.4 },
  { code: "COLLAB10", campaign: "Creator Collab — @fitwithananya", uses: 240, totalDiscount: 88000, avgDiscount: 366, redemptionRatePct: 6.1 },
  { code: "MONSOON20", campaign: "Monsoon Flash — 20% off Leggings", uses: 520, totalDiscount: 276000, avgDiscount: 531, redemptionRatePct: 24.8 },
  { code: "WINBACK15", campaign: "Winback Email — 'We miss you' 15%", uses: 190, totalDiscount: 29040, avgDiscount: 153, redemptionRatePct: 12.2 },
];

export function campaignSalesTotals(rows: CampaignSalesRow[]) {
  const orders = rows.reduce((s, r) => s + r.orders, 0);
  const users = rows.reduce((s, r) => s + r.users, 0);
  const gross = rows.reduce((s, r) => s + r.grossRevenue, 0);
  const nsr = rows.reduce((s, r) => s + r.nsr, 0);
  const discount = rows.reduce((s, r) => s + r.discountSupplied, 0);
  return {
    orders,
    users,
    gross,
    nsr,
    discount,
    aov: orders > 0 ? Math.round(gross / orders) : 0,
    discountPct: gross > 0 ? Math.round((discount / gross) * 1000) / 10 : 0,
  };
}
