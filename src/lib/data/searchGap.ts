// On-site search queries. "Gaps" are terms that returned no matching product —
// a free product/merchandising roadmap. CAVA athleisure flavoured.

export interface SearchTerm {
  term: string;
  count: number;
  matched: boolean;
}

export const SEARCH_TERMS: SearchTerm[] = [
  { term: "tall leggings", count: 6, matched: false },
  { term: "maternity legging", count: 5, matched: false },
  { term: "plus size", count: 5, matched: false },
  { term: "tennis skirt", count: 4, matched: false },
  { term: "3xl", count: 4, matched: false },
  { term: "seamless set", count: 3, matched: true },
  { term: "track order", count: 3, matched: false },
  { term: "flare leggings", count: 3, matched: false },
  { term: "golf skort", count: 2, matched: false },
  { term: "unitard", count: 2, matched: false },
  { term: "swim", count: 2, matched: false },
  { term: "size chart", count: 2, matched: false },
  { term: "return", count: 2, matched: false },
  { term: "sculpt legging", count: 8, matched: true },
  { term: "electric lime bra", count: 5, matched: true },
  { term: "sports bra", count: 7, matched: true },
  { term: "black leggings", count: 6, matched: true },
  { term: "co-ord set", count: 4, matched: true },
  { term: "ribbed tank", count: 2, matched: false },
  { term: "compression shorts", count: 3, matched: false },
  { term: "hoodie", count: 2, matched: true },
  { term: "yoga mat", count: 2, matched: false },
  { term: "gift card", count: 1, matched: false },
  { term: "petite", count: 2, matched: false },
  { term: "nude legging", count: 3, matched: true },
];

export function searchGapSummary() {
  const totalSearches = SEARCH_TERMS.reduce((s, t) => s + t.count, 0);
  const uniqueTerms = SEARCH_TERMS.length;
  const gaps = SEARCH_TERMS.filter((t) => !t.matched);
  return { totalSearches, uniqueTerms, unmetGaps: gaps.length };
}
