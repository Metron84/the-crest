/**
 * Sanity checks for the club database and engine. Run with `npm run check`.
 * Exits non-zero if any club breaks the scoring rules.
 */
import { CARDS } from "../lib/crest/cards.js";
import { CLUBS } from "../lib/crest/clubs.js";
import { blend, rankClubs, nextCard, arrivalSummary } from "../lib/crest/engine.js";

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
  console.log(`  ${name.padEnd(22)} ${top.map((r) => `${r.club.slug} ${r.score.toFixed(3)}`).join(" | ")}`);
}

let seed = 20260928;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const wins = {};
const N = 3000;
for (let k = 0; k < N; k++) {
  const top = rankClubs(toAnswers(mk(() => (rnd() < 0.5 ? "L" : "R"))))[0];
  wins[top.club.slug] = (wins[top.club.slug] || 0) + 1;
}
const shares = Object.entries(wins).sort((a, b) => b[1] - a[1]);
console.log(`\nrandom hands: ${shares.length} of ${CLUBS.length} clubs win at least once`);
console.log(`  top 8: ${shares.slice(0, 8).map(([s, n]) => `${s} ${((100 * n) / N).toFixed(1)}%`).join(", ")}`);

let pairs = 0;
for (let a = 0; a < CLUBS.length; a++) {
  for (let b = a + 1; b < CLUBS.length; b++) {
    let d = 0;
    for (let i = 0; i < 12; i++) d += Math.abs(blend(CLUBS[a], i) - blend(CLUBS[b], i));
    if (d / 12 < 0.1) pairs++;
  }
}
console.log(`near-duplicate pairs (mean blend gap under 0.10): ${pairs}`);

const answers = [];
for (let i = 0; i < 20; i++) {
  const next = nextCard(answers);
  answers.push({ cardId: next.card.id, value: rnd() < 0.5 ? 1 : -1 });
}
const arrival = arrivalSummary(answers);
console.log(`\nflow: 20 cards -> ${arrival.club.name} (${arrival.score.toFixed(3)})`);

if (failures) {
  console.log(`\n${failures} club(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
