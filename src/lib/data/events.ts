export type EventType = "Sale" | "Product Drop" | "Influencer Collab" | "Email Blast" | "Flash Discount" | "Marketplace Event";

export type EventStatus = "upcoming" | "live" | "ended";

export interface BrandEvent {
  id: string;
  name: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  channelsLabel: string;
  // Revenue figures in INR
  baselineDailyRevenue: number; // avg daily revenue in 14 days before the event
  eventDailyRevenue: number; // avg daily revenue during the event (0 for upcoming)
  ordersDriven: number;
  revenueTarget: number | null;
  actualRevenue: number; // total during event
  note: string;
}

// Anchored around 2026-07-09 "today". Uses fixed dates so figures stay stable.
export const BRAND_EVENTS: BrandEvent[] = [
  {
    id: "ev-diwali",
    name: "Diwali Festive Sale — Flat 40%",
    type: "Sale",
    status: "ended",
    startDate: "2025-10-18",
    endDate: "2025-10-26",
    channelsLabel: "Shopify D2C · Myntra · Amazon",
    baselineDailyRevenue: 486000,
    eventDailyRevenue: 768000,
    ordersDriven: 3120,
    revenueTarget: 6000000,
    actualRevenue: 6912000,
    note: "Deepest discount of the year; heavy paid + email push. Strong AOV hold despite discount.",
  },
  {
    id: "ev-bfcm",
    name: "Black Friday / Cyber Monday",
    type: "Sale",
    status: "ended",
    startDate: "2025-11-28",
    endDate: "2025-12-01",
    channelsLabel: "All channels",
    baselineDailyRevenue: 512000,
    eventDailyRevenue: 1558000,
    ordersDriven: 2740,
    revenueTarget: 5000000,
    actualRevenue: 6232000,
    note: "Best single lift of the year. Sculpt Legging + Power Bra bundles drove 60% of orders.",
  },
  {
    id: "ev-lime-drop",
    name: "Electric Lime Collection Drop",
    type: "Product Drop",
    status: "ended",
    startDate: "2026-05-14",
    endDate: "2026-05-18",
    channelsLabel: "Shopify D2C · Instagram",
    baselineDailyRevenue: 534000,
    eventDailyRevenue: 712000,
    ordersDriven: 1180,
    revenueTarget: 2500000,
    actualRevenue: 2848000,
    note: "New colorway launch. Sold through 78% of first batch; reorder placed within 4 days.",
  },
  {
    id: "ev-creator-collab",
    name: "Creator Collab — @fitwithananya",
    type: "Influencer Collab",
    status: "ended",
    startDate: "2026-06-06",
    endDate: "2026-06-09",
    channelsLabel: "Instagram · Shopify D2C",
    baselineDailyRevenue: 548000,
    eventDailyRevenue: 482000,
    ordersDriven: 240,
    revenueTarget: 1500000,
    actualRevenue: 1446000,
    note: "Underdelivered vs target. High reach but low conversion — audience skewed younger/non-buyer.",
  },
  {
    id: "ev-flash-june",
    name: "Monsoon Flash — 20% off Leggings",
    type: "Flash Discount",
    status: "ended",
    startDate: "2026-06-21",
    endDate: "2026-06-22",
    channelsLabel: "Shopify D2C · Zepto",
    baselineDailyRevenue: 556000,
    eventDailyRevenue: 690000,
    ordersDriven: 520,
    revenueTarget: null,
    actualRevenue: 1380000,
    note: "48h flash. Modest lift; likely pulled forward orders that would have landed in the week anyway.",
  },
  {
    id: "ev-email-refresh",
    name: "Winback Email — 'We miss you' 15%",
    type: "Email Blast",
    status: "ended",
    startDate: "2026-06-28",
    endDate: "2026-06-29",
    channelsLabel: "Email · Shopify D2C",
    baselineDailyRevenue: 561000,
    eventDailyRevenue: 604000,
    ordersDriven: 190,
    revenueTarget: 600000,
    actualRevenue: 604000,
    note: "Targeted lapsed customers (90d+). Cheap to run, small but positive incremental lift.",
  },
  {
    id: "ev-freedom",
    name: "Amazon Great Freedom Festival",
    type: "Marketplace Event",
    status: "upcoming",
    startDate: "2026-08-08",
    endDate: "2026-08-12",
    channelsLabel: "Amazon",
    baselineDailyRevenue: 572000,
    eventDailyRevenue: 0,
    ordersDriven: 0,
    revenueTarget: 4200000,
    actualRevenue: 0,
    note: "Deal submissions locked. Sculpt Legging + Core Set entered as lightning deals.",
  },
  {
    id: "ev-indep-drop",
    name: "Independence Edit — Windbreak Jacket",
    type: "Product Drop",
    status: "upcoming",
    startDate: "2026-08-14",
    endDate: "2026-08-17",
    channelsLabel: "Shopify D2C · Instagram",
    baselineDailyRevenue: 572000,
    eventDailyRevenue: 0,
    ordersDriven: 0,
    revenueTarget: 1800000,
    actualRevenue: 0,
    note: "New Navy jacket hero push timed with monsoon-to-transition weather messaging.",
  },
];

export function eventLiftPct(e: BrandEvent): number {
  if (e.baselineDailyRevenue === 0 || e.status === "upcoming") return 0;
  return Math.round(((e.eventDailyRevenue - e.baselineDailyRevenue) / e.baselineDailyRevenue) * 1000) / 10;
}

export function eventTargetPct(e: BrandEvent): number | null {
  if (!e.revenueTarget) return null;
  return Math.round((e.actualRevenue / e.revenueTarget) * 1000) / 10;
}

export function eventDurationDays(e: BrandEvent): number {
  const start = new Date(e.startDate).getTime();
  const end = new Date(e.endDate).getTime();
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
}

export function eventsSummary() {
  const ended = BRAND_EVENTS.filter((e) => e.status === "ended");
  const upcoming = BRAND_EVENTS.filter((e) => e.status === "upcoming");
  const avgLift = Math.round((ended.reduce((s, e) => s + eventLiftPct(e), 0) / ended.length) * 10) / 10;
  const bestEvent = [...ended].sort((a, b) => eventLiftPct(b) - eventLiftPct(a))[0];
  const totalRevenue = ended.reduce((s, e) => s + e.actualRevenue, 0);
  return { endedCount: ended.length, upcomingCount: upcoming.length, avgLift, bestEvent, totalRevenue };
}
