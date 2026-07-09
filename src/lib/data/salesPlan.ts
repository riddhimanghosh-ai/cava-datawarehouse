import { seededRandom } from "../rng";
import { Category, Channel, PRODUCTS } from "./products";

const rng = seededRandom(8214);

// --- Primary vs Secondary, SKU-wise --------------------------------------
// Qty = units billed (primary) / sold-through (secondary). GMV = gross
// merchandise value. NSR (Net Sales Realisation) = GMV net of returns,
// discounts & channel fees; pre-tax then post-tax (after GST).

export interface PrimarySecondarySkuRow {
  sku: string;
  name: string;
  category: Category;
  primaryQty: number;
  primaryGmv: number;
  primaryPreTaxNsr: number;
  primaryPostTaxNsr: number;
  secondaryQty: number;
  secondaryGmv: number;
  secondaryPreTaxNsr: number;
  secondaryPostTaxNsr: number;
}

export const PRIMARY_SECONDARY_SKU: PrimarySecondarySkuRow[] = PRODUCTS.map((p) => {
  const primaryQty = rng.int(1200, 42000);
  const primaryGmv = Math.round(primaryQty * p.price * rng.range(0.96, 1.0));
  const primaryPreTaxNsr = Math.round(primaryGmv * rng.range(0.7, 0.78));
  const primaryPostTaxNsr = Math.round(primaryPreTaxNsr * 0.9525);
  // Secondary (sell-through) is usually a bit below primary billing
  const secondaryQty = Math.round(primaryQty * rng.range(0.86, 1.02));
  const secondaryGmv = Math.round(secondaryQty * p.price * rng.range(0.94, 1.0));
  const secondaryPreTaxNsr = Math.round(secondaryGmv * rng.range(0.72, 0.8));
  const secondaryPostTaxNsr = Math.round(secondaryPreTaxNsr * 0.9525);
  return {
    sku: p.sku,
    name: p.name,
    category: p.category,
    primaryQty,
    primaryGmv,
    primaryPreTaxNsr,
    primaryPostTaxNsr,
    secondaryQty,
    secondaryGmv,
    secondaryPreTaxNsr,
    secondaryPostTaxNsr,
  };
});

export function primarySecondarySkuTotals() {
  return PRIMARY_SECONDARY_SKU.reduce(
    (acc, r) => ({
      primaryQty: acc.primaryQty + r.primaryQty,
      primaryGmv: acc.primaryGmv + r.primaryGmv,
      primaryPreTaxNsr: acc.primaryPreTaxNsr + r.primaryPreTaxNsr,
      primaryPostTaxNsr: acc.primaryPostTaxNsr + r.primaryPostTaxNsr,
      secondaryQty: acc.secondaryQty + r.secondaryQty,
      secondaryGmv: acc.secondaryGmv + r.secondaryGmv,
      secondaryPreTaxNsr: acc.secondaryPreTaxNsr + r.secondaryPreTaxNsr,
      secondaryPostTaxNsr: acc.secondaryPostTaxNsr + r.secondaryPostTaxNsr,
    }),
    { primaryQty: 0, primaryGmv: 0, primaryPreTaxNsr: 0, primaryPostTaxNsr: 0, secondaryQty: 0, secondaryGmv: 0, secondaryPreTaxNsr: 0, secondaryPostTaxNsr: 0 }
  );
}

// --- Primary vs Secondary sales -------------------------------------------
// Primary = brand billing into a channel (sell-in). Secondary = what the
// channel actually sells through to the end consumer (sell-out). A gap that
// widens (primary growing faster than secondary) means inventory is piling
// up downstream — a classic early warning sign for a D2C/marketplace brand.

export interface PrimarySecondaryPoint {
  month: string;
  primarySalesLakh: number;
  secondarySalesLakh: number;
}

const PS_MONTHS = ["Jan'26", "Feb'26", "Mar'26", "Apr'26", "May'26", "Jun'26"];

export const PRIMARY_SECONDARY: PrimarySecondaryPoint[] = (() => {
  let primary = 165;
  let secondary = 158;
  return PS_MONTHS.map((month) => {
    primary *= 1 + rng.range(0.03, 0.1);
    secondary *= 1 + rng.range(0.02, 0.09);
    return {
      month,
      primarySalesLakh: Math.round(primary * 10) / 10,
      secondarySalesLakh: Math.round(secondary * 10) / 10,
    };
  });
})();

export function primarySecondarySummary() {
  const latest = PRIMARY_SECONDARY[PRIMARY_SECONDARY.length - 1];
  const prev = PRIMARY_SECONDARY[PRIMARY_SECONDARY.length - 2];
  const primaryGrowthPct = ((latest.primarySalesLakh - prev.primarySalesLakh) / prev.primarySalesLakh) * 100;
  const secondaryGrowthPct = ((latest.secondarySalesLakh - prev.secondarySalesLakh) / prev.secondarySalesLakh) * 100;
  return {
    latest,
    primaryGrowthPct: Math.round(primaryGrowthPct * 10) / 10,
    secondaryGrowthPct: Math.round(secondaryGrowthPct * 10) / 10,
    primaryDeltaLakh: Math.round((latest.primarySalesLakh - prev.primarySalesLakh) * 10) / 10,
    secondaryDeltaLakh: Math.round((latest.secondarySalesLakh - prev.secondarySalesLakh) * 10) / 10,
    gapLakh: Math.round((latest.primarySalesLakh - latest.secondarySalesLakh) * 10) / 10,
  };
}

