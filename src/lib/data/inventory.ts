import { seededRandom } from "../rng";
import { AVAILABILITY, CHANNELS, Channel, PRODUCTS } from "./products";

const rng = seededRandom(9183);

export type StockStatus = "healthy" | "low" | "critical" | "overstock" | "excess-aging";

export interface InventoryRow {
  sku: string;
  name: string;
  category: string;
  channel: Channel;
  onHand: number;
  incoming: number;
  incomingEta: string;
  avgDailySales: number;
  daysOfCover: number;
  reorderPoint: number;
  status: StockStatus;
  sellThroughPct: number;
  warehouse: string;
  openOrders: number;
  leadTimeDays: number;
}

const WAREHOUSE_BY_CHANNEL: Record<Channel, string> = {
  "Shopify D2C": "Bhiwandi FC (3PL)",
  Amazon: "Amazon FBA – Bhiwandi",
  Myntra: "Myntra WH – Bengaluru",
  Zepto: "Zepto Dark Store Pool (Mumbai/Delhi/BLR)",
  "Nykaa Fashion": "Nykaa FC – Mumbai",
};

function computeStatus(daysOfCover: number): StockStatus {
  if (daysOfCover < 5) return "critical";
  if (daysOfCover < 12) return "low";
  if (daysOfCover > 75) return "excess-aging";
  if (daysOfCover > 45) return "overstock";
  return "healthy";
}

export const INVENTORY: InventoryRow[] = [];

for (const product of PRODUCTS) {
  for (const channel of CHANNELS) {
    if (!AVAILABILITY[channel].includes(product.sku)) continue;

    // Bestsellers (Hourglass Snug Black, Cross Back Bra, Hyper Mesh Bra) run hot and
    // frequently understock; the Pine Supima Tee and Plie Skort overshot demand forecasts
    // and are sitting in excess. Everything else sits near a plausible middle.
    const isHeroRunner = ["CV-LEG-HG-BLK", "CV-BRA-CB-BLK", "CV-BRA-HM-WNE"].includes(product.sku);
    const isOverbought = ["CV-TEE-SU-PNE", "CV-SKT-PLE-BLK", "CV-JOG-EW-NVY"].includes(product.sku);

    const baseVelocity = channel === "Shopify D2C" ? rng.range(3, 8) : channel === "Amazon" ? rng.range(2, 5.5) : channel === "Myntra" ? rng.range(1.5, 4.5) : channel === "Zepto" ? rng.range(1, 3) : rng.range(0.8, 2.5);
    const avgDailySales = Math.round((isHeroRunner ? baseVelocity * 1.9 : isOverbought ? baseVelocity * 0.55 : baseVelocity) * 10) / 10;

    let daysOfCover: number;
    if (isHeroRunner) {
      daysOfCover = rng.range(2.5, 9);
    } else if (isOverbought) {
      daysOfCover = rng.range(70, 130);
    } else {
      daysOfCover = rng.range(14, 42);
    }

    const onHand = Math.max(0, Math.round(avgDailySales * daysOfCover));
    const reorderPoint = Math.round(avgDailySales * 14);
    const status = computeStatus(daysOfCover);
    const incoming = status === "critical" || status === "low" ? Math.round(avgDailySales * rng.range(20, 40)) : status === "excess-aging" ? 0 : Math.round(avgDailySales * rng.range(0, 15));
    const etaDays = rng.int(4, 18);
    const sellThroughPct = Math.round(
      (isOverbought ? rng.range(18, 34) : isHeroRunner ? rng.range(78, 96) : rng.range(45, 72)) * 10
    ) / 10;
    const openOrders = status === "critical" || status === "low" ? Math.round(avgDailySales * rng.range(10, 25)) : Math.round(avgDailySales * rng.range(0, 8));

    INVENTORY.push({
      sku: product.sku,
      name: product.name,
      category: product.category,
      channel,
      onHand,
      incoming,
      incomingEta: `${etaDays}d`,
      avgDailySales,
      daysOfCover: Math.round(daysOfCover * 10) / 10,
      reorderPoint,
      status,
      sellThroughPct,
      warehouse: WAREHOUSE_BY_CHANNEL[channel],
      openOrders,
      leadTimeDays: etaDays,
    });
  }
}

