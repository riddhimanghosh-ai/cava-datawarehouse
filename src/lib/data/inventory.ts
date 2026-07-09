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

    // Bestsellers (Sculpt Legging Black, Power Bra Black/Lime) run hot and
    // frequently understock; Sage Tee and Berry Set overshot demand forecasts
    // and are sitting in excess. Everything else sits near a plausible middle.
    const isHeroRunner = ["CV-LEG-SCLP-BLK", "CV-BRA-PWR-BLK", "CV-BRA-PWR-ELC"].includes(product.sku);
    const isOverbought = ["CV-TEE-OVR-SGE", "CV-SET-CORE-BRY", "CV-JOG-CLD-GRY"].includes(product.sku);

    const baseVelocity = channel === "Shopify D2C" ? rng.range(9, 22) : channel === "Amazon" ? rng.range(6, 16) : channel === "Myntra" ? rng.range(5, 13) : channel === "Zepto" ? rng.range(3, 9) : rng.range(2, 7);
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
