import { seededRandom } from "../rng";

const rng = seededRandom(3312);

export type CatalogStockStatus = "in-stock" | "out-of-stock";
export type ChangeType = "new-launch" | "restocked" | "price-drop" | "price-hike" | "stockout";

export interface CompetitorProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  stock: CatalogStockStatus;
  publishedDaysAgo: number;
  outOfStockDays: number | null; // days since it went OOS (for sniper)
}

export interface RecentChange {
  type: ChangeType;
  productTitle: string;
  price: number;
  priceDelta: number | null;
  daysAgo: number;
}

export interface CompetitorStore {
  id: string;
  name: string;
  url: string;
  lastScannedDaysAgo: number;
  products: CompetitorProduct[];
  recentChanges: RecentChange[];
}

const CATEGORIES = ["Leggings", "Sports Bra", "Joggers", "Co-ord Set", "Tees", "Flare Pants", "Outerwear"];

function buildProducts(prefix: string, count: number, priceLow: number, priceHigh: number): CompetitorProduct[] {
  const titles: Record<string, string[]> = {
    Leggings: ["High-Rise Flex Legging", "Seamless Sculpt Legging", "Everyday Ankle Legging", "Pocket Legging 7/8"],
    "Sports Bra": ["Featherlite Bra", "High-Impact Racerback", "Everyday Comfort Bra"],
    Joggers: ["Cloud Jogger", "Tapered Lounge Jogger"],
    "Co-ord Set": ["Move Co-ord Set", "Studio Two-Piece"],
    Tees: ["Boxy Crop Tee", "Oversized Cotton Tee"],
    "Flare Pants": ["Flared Legging", "Wide Leg Flare Pant"],
    Outerwear: ["Wind Shell Jacket", "Zip Hoodie"],
  };
  const out: CompetitorProduct[] = [];
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const nameList = titles[category];
    const title = `${nameList[i % nameList.length]} ${["Black", "Sage", "Navy", "Blush", "Charcoal", "Berry"][i % 6]}`;
    const price = Math.round(rng.range(priceLow, priceHigh) / 10) * 10;
    const onSale = rng.bool(0.55);
    const stock: CatalogStockStatus = rng.bool(0.18) ? "out-of-stock" : "in-stock";
    out.push({
      id: `${prefix}-${i}`,
      title,
      category,
      price,
      compareAtPrice: onSale ? Math.round((price * rng.range(1.15, 1.5)) / 10) * 10 : null,
      stock,
      publishedDaysAgo: rng.int(2, 400),
      outOfStockDays: stock === "out-of-stock" ? rng.int(1, 21) : null,
    });
  }
  return out;
}

function buildChanges(products: CompetitorProduct[]): RecentChange[] {
  const changes: RecentChange[] = [];
  const newLaunches = products.filter((p) => p.publishedDaysAgo <= 14).slice(0, 3);
  for (const p of newLaunches) {
    changes.push({ type: "new-launch", productTitle: p.title, price: p.price, priceDelta: null, daysAgo: p.publishedDaysAgo });
  }
  const oos = products.filter((p) => p.stock === "out-of-stock").slice(0, 3);
  for (const p of oos) {
    changes.push({ type: "stockout", productTitle: p.title, price: p.price, priceDelta: null, daysAgo: p.outOfStockDays ?? 1 });
  }
  const restocked = products.filter((p) => p.stock === "in-stock").slice(3, 6);
  for (const p of restocked) {
    changes.push({ type: "restocked", productTitle: p.title, price: p.price, priceDelta: null, daysAgo: rng.int(1, 10) });
  }
  const priceMoves = products.slice(6, 10);
  for (const p of priceMoves) {
    const delta = rng.bool() ? -rng.int(100, 400) : rng.int(100, 300);
    changes.push({ type: delta < 0 ? "price-drop" : "price-hike", productTitle: p.title, price: p.price, priceDelta: delta, daysAgo: rng.int(1, 12) });
  }
  return changes.sort((a, b) => a.daysAgo - b.daysAgo);
}

function buildStore(id: string, name: string, url: string, count: number, low: number, high: number): CompetitorStore {
  const products = buildProducts(id, count, low, high);
  return { id, name, url, lastScannedDaysAgo: rng.int(1, 6), products, recentChanges: buildChanges(products) };
}

export const COMPETITOR_STORES: CompetitorStore[] = [
  buildStore("blissclub", "BlissClub", "https://www.blissclub.com", 96, 899, 2599),
  buildStore("kica", "Kica Active", "https://wearkica.com", 72, 799, 2299),
  buildStore("nykd", "Nykd by Nykaa", "https://www.nykaafashion.com/nykd", 64, 699, 1999),
  buildStore("enamor", "Enamor Active", "https://www.enamor.co.in", 58, 749, 1899),
];

export function storeStats(store: CompetitorStore) {
  const avgPrice = Math.round(store.products.reduce((s, p) => s + p.price, 0) / store.products.length);
  const onSale = store.products.filter((p) => p.compareAtPrice !== null).length;
  const soldOut = store.products.filter((p) => p.stock === "out-of-stock").length;
  return { productCount: store.products.length, avgPrice, onSale, soldOut };
}

export interface LaunchRow {
  store: string;
  product: CompetitorProduct;
}

export function allNewLaunches(maxDays = 21): LaunchRow[] {
  const rows: LaunchRow[] = [];
  for (const store of COMPETITOR_STORES) {
    for (const p of store.products) {
      if (p.publishedDaysAgo <= maxDays) rows.push({ store: store.name, product: p });
    }
  }
  return rows.sort((a, b) => a.product.publishedDaysAgo - b.product.publishedDaysAgo);
}

export interface StockoutRow {
  store: string;
  product: CompetitorProduct;
}

export function allStockouts(): StockoutRow[] {
  const rows: StockoutRow[] = [];
  for (const store of COMPETITOR_STORES) {
    for (const p of store.products) {
      if (p.stock === "out-of-stock") rows.push({ store: store.name, product: p });
    }
  }
  return rows.sort((a, b) => (b.product.outOfStockDays ?? 0) - (a.product.outOfStockDays ?? 0));
}
