import { seededRandom } from "../rng";
import { PRODUCTS } from "./products";

const rng = seededRandom(2601);

export interface WeeklyForecastPoint {
  week: string;
  actual: number | null;
  forecast: number;
}

// 8 weeks of history + 4 weeks forward forecast, aggregated units across all channels.
const WEEK_LABELS = [
  "May 4", "May 11", "May 18", "May 25",
  "Jun 1", "Jun 8", "Jun 15", "Jun 22", "Jun 29", "Jul 6",
  "Jul 13", "Jul 20", "Jul 27", "Aug 3",
];

export const DEMAND_FORECAST: WeeklyForecastPoint[] = (() => {
  const points: WeeklyForecastPoint[] = [];
  let base = 3400;
  WEEK_LABELS.forEach((week, i) => {
    base *= 1 + rng.range(-0.02, 0.06);
    const forecast = Math.round(base);
    const isFuture = i >= 10; // last 4 weeks are pure forecast (monsoon restock push)
    const actual = isFuture ? null : Math.round(forecast * rng.range(0.88, 1.1));
    points.push({ week, actual, forecast });
  });
  return points;
})();

export function forecastAccuracy() {
  const withActuals = DEMAND_FORECAST.filter((p) => p.actual !== null);
  const errors = withActuals.map((p) => Math.abs((p.actual! - p.forecast) / p.actual!));
  const mape = (errors.reduce((s, e) => s + e, 0) / errors.length) * 100;
  return Math.round((100 - mape) * 10) / 10;
}

export interface SkuForecastRow {
  sku: string;
  name: string;
  category: string;
  next4WeekDemand: number;
  currentSellability: "surging" | "stable" | "cooling";
  driverNote: string;
  recommendedAction: string;
}

export const SKU_FORECASTS: SkuForecastRow[] = [
  {
    sku: "CV-LEG-SCLP-BLK",
    name: "Sculpt High-Waist Legging – Jet Black",
    category: "Leggings",
    next4WeekDemand: 5460,
    currentSellability: "surging",
    driverNote: "Reel #CavaSculptCheck at 2.1M views is driving a spike in branded search + add-to-carts",
    recommendedAction: "Raise PO by 35% for Bhiwandi FC + Amazon FBA before Jul 20",
  },
  {
    sku: "CV-BRA-PWR-ELC",
    name: "Power Hold Sports Bra – Electric Lime",
    category: "Sports Bra",
    next4WeekDemand: 3120,
    currentSellability: "surging",
    driverNote: "Color trending on Pinterest + picked up by 3 fitness micro-influencers this week",
    recommendedAction: "Expedite incoming batch; consider airfreight for Zepto dark stores",
  },
  {
    sku: "CV-JKT-WIND-NVY",
    name: "Windbreak Jacket – Navy",
    category: "Jacket",
    next4WeekDemand: 890,
    currentSellability: "stable",
    driverNote: "New SKU (launched 3 weeks ago), demand tracking in line with plan",
    recommendedAction: "Hold current PO cadence, revisit after week 6 of sell data",
  },
  {
    sku: "CV-TEE-OVR-SGE",
    name: "Oversized Rib Tee – Sage",
    category: "Oversized Tee",
    next4WeekDemand: 410,
    currentSellability: "cooling",
    driverNote: "Sage colorway underperforming vs. forecast; White variant outselling it 3:1",
    recommendedAction: "Pause reorder, route to markdown/clearance bundle on Myntra",
  },
  {
    sku: "CV-SET-CORE-BRY",
    name: "Core Co-ord Set – Berry",
    category: "Sports Set",
    next4WeekDemand: 260,
    currentSellability: "cooling",
    driverNote: "Overproduced ahead of a festive push that under-delivered; aging 90+ days in FC",
    recommendedAction: "Bundle with bestseller legging as a bundle offer to clear stock",
  },
  {
    sku: "CV-JOG-CLD-GRY",
    name: "Cloud Fleece Jogger – Heather Grey",
    category: "Joggers",
    next4WeekDemand: 720,
    currentSellability: "cooling",
    driverNote: "Fleece demand softening as monsoon heat/humidity sets in across key metros",
    recommendedAction: "Shift ad spend to lightweight joggers; hold reorder till Sep",
  },
  {
    sku: "CV-LEG-FLEX-NUD",
    name: "Flex Seamless Legging – Nude Blush",
    category: "Leggings",
    next4WeekDemand: 2380,
    currentSellability: "surging",
    driverNote: "Nude/skin-tone shade range trending across activewear category on Instagram Reels",
    recommendedAction: "Increase size-curve depth (S/M) at Myntra + Nykaa Fashion",
  },
];
