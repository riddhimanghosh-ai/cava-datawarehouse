// Meta (Facebook/Instagram) ads performance for CAVA. Hand-tuned to feel real
// for a mid-size Indian D2C athleisure brand running a below-1x ROAS month.

import { ShopifyKpi } from "./webAnalytics";

export const META_KPIS: ShopifyKpi[] = [
  { label: "Total Spend", value: "₹2.08L", caption: "last 30 days" },
  { label: "Purchase ROAS", value: "0.76x", caption: "below target", tone: "danger" },
  { label: "Purchase Revenue", value: "₹1.59L", caption: "111 purchases" },
  { label: "Cost / Purchase", value: "₹1,870", caption: "CPP" },
  { label: "Link Clicks", value: "5.5K", caption: "₹38 / click" },
  { label: "Impressions", value: "1.5M", caption: "CPM ₹136" },
  { label: "Reach", value: "899.5K", caption: "freq 1.69x" },
  { label: "CTR (unique)", value: "0.71%", caption: "1.86% all clicks" },
  { label: "Add to Cart", value: "1.2K", caption: "₹176 / ATC" },
  { label: "Initiated Checkout", value: "434", caption: "₹478 / IC" },
  { label: "View Content", value: "2.7K", caption: "product page visits" },
  { label: "Video Plays", value: "1.2M", caption: "18.9% watched to end" },
];

export interface MetaFunnelStage {
  stage: string;
  count: number;
  pctOfPrevious: number | null;
  pctOfTop: number;
}

export const META_FUNNEL: MetaFunnelStage[] = [
  { stage: "Impressions", count: 1500000, pctOfPrevious: null, pctOfTop: 100 },
  { stage: "Reach", count: 899500, pctOfPrevious: 59.97, pctOfTop: 59.97 },
  { stage: "Link Clicks", count: 5500, pctOfPrevious: 0.61, pctOfTop: 0.37 },
  { stage: "Add to Cart", count: 1200, pctOfPrevious: 21.82, pctOfTop: 0.08 },
  { stage: "Initiate Checkout", count: 434, pctOfPrevious: 36.17, pctOfTop: 0.03 },
  { stage: "Purchases", count: 111, pctOfPrevious: 25.58, pctOfTop: 0.01 },
];

export interface MetaBar {
  label: string;
  spend: number;
  roas: number;
}

// Spend by age × gender, coloured by ROAS band on the page.
export const META_AGE_GENDER: MetaBar[] = [
  { label: "25–34 · male", spend: 96000, roas: 0.9 },
  { label: "18–24 · male", spend: 58000, roas: 0.7 },
  { label: "35–44 · male", spend: 41000, roas: 0.6 },
  { label: "25–34 · female", spend: 34000, roas: 1.4 },
  { label: "45–54 · male", spend: 21000, roas: 0.5 },
  { label: "35–44 · female", spend: 18000, roas: 1.1 },
];

export const META_DEVICES: MetaBar[] = [
  { label: "iPhone", spend: 118000, roas: 0.9 },
  { label: "Android smartphone", spend: 84000, roas: 0.7 },
  { label: "Desktop", spend: 4200, roas: 1.6 },
  { label: "iPad", spend: 1800, roas: 1.2 },
  { label: "Android tablet", spend: 900, roas: 0.4 },
];

export const META_PLACEMENT_PERF: MetaBar[] = [
  { label: "Instagram · Reels", spend: 118000, roas: 0.8 },
  { label: "Instagram · Feed", spend: 62000, roas: 0.9 },
  { label: "Instagram · Stories", spend: 34000, roas: 0.7 },
  { label: "Facebook · Reels", spend: 22000, roas: 1.6 },
  { label: "Facebook · Feed", spend: 14000, roas: 0.6 },
  { label: "Facebook · in-stream", spend: 6000, roas: 0.3 },
];

export interface MetaPlacementShare {
  label: string;
  pct: number;
}

export const META_PLACEMENT_MIX: MetaPlacementShare[] = [
  { label: "Instagram · Reels", pct: 41 },
  { label: "Instagram · Feed", pct: 22 },
  { label: "Instagram · Stories", pct: 12 },
  { label: "Facebook · Reels", pct: 11 },
  { label: "Facebook · Feed", pct: 9 },
  { label: "Facebook · in-stream", pct: 5 },
];

