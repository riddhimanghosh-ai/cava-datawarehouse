import { seededRandom } from "../rng";

const rng = seededRandom(5540);

export interface TrendingKeyword {
  keyword: string;
  platform: "Google Search" | "Instagram" | "Pinterest";
  volumeTrend: number[]; // 8-week sparkline, relative index
  changePct: number;
  cavaRanking: number | null; // null = not ranking
  intent: "high" | "medium" | "low";
}

function sparkline(base: number, trendPct: number) {
  const arr: number[] = [];
  let v = base;
  for (let i = 0; i < 8; i++) {
    v *= 1 + trendPct / 8 + rng.range(-0.04, 0.04);
    arr.push(Math.round(v));
  }
  return arr;
}

export const TRENDING_KEYWORDS: TrendingKeyword[] = [
  { keyword: "seamless leggings india", platform: "Google Search", volumeTrend: sparkline(2200, 0.42), changePct: 42, cavaRanking: 4, intent: "high" },
  { keyword: "cava sculpt leggings review", platform: "Google Search", volumeTrend: sparkline(180, 0.85), changePct: 85, cavaRanking: 1, intent: "high" },
  { keyword: "nude sports bra", platform: "Instagram", volumeTrend: sparkline(950, 0.31), changePct: 31, cavaRanking: 6, intent: "medium" },
  { keyword: "tennis skort women", platform: "Google Search", volumeTrend: sparkline(1400, 0.18), changePct: 18, cavaRanking: 9, intent: "medium" },
  { keyword: "squat proof leggings", platform: "Pinterest", volumeTrend: sparkline(700, 0.55), changePct: 55, cavaRanking: null, intent: "high" },
  { keyword: "wine sports bra", platform: "Instagram", volumeTrend: sparkline(310, 0.63), changePct: 63, cavaRanking: 2, intent: "medium" },
  { keyword: "monsoon workout jacket", platform: "Google Search", volumeTrend: sparkline(260, 0.22), changePct: 22, cavaRanking: null, intent: "low" },
  { keyword: "blissclub vs cava", platform: "Google Search", volumeTrend: sparkline(140, 0.9), changePct: 90, cavaRanking: 1, intent: "high" },
];

export interface ReelPerformance {
  id: string;
  caption: string;
  postedDaysAgo: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  featuredSku: string;
  status: "viral" | "trending" | "steady" | "underperforming";
}

export const REELS: ReelPerformance[] = [
  { id: "r1", caption: "#CavaSquatProof – squat test in the Black Hourglass Snug", postedDaysAgo: 6, views: 2_140_000, likes: 187_000, comments: 4_200, shares: 22_500, engagementRate: 9.9, featuredSku: "CV-LEG-HG-BLK", status: "viral" },
  { id: "r2", caption: "5AM gym routine ft. the Wine Hyper Mesh bra", postedDaysAgo: 3, views: 640_000, likes: 51_000, comments: 980, shares: 6_100, engagementRate: 9.1, featuredSku: "CV-BRA-HM-WNE", status: "trending" },
  { id: "r3", caption: "Pack with me: monsoon workout edit", postedDaysAgo: 9, views: 118_000, likes: 6_400, comments: 210, shares: 340, engagementRate: 6.0, featuredSku: "CV-JKT-SCP-BLK", status: "steady" },
  { id: "r4", caption: "Pine Supima tee try-on haul", postedDaysAgo: 11, views: 42_000, likes: 1_100, comments: 38, shares: 22, engagementRate: 2.8, featuredSku: "CV-TEE-SU-PNE", status: "underperforming" },
  { id: "r5", caption: "Tennis skort transition trend", postedDaysAgo: 2, views: 289_000, likes: 24_000, comments: 610, shares: 2_900, engagementRate: 9.5, featuredSku: "CV-SKT-SWL-BLK", status: "trending" },
  { id: "r6", caption: "Auburn Seamless leggings on 5 skin tones", postedDaysAgo: 5, views: 510_000, likes: 46_000, comments: 890, shares: 5_200, engagementRate: 10.2, featuredSku: "CV-LEG-SC-AUB", status: "viral" },
];

export interface AdCampaign {
  name: string;
  platform: "Meta" | "Google" | "Pinterest";
  sku: string;
  spend: number;
  revenue: number;
  roas: number;
  roasChangePct: number;
  ctr: number;
  cpm: number;
  status: "scaling" | "healthy" | "fatigued" | "paused-recommended";
}

