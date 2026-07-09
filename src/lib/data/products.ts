export type Channel = "Shopify D2C" | "Amazon" | "Myntra" | "Zepto" | "Nykaa Fashion";

export const CHANNELS: Channel[] = ["Shopify D2C", "Amazon", "Myntra", "Zepto", "Nykaa Fashion"];

export const CHANNEL_COLORS: Record<Channel, string> = {
  "Shopify D2C": "#1E6FFF",
  Amazon: "#FF9900",
  Myntra: "#FF3E6C",
  Zepto: "#8A2BE2",
  "Nykaa Fashion": "#FC2779",
};

export type Category =
  | "Leggings"
  | "Sports Bra"
  | "Joggers"
  | "T-Shirts"
  | "Skorts"
  | "Flare Pants"
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

// Real CAVA Athleisure catalog (cavaathleisure.com) — selling prices as listed.
export const PRODUCTS: Product[] = [
  { sku: "CV-LEG-HG-BLK", name: "Black Hourglass Snug Leggings", category: "Leggings", price: 1299, cost: 445, launchedMonthsAgo: 14, heroColor: "#0B0B0B" },
  { sku: "CV-LEG-HG-RBY", name: "Ruby Hourglass Snug Leggings", category: "Leggings", price: 1299, cost: 445, launchedMonthsAgo: 10, heroColor: "#8E2233" },
  { sku: "CV-LEG-SC-AUB", name: "Auburn Seamless Cinched Leggings", category: "Leggings", price: 1099, cost: 380, launchedMonthsAgo: 6, heroColor: "#A85C32" },
  { sku: "CV-BRA-CB-BLK", name: "Black Cross Back Sports Bra", category: "Sports Bra", price: 1199, cost: 400, launchedMonthsAgo: 14, heroColor: "#0B0B0B" },
  { sku: "CV-BRA-HM-WNE", name: "Wine Hyper Mesh Sports Bra", category: "Sports Bra", price: 1499, cost: 515, launchedMonthsAgo: 4, heroColor: "#722F37" },
  { sku: "CV-BRA-SB-TEA", name: "Teal Fluid Strap Back Sports Bra", category: "Sports Bra", price: 1299, cost: 440, launchedMonthsAgo: 2, heroColor: "#2A7F80" },
  { sku: "CV-JOG-WL-BLK", name: "Black Wide Leg Joggers", category: "Joggers", price: 1399, cost: 495, launchedMonthsAgo: 9, heroColor: "#0B0B0B" },
  { sku: "CV-JOG-EW-NVY", name: "Navy Everywear Joggers", category: "Joggers", price: 1499, cost: 525, launchedMonthsAgo: 9, heroColor: "#1B2A4A" },
  { sku: "CV-TEE-VT-WHT", name: "White Velocity Training Tee", category: "T-Shirts", price: 1343, cost: 465, launchedMonthsAgo: 11, heroColor: "#F4F2ED" },
  { sku: "CV-TEE-SU-PNE", name: "Pine Supima Crew Neck T-Shirt", category: "T-Shirts", price: 799, cost: 275, launchedMonthsAgo: 5, heroColor: "#2F4F3E" },
  { sku: "CV-SKT-SWL-BLK", name: "Black Swirl Tennis Skort", category: "Skorts", price: 1399, cost: 485, launchedMonthsAgo: 7, heroColor: "#0B0B0B" },
  { sku: "CV-SKT-PLE-BLK", name: "Black Plie Pleated Skort", category: "Skorts", price: 1699, cost: 590, launchedMonthsAgo: 3, heroColor: "#1A1A1A" },
  { sku: "CV-FLR-HG-WNE", name: "Wine Hourglass Flared Leggings", category: "Flare Pants", price: 1429, cost: 500, launchedMonthsAgo: 8, heroColor: "#5C2233" },
  { sku: "CV-JKT-SCP-BLK", name: "Black Sculptor Jacket", category: "Jacket", price: 1799, cost: 640, launchedMonthsAgo: 1, heroColor: "#0B0B0B" },
];

export const AVAILABILITY: Record<Channel, string[]> = {
  "Shopify D2C": PRODUCTS.map((p) => p.sku),
  Amazon: PRODUCTS.filter((p) => p.category !== "Jacket").map((p) => p.sku),
  Myntra: PRODUCTS.map((p) => p.sku),
  Zepto: PRODUCTS.filter((p) => ["Leggings", "Sports Bra", "T-Shirts", "Skorts"].includes(p.category)).map((p) => p.sku),
  "Nykaa Fashion": PRODUCTS.filter((p) => p.category !== "Jacket" && p.category !== "Joggers").map((p) => p.sku),
};