export const META_COUNTRIES: MetaBar[] = [
  { label: "India", spend: 198000, roas: 0.77 },
  { label: "Unknown / other", spend: 9500, roas: 0.4 },
];

export const META_REACH_FREQ = {
  uniqueReach: "899.5K",
  impressions: "1.5M",
  cpm: "₹136",
  avgFrequency: 1.69,
  videoCompletionPct: 18.9,
};

export interface MetaCampaignRow {
  campaign: string;
  spend: number;
  reach: number;
  impressions: number;
  linkClicks: number;
  ctr: number;
  cpc: number;
  atc: number;
  ic: number;
  purchases: number;
  revenue: number;
  roas: number;
}

export const META_CAMPAIGNS: MetaCampaignRow[] = [
  { campaign: "CV_DCO_June_tROAS", spend: 47868, reach: 254300, impressions: 318300, linkClicks: 859, ctr: 0.42, cpc: 36, atc: 282, ic: 116, purchases: 33, revenue: 69921, roas: 1.46 },
  { campaign: "CV_BAU-June", spend: 41248, reach: 393100, impressions: 447500, linkClicks: 957, ctr: 0.31, cpc: 29, atc: 270, ic: 82, purchases: 12, revenue: 19096, roas: 0.46 },
  { campaign: "CV_BAU_JUNE1", spend: 29475, reach: 150500, impressions: 198300, linkClicks: 482, ctr: 0.37, cpc: 41, atc: 164, ic: 70, purchases: 15, revenue: 28388, roas: 0.96 },
  { campaign: "CV_BAU_JUNE_Influencer", spend: 24784, reach: 86700, impressions: 144100, linkClicks: 891, ctr: 2.38, cpc: 7, atc: 154, ic: 40, purchases: 15, revenue: 17542, roas: 0.71 },
  { campaign: "PW-ASC-TOF-BAU", spend: 20943, reach: 99300, impressions: 123600, linkClicks: 641, ctr: 0.86, cpc: 20, atc: 64, ic: 26, purchases: 12, revenue: 10520, roas: 0.5 },
  { campaign: "PW-ASC-TOF-Offer-B3@1999", spend: 15621, reach: 101300, impressions: 119700, linkClicks: 645, ctr: 0.82, cpc: 16, atc: 88, ic: 32, purchases: 12, revenue: 17119, roas: 1.1 },
  { campaign: "PW-TOF-INB-Offer-B3@1999", spend: 10444, reach: 73100, impressions: 91500, linkClicks: 724, ctr: 1.47, cpc: 8, atc: 30, ic: 12, purchases: 0, revenue: 0, roas: 0 },
  { campaign: "PW-TOF-INB-BAU", spend: 7101, reach: 32400, impressions: 36800, linkClicks: 144, ctr: 0.61, cpc: 32, atc: 16, ic: 6, purchases: 3, revenue: 5997, roas: 0.85 },
  { campaign: "PW-MOF-Offer-B3@1999", spend: 3659, reach: 13600, impressions: 17900, linkClicks: 65, ctr: 0.49, cpc: 42, atc: 56, ic: 24, purchases: 3, revenue: 5997, roas: 1.64 },
  { campaign: "PW-MOF-BAU", spend: 3235, reach: 11900, impressions: 15600, linkClicks: 96, ctr: 0.85, cpc: 25, atc: 34, ic: 18, purchases: 6, revenue: 11394, roas: 3.71 },
  { campaign: "PW-BOF-BAU", spend: 1875, reach: 2100, impressions: 5200, linkClicks: 20, ctr: 0.14, cpc: 87, atc: 2, ic: 0, purchases: 0, revenue: 0, roas: 0 },
  { campaign: "PW-BOF-Offer-B3@1999", spend: 1296, reach: 1400, impressions: 2900, linkClicks: 18, ctr: 0.61, cpc: 56, atc: 0, ic: 0, purchases: 0, revenue: 0, roas: 0 },
  { campaign: "CV_BOGO_JUNE", spend: 0, reach: 0, impressions: 0, linkClicks: 0, ctr: 0, cpc: 0, atc: 14, ic: 0, purchases: 0, revenue: 0, roas: 0 },
];

