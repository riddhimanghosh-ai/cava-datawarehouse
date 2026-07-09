// Deterministic seeded RNG so dummy data is stable across server/client renders.
export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(seed: number) {
  const rand = mulberry32(seed);
  return {
    next: () => rand(),
    range: (min: number, max: number) => min + rand() * (max - min),
    int: (min: number, max: number) => Math.floor(min + rand() * (max - min + 1)),
    pick: <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)],
    bool: (p = 0.5) => rand() < p,
  };
}
