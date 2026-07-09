// Planner actions, restructured as four opportunity lenses. Everything is
// derived from datasets that already exist in the warehouse — inventory
// cover & sell-through, channel availability, ad ROAS, and city-level sales —
// so each action is a mismatch between demand and supply/presence.

import { AVAILABILITY, CHANNELS, Channel, PRODUCTS } from "./products";
import { INVENTORY } from "./inventory";
import { DEMAND_PLANS } from "./demandPlan";
import { AD_CAMPAIGNS } from "./marketing";
import { aggregateCitySales, citySalesTotals } from "./cityLevelSales";

// --- 1. Understocked winners ------------------------------------------------
// High sell-through + thin cover = demand you're physically losing.

export interface UnderstockedWinner {
  sku: string;
  name: string;
  channel: Channel;
  daysOfCover: number;
  sellThroughPct: number;
  suggestedQty: number;
  estCost: number;
  capacityNote: string | null; // e.g. "126% of capacity in Nov'26 — pre-build"
}

export function understockedWinners(): UnderstockedWinner[] {
  return INVENTORY.filter((r) => (r.status === "critical" || r.status === "low") && r.sellThroughPct >= 70)
    .sort((a, b) => a.daysOfCover - b.daysOfCover)
    .map((r) => {
      const product = PRODUCTS.find((p) => p.sku === r.sku)!;
      const plan = DEMAND_PLANS.find((p) => p.sku === r.sku);
      const worst = plan?.months.filter((m) => m.action.tone !== "ok").sort((a, b) => b.action.pct - a.action.pct)[0];
      const suggestedQty = Math.round(r.avgDailySales * 30);
      return {
        sku: r.sku,
        name: r.name,
        channel: r.channel,
        daysOfCover: r.daysOfCover,
        sellThroughPct: r.sellThroughPct,
        suggestedQty,
        estCost: suggestedQty * product.cost,
        capacityNote: worst ? `${worst.action.pct}% of capacity in ${worst.month} — pre-build in the prior month` : null,
      };
    });
}

// --- 2. Channel white space --------------------------------------------------
// A SKU earning well on its listed channels but absent from others.

export interface WhiteSpaceRow {
  sku: string;
  name: string;
  missingChannels: Channel[];
  monthlyRevenuePerListedChannel: number; // proxy for what a new listing could add
  estMonthlyUpside: number;
}

export function channelWhiteSpace(): WhiteSpaceRow[] {
  return PRODUCTS.map((p) => {
    const listed = CHANNELS.filter((c) => AVAILABILITY[c].includes(p.sku));
    const missing = CHANNELS.filter((c) => !AVAILABILITY[c].includes(p.sku));
    if (missing.length === 0) return null;
    const rows = INVENTORY.filter((r) => r.sku === p.sku);
    const monthlyRevenue = rows.reduce((s, r) => s + r.avgDailySales * 30 * p.price, 0);
    const perChannel = Math.round(monthlyRevenue / Math.max(1, listed.length));
    // New listings ramp slowly; assume ~55% of an average listed channel.
    const upside = Math.round(perChannel * 0.55 * missing.length);
    return { sku: p.sku, name: p.name, missingChannels: missing, monthlyRevenuePerListedChannel: perChannel, estMonthlyUpside: upside };
  })
    .filter((r): r is WhiteSpaceRow => r !== null)
    .sort((a, b) => b.estMonthlyUpside - a.estMonthlyUpside);
}

// --- 3. Marketing ↔ stock alignment ------------------------------------------
// Don't scale ads into a stockout; don't let spend idle on overstock.

export interface AlignmentRow {
  kind: "restock-before-scaling" | "shift-spend";
  campaign: string;
  sku: string;
  name: string;
  roas: number;
  detail: string;
}

export function marketingStockAlignment(): AlignmentRow[] {
  const rows: AlignmentRow[] = [];
  const bestScaler = AD_CAMPAIGNS.filter((a) => a.status === "scaling").sort((a, b) => b.roas - a.roas)[0];

  for (const a of AD_CAMPAIGNS) {
    const inv = INVENTORY.filter((r) => r.sku === a.sku);
    if (inv.length === 0) continue;
    const minCover = Math.min(...inv.map((r) => r.daysOfCover));
    const maxCover = Math.max(...inv.map((r) => r.daysOfCover));
    const product = PRODUCTS.find((p) => p.sku === a.sku)!;

    if (a.roas >= 3 && minCover < 12) {
      rows.push({
        kind: "restock-before-scaling",
        campaign: a.name,
        sku: a.sku,
        name: product.name,
        roas: a.roas,
        detail: `ROAS ${a.roas.toFixed(2)}x but only ${minCover}d cover on the thinnest channel — land the restock before adding budget, or the spend converts into stockouts.`,
      });
    } else if (a.roas < 2 && maxCover > 60) {
      rows.push({
        kind: "shift-spend",
        campaign: a.name,
        sku: a.sku,
        name: product.name,
        roas: a.roas,
        detail: `ROAS ${a.roas.toFixed(2)}x while ${Math.round(maxCover)}d of stock sits idle — cut the broad prospecting and move budget to ${bestScaler ? `${bestScaler.name} (${bestScaler.roas.toFixed(2)}x)` : "the top scaler"}; clear this stock with a bundle instead.`,
      });
    }
  }
  return rows.sort((a, b) => (a.kind === b.kind ? b.roas - a.roas : a.kind === "restock-before-scaling" ? -1 : 1));
}

// --- 4. Geo pockets -----------------------------------------------------------
// Cities punching above their weight on value but below it on volume, and
// COD-heavy cities where prepaid nudges protect margin.

export interface GeoPocket {
  kind: "underweight-city" | "cod-heavy";
  city: string;
  state: string;
  detail: string;
  metric: string;
}

export function geoPockets(): GeoPocket[] {
  const rows = aggregateCitySales({ channels: new Set(), states: new Set(), cities: new Set() });
  const totals = citySalesTotals(rows);
  const avgShare = 1 / rows.length;
  const out: GeoPocket[] = [];

  for (const r of rows) {
    const orderShare = r.orders / totals.orders;
    const codShare = r.orders > 0 ? r.codOrders / r.orders : 0;
    if (r.aov > totals.aov * 1.05 && orderShare < avgShare * 0.85) {
      out.push({
        kind: "underweight-city",
        city: r.city,
        state: r.state,
        metric: `AOV ₹${r.aov.toLocaleString("en-IN")} vs ₹${totals.aov.toLocaleString("en-IN")} avg`,
        detail: `High-value buyers but only ${(orderShare * 100).toFixed(1)}% of orders — add geo-targeted spend and check delivery promise here.`,
      });
    } else if (codShare > 0.55) {
      out.push({
        kind: "cod-heavy",
        city: r.city,
        state: r.state,
        metric: `${Math.round(codShare * 100)}% COD`,
        detail: `COD share is eating margin and driving RTO risk — run a prepaid-discount nudge (₹50–75 off prepaid) in this city.`,
      });
    }
  }
  return out.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "underweight-city" ? -1 : 1)).slice(0, 8);
}
