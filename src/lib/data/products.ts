export type Channel = "Shopify D2C" | "Amazon" | "Myntra" | "Zepto" | "Nykaa Fashion";

export const CHANNELS: Channel[] = ["Shopify D2C", "Amazon", "Myntra", "Zepto", "Nykaa Fashion"];

export const CHANNEL_COLORS: Record<Channel, string> = {
  "Shopify D2C": "#C6FF3D",
  Amazon: "#FF9900",
  Myntra: "#FF3E6C",
  Zepto: "#8A2BE2",
  "Nykaa Fashion": "#FC2779",
};

export type Category =
  | "Leggings"
  | "Sports Bra"
  | "Joggers"
  | "Oversized Tee"
  | "Sports Set"
  | "Shorts"
  | "Jacket";

export interface Product {
  sku: string;
  name: string;
  category: Category;
  price: number;
  cost: number;
  launchedMonthsAgo: number;
  heroColor: string;
}

export const PRODUCTS: Product[] = [
  { sku: "CV-LEG-SCLP-BLK", name: "Sculpt High-Waist Legging – Jet Black", category: "Leggings", price: 1799, cost: 612, launchedMonthsAgo: 14, heroColor: "#0B0B0B" },
  { sku: "CV-LEG-SCLP-OLV", name: "Sculpt High-Waist Legging – Olive Moss", category: "Leggings", price: 1799, cost: 612, launchedMonthsAgo: 10, heroColor: "#5C6B4F" },
  { sku: "CV-LEG-FLEX-NUD", name: "Flex Seamless Legging – Nude Blush", category: "Leggings", price: 1999, cost: 690, launchedMonthsAgo: 6, heroColor: "#D9A98C" },
  { sku: "CV-BRA-PWR-BLK", name: "Power Hold Sports Bra – Black", category: "Sports Bra", price: 1299, cost: 410, launchedMonthsAgo: 14, heroColor: "#0B0B0B" },
  { sku: "CV-BRA-PWR-ELC", name: "Power Hold Sports Bra – Electric Lime", category: "Sports Bra", price: 1299, cost: 410, launchedMonthsAgo: 4, heroColor: "#C6FF3D" },
  { sku: "CV-BRA-STRP-MLT", name: "Strappy Back Bra – Multi Tie-Dye", category: "Sports Bra", price: 1399, cost: 445, launchedMonthsAgo: 2, heroColor: "#6E44FF" },
  { sku: "CV-JOG-CLD-GRY", name: "Cloud Fleece Jogger – Heather Grey", category: "Joggers", price: 2199, cost: 780, launchedMonthsAgo: 9, heroColor: "#9A9A9A" },
  { sku: "CV-JOG-CLD-BLK", name: "Cloud Fleece Jogger – Black", category: "Joggers", price: 2199, cost: 780, launchedMonthsAgo: 9, heroColor: "#0B0B0B" },
  { sku: "CV-TEE-OVR-WHT", name: "Oversized Rib Tee – Chalk White", category: "Oversized Tee", price: 999, cost: 320, launchedMonthsAgo: 11, heroColor: "#F4F2ED" },
  { sku: "CV-TEE-OVR-SGE", name: "Oversized Rib Tee – Sage", category: "Oversized Tee", price: 999, cost: 320, launchedMonthsAgo: 5, heroColor: "#A9B79A" },
  { sku: "CV-SET-CORE-BLK", name: "Core Co-ord Set – Black", category: "Sports Set", price: 2899, cost: 960, launchedMonthsAgo: 7, heroColor: "#0B0B0B" },
  { sku: "CV-SET-CORE-BRY", name: "Core Co-ord Set – Berry", category: "Sports Set", price: 2899, cost: 960, launchedMonthsAgo: 3, heroColor: "#9C2B4E" },
  { sku: "CV-SRT-RUN-BLK", name: "Run Lined Shorts – Black", category: "Shorts", price: 1199, cost: 380, launchedMonthsAgo: 8, heroColor: "#0B0B0B" },
  { sku: "CV-JKT-WIND-NVY", name: "Windbreak Jacket – Navy", category: "Jacket", price: 2999, cost: 1120, launchedMonthsAgo: 1, heroColor: "#1B2A4A" },
];

export const AVAILABILITY: Record<Channel, string[]> = {
  "Shopify D2C": PRODUCTS.map((p) => p.sku),
  Amazon: PRODUCTS.filter((p) => p.category !== "Jacket").map((p) => p.sku),
  Myntra: PRODUCTS.map((p) => p.sku),
  Zepto: PRODUCTS.filter((p) => ["Leggings", "Sports Bra", "Oversized Tee", "Shorts"].includes(p.category)).map((p) => p.sku),
  "Nykaa Fashion": PRODUCTS.filter((p) => p.category !== "Jacket" && p.category !== "Joggers").map((p) => p.sku),
};
