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

// Pull-on-demand metrics for a single ended event, derived deterministically
// from its own revenue so the numbers stay stable and internally consistent.
export interface EventMetrics {
  revenue: { gross: number; net: number; returns: number };
  ordersAov: { orders: number; aov: number; units: number };
  topProducts: { name: string; revenue: number }[];
  cvrAtc: { cvrPct: number; addToCarts: number; checkouts: number };
  funnel: { sessions: number; addToCart: number; checkout: number; purchase: number };
  engagement: { sessions: number; avgDuration: string; bouncePct: number; pageviews: number };
}

const TOP_PRODUCT_POOL = [
  "Sculpt High-Waist Legging – Jet Black",
  "Power Hold Sports Bra – Black",
  "Power Hold Sports Bra – Electric Lime",
  "Core Co-ord Set – Black",
  "Flex Seamless Legging – Nude Blush",
  "Cloud Fleece Jogger – Heather Grey",
];

export function eventMetrics(e: BrandEvent): EventMetrics {
  const gross = e.actualRevenue || Math.round(e.eventDailyRevenue * eventDurationDays(e));
  const returns = -Math.round(gross * 0.0055);
  const net = Math.round(gross * 0.52) + returns;
  const aov = 1750 + (e.name.charCodeAt(0) % 9) * 60;
  const orders = Math.max(1, Math.round(gross / aov));
  const units = Math.round(orders * 1.86);
  const seed = e.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const topProducts = [0, 1, 2].map((i) => ({
    name: TOP_PRODUCT_POOL[(seed + i) % TOP_PRODUCT_POOL.length],
    revenue: Math.round(gross * [0.34, 0.22, 0.14][i]),
  }));
  const purchase = orders;
  const checkout = Math.round(purchase / 0.31);
  const addToCart = Math.round(checkout / 0.35);
  const sessions = Math.round(addToCart / 0.114);
  const cvrPct = Math.round((purchase / sessions) * 10000) / 100;
  return {
    revenue: { gross, net, returns },
    ordersAov: { orders, aov, units },
    topProducts,
    cvrAtc: { cvrPct, addToCarts: addToCart, checkouts: checkout },
    funnel: { sessions, addToCart, checkout, purchase },
    engagement: {
      sessions,
      avgDuration: `${1 + (seed % 2)}m ${10 + (seed % 40)}s`,
      bouncePct: 32 + (seed % 12),
      pageviews: Math.round(sessions * 2.7),
    },
  };
}

export function eventsSummary() {
  const ended = BRAND_EVENTS.filter((e) => e.status === "ended");
  const upcoming = BRAND_EVENTS.filter((e) => e.status === "upcoming");
  const avgLift = Math.round((ended.reduce((s, e) => s + eventLiftPct(e), 0) / ended.length) * 10) / 10;
  const bestEvent = [...ended].sort((a, b) => eventLiftPct(b) - eventLiftPct(a))[0];
  const totalRevenue = ended.reduce((s, e) => s + e.actualRevenue, 0);
  return { endedCount: ended.length, upcomingCount: upcoming.length, avgLift, bestEvent, totalRevenue };
}