// --- Daily Sales Report: channel-group tracking vs plan --------------------

export type ChannelGroup = "QComm" | "Marketplaces" | "D2C";

export const CHANNEL_GROUP_MAP: Record<ChannelGroup, Channel[]> = {
  QComm: ["Zepto"],
  Marketplaces: ["Amazon", "Myntra", "Nykaa Fashion"],
  D2C: ["Shopify D2C"],
};

export interface ChannelGroupPlan {
  group: ChannelGroup;
  bPlan: number;
  dPlan: number;
  mtdGross: number;
  rto: number;
  cancelled: number;
  mtdNet: number;
  pctAchieved: number;
  forecast: number;
  lmFinal: number;
  fGolmPct: number;
  lyFinal: number;
  fGolyPct: number;
}

function buildGroupPlan(group: ChannelGroup, bPlan: number, rtoRate: number, cancelRate: number, lmFinal: number, lyFinal: number): ChannelGroupPlan {
  const dPlan = Math.round(bPlan * rng.range(0.94, 1.05));
  const achievedFrac = rng.range(0.42, 0.6); // ~mid-month pace
  const mtdGross = Math.round(dPlan * achievedFrac);
  const rto = -Math.round(mtdGross * rtoRate);
  const cancelled = -Math.round(mtdGross * cancelRate);
  const mtdNet = mtdGross + rto + cancelled;
  const pctAchieved = Math.round((mtdNet / dPlan) * 100);
  const forecast = Math.round(mtdNet / achievedFrac);
  const fGolmPct = Math.round(((forecast - lmFinal) / lmFinal) * 100);
  const fGolyPct = Math.round(((forecast - lyFinal) / lyFinal) * 100);
  return { group, bPlan, dPlan, mtdGross, rto, cancelled, mtdNet, pctAchieved, forecast, lmFinal, fGolmPct, lyFinal, fGolyPct };
}

export const DSR_CHANNEL_GROUPS: ChannelGroupPlan[] = [
  buildGroupPlan("QComm", 4200, 0.018, 0.01, 3180, 1240),
  buildGroupPlan("Marketplaces", 8600, 0.06, 0.03, 7460, 3320),
  buildGroupPlan("D2C", 6100, 0.025, 0.015, 5540, 2650),
];

export function dsrTotals() {
  const total: Omit<ChannelGroupPlan, "group" | "pctAchieved" | "fGolmPct" | "fGolyPct"> = DSR_CHANNEL_GROUPS.reduce(
    (acc, g) => ({
      bPlan: acc.bPlan + g.bPlan,
      dPlan: acc.dPlan + g.dPlan,
      mtdGross: acc.mtdGross + g.mtdGross,
      rto: acc.rto + g.rto,
      cancelled: acc.cancelled + g.cancelled,
      mtdNet: acc.mtdNet + g.mtdNet,
      forecast: acc.forecast + g.forecast,
      lmFinal: acc.lmFinal + g.lmFinal,
      lyFinal: acc.lyFinal + g.lyFinal,
    }),
    { bPlan: 0, dPlan: 0, mtdGross: 0, rto: 0, cancelled: 0, mtdNet: 0, forecast: 0, lmFinal: 0, lyFinal: 0 }
  );
  return {
    ...total,
    pctAchieved: Math.round((total.mtdNet / total.dPlan) * 100),
    fGolmPct: Math.round(((total.forecast - total.lmFinal) / total.lmFinal) * 100),
    fGolyPct: Math.round(((total.forecast - total.lyFinal) / total.lyFinal) * 100),
  };
}

// --- Offtake: MTD-till comparison by channel & category ---------------------

const OFFTAKE_CATEGORIES: Category[] = ["Leggings", "Sports Bra", "Joggers", "Oversized Tee", "Sports Set", "Shorts", "Jacket"];
const OFFTAKE_CHANNELS: Channel[] = ["Zepto", "Amazon", "Myntra", "Nykaa Fashion", "Shopify D2C"];

export interface OfftakeRow {
  channel: Channel;
  tillLabel: string;
  byCategory: Record<Category, number>;
  total: number;
}

function buildOfftake(tillLabel: string, growthFactor: number): OfftakeRow[] {
  return OFFTAKE_CHANNELS.map((channel) => {
    const byCategory = {} as Record<Category, number>;
    let total = 0;
    for (const cat of OFFTAKE_CATEGORIES) {
      const base =
        channel === "Shopify D2C" ? rng.range(180000, 520000) :
        channel === "Amazon" ? rng.range(120000, 380000) :
        channel === "Myntra" ? rng.range(90000, 310000) :
        channel === "Nykaa Fashion" ? rng.range(30000, 110000) :
        rng.range(15000, 70000);
      const value = Math.round(base * growthFactor);
      byCategory[cat] = value;
      total += value;
    }
    return { channel, tillLabel, byCategory, total };
  });
}

export const OFFTAKE_CURRENT = buildOfftake("Till 09-Jul", 1);
export const OFFTAKE_PREVIOUS = buildOfftake("Till 09-Jun", 0.88);
export const OFFTAKE_CATEGORY_LIST = OFFTAKE_CATEGORIES;
