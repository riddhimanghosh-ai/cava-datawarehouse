// Dummy AI assistant knowledge base. A lightweight keyword matcher returns a
// canned, data-aware answer so the prototype "feels" like it's querying the
// warehouse. No real model call.

export interface CannedAnswer {
  keywords: string[];
  answer: string;
}

export const SUGGESTED_QUESTIONS = [
  "Which SKUs are at stockout risk right now?",
  "What's my cash runway and biggest receivable?",
  "Which ad campaigns should I pause?",
  "Which competitor products are out of stock?",
  "How did the Black Friday campaign perform?",
  "Where is my Shopify funnel leaking the most?",
  "What's my primary vs secondary sales gap?",
  "Which category is losing on-shelf availability?",
];

export const CANNED_ANSWERS: CannedAnswer[] = [
  {
    keywords: ["stockout", "stock out", "understock", "out of stock", "reorder", "low stock", "inventory risk"],
    answer:
      "3 channel-SKU listings are critical (under 5 days of cover):\n• Black Hourglass Snug Leggings (Shopify D2C) — 2.5d cover, 42/day velocity\n• Black Cross Back Sports Bra (Amazon) — 3.1d cover\n• Wine Hyper Mesh Sports Bra (Zepto) — 4.2d cover\n\nRecommended: raise the Hourglass Snug PO by ~35% before Jul 20 and expedite the Hyper Mesh bra batch to Zepto dark stores. Est. lost sales if you don't restock in 14 days: ₹6.1L.",
  },
  {
    keywords: ["overstock", "excess", "aging", "capital stuck", "dead stock"],
    answer:
      "₹18.4L of capital is stuck in slow-movers:\n• Pine Supima Crew Neck T-Shirt — 112 days of cover, 24% sell-through\n• Black Plie Pleated Skort — aging 90d+ in FC\n• Navy Everywear Joggers — demand softening with monsoon\n\nRecommended: bundle the Plie Skort with a bestseller legging and route the Pine Supima tee to a Myntra clearance to free up working capital.",
  },
  {
    keywords: ["cash", "runway", "receivable", "payable", "burn", "payout"],
    answer:
      "Cash on hand is ₹7.1Cr with an estimated 7.4-month runway at current burn.\n\nBiggest watch item: ₹49L sitting in Myntra receivables — the oldest invoice is 12 days past its normal 30-day cycle, while ₹14.2L of Meta ad spend is due in 3 days. If the Myntra payout slips further, plan a short-term draw to cover the gap.",
  },
  {
    keywords: ["campaign", "pause", "roas", "ad", "fatigue", "creative"],
    answer:
      "2 campaigns need action:\n• Pine Supima Tee – Prospecting — ROAS 1.5x, down 41% WoW → pause recommended\n• Plie Skort – Broad Prospecting — ROAS 1.5x, fatiguing (CTR 1.1%)\n\nScale winners instead: Hyper Mesh Bra UGC (5.06x, +34%) and Hourglass Snug Retargeting (5.29x). Shift the ~₹3.3L from the two weak campaigns into these two.",
  },
  {
    keywords: ["competitor", "rival", "blissclub", "kica", "out of stock competitor", "sniper"],
    answer:
      "133 competitor SKUs are currently out of stock across the 4 tracked stores — 41 of them opened in the last 5 days (fresh windows).\n\nTop opportunity: BlissClub's Seamless Sculpt Legging (their hero) is out in 2 colours. Aim a comparison ad at those search terms now — their demand has nowhere to go while they restock.",
  },
  {
    keywords: ["black friday", "bfcm", "event", "campaign perform", "lift", "diwali", "roi"],
    answer:
      "Black Friday / Cyber Monday was your best lever of the year: +204% revenue lift vs the 14-day pre-event baseline (₹5.1L/day → ₹15.6L/day), 2,740 orders, ₹62.3L total — 125% of its ₹50L target.\n\nBy contrast, the @fitwithananya creator collab underdelivered at −12% lift, so repeat the sale mechanic before the collab format.",
  },
  {
    keywords: ["funnel", "leak", "drop-off", "dropoff", "conversion", "cvr", "checkout"],
    answer:
      "Your Shopify funnel leaks hardest at Product View → Add to Cart: only 21.9% of the 96.3K product views add to cart (78% drop-off). Checkout → Purchase is healthier at 31%.\n\nBiggest lever: the size-guide page has a low 22% bounce and high dwell — surfacing it earlier on PDPs should lift add-to-cart. Overall session→purchase conversion is 1.24%.",
  },
  {
    keywords: ["primary", "secondary", "sell-in", "sell-through", "gap"],
    answer:
      "Primary (sell-in) is ₹259L this month vs Secondary (sell-through) at ₹241L — an ₹18L gap that has been widening for 2 months. That means you're billing into channels faster than they're selling out, so downstream inventory is building.\n\nWatch Myntra and Amazon specifically; consider easing primary dispatch there until secondary catches up.",
  },
  {
    keywords: ["osa", "on-shelf", "availability", "shelf", "crashing", "category rca"],
    answer:
      "Average 7-day OSA is 71%, below the 80% target. Skorts and heavier joggers are crashing hardest — 6 SKUs are P0-critical and trending down on Blinkit/Zepto.\n\nThe Pine Supima Tee and Plie Pleated Skort are the biggest OSA laggards. Category RCA shows Leggings holding share while Skorts lose both OSA and share of voice month-over-month.",
  },
  {
    keywords: ["revenue", "sales", "top product", "best seller", "bestseller", "how much"],
    answer:
      "Last 30 days: ₹42.6L on Shopify D2C (+12.4%), blended across all channels the mix is Shopify > Amazon > Myntra > Nykaa > Zepto (Zepto ramping fastest).\n\nTop revenue SKU is the Black Hourglass Snug Leggings (₹8.9L, 496 units, 4.6% PDP conversion), followed by the Cross Back Bra in Black and the Wine Hyper Mesh.",
  },
  {
    keywords: ["keyword", "trending", "search", "seo", "reel", "viral"],
    answer:
      "Trending up: 'cava sculpt leggings review' (+85%), 'blissclub vs cava' (+90%, you rank #1), and 'squat proof leggings' (+55% — you're not ranking yet, worth a landing page).\n\nOn social, the #CavaSquatProof reel hit 2.1M views (9.9% engagement) and is driving branded search — keep feeding budget to that creative.",
  },
];

export function answerFor(question: string): string {
  const q = question.toLowerCase();
  const hit = CANNED_ANSWERS.find((a) => a.keywords.some((k) => q.includes(k)));
  if (hit) return hit.answer;
  return "I pulled across inventory, sales, cash flow and marketing tables but couldn't find an exact match for that. Try one of the suggested questions, or ask about stockout risk, cash runway, ad ROAS, competitor stockouts, campaign lift, or your Shopify funnel. (This is a prototype assistant with sample data.)";
}
