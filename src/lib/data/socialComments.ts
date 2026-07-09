export type Sentiment = "positive" | "negative" | "neutral";

export interface SocialComment {
  id: string;
  ad: string;
  platform: "Instagram" | "Facebook";
  author: string;
  text: string;
  language: "English" | "Hindi" | "Hinglish";
  sentiment: Sentiment;
  purchaseIntent: boolean;
  answered: boolean;
  ageHours: number;
}

// Comments pulled from active Meta ads, classified by sentiment + purchase intent.
export const SOCIAL_COMMENTS: SocialComment[] = [
  { id: "c1", ad: "Hourglass Snug – Retargeting Q3", platform: "Instagram", author: "priya.fit", text: "Price kitna hai? Link do please 🙏", language: "Hinglish", sentiment: "neutral", purchaseIntent: true, answered: false, ageHours: 26 },
  { id: "c2", ad: "Hyper Mesh Bra – UGC Reel Boost", platform: "Instagram", author: "meghna_lifts", text: "Omg the wine colour is everything 😍 need this", language: "English", sentiment: "positive", purchaseIntent: true, answered: false, ageHours: 19 },
  { id: "c3", ad: "Hourglass Snug – Retargeting Q3", platform: "Facebook", author: "Rohit Sharma", text: "Kahan milega ye? Amazon pe hai kya?", language: "Hinglish", sentiment: "neutral", purchaseIntent: true, answered: false, ageHours: 31 },
  { id: "c4", ad: "Plie Skort – Broad Prospecting", platform: "Instagram", author: "anonymous_92", text: "Ordered last month, still not delivered. Worst service 😡", language: "English", sentiment: "negative", purchaseIntent: false, answered: false, ageHours: 8 },
  { id: "c5", ad: "Hyper Mesh Bra – UGC Reel Boost", platform: "Instagram", author: "sana.workout", text: "available hai medium size?", language: "Hinglish", sentiment: "neutral", purchaseIntent: true, answered: false, ageHours: 14 },
  { id: "c6", ad: "Hourglass Snug – Retargeting Q3", platform: "Instagram", author: "the.gym.girl", text: "Best leggings I've bought, squat proof for real 🔥", language: "English", sentiment: "positive", purchaseIntent: false, answered: true, ageHours: 40 },
  { id: "c7", ad: "Auburn Seamless – Prospecting", platform: "Facebook", author: "Kavya R", text: "Colour thoda different aaya vs photo. Thoda disappointed.", language: "Hinglish", sentiment: "negative", purchaseIntent: false, answered: false, ageHours: 22 },
  { id: "c8", ad: "Plie Skort – Broad Prospecting", platform: "Instagram", author: "fitness_neha", text: "link please! want the black one", language: "English", sentiment: "positive", purchaseIntent: true, answered: false, ageHours: 5 },
  { id: "c9", ad: "Sculptor Jacket – Launch Push", platform: "Instagram", author: "trailrunner.arjun", text: "Is it waterproof or just water resistant?", language: "English", sentiment: "neutral", purchaseIntent: true, answered: false, ageHours: 11 },
  { id: "c10", ad: "Hourglass Snug – Retargeting Q3", platform: "Instagram", author: "dance.with.tia", text: "Quality is amazing, repurchasing in 2 more colours", language: "English", sentiment: "positive", purchaseIntent: false, answered: true, ageHours: 52 },
  { id: "c11", ad: "Hyper Mesh Bra – UGC Reel Boost", platform: "Facebook", author: "Simran K", text: "kitne ka hai ye? COD available?", language: "Hinglish", sentiment: "neutral", purchaseIntent: true, answered: false, ageHours: 3 },
  { id: "c12", ad: "Auburn Seamless – Prospecting", platform: "Instagram", author: "yoga_by_ritu", text: "The nude shade range is so inclusive, love this brand ❤️", language: "English", sentiment: "positive", purchaseIntent: false, answered: false, ageHours: 17 },
  { id: "c13", ad: "Plie Skort – Broad Prospecting", platform: "Instagram", author: "unhappy_buyer", text: "Return request pending 5 days, koi reply nahi kar raha", language: "Hinglish", sentiment: "negative", purchaseIntent: false, answered: false, ageHours: 6 },
  { id: "c14", ad: "Sculptor Jacket – Launch Push", platform: "Instagram", author: "monsoon.runs", text: "price? and does it come in navy", language: "English", sentiment: "neutral", purchaseIntent: true, answered: false, ageHours: 29 },
  { id: "c15", ad: "Hourglass Snug – Retargeting Q3", platform: "Facebook", author: "Deepa M", text: "Size chart confusing hai, M ya L lu?", language: "Hinglish", sentiment: "neutral", purchaseIntent: true, answered: false, ageHours: 9 },
  { id: "c16", ad: "Hyper Mesh Bra – UGC Reel Boost", platform: "Instagram", author: "casual_scroller", text: "Nice ad", language: "English", sentiment: "neutral", purchaseIntent: false, answered: true, ageHours: 44 },
];

export function commentsSummary() {
  const positive = SOCIAL_COMMENTS.filter((c) => c.sentiment === "positive").length;
  const negative = SOCIAL_COMMENTS.filter((c) => c.sentiment === "negative").length;
  const neutral = SOCIAL_COMMENTS.filter((c) => c.sentiment === "neutral").length;
  const intent = SOCIAL_COMMENTS.filter((c) => c.purchaseIntent).length;
  const unansweredIntent = SOCIAL_COMMENTS.filter((c) => c.purchaseIntent && !c.answered).length;
  return { positive, negative, neutral, intent, unansweredIntent, total: SOCIAL_COMMENTS.length };
}

export const SOCIAL_ADS = Array.from(new Set(SOCIAL_COMMENTS.map((c) => c.ad)));
