import { seededRandom } from "../rng";
import { Category, CHANNELS, Channel } from "./products";

const rng = seededRandom(6650);

const CATEGORIES: Category[] = ["Leggings", "Sports Bra", "Joggers", "Oversized Tee", "Sports Set", "Shorts", "Jacket"];
const MONTHS = ["Apr'26", "May'26", "Jun'26"];

export interface CategoryRcaRow {
  category: Category;
  channel: Channel;
  month: string;
  marketSharePct: number;
  osaPct: number;
  sovPct: number;
}

export const CATEGORY_RCA: CategoryRcaRow[] = [];

// Quick-commerce style RCA is most meaningful on the marketplace/quick-commerce
// channels where CAVA competes for shelf space against other D2C brands.
const RCA_CHANNELS: Channel[] = ["Amazon", "Myntra", "Zepto", "Nykaa Fashion"];

for (const category of CATEGORIES) {
  for (const channel of RCA_CHANNELS) {
    let ms = rng.range(0.6, 3.2);
    let osa = rng.range(60, 92);
    let sov = rng.range(0.1, 1.8);
    for (const month of MONTHS) {
      ms = Math.max(0.05, ms + rng.range(-0.3, 0.35));
      osa = Math.max(15, Math.min(97, osa + rng.range(-6, 5)));
      sov = Math.max(0.02, sov + rng.range(-0.25, 0.3));
      CATEGORY_RCA.push({
        category,
        channel,
        month,
        marketSharePct: Math.round(ms * 100) / 100,
        osaPct: Math.round(osa * 100) / 100,
        sovPct: Math.round(sov * 100) / 100,
      });
    }
  }
}
