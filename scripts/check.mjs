/**
 * Crest database and engine checks. Run with `npm run check:crest`.
 * Exits non-zero if a club breaks the scoring rules or the recovery
 * test misses its targets.
 */
import { CARDS } from "../lib/crest/cards.js";
import { CLUBS } from "../lib/crest/clubs.js";
import {
  blend,
  rankClubs,
  nextCard,
  arrivalSummary,
  colourMap,
} from "../lib/crest/engine.js";

const SCALE = new Set([-1, -0.6, -0.3, 0, 0.3, 0.6, 1]);
let failures = 0;

console.log(`clubs: ${CLUBS.length}`);
for (const club of CLUBS) {
  const problems = [];
  if (club.self.length !== 12 || club.others.length !== 12) problems.push("length");
  if ([...club.self, ...club.others].some((v) => !SCALE.has(v))) problems.push("scale");
  const ones = (v) => v.filter((x) => Math.abs(x) === 1).length;
  if (ones(club.self) > 5 || ones(club.others) > 5) problems.push("too many poles");
  const diff = club.self.filter((v, i) => v !== club.others[i]).length;
  if (diff < 2 && !club.flags.includes("narrow-gap")) problems.push("self equals others, unflagged");
  if (problems.length) {
    failures++;
    console.log(`FAIL ${club.slug}: ${problems.join(", ")}`);
  }
}

const toAnswers = (hand) =>
  CARDS.filter((c) => hand[c.id]).map((c) => ({
    cardId: c.id,
    value: hand[c.id] === "L" ? c.leftValue : -c.leftValue,
  }));
const mk = (fn) => Object.fromEntries(CARDS.map((c) => [c.id, fn(c)]));
const want = (t) => mk((c) => (Math.sign(c.leftValue) === Math.sign(t[c.facet] ?? 0) ? "L" : "R"));

const hands = {
  romanticLocal: want([1, 1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1]),
  gloryGlobal: want([-1, 1, 1, 1, -1, 1, 1, -1, 1, 1, 1, 1]),
  calmPlannerLocal: want([1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1]),
  dataClub: want([-1, -1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1]),
  beautifulGloryGlobal: want([-1, 1, 1, 1, -1, 1, -1, 1, 1, 1, -1, 1]),
};
console.log("\ntest hands (top 3)");
for (const [name, hand] of Object.entries(hands)) {
  const top = rankClubs(toAnswers(hand)).slice(0, 3);
  console.log(
    `  ${name.padEnd(22)} ${top.map((r) => `${r.club.slug} ${r.score.toFixed(3)}`).join(" | ")}`,
  );
}

const N = CLUBS.length;
const F = 12;
const M = CLUBS.map((c) => Array.from({ length: F }, (_, i) => blend(c, i)));
let seed = 11;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const gauss = () => {
  let u = 0;
  let v = 0;
  while (!u) u = rnd();
  while (!v) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const noisyHand = (vec) =>
  CARDS.map((c) => ({
    cardId: c.id,
    value: /** @type {1|-1} */ (Math.sign(vec[c.facet] + 0.45 * gauss()) || 1),
  }));

const HANDS = 30;
let hit1 = 0;
let hit5 = 0;
const ranks = [];
const wins = {};
const colourHits = { n: 0, top3: 0 };

for (let c = 0; c < N; c++) {
  for (let h = 0; h < HANDS; h++) {
    const answers = noisyHand(M[c]);
    const ranked = rankClubs(answers);
    const rank = ranked.findIndex((r) => r.club.slug === CLUBS[c].slug) + 1;
    ranks.push(rank);
    if (rank === 1) hit1++;
    if (rank <= 5) hit5++;
    wins[ranked[0].club.slug] = (wins[ranked[0].club.slug] || 0) + 1;

    const families = CLUBS[c].colourFamilies || [];
    if (families.length) {
      const rows = colourMap(answers);
      const row = rows.find((r) => r.family === families[0]);
      colourHits.n++;
      if (row && row.clubs.some((r) => r.club.slug === CLUBS[c].slug)) colourHits.top3++;
    }
  }
}

ranks.sort((a, b) => a - b);
const total = N * HANDS;
const median = ranks[Math.floor(ranks.length / 2)];
const neverReturned = N - Object.keys(wins).length;
const thieves = Object.entries(wins).sort((a, b) => b[1] - a[1]);
const thiefShare = thieves[0][1] / total;
const hit5Share = hit5 / total;
const colourShare = colourHits.n ? colourHits.top3 / colourHits.n : 0;

console.log("\nrecovery (own-club vector + noise, 30 hands each)");
console.log(
  `  hit@1 ${(100 * hit1 / total).toFixed(0)}%  hit@5 ${(100 * hit5Share).toFixed(0)}%  median rank ${median}`,
);
console.log(`  clubs never returned: ${neverReturned}`);
console.log(
  `  biggest thief: ${thieves[0][0]} ${(100 * thiefShare).toFixed(1)}%`,
);
console.log(
  `  own-colour row top 3: ${(100 * colourShare).toFixed(0)}% (${colourHits.n} coloured hands)`,
);

if (hit5Share < 0.45) {
  failures++;
  console.log("FAIL recovery: hit@5 under 45%");
}
if (neverReturned > 0) {
  failures++;
  console.log("FAIL recovery: clubs never returned");
}
if (thiefShare > 0.02) {
  failures++;
  console.log("FAIL recovery: a club takes more than 2% of hands");
}
if (colourHits.n && colourShare < 0.6) {
  failures++;
  console.log("FAIL colour map: own-colour row top 3 under 60%");
}

const answers = [];
for (let i = 0; i < 20; i++) {
  const next = nextCard(answers);
  if (!next) {
    failures++;
    console.log("FAIL flow: nextCard returned null early");
    break;
  }
  answers.push({ cardId: next.card.id, value: rnd() < 0.5 ? 1 : -1 });
}
const arrival = arrivalSummary(answers);
console.log(
  `\nflow: 20 cards -> ${arrival.club.name} (${arrival.score.toFixed(3)}, p=${arrival.probability.toFixed(3)}, ${arrival.confident ? "confident" : "between"})`,
);

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