// --- Google Ads (second tab) ------------------------------------------------

export const GOOGLE_ADS_KPIS: ShopifyKpi[] = [
  { label: "Total Spend", value: "₹5.54L", caption: "last 30 days" },
  { label: "ROAS", value: "0.88x", caption: "below target", tone: "danger" },
  { label: "Clicks", value: "35.8K", caption: "CTR 1.17%" },
  { label: "Conversions", value: "393", caption: "value ₹4.87L" },
  { label: "Impressions", value: "3.0M", caption: "avg CPC ₹15" },
  { label: "Cost / Conversion", value: "₹1,411", caption: "CPA", tone: "danger" },
];

export const GOOGLE_ADS_TOTALS = {
  spend: 554136,
  conversions: 393,
  conversionValue: 487150,
};

export interface GoogleAdsCampaignRow {
  campaign: string;
  status: "ENABLED" | "PAUSED";
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  conversions: number;
  roas: number;
}

export const GOOGLE_ADS_CAMPAIGNS: GoogleAdsCampaignRow[] = [
  { campaign: "NK - Pmax - Full Funnel - 09/05", status: "ENABLED", spend: 151257, impressions: 492700, clicks: 7700, ctr: 1.56, avgCpc: 20, conversions: 97.0, roas: 0.83 },
  { campaign: "NK_Brand-Search_08/05", status: "ENABLED", spend: 95105, impressions: 14100, clicks: 3800, ctr: 26.69, avgCpc: 25, conversions: 117.8, roas: 1.65 },
  { campaign: "NK_Pmax_Shopping_Brand_All_Products", status: "PAUSED", spend: 88179, impressions: 614200, clicks: 5500, ctr: 0.9, avgCpc: 16, conversions: 61.7, roas: 0.79 },
  { campaign: "NK_Pmax_Shopping_NB_All_Products", status: "ENABLED", spend: 69416, impressions: 853900, clicks: 9200, ctr: 1.07, avgCpc: 8, conversions: 43.6, roas: 0.79 },
  { campaign: "NK - Dem Gen - Open Targeting - 18/05", status: "ENABLED", spend: 37890, impressions: 373000, clicks: 2800, ctr: 0.76, avgCpc: 13, conversions: 15.0, roas: 0.53 },
  { campaign: "OW-Pmax-Bestsellers", status: "PAUSED", spend: 28660, impressions: 185200, clicks: 1800, ctr: 0.99, avgCpc: 16, conversions: 23.4, roas: 0.86 },
  { campaign: "OW-DemandGen-Prospect", status: "PAUSED", spend: 23942, impressions: 227600, clicks: 1400, ctr: 0.64, avgCpc: 17, conversions: 2.3, roas: 0.12 },
  { campaign: "OW-PMax_AllProducts_Brand_Asset", status: "PAUSED", spend: 21250, impressions: 141800, clicks: 1300, ctr: 0.93, avgCpc: 16, conversions: 9.5, roas: 0.4 },
  { campaign: "OW-DemandGen-Engaged", status: "PAUSED", spend: 16015, impressions: 120800, clicks: 1100, ctr: 0.88, avgCpc: 15, conversions: 5.6, roas: 0.29 },
  { campaign: "OW-Brand-Search_Brand&Product", status: "PAUSED", spend: 11040, impressions: 1500, clicks: 261, ctr: 17.3, avgCpc: 42, conversions: 2.0, roas: 0.26 },
  { campaign: "OW-Brand-Search_PureBrand", status: "PAUSED", spend: 9274, impressions: 7800, clicks: 729, ctr: 9.36, avgCpc: 13, conversions: 13.0, roas: 1.61 },
  { campaign: "NK - Dem Gen - Statics - BOGO Open T.", status: "PAUSED", spend: 2107, impressions: 12400, clicks: 143, ctr: 1.16, avgCpc: 15, conversions: 2.0, roas: 1.23 },
];
