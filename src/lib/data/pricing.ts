import { seededRandom } from "../rng";
import { CHANNELS, Channel, PRODUCTS } from "./products";

const rng = seededRandom(9021);

export const PRICING_PLATFORMS: Channel[] = CHANNELS;

const PRICING_SKUS = PRODUCTS.slice(0, 5).map((p) => ({ code: p.sku.split("-").slice(1).join(""), name: p.name, mrp: p.price, isCompetitor: false }));

const COMPETITOR_SKUS = [
  { code: "BC-SCULPT-01", name: "BlissClub The Ultimate Legging", mrp: 2199, isCompetitor: true },
  { code: "KICA-BRA-02", name: "Kica Featherlite Bra", mrp: 1499, isCompetitor: true },
  { code: "NYKD-COORD-03", name: "Nykd Comfort Co-ord", mrp: 2599, isCompetitor: true },
  { code: "ENM-LEG-04", name: "Enamor Active Legging", mrp: 1699, isCompetitor: true },
];

export const PRICING_TRACKED_SKUS = [...PRICING_SKUS, ...COMPETITOR_SKUS];

const DATES = Array.from({ length: 14 }, (_, i) => {
  const anchor = new Date("2026-07-09T00:00:00Z");
  const d = new Date(anchor);
  d.setUTCDate(d.getUTCDate() - (13 - i));
  return d.toISOString().slice(0, 10);
});

export interface PriceRow {
  date: string;
  values: Record<string, number>;
}

// Platform-specific commission/markup skews the effective selling price a
// little differently per channel, same as real marketplace pricing behavior.
const PLATFORM_SKEW: Record<Channel, number> = {
  "Shopify D2C": 1.0,
  Amazon: 1.03,
  Myntra: 1.06,
  Zepto: 0.97,
  "Nykaa Fashion": 1.02,
};

function buildSeries(metric: "MRP" | "SP", platform: Channel): PriceRow[] {
  const base: Record<string, number> = {};
  for (const sku of PRICING_TRACKED_SKUS) {
    base[sku.code] = metric === "MRP" ? sku.mrp * PLATFORM_SKEW[platform] : sku.mrp * PLATFORM_SKEW[platform] * rng.range(0.78, 0.92);
  }
  return DATES.map((date) => {
    const values: Record<string, number> = {};
    for (const sku of PRICING_TRACKED_SKUS) {
      base[sku.code] *= 1 + rng.range(-0.006, 0.004);
      values[sku.code] = Math.round(base[sku.code]);
    }
    return { date, values };
  });
}

// Precomputed once, in a fixed order, so results are stable across server
// prerender and client hydration (no lazy rng calls at read time).
const ALL_SERIES: Record<string, PriceRow[]> = {};
for (const metric of ["MRP", "SP"] as const) {
  for (const platform of CHANNELS) {
    ALL_SERIES[`${metric}__${platform}`] = buildSeries(metric, platform);
  }
}

export function pricingSeries(metric: "MRP" | "SP", platform: Channel): PriceRow[] {
  return ALL_SERIES[`${metric}__${platform}`];
}
