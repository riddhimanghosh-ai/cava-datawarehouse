import { seededRandom } from "../rng";
import { CHANNELS, Channel, PRODUCTS } from "./products";

const rng = seededRandom(5127);

interface CityDef {
  city: string;
  state: string;
  weight: number; // relative demand weight
}

const CITY_DEFS: CityDef[] = [
  { city: "Mumbai", state: "Maharashtra", weight: 1.0 },
  { city: "Delhi", state: "Delhi", weight: 0.95 },
  { city: "Bengaluru", state: "Karnataka", weight: 0.92 },
  { city: "Hyderabad", state: "Telangana", weight: 0.7 },
  { city: "Pune", state: "Maharashtra", weight: 0.62 },
  { city: "Chennai", state: "Tamil Nadu", weight: 0.58 },
  { city: "Gurugram", state: "Haryana", weight: 0.5 },
  { city: "Kolkata", state: "West Bengal", weight: 0.44 },
  { city: "Ahmedabad", state: "Gujarat", weight: 0.4 },
  { city: "Jaipur", state: "Rajasthan", weight: 0.33 },
  { city: "Chandigarh", state: "Chandigarh", weight: 0.28 },
  { city: "Lucknow", state: "Uttar Pradesh", weight: 0.24 },
];

export interface CitySalesRow {
  city: string;
  state: string;
  channel: Channel;
  grossSales: number;
  postTaxNsr: number;
  listingDiscount: number;
  contribution: number;
  orders: number;
  codOrders: number;
}

export const CITY_SALES: CitySalesRow[] = [];

for (const def of CITY_DEFS) {
  for (const channel of CHANNELS) {
    const channelWeight =
      channel === "Shopify D2C" ? 1.0 : channel === "Amazon" ? 0.78 : channel === "Myntra" ? 0.64 : channel === "Zepto" ? 0.42 : 0.3;
    const grossSales = Math.round(def.weight * channelWeight * rng.range(280000, 620000));
    // Marketplaces discount harder; D2C keeps price integrity.
    const discountRate = channel === "Shopify D2C" ? rng.range(0.06, 0.13) : channel === "Zepto" ? rng.range(0.1, 0.16) : rng.range(0.16, 0.28);
    const listingDiscount = Math.round(grossSales * discountRate);
    // Post-tax NSR ≈ gross − discount − 18% GST on net.
    const postTaxNsr = Math.round((grossSales - listingDiscount) / 1.18);
    const contribution = Math.round(postTaxNsr * rng.range(0.32, 0.46));
    const aov = 1550 + rng.range(0, 900);
    const orders = Math.max(1, Math.round(grossSales / aov));
    // COD share higher on marketplaces / tier-2, lower on prepaid-heavy D2C.
    const codShare = channel === "Shopify D2C" ? rng.range(0.18, 0.3) : rng.range(0.4, 0.62);
    const codOrders = Math.round(orders * codShare);

    CITY_SALES.push({ city: def.city, state: def.state, channel, grossSales, postTaxNsr, listingDiscount, contribution, orders, codOrders });
  }
}

export const CITY_STATE_LIST = CITY_DEFS.map((c) => ({ city: c.city, state: c.state }));
export const STATE_LIST = Array.from(new Set(CITY_DEFS.map((c) => c.state)));

export interface CityTopProduct {
  name: string;
  sku: string;
  units: number;
  revenue: number;
}

// Deterministic top-selling products for a given city (varies the ranking by city).
export function topProductsForCity(city: string): CityTopProduct[] {
  const cityRng = seededRandom(city.split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 31 + 7);
  return PRODUCTS.map((p) => {
    const units = cityRng.int(40, 640);
    return { name: p.name, sku: p.sku, units, revenue: units * p.price };
  })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export interface CityAggregate {
  city: string;
  state: string;
  grossSales: number;
  postTaxNsr: number;
  listingDiscount: number;
  contribution: number;
  orders: number;
  codOrders: number;
  tdPct: number;
  aov: number;
}

// Aggregate CITY_SALES to one row per city, honouring channel/state/city filters.
export function aggregateCitySales(opts: { channels: Set<string>; states: Set<string>; cities: Set<string> }): CityAggregate[] {
  const pass = (set: Set<string>, v: string) => set.size === 0 || set.has(v);
  const byCity = new Map<string, CityAggregate>();
  for (const r of CITY_SALES) {
    if (!pass(opts.channels, r.channel) || !pass(opts.states, r.state) || !pass(opts.cities, r.city)) continue;
    const cur =
      byCity.get(r.city) ??
      { city: r.city, state: r.state, grossSales: 0, postTaxNsr: 0, listingDiscount: 0, contribution: 0, orders: 0, codOrders: 0, tdPct: 0, aov: 0 };
    cur.grossSales += r.grossSales;
    cur.postTaxNsr += r.postTaxNsr;
    cur.listingDiscount += r.listingDiscount;
    cur.contribution += r.contribution;
    cur.orders += r.orders;
    cur.codOrders += r.codOrders;
    byCity.set(r.city, cur);
  }
  const rows = Array.from(byCity.values());
  for (const r of rows) {
    r.tdPct = r.grossSales > 0 ? Math.round((r.listingDiscount / r.grossSales) * 1000) / 10 : 0;
    r.aov = r.orders > 0 ? Math.round(r.grossSales / r.orders) : 0;
  }
  return rows.sort((a, b) => b.grossSales - a.grossSales);
}

export function citySalesTotals(rows: CityAggregate[]) {
  const gross = rows.reduce((s, r) => s + r.grossSales, 0);
  const postTaxNsr = rows.reduce((s, r) => s + r.postTaxNsr, 0);
  const listingDiscount = rows.reduce((s, r) => s + r.listingDiscount, 0);
  const contribution = rows.reduce((s, r) => s + r.contribution, 0);
  const orders = rows.reduce((s, r) => s + r.orders, 0);
  const codOrders = rows.reduce((s, r) => s + r.codOrders, 0);
  return {
    gross,
    postTaxNsr,
    listingDiscount,
    contribution,
    orders,
    codOrders,
    tdPct: gross > 0 ? Math.round((listingDiscount / gross) * 1000) / 10 : 0,
    aov: orders > 0 ? Math.round(gross / orders) : 0,
    codSharePct: orders > 0 ? Math.round((codOrders / orders) * 1000) / 10 : 0,
  };
}
