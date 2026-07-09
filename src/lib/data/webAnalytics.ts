// Web analytics for CAVA's own D2C storefront (Shopify) + Google Analytics (GA4).
// Numbers are hand-tuned to feel real for a mid-size Indian athleisure D2C brand.

// ---------------------------------------------------------------------------
// SHOPIFY ANALYTICS
// ---------------------------------------------------------------------------

export interface ShopifyKpi {
  label: string;
  value: string;
  changePct?: number;
  changeLabel?: string;
  caption?: string;
  tone?: "default" | "ok" | "danger";
}

export const SHOPIFY_OVERVIEW_KPIS: ShopifyKpi[] = [
  { label: "Total Revenue", value: "₹42.6L", changePct: 12.4, changeLabel: "vs prev 30d" },
  { label: "Total Orders", value: "2,318", changePct: 9.1, changeLabel: "vs prev 30d" },
  { label: "Avg Order Value", value: "₹1,838", changePct: 3.0, changeLabel: "vs prev 30d" },
  { label: "Unique Customers", value: "1,974", changePct: 8.2, changeLabel: "vs prev 30d" },
  { label: "Repeat Customer Rate", value: "31.4%", caption: "CRO key metric" },
  { label: "Avg Items / Order", value: "1.86", caption: "Refund rate: 2.4%" },
  { label: "Refund Rate", value: "2.4%", caption: "of gross revenue", tone: "danger" },
  { label: "Total Discounts Given", value: "₹5.9L", caption: "13.8% of revenue" },
  { label: "New Customer Revenue", value: "₹28.1L", caption: "66% of total" },
  { label: "Purchase Frequency", value: "1.17", caption: "orders / customer" },
];

export interface SalesByCategory {
  category: string;
  revenue: number;
  orders: number;
  units: number;
  discountPct: number;
}

export const SHOPIFY_SALES_BY_CATEGORY: SalesByCategory[] = [
  { category: "Leggings", revenue: 1680000, orders: 812, units: 1102, discountPct: 11 },
  { category: "Sports Bra", revenue: 940000, orders: 640, units: 921, discountPct: 9 },
  { category: "Sports Set", revenue: 712000, orders: 268, units: 302, discountPct: 18 },
  { category: "Joggers", revenue: 486000, orders: 214, units: 236, discountPct: 14 },
  { category: "Oversized Tee", revenue: 262000, orders: 248, units: 318, discountPct: 7 },
  { category: "Shorts", revenue: 118000, orders: 96, units: 121, discountPct: 12 },
  { category: "Jacket", revenue: 102000, orders: 40, units: 42, discountPct: 5 },
];

export interface TopCustomer {
  name: string;
  orders: number;
  spend: number;
  lastOrderDays: number;
  segment: "VIP" | "Repeat" | "New";
}

export interface DiscountCode {
  code: string;
  uses: number;
  totalDiscount: number;
  avgDiscount: number;
}

export const SHOPIFY_DISCOUNT_SUMMARY = {
  discountRatePct: 68.4, // share of orders that used any discount
  totalDiscountsGiven: 590000,
  avgDiscountPerOrder: 764,
};

export const SHOPIFY_DISCOUNT_CODES: DiscountCode[] = [
  { code: "FESTIVE40", uses: 412, totalDiscount: 214600, avgDiscount: 521 },
  { code: "SCULPT10", uses: 286, totalDiscount: 51480, avgDiscount: 180 },
  { code: "LIME15", uses: 198, totalDiscount: 44550, avgDiscount: 225 },
  { code: "PREPAID", uses: 640, totalDiscount: 38400, avgDiscount: 60 },
  { code: "WINBACK15", uses: 132, totalDiscount: 29040, avgDiscount: 220 },
  { code: "BOGO", uses: 96, totalDiscount: 86400, avgDiscount: 900 },
  { code: "POP10", uses: 154, totalDiscount: 24640, avgDiscount: 160 },
  { code: "INFLUENCER100", uses: 88, totalDiscount: 88000, avgDiscount: 1000 },
  { code: "FLAT300", uses: 71, totalDiscount: 21300, avgDiscount: 300 },
  { code: "FIRST5", uses: 210, totalDiscount: 21000, avgDiscount: 100 },
];

export const SHOPIFY_TOP_CUSTOMERS: TopCustomer[] = [
  { name: "Ananya Iyer", orders: 9, spend: 24180, lastOrderDays: 4, segment: "VIP" },
  { name: "Rhea Kapoor", orders: 7, spend: 19420, lastOrderDays: 11, segment: "VIP" },
  { name: "Sneha Nair", orders: 6, spend: 15960, lastOrderDays: 6, segment: "VIP" },
  { name: "Aditi Rao", orders: 4, spend: 9880, lastOrderDays: 19, segment: "Repeat" },
  { name: "Kavya Menon", orders: 3, spend: 7640, lastOrderDays: 2, segment: "Repeat" },
  { name: "Ishita Bose", orders: 3, spend: 6910, lastOrderDays: 27, segment: "Repeat" },
];