export function inventorySummary() {
  const critical = INVENTORY.filter((r) => r.status === "critical").length;
  const low = INVENTORY.filter((r) => r.status === "low").length;
  const overstock = INVENTORY.filter((r) => r.status === "overstock").length;
  const excess = INVENTORY.filter((r) => r.status === "excess-aging").length;
  const healthy = INVENTORY.filter((r) => r.status === "healthy").length;
  const capitalStuck = INVENTORY.filter((r) => r.status === "excess-aging" || r.status === "overstock").reduce((s, r) => {
    const product = PRODUCTS.find((p) => p.sku === r.sku)!;
    return s + r.onHand * product.cost;
  }, 0);
  const potentialLostSales = INVENTORY.filter((r) => r.status === "critical" || r.status === "low").reduce((s, r) => {
    const product = PRODUCTS.find((p) => p.sku === r.sku)!;
    return s + r.avgDailySales * 14 * product.price * 0.4;
  }, 0);
  return { critical, low, overstock, excess, healthy, capitalStuck, potentialLostSales, total: INVENTORY.length };
}

export interface SohSummaryRow {
  key: string;
  label: string;
  totalSoh: number;
  totalConsumption: number;
  doh: number;
  dohLastDay: number;
  avgLeadTimeDays: number;
  totalOpenOrders: number;
  totalInTransit: number;
  avgMrp: number;
}

// Mirrors the "SCM Qcomm SOH" report: channel rollups that expand into their
// category breakdown, each with SOH, trailing consumption, days-of-hand
// (DOH), and pipeline (open orders / in transit).
export function sohByChannel(): SohSummaryRow[] {
  return CHANNELS.map((channel) => rollupSoh(channel, INVENTORY.filter((r) => r.channel === channel), channel));
}

export function sohByCategoryForChannel(channel: Channel): SohSummaryRow[] {
  const rows = INVENTORY.filter((r) => r.channel === channel);
  const categories = Array.from(new Set(rows.map((r) => r.category)));
  return categories.map((cat) => rollupSoh(`${channel}__${cat}`, rows.filter((r) => r.category === cat), cat));
}

export function sohTotal(): SohSummaryRow {
  return rollupSoh("total", INVENTORY, "Total");
}

function rollupSoh(key: string, rows: InventoryRow[], label: string): SohSummaryRow {
  const totalSoh = rows.reduce((s, r) => s + r.onHand, 0);
  const totalConsumption = Math.round(rows.reduce((s, r) => s + r.avgDailySales * 30, 0));
  const doh = totalConsumption > 0 ? Math.round((totalSoh / (totalConsumption / 30)) * 10) / 10 : 0;
  const dohLastDay = Math.round(doh * (0.96 + ((totalSoh * 7) % 9) / 100) * 10) / 10;
  const avgLeadTimeDays = rows.length ? Math.round(rows.reduce((s, r) => s + r.leadTimeDays, 0) / rows.length) : 0;
  const totalOpenOrders = rows.reduce((s, r) => s + r.openOrders, 0);
  const totalInTransit = rows.reduce((s, r) => s + r.incoming, 0);
  const mrpWeighted = rows.reduce((s, r) => {
    const product = PRODUCTS.find((p) => p.sku === r.sku)!;
    return s + product.price * r.onHand;
  }, 0);
  const avgMrp = totalSoh > 0 ? Math.round(mrpWeighted / totalSoh) : 0;
  return { key, label, totalSoh, totalConsumption, doh, dohLastDay, avgLeadTimeDays, totalOpenOrders, totalInTransit, avgMrp };
}
