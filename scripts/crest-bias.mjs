/**
 * Crest ranking bias diagnostic. Does not write club data.
 *
 *   node scripts/crest-bias.mjs [--out scripts/crest-bias-before.csv]
 */
import { writeFileSync } from "node:fs";
import { CARDS } from "../lib/crest/cards.js";
import { CLUBS } from "../lib/crest/clubs.js";
import { blend, rankClubs, setScoringMode, zNorm } from "../lib/crest/engine.js";

const HANDS = 4000;
const VIRTUE = {
  0: 1,
  3: -1,
  6: -1,
  7: 1,
  8: -1,
  9: -1,
  10: -1,
  11: -1,
};

const FIXED = {
  "glory-global-modern-big-capital": [-1, 1, 1, 1, -1, 1, 1, -1, 1, 1, 1, 1],
  "romantic-local-belonging-homegrown": [1, 1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1],
  "calm-planner-local": [1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1],
  "beautiful-glory-global": [-1, 1, 1, 1, -1, 1, -1, 1, 1, 1, -1, 1],
};

function arg(name, fallback) {
  const flag = process.argv.indexOf(name);
  return flag >= 0 && process.argv[flag + 1] ? process.argv[flag + 1] : fallback;
}

let seed = 20260928;
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function handFromPoles(poles) {
  return CARDS.map((card) => ({
    cardId: card.id,
    value: /** @type {1|-1} */ (Math.sign(card.leftValue) === Math.sign(poles[card.facet]) ? card.leftValue : -card.leftValue),
  }));
}

function randomHand() {
  return CARDS.map((card) => ({
    cardId: card.id,
    value: /** @type {1|-1} */ (rnd() < 0.5 ? card.leftValue : -card.leftValue),
  }));
}

function desirableHand() {
  return CARDS.map((card) => {
    const virtue = VIRTUE[card.facet];
    const pick = virtue === undefined || rnd() >= 0.7 ? (rnd() < 0.5 ? -1 : 1) : virtue;
    const value = Math.sign(card.leftValue) === Math.sign(pick) ? card.leftValue : -card.leftValue;
    return { cardId: card.id, value: /** @type {1|-1} */ (value) };
  });
}

function tally(makeHand) {
  const wins = Object.fromEntries(CLUBS.map((c) => [c.slug, 0]));
  const tieWins = {};
  let ties = 0;
  let nameTies = 0;
  let dataOrderTies = 0;
  for (let i = 0; i < HANDS; i++) {
    const ranked = rankClubs(makeHand());
    const top = ranked[0];
    const second = ranked[1];
    wins[top.club.slug] += 1;
    if (second && Math.abs(top.logLikelihood - second.logLikelihood) < 1e-9) {
      ties += 1;
      tieWins[top.club.slug] = (tieWins[top.club.slug] || 0) + 1;
      const zGap = Math.abs(zNorm(top.club) - zNorm(second.club));
      const nameFirst = top.club.name.localeCompare(second.club.name) < 0;
      const dataFirst =
        CLUBS.findIndex((c) => c.slug === top.club.slug) <
        CLUBS.findIndex((c) => c.slug === second.club.slug);
      if (nameFirst) nameTies += 1;
      if (zGap < 1e-9 && dataFirst && !nameFirst) dataOrderTies += 1;
    }
  }
  return { wins, ties, nameTies, dataOrderTies, tieWins };
}

function gini(counts) {
  const xs = Object.values(counts).slice().sort((a, b) => a - b);
  const n = xs.length;
  const total = xs.reduce((s, v) => s + v, 0);
  if (!total) return 0;
  let acc = 0;
  xs.forEach((v, i) => {
    acc += (2 * (i + 1) - n - 1) * v;
  });
  return acc / (n * total);
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const out = arg("--out", "scripts/crest-bias-before.csv");
setScoringMode(arg("--mode", process.env.CREST_SCORING_MODE || "likelihood"));

const random = tally(randomHand);
const desirable = tally(desirableHand);

const rows = CLUBS.map((club) => {
  const abs = Array.from({ length: 12 }, (_, i) => Math.abs(blend(club, i)));
  const meanAbs = abs.reduce((s, v) => s + v, 0) / 12;
  const selfN = (club.selfMask || []).filter(Boolean).length;
  const othersN = (club.othersMask || []).filter(Boolean).length;
  return {
    name: club.name,
    slug: club.slug,
    randomPct: (100 * random.wins[club.slug]) / HANDS,
    desirablePct: (100 * desirable.wins[club.slug]) / HANDS,
    meanAbs,
    selfN,
    othersN,
    confidence: club.confidence,
  };
});

const header = "name,win_pct_random,win_pct_desirable,mean_abs_blend,self_evidence,others_evidence,confidence";
const csv = [
  header,
  ...rows.map((r) =>
    [
      csvEscape(r.name),
      r.randomPct.toFixed(4),
      r.desirablePct.toFixed(4),
      r.meanAbs.toFixed(4),
      r.selfN,
      r.othersN,
      r.confidence,
    ].join(","),
  ),
].join("\n");
writeFileSync(out, `${csv}\n`);

const ever = rows.filter((r) => r.randomPct > 0).length;
const topDesirable = [...rows].sort((a, b) => b.desirablePct - a.desirablePct).slice(0, 15);
const empoli = rows.find((r) => r.slug === "empoli");
const palmas = rows.find((r) => r.slug === "las-palmas");

console.log(`scoring mode: ${arg("--mode", process.env.CREST_SCORING_MODE || "likelihood")}`);
console.log(`wrote ${out}`);
console.log(`\nrandom ties (exact ll): ${random.ties} / ${HANDS}`);
console.log(`of those, winner is alphabetical first: ${random.nameTies}`);
console.log(`ties decided by data order: ${random.dataOrderTies}`);
if (Object.keys(random.tieWins).length) {
  console.log(
    "tie winners:",
    Object.entries(random.tieWins)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k, v]) => `${k} ${v}`)
      .join(", "),
  );
}

console.log("\nfixed test hands (top 5)");
for (const [name, poles] of Object.entries(FIXED)) {
  const top = rankClubs(handFromPoles(poles)).slice(0, 5);
  console.log(`  ${name}`);
  for (const row of top) console.log(`    ${row.club.name} ${row.score.toFixed(3)} ll=${row.logLikelihood.toFixed(3)}`);
}

console.log("\ntop 15 desirable-hand win %");
for (const row of topDesirable) {
  console.log(`  ${row.name.padEnd(28)} ${row.desirablePct.toFixed(2)}%`);
}

console.log("\nEmpoli / UD Las Palmas");
for (const row of [empoli, palmas]) {
  if (!row) continue;
  console.log(
    `  ${row.name}: random ${row.randomPct.toFixed(2)}%  desirable ${row.desirablePct.toFixed(2)}%  |blend| ${row.meanAbs.toFixed(3)}  self ${row.selfN} others ${row.othersN} conf ${row.confidence}`,
  );
}

console.log(`\nGini (random wins): ${gini(random.wins).toFixed(4)}`);
console.log(`clubs that ever win a random hand: ${ever} / ${CLUBS.length}`);
