/**
 * Find My FC foundations layer.
 *
 * The thinkers database sorts every thinker by a primary foundation. Ten of them:
 * Truth, Understanding, Authenticity, Justice, Clear Communication, Love, Goodness,
 * Trust, Respect, Peace. This file uses the same ten to describe a fan and a club,
 * so a match can be explained in one line: "You and Arsenal both lead with Trust and Love."
 *
 * Each of the twelve facets has two poles. Each pole leans toward one foundation.
 * A fan's swipes and a club's agreed position on each facet push weight onto the
 * foundation of the pole they sit on, in proportion to how far they sit toward it.
 *
 * The map below is editorial. Change a pole's foundation here and every club and
 * every result follows. docs/FOUNDATIONS.md explains each choice.
 */
import { CARDS } from "./cards.js";
import { readFacet } from "./engine.js";

export const FOUNDATIONS = [
  "Truth",
  "Understanding",
  "Authenticity",
  "Justice",
  "Clear Communication",
  "Love",
  "Goodness",
  "Trust",
  "Respect",
  "Peace",
];

/** Facet index -> [left pole foundation, right pole foundation]. Order follows facets.js. */
export const POLE_FOUNDATION = [
  ["Truth", "Trust"], // 0 Winning / Enduring: the scoreboard does not lie / you stay through it
  ["Peace", "Love"], // 1 Calm / Intense: composure / passion
  ["Trust", "Respect"], // 2 Tight-knit / Open: the inner circle / room for everyone
  ["Love", "Truth"], // 3 Belonging / Glory: the people / the proof of trophies
  ["Goodness", "Truth"], // 4 Beautiful / Effective: football done well / the result is the fact
  ["Understanding", "Authenticity"], // 5 Planned / Gamble: knowing the path / backing your nerve
  ["Trust", "Understanding"], // 6 Homegrown / Bought: your own / buying what the plan needs
  ["Understanding", "Love"], // 7 Head / Heart: reason / feeling
  ["Authenticity", "Clear Communication"], // 8 Rooted / Global: true to one place / speaking to the world
  ["Respect", "Understanding"], // 9 Tradition / Modern: honouring what was / learning what is next
  ["Justice", "Truth"], // 10 Local hands / Big capital: the club belongs to its people / money is the reality
  ["Justice", "Truth"], // 11 Stand for something / Win: principle / the result
];

/** How many poles lean to each foundation. Used so a foundation on five poles does not win by count alone. */
const POLE_COUNT = Object.fromEntries(FOUNDATIONS.map((f) => [f, POLE_FOUNDATION.flat().filter((x) => x === f).length || 1]));

const EMPTY = () => Object.fromEntries(FOUNDATIONS.map((f) => [f, 0]));

function push(profile, facet, value, weight = 1) {
  if (value == null || !Number.isFinite(value) || value === 0) return;
  const [left, right] = POLE_FOUNDATION[facet];
  // Facets run -1 (left pole) to +1 (right pole).
  if (value < 0) profile[left] += (-value * weight) / POLE_COUNT[left];
  else profile[right] += (value * weight) / POLE_COUNT[right];
}

function normalise(profile) {
  const total = Object.values(profile).reduce((sum, v) => sum + v, 0);
  if (!total) return profile;
  for (const key of Object.keys(profile)) profile[key] /= total;
  return profile;
}

const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]));

/**
 * The fan's foundation profile from their swipes. Shares sum to 1.
 * @param {{cardId:number, value:number}[]} answers
 */
export function fanFoundations(answers) {
  const profile = EMPTY();
  for (const answer of answers || []) {
    const card = CARD_BY_ID.get(answer.cardId);
    if (!card) continue;
    push(profile, card.facet, answer.value, 1);
  }
  return normalise(profile);
}

const clubCache = new Map();

/**
 * The club's foundation profile from its agreed position on each facet
 * (self and others averaged; contested or missing facets are left out). Shares sum to 1.
 * @param {import("./clubs.js").CrestClub} club
 */
export function clubFoundations(club) {
  const hit = clubCache.get(club.slug);
  if (hit) return hit;
  const profile = EMPTY();
  for (let facet = 0; facet < 12; facet++) {
    const reading = readFacet(club, facet);
    if (reading.contested || reading.value == null) continue;
    push(profile, facet, reading.value, 1);
  }
  const out = normalise(profile);
  clubCache.set(club.slug, out);
  return out;
}

/**
 * Overlap of two foundation profiles: the share they hold in common.
 * 1 is the same profile, 0 is nothing in common.
 */
export function overlap(a, b) {
  let sum = 0;
  for (const f of FOUNDATIONS) sum += Math.min(a[f] || 0, b[f] || 0);
  return sum;
}

/** Top foundations of a profile, strongest first. */
export function leading(profile, n = 2) {
  return FOUNDATIONS.map((f) => [f, profile[f] || 0])
    .filter(([, v]) => v > 0)
    .sort((x, y) => y[1] - x[1] || FOUNDATIONS.indexOf(x[0]) - FOUNDATIONS.indexOf(y[0]))
    .slice(0, n)
    .map(([f]) => f);
}

/**
 * The foundations the fan and the club share most, strongest shared first.
 * This is the line the result screen shows.
 */
export function sharedFoundations(fan, club, n = 2) {
  return FOUNDATIONS.map((f) => [f, Math.min(fan[f] || 0, club[f] || 0)])
    .filter(([, v]) => v > 0)
    .sort((x, y) => y[1] - x[1] || FOUNDATIONS.indexOf(x[0]) - FOUNDATIONS.indexOf(y[0]))
    .slice(0, n)
    .map(([f]) => f);
}
