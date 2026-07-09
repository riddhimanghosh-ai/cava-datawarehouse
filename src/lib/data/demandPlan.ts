import { seededRandom } from "../rng";
import { AVAILABILITY, Category, CHANNELS, Channel, PRODUCTS, Product } from "./products";

const rng = seededRandom(4478);

export const DEMAND_PLAN_MONTHS = ["Jul'26", "Aug'26", "Sep'26", "Oct'26", "Nov'26", "Dec'26"];

const MONTHLY_CAPACITY_BY_CATEGORY: Record<Category, number> = {
  Leggings: 6000,
  "Sports Bra": 5000,
  Joggers: 3500,
  "T-Shirts": 7000,
  "Skorts": 2500,
  "Flare Pants": 4000,
  Jacket: 1200,
};

const CHANNEL_WEIGHT: Record<Channel, number> = {
  "Shopify D2C": 0.36,
  Amazon: 0.25,
  Myntra: 0.2,
  "Nykaa Fashion": 0.1,
  Zepto: 0.09,
};

export interface PlannerAction {
  pct: number;
  label: string;
  tone: "ok" | "warning" | "danger";
}

export interface DemandPlanMonth {
  month: string;
  totalDemand: number;
  inStock: number;
  needToProduce: number;
  byChannel: Record<Channel, number>;
  action: PlannerAction;
}

export interface DemandPlanSku {
  sku: string;
  name: string;
  category: Category;
  monthlyCapacity: number;
  months: DemandPlanMonth[];
}

function plannerAction(pct: number): PlannerAction {
  if (pct > 130) return { pct, label: `Over-capacity (${pct}%) — pre-build inventory in prior month`, tone: "danger" };
  if (pct > 100) return { pct, label: `At-capacity (${pct}%) — plan extra shift or 3PL top-up`, tone: "warning" };
  if (pct > 70) return { pct, label: `On track (${pct}%) — no action needed`, tone: "ok" };
  return { pct, label: `Under-utilized (${pct}%) — capacity available`, tone: "ok" };
}

function buildPlanFor(product: Product): DemandPlanSku {
  const capacity = MONTHLY_CAPACITY_BY_CATEGORY[product.category];
  const isHeroRunner = ["CV-LEG-HG-BLK", "CV-BRA-CB-BLK", "CV-BRA-HM-WNE", "CV-LEG-SC-AUB"].includes(product.sku);
  const isOverbought = ["CV-TEE-SU-PNE", "CV-SKT-PLE-BLK", "CV-JOG-EW-NVY"].includes(product.sku);

  const availableChannels = CHANNELS.filter((c) => AVAILABILITY[c].includes(product.sku));
  const weightSum = availableChannels.reduce((s, c) => s + CHANNEL_WEIGHT[c], 0);

  // Heroes run hot enough to breach monthly capacity as festive demand builds;
  // overbought SKUs idle well below it.
  let demandBase = isHeroRunner ? capacity * rng.range(1.1, 1.3) : isOverbought ? capacity * rng.range(0.15, 0.3) : capacity * rng.range(0.45, 0.85);

  const months: DemandPlanMonth[] = DEMAND_PLAN_MONTHS.map((month) => {
    demandBase *= 1 + rng.range(-0.02, isHeroRunner ? 0.12 : 0.03);
    const totalDemand = Math.round(demandBase);
    const inStock = Math.round(totalDemand * (isHeroRunner ? rng.range(0.14, 0.28) : rng.range(0.28, 0.48)));
    const needToProduce = Math.max(0, totalDemand - inStock);
    const pct = Math.round((needToProduce / capacity) * 100);
    const byChannel = {} as Record<Channel, number>;
    for (const c of CHANNELS) {
      byChannel[c] = availableChannels.includes(c) ? Math.round((totalDemand * CHANNEL_WEIGHT[c]) / weightSum) : 0;
    }
    return { month, totalDemand, inStock, needToProduce, byChannel, action: plannerAction(pct) };
  });

  return { sku: product.sku, name: product.name, category: product.category, monthlyCapacity: capacity, months };
}

export const DEMAND_PLANS: DemandPlanSku[] = PRODUCTS.map(buildPlanFor);

export function demandPlanFor(sku: string): DemandPlanSku {
  return DEMAND_PLANS.find((p) => p.sku === sku) ?? DEMAND_PLANS[0];
}
