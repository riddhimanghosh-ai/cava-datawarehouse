// Discount-code quality. Each code is scored 0–100 on a "deal-hunter" scale
// from new-vs-repeat mix, discount depth and AOV. High score = attracts
// one-time bargain hunters; low score = drives customers who come back.

export type CodeClass = "Growth Driver" | "Deal Hunters" | "Mixed" | "Low Volume";

export interface CodeQuality {
  code: string;
  klass: CodeClass;
  dealHunterScore: number;
  orders: number;
  revenue: number;
  aov: number;
  discountGiven: number;
  newCustSharePct: number;
  repeatSharePct: number;
  insight: string;
}

export const CODE_QUALITY: CodeQuality[] = [
  {
    code: "FESTIVE40",
    klass: "Deal Hunters",
    dealHunterScore: 92,
    orders: 412,
    revenue: 743000,
    aov: 1803,
    discountGiven: 214600,
    newCustSharePct: 87,
    repeatSharePct: 13,
    insight: "87% first-time buyers at 34% avg discount — mostly price-driven. Cap the depth or rotate it so it doesn't train shoppers to wait for the sale.",
  },
  {
    code: "SCULPT10",
    klass: "Growth Driver",
    dealHunterScore: 28,
    orders: 286,
    revenue: 486000,
    aov: 1699,
    discountGiven: 51480,
    newCustSharePct: 41,
    repeatSharePct: 59,
    insight: "Shallow 10% code with 59% repeat share — it nudges loyal customers to reorder without eroding margin. Safe to keep running.",
  },
  {
    code: "WINBACK15",
    klass: "Growth Driver",
    dealHunterScore: 34,
    orders: 132,
    revenue: 231000,
    aov: 1750,
    discountGiven: 29040,
    newCustSharePct: 22,
    repeatSharePct: 78,
    insight: "Targeted at lapsed customers — 78% repeat share means it's reactivating real buyers, not subsidising bargain hunters. Highest-quality code in the set.",
  },
  {
    code: "MESH15",
    klass: "Mixed",
    dealHunterScore: 55,
    orders: 198,
    revenue: 356000,
    aov: 1798,
    discountGiven: 44550,
    newCustSharePct: 58,
    repeatSharePct: 42,
    insight: "Launch code for the Hyper Mesh drop — a healthy new/repeat mix. Fine for a launch window; retire it once the drop matures.",
  },
  {
    code: "INFLUENCER100",
    klass: "Deal Hunters",
    dealHunterScore: 81,
    orders: 88,
    revenue: 176000,
    aov: 2000,
    discountGiven: 88000,
    newCustSharePct: 74,
    repeatSharePct: 26,
    insight: "Flat ₹100-off from a creator push. High new-customer share is good, but check 60-day repeat before scaling the collab format.",
  },
  {
    code: "BOGO",
    klass: "Deal Hunters",
    dealHunterScore: 76,
    orders: 96,
    revenue: 268000,
    aov: 2792,
    discountGiven: 86400,
    newCustSharePct: 69,
    repeatSharePct: 31,
    insight: "Buy-one-get-one lifts AOV but the discount value is steep. Works as an inventory-clearing lever, not an everyday code.",
  },
  {
    code: "POP10",
    klass: "Low Volume",
    dealHunterScore: 44,
    orders: 6,
    revenue: 59000,
    aov: 983,
    discountGiven: 1893,
    newCustSharePct: 83,
    repeatSharePct: 17,
    insight: "Too few orders to draw conclusions — check back once it clears 10 orders.",
  },
  {
    code: "PREPAID",
    klass: "Low Volume",
    dealHunterScore: 47,
    orders: 9,
    revenue: 34000,
    aov: 1139,
    discountGiven: 1800,
    newCustSharePct: 67,
    repeatSharePct: 33,
    insight: "Small prepaid nudge — low discount depth. Volume too low to classify; keep as a checkout incentive.",
  },
];

export function codeQualityCounts() {
  const by = (k: CodeClass) => CODE_QUALITY.filter((c) => c.klass === k).length;
  return {
    all: CODE_QUALITY.length,
    "Growth Driver": by("Growth Driver"),
    "Deal Hunters": by("Deal Hunters"),
    Mixed: by("Mixed"),
    "Low Volume": by("Low Volume"),
  };
}