export interface TopProduct {
  name: string;
  sku: string;
  revenue: number;
  units: number;
  refundRate: number;
  conversion: number;
}

export const SHOPIFY_TOP_PRODUCTS: TopProduct[] = [
  { name: "Sculpt High-Waist Legging – Jet Black", sku: "CV-LEG-SCLP-BLK", revenue: 892000, units: 496, refundRate: 1.8, conversion: 4.6 },
  { name: "Power Hold Sports Bra – Black", sku: "CV-BRA-PWR-BLK", revenue: 461000, units: 355, refundRate: 2.1, conversion: 4.1 },
  { name: "Power Hold Sports Bra – Electric Lime", sku: "CV-BRA-PWR-ELC", revenue: 388000, units: 299, refundRate: 2.4, conversion: 5.2 },
  { name: "Core Co-ord Set – Black", sku: "CV-SET-CORE-BLK", revenue: 351000, units: 121, refundRate: 3.2, conversion: 3.4 },
  { name: "Flex Seamless Legging – Nude Blush", sku: "CV-LEG-FLEX-NUD", revenue: 318000, units: 159, refundRate: 2.0, conversion: 4.9 },
  { name: "Cloud Fleece Jogger – Heather Grey", sku: "CV-JOG-CLD-GRY", revenue: 154000, units: 70, refundRate: 4.1, conversion: 2.2 },
];

export interface ShopifyOrder {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: "fulfilled" | "processing" | "refunded" | "cancelled";
  ageHours: number;
}

export const SHOPIFY_RECENT_ORDERS: ShopifyOrder[] = [
  { id: "#CV10482", customer: "Ananya Iyer", items: 2, total: 3098, status: "fulfilled", ageHours: 2 },
  { id: "#CV10481", customer: "Guest (Mumbai)", items: 1, total: 1799, status: "processing", ageHours: 3 },
  { id: "#CV10480", customer: "Rhea Kapoor", items: 3, total: 4597, status: "fulfilled", ageHours: 5 },
  { id: "#CV10479", customer: "Guest (Delhi)", items: 1, total: 1299, status: "processing", ageHours: 6 },
  { id: "#CV10478", customer: "Sneha Nair", items: 2, total: 2898, status: "fulfilled", ageHours: 9 },
  { id: "#CV10477", customer: "Guest (Bengaluru)", items: 1, total: 2199, status: "refunded", ageHours: 14 },
  { id: "#CV10476", customer: "Aditi Rao", items: 2, total: 3598, status: "fulfilled", ageHours: 18 },
  { id: "#CV10475", customer: "Guest (Pune)", items: 1, total: 999, status: "cancelled", ageHours: 22 },
];

export interface FunnelStage {
  stage: string;
  count: number;
  pctOfPrevious: number | null;
  dropOffPct: number;
}

export const SHOPIFY_FUNNEL: FunnelStage[] = [
  { stage: "Sessions", count: 148200, pctOfPrevious: null, dropOffPct: 0 },
  { stage: "Product Views", count: 96300, pctOfPrevious: 65.0, dropOffPct: 35.0 },
  { stage: "Add to Cart", count: 21100, pctOfPrevious: 21.9, dropOffPct: 78.1 },
  { stage: "Checkout", count: 7400, pctOfPrevious: 35.1, dropOffPct: 64.9 },
  { stage: "Purchase", count: 2318, pctOfPrevious: 31.3, dropOffPct: 68.7 },
];

// ---------------------------------------------------------------------------
// GOOGLE ANALYTICS (GA4)
// ---------------------------------------------------------------------------

export const GA_TRAFFIC_KPIS: ShopifyKpi[] = [
  { label: "Sessions", value: "182.4K", changePct: 7.4, changeLabel: "vs prev period" },
  { label: "Active Users", value: "141.8K", changePct: 11.7, changeLabel: "vs prev period" },
  { label: "New Users", value: "108.9K", caption: "76.8% of total" },
  { label: "Pageviews", value: "512.6K", caption: "2.81 pages / session" },
  { label: "Bounce Rate", value: "38.2%", caption: "Healthy", tone: "ok" },
  { label: "Avg Session Duration", value: "2m 11s", caption: "Room to improve" },
];