export const AD_CAMPAIGNS: AdCampaign[] = [
  { name: "Hourglass Snug – Retargeting Q3", platform: "Meta", sku: "CV-LEG-HG-BLK", spend: 412_000, revenue: 2_180_000, roas: 5.29, roasChangePct: 12, ctr: 2.4, cpm: 210, status: "scaling" },
  { name: "Hyper Mesh Bra – UGC Reel Boost", platform: "Meta", sku: "CV-BRA-HM-WNE", spend: 265_000, revenue: 1_340_000, roas: 5.06, roasChangePct: 34, ctr: 3.1, cpm: 195, status: "scaling" },
  { name: "Search – seamless leggings india", platform: "Google", sku: "CV-LEG-SC-AUB", spend: 198_000, revenue: 760_000, roas: 3.84, roasChangePct: 6, ctr: 4.8, cpm: 340, status: "healthy" },
  { name: "Pine Supima Tee – Prospecting", platform: "Meta", sku: "CV-TEE-SU-PNE", spend: 154_000, revenue: 231_000, roas: 1.5, roasChangePct: -41, ctr: 0.9, cpm: 265, status: "paused-recommended" },
  { name: "Plie Skort – Broad Prospecting", platform: "Meta", sku: "CV-SKT-PLE-BLK", spend: 176_000, revenue: 264_000, roas: 1.5, roasChangePct: -29, ctr: 1.1, cpm: 250, status: "fatigued" },
  { name: "Pinterest – Squat Proof Leggings", platform: "Pinterest", sku: "CV-LEG-HG-BLK", spend: 62_000, revenue: 228_000, roas: 3.68, roasChangePct: 19, ctr: 1.8, cpm: 140, status: "healthy" },
  { name: "Sculptor Jacket – Launch Push", platform: "Meta", sku: "CV-JKT-SCP-BLK", spend: 220_000, revenue: 480_000, roas: 2.18, roasChangePct: -8, ctr: 1.6, cpm: 280, status: "fatigued" },
];

export interface DealPerformance {
  name: string;
  channel: string;
  discountPct: number;
  weeksLive: number;
  conversionTrend: number[]; // weekly conversion rate %
  status: "performing" | "decaying" | "dead";
}

export const DEALS: DealPerformance[] = [
  { name: "Buy 2 Leggings Get 1 Bra Free", channel: "Shopify D2C", discountPct: 20, weeksLive: 6, conversionTrend: [4.8, 5.1, 4.9, 4.2, 3.4, 2.6], status: "decaying" },
  { name: "Myntra End of Season Sale – Flat 30%", channel: "Myntra", discountPct: 30, weeksLive: 3, conversionTrend: [6.2, 7.0, 6.8], status: "performing" },
  { name: "Zepto 15-Min Flash Deal – Sports Bra", channel: "Zepto", discountPct: 15, weeksLive: 2, conversionTrend: [8.1, 8.6], status: "performing" },
  { name: "Amazon Great Freedom Festival Bundle", channel: "Amazon", discountPct: 25, weeksLive: 5, conversionTrend: [5.4, 5.9, 5.5, 4.6, 3.8], status: "decaying" },
  { name: "Nykaa Fashion Skort Clearance", channel: "Nykaa Fashion", discountPct: 40, weeksLive: 8, conversionTrend: [3.2, 2.8, 2.1, 1.6, 1.2, 0.9, 0.7, 0.5], status: "dead" },
];

export interface Competitor {
  name: string;
  positioning: string;
  estMonthlyRevenueINR: number;
  igFollowers: number;
  igGrowthPct30d: number;
  topMoveThisWeek: string;
  priceIndexVsCava: number; // 1.0 = same avg price, >1 = pricier
}

export const COMPETITORS: Competitor[] = [
  { name: "BlissClub", positioning: "Premium D2C leggings & sets", estMonthlyRevenueINR: 42_000_000, igFollowers: 412_000, igGrowthPct30d: 6.1, topMoveThisWeek: "Launched 'Squat Proof 2.0' fabric campaign with 40 creators simultaneously", priceIndexVsCava: 1.12 },
  { name: "Kica Activewear", positioning: "Athleisure + intimates crossover", estMonthlyRevenueINR: 28_000_000, igFollowers: 265_000, igGrowthPct30d: 9.4, topMoveThisWeek: "Running an aggressive 'buy 3 for 2999' bundle across Instagram Shop", priceIndexVsCava: 0.94 },
  { name: "Nykd by Nykaa", positioning: "Mass-premium comfortwear", estMonthlyRevenueINR: 35_000_000, igFollowers: 190_000, igGrowthPct30d: 3.2, topMoveThisWeek: "Heavy push into Nykaa Fashion homepage placements", priceIndexVsCava: 0.88 },
  { name: "Adidas (activewear line)", positioning: "Global sportswear giant", estMonthlyRevenueINR: 210_000_000, igFollowers: 4_800_000, igGrowthPct30d: 1.1, topMoveThisWeek: "Signed a new cricket-adjacent celebrity for training-wear campaign", priceIndexVsCava: 1.35 },
  { name: "Enamor Active", positioning: "Legacy intimatewear brand extending into activewear", estMonthlyRevenueINR: 18_000_000, igFollowers: 98_000, igGrowthPct30d: -2.4, topMoveThisWeek: "Discounting older seamless line 35% to clear inventory", priceIndexVsCava: 0.97 },
];
