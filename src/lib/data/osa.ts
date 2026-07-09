import { seededRandom } from "../rng";
import { AVAILABILITY, CHANNELS, Channel, PRODUCTS } from "./products";

const rng = seededRandom(3391);

export type OsaPriority = "P0 - Critical" | "P1 - High" | "P2 - Medium" | "Healthy";
export type OsaTrend = "CRASHING" | "Deteriorating" | "Stable" | "Improving";

export interface OsaSkuRow {
  sku: string;
  name: string;
  channel: Channel;
  last7DayOsa: number;
  last15DayOsa: number;
  priority: OsaPriority;
  trend: OsaTrend;
  dailySeries: number[]; // last 10 days, most recent last
}

function priorityFor(osa: number): OsaPriority {
  if (osa < 55) return "P0 - Critical";
  if (osa < 72) return "P1 - High";
  if (osa < 85) return "P2 - Medium";
  return "Healthy";
}

export const OSA: OsaSkuRow[] = [];

for (const product of PRODUCTS) {
  for (const channel of CHANNELS) {
    if (!AVAILABILITY[channel].includes(product.sku)) continue;

    const isHeroRunner = ["CV-LEG-HG-BLK", "CV-BRA-CB-BLK", "CV-BRA-HM-WNE"].includes(product.sku);
    const isProblematic = ["CV-TEE-SU-PNE", "CV-SKT-PLE-BLK", "CV-JOG-EW-NVY"].includes(product.sku);

    let base = isProblematic ? rng.range(38, 58) : isHeroRunner ? rng.range(78, 94) : rng.range(60, 88);
    const dailySeries: number[] = [];
    // problematic SKUs trend down (crashing), hero runners trend up/stable, rest drift a little
    const drift = isProblematic ? -rng.range(1.2, 2.4) : isHeroRunner ? rng.range(0.1, 0.6) : rng.range(-0.5, 0.5);
    for (let d = 0; d < 10; d++) {
      base = Math.max(3, Math.min(99, base + drift + rng.range(-2.5, 2.5)));
      dailySeries.push(Math.round(base * 10) / 10);
    }
    const last7 = Math.round((dailySeries.slice(-7).reduce((s, v) => s + v, 0) / 7) * 10) / 10;
    const last15 = Math.round((dailySeries.reduce((s, v) => s + v, 0) / dailySeries.length + rng.range(-1, 3)) * 10) / 10;
    const trend: OsaTrend = isProblematic
      ? drift < -1.8 ? "CRASHING" : "Deteriorating"
      : last7 - last15 > 2
      ? "Improving"
      : Math.abs(last7 - last15) <= 2
      ? "Stable"
      : "Deteriorating";

    OSA.push({
      sku: product.sku,
      name: product.name,
      channel,
      last7DayOsa: last7,
      last15DayOsa: Math.max(0, Math.min(100, last15)),
      priority: priorityFor(last7),
      trend,
      dailySeries,
    });
  }
}

export function osaSummary() {
  const p0 = OSA.filter((r) => r.priority === "P0 - Critical").length;
  const p1 = OSA.filter((r) => r.priority === "P1 - High").length;
  const crashing = OSA.filter((r) => r.trend === "CRASHING").length;
  const avgOsa = Math.round((OSA.reduce((s, r) => s + r.last7DayOsa, 0) / OSA.length) * 10) / 10;
  return { p0, p1, crashing, avgOsa, total: OSA.length };
}
