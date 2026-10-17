// Glycemic index (GI) values, glucose = 100.
// Sources: International Tables of Glycemic Index and Glycemic Load Values
// (Atkinson, Foster-Powell & Brand-Miller, Diabetes Care 2008; updated 2021 tables),
// and published Indian GI studies for idli, dosa, chapati, poha, upma.
// GI varies with variety, cooking and portion. Values are rounded typical values.
// `verify: true` marks foods whose published values vary a lot between studies:
// double-check before the demo and show the "approx." label in the UI.

export type Food = {
  id: string;
  name: string;
  emoji: string;
  gi: number;
  note: string;
  verify?: boolean;
};

export const FOODS: Food[] = [
  { id: "glucose", name: "Glucose drink", emoji: "🧪", gi: 100, note: "The reference: GI 100 by definition." },
  { id: "cornflakes", name: "Cornflakes", emoji: "🥣", gi: 81, note: "Highly processed flakes digest very fast." },
  { id: "potato", name: "Boiled potato", emoji: "🥔", gi: 78, note: "Soft starch breaks down quickly." },
  { id: "rice-porridge", name: "Rice kanji / congee", emoji: "🍚", gi: 78, note: "Overcooked rice spikes faster than plain rice." },
  { id: "dosa", name: "Plain dosa", emoji: "🥞", gi: 77, note: "Fermented rice batter, crisped thin.", verify: true },
  { id: "watermelon", name: "Watermelon", emoji: "🍉", gi: 76, note: "High GI, but very little sugar per slice (low GL)." },
  { id: "white-bread", name: "White bread", emoji: "🍞", gi: 75, note: "Refined flour, quick to digest." },
  { id: "white-rice", name: "White rice", emoji: "🍚", gi: 73, note: "India's staple; portion size matters most." },
  { id: "idli", name: "Idli", emoji: "⚪", gi: 69, note: "Steamed and fermented, still rice-heavy.", verify: true },
  { id: "brown-rice", name: "Brown rice", emoji: "🍘", gi: 68, note: "The bran slows things a little." },
  { id: "upma", name: "Rava upma", emoji: "🍲", gi: 68, note: "Semolina is refined wheat.", verify: true },
  { id: "millet-porridge", name: "Millet porridge", emoji: "🥣", gi: 67, note: "Porridge form raises GI of most grains." },
  { id: "sucrose", name: "Table sugar", emoji: "🍬", gi: 65, note: "Half glucose, half fructose." },
  { id: "poha", name: "Poha", emoji: "🍛", gi: 64, note: "Flattened rice; add peanuts and veg to slow it.", verify: true },
  { id: "sweet-potato", name: "Sweet potato", emoji: "🍠", gi: 63, note: "Lower than regular potato." },
  { id: "chapati", name: "Wheat chapati", emoji: "🫓", gi: 62, note: "Whole wheat beats maida." },
  { id: "honey", name: "Honey", emoji: "🍯", gi: 61, note: "Not much better than sugar." },
  { id: "papaya", name: "Papaya", emoji: "🧡", gi: 60, note: "Medium GI fruit." },
  { id: "cola", name: "Cola", emoji: "🥤", gi: 59, note: "Medium GI, but huge sugar load per can." },
  { id: "basmati", name: "Basmati rice", emoji: "🍚", gi: 58, note: "Usually lower than regular white rice.", verify: true },
  { id: "oats", name: "Oats porridge", emoji: "🥣", gi: 55, note: "Rolled oats, not instant." },
  { id: "corn", name: "Sweet corn", emoji: "🌽", gi: 52, note: "Fibre in the kernel helps." },
  { id: "banana", name: "Banana", emoji: "🍌", gi: 51, note: "Riper bananas run higher." },
  { id: "mango", name: "Mango", emoji: "🥭", gi: 51, note: "Medium GI; easy to overeat." },
  { id: "orange", name: "Orange", emoji: "🍊", gi: 43, note: "Whole fruit beats juice." },
  { id: "curd", name: "Plain curd", emoji: "🥛", gi: 41, note: "Protein and fat slow absorption." },
  { id: "milk", name: "Milk", emoji: "🥛", gi: 39, note: "Low GI." },
  { id: "carrot", name: "Boiled carrots", emoji: "🥕", gi: 39, note: "Sweet taste, low GI." },
  { id: "apple", name: "Apple", emoji: "🍎", gi: 36, note: "Fibre-rich, low GI." },
  { id: "dal", name: "Masoor dal (lentils)", emoji: "🍲", gi: 32, note: "Pulses are some of the lowest-GI foods." },
  { id: "chana", name: "Chickpeas (chana)", emoji: "🫘", gi: 28, note: "Great swap for refined snacks." },
  { id: "rajma", name: "Rajma (kidney beans)", emoji: "🫘", gi: 24, note: "Very low GI." },
];

export const DISCLAIMER =
  "Approximate GI values from published tables. Educational only, not medical advice. Talk to a doctor before changing your diet or medication.";

// Build N rounds of "which spikes your blood sugar more?" pairs.
// Pairs need a GI gap of at least `minGap` so answers are fair.
// A seed (e.g. today's date) makes the daily puzzle the same for everyone, Wordle-style.
export function makeRounds(seed: string, n = 10, minGap = 8): [Food, Food][] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const rounds: [Food, Food][] = [];
  const used = new Set<string>();
  let guard = 0;
  while (rounds.length < n && guard++ < 2000) {
    const a = FOODS[Math.floor(rand() * FOODS.length)];
    const b = FOODS[Math.floor(rand() * FOODS.length)];
    const key = [a.id, b.id].sort().join("|");
    if (a.id === b.id || used.has(key) || Math.abs(a.gi - b.gi) < minGap) continue;
    if (a.id === "glucose" || b.id === "glucose") continue;
    used.add(key);
    rounds.push([a, b]);
  }
  return rounds;
}

export function todaySeed(tz = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}