export const GA_ECOMMERCE_KPIS: ShopifyKpi[] = [
  { label: "Revenue (GA4)", value: "₹41.2L", changePct: 10.2, changeLabel: "vs prev period", tone: "ok" },
  { label: "Transactions", value: "2,254", changePct: 8.6, changeLabel: "vs prev period" },
  { label: "Conversion Rate", value: "1.24%", caption: "Above category avg", tone: "ok" },
  { label: "Add to Carts", value: "20,880", caption: "11.4% of sessions" },
  { label: "Checkouts", value: "7,240", caption: "34.7% of carts" },
  { label: "Avg Order Value", value: "₹1,828", caption: "per transaction" },
];

export interface UserTypeRow {
  type: string;
  sessions: number;
  sharePct: number;
  purchases: number;
  revenue: number;
}

export const GA_NEW_VS_RETURNING: UserTypeRow[] = [
  { type: "New Users", sessions: 134900, sharePct: 74.0, purchases: 1198, revenue: 2410000 },
  { type: "Returning Users", sessions: 47500, sharePct: 26.0, purchases: 1056, revenue: 1710000 },
];

export interface BarRow {
  label: string;
  value: number;
  sharePct: number;
}

export const GA_DEVICE_CATEGORY: BarRow[] = [
  { label: "Mobile", value: 167800, sharePct: 92.0 },
  { label: "Desktop", value: 13100, sharePct: 7.2 },
  { label: "Tablet", value: 1500, sharePct: 0.8 },
];

export const GA_BROWSERS: BarRow[] = [
  { label: "Chrome", value: 89400, sharePct: 49.0 },
  { label: "Safari", value: 62000, sharePct: 34.0 },
  { label: "Android Webview", value: 21900, sharePct: 12.0 },
  { label: "Others", value: 9100, sharePct: 5.0 },
];

export interface AcquisitionRow {
  channel: string;
  sessions: number;
  newUsers: number;
  convRate: number;
  revenue: number;
}

export const GA_ACQUISITION: AcquisitionRow[] = [
  { channel: "Paid Social (Meta)", sessions: 68400, newUsers: 52100, convRate: 1.1, revenue: 1520000 },
  { channel: "Organic Search", sessions: 41200, newUsers: 22800, convRate: 1.8, revenue: 1180000 },
  { channel: "Direct", sessions: 28600, newUsers: 9400, convRate: 2.2, revenue: 940000 },
  { channel: "Paid Search (Google)", sessions: 21300, newUsers: 15600, convRate: 1.4, revenue: 610000 },
  { channel: "Email", sessions: 12800, newUsers: 2100, convRate: 3.1, revenue: 480000 },
  { channel: "Organic Social", sessions: 7900, newUsers: 5600, convRate: 0.7, revenue: 120000 },
  { channel: "Referral", sessions: 2200, newUsers: 1300, convRate: 1.2, revenue: 60000 },
];

export interface BehaviorRow {
  page: string;
  pageviews: number;
  avgTime: string;
  bouncePct: number;
}

export const GA_BEHAVIOR_PAGES: BehaviorRow[] = [
  { page: "/ (Home)", pageviews: 118200, avgTime: "0m 52s", bouncePct: 41 },
  { page: "/collections/leggings", pageviews: 72400, avgTime: "1m 34s", bouncePct: 32 },
  { page: "/products/sculpt-legging-black", pageviews: 54800, avgTime: "2m 18s", bouncePct: 28 },
  { page: "/collections/sports-bra", pageviews: 41900, avgTime: "1m 21s", bouncePct: 36 },
  { page: "/products/power-bra-lime", pageviews: 33600, avgTime: "2m 04s", bouncePct: 30 },
  { page: "/pages/size-guide", pageviews: 21200, avgTime: "1m 47s", bouncePct: 22 },
  { page: "/cart", pageviews: 20880, avgTime: "1m 12s", bouncePct: 18 },
];

export const GA_SESSION_FUNNEL: FunnelStage[] = [
  { stage: "Sessions", count: 182400, pctOfPrevious: null, dropOffPct: 0 },
  { stage: "Add to Cart", count: 20880, pctOfPrevious: 11.4, dropOffPct: 88.6 },
  { stage: "Checkout", count: 7240, pctOfPrevious: 34.7, dropOffPct: 65.3 },
  { stage: "Purchase", count: 2254, pctOfPrevious: 31.1, dropOffPct: 68.9 },
];

export const GA_PRODUCT_FUNNEL: FunnelStage[] = [
  { stage: "Product Views", count: 96300, pctOfPrevious: null, dropOffPct: 0 },
  { stage: "Add to Cart", count: 20880, pctOfPrevious: 21.7, dropOffPct: 78.3 },
  { stage: "Purchase", count: 2254, pctOfPrevious: 10.8, dropOffPct: 89.2 },
];
