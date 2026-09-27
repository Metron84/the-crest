/**
 * Pure Crest scoring engine. Ported from docs/crest-road-prototype.html.
 * No React, no DOM.
 */

import { CARDS, PART_WEIGHT, TOTAL } from "./cards.js";
import { CLUBS } from "./clubs.js";
import { FACETS } from "./facets.js";

/**
 * @typedef {{cardId: number, value: 1|-1}} CrestAnswer
 * @typedef {{v: number[], w: number[]}} CrestUserVector
 * @typedef {{club: import("./clubs.js").CrestClub, score: number}} CrestRank
 * @typedef {{facet: import("./facets.js").CrestFacet, userPhrase: string, clubPhrase: string}} CrestArrivalFlag
 */

/**
 * Weighted mean of pole values per facet.
 * `value` is the facet pole after applying the card's leftValue:
 * a left swipe stores `leftValue`, a right swipe stores `-leftValue`.
 *
 * @param {CrestAnswer[]} answers
 * @returns {CrestUserVector}
 */
export function userVector(answers) {
  const s = Array(12).fill(0);
  const w = Array(12).fill(0);
  for (const answer of answers) {
    const card = CARDS.find((c) => c.id === answer.cardId);
    if (!card) continue;
    const weight = PART_WEIGHT[card.part];
    s[card.facet] += answer.value * weight;
    w[card.facet] += weight;
  }
  return {
    v: s.map((sum, i) => (w[i] ? sum / w[i] : 0)),
    w,
  };
}

/**
 * How much a thin file (confidence 0.6) is pulled toward the neutral 0.5.
 * Shrink factor is CONFIDENCE_FLOOR + (1 - CONFIDENCE_FLOOR) * confidence,
 * so a 1.0 file keeps its full score and a 0.6 file keeps 94 percent of its
 * distance from neutral. Mild on purpose: thin files should lose ties, not races.
 */
export const CONFIDENCE_FLOOR = 0.85;

/**
 * Blend a club's self and others scores on one facet.
 * Where one voice has no evidence for the facet (mask false) the other voice
 * is used alone. Where neither has evidence the facet reads as 0.
 *
 * @param {import("./clubs.js").CrestClub} club
 * @param {number} facet
 * @param {number} [alpha=0.6]
 * @returns {number}
 */
export function blend(club, facet, alpha = 0.6) {
  const hasSelf = club.selfMask ? club.selfMask[facet] : true;
  const hasOthers = club.othersMask ? club.othersMask[facet] : true;
  if (hasSelf && hasOthers) {
    return alpha * club.self[facet] + (1 - alpha) * club.others[facet];
  }
  if (hasSelf) return club.self[facet];
  if (hasOthers) return club.others[facet];
  return 0;
}

/**
 * Rank clubs against the current answers, high score first.
 * Score is 0.5 for every club when nothing is answered.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=0.6]
 * @param {{group?: string|null, clubs?: import("./clubs.js").CrestClub[]}} [options]
 *   `group` limits the field to one of CREST_GROUPS; `clubs` overrides the pool.
 * @returns {CrestRank[]}
 */
export function rankClubs(answers, alpha = 0.6, options = {}) {
  const u = userVector(answers);
  const totalWeight = u.w.reduce((sum, weight) => sum + weight, 0);
  let pool = options.clubs || CLUBS;
  if (options.group) pool = pool.filter((club) => club.group === options.group);
  return pool
    .map((club) => {
      let s = 0;
      u.w.forEach((weight, facet) => {
        if (weight) {
          s += weight * (1 - Math.abs(u.v[facet] - blend(club, facet, alpha)) / 2);
        }
      });
      const raw = totalWeight ? s / totalWeight : 0.5;
      const confidence = typeof club.confidence === "number" ? club.confidence : 1;
      const shrink = CONFIDENCE_FLOOR + (1 - CONFIDENCE_FLOOR) * confidence;
      return { club, score: 0.5 + (raw - 0.5) * shrink };
    })
    .sort((a, b) => b.score - a.score || a.club.name.localeCompare(b.club.name));
}

/**
 * Next unused card, or null after 20 answers.
 * Part 1 is fixed order. Parts 2 and 3 pick the unused card that best
 * separates the six closest homes on its facet.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=0.6]
 * @param {{group?: string|null}} [options]
 * @returns {{card: import("./cards.js").CrestCard, reason: string}|null}
 */
export function nextCard(answers, alpha = 0.6, options = {}) {
  const n = answers.length;
  if (n >= TOTAL) return null;
  const used = new Set(answers.map((a) => a.cardId));

  if (n < 7) {
    const card = CARDS.find((c) => c.part === 1 && !used.has(c.id));
    if (!card) return null;
    return {
      card,
      reason: "Personality cards come in a fixed order for everyone and count half.",
    };
  }

  const part = n < 13 ? 2 : 3;
  const u = userVector(answers);
  const top = rankClubs(answers, alpha, options).slice(0, 6);
  let best = null;
  let bestScore = -1;
  let spread = 0;

  for (const card of CARDS) {
    if (card.part !== part || used.has(card.id)) continue;
    const values = top.map((row) => blend(row.club, card.facet, alpha));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const sd = Math.sqrt(
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length,
    );
    const score = sd + 0.3 * (1 - Math.min(u.w[card.facet], 1));
    if (score > bestScore) {
      bestScore = score;
      best = card;
      spread = sd;
    }
  }

  if (!best) return null;
  return {
    card: best,
    reason: `Picked because it best separates your six closest homes on ${FACETS[best.facet].label} (spread ${spread.toFixed(2)}).`,
  };
}

/**
 * Phrase for a pole value. Zero and positive use the right phrase.
 *
 * @param {number} facet
 * @param {number} value
 * @returns {string}
 */
function phraseFor(facet, value) {
  return FACETS[facet].phrases[value < 0 ? 0 : 1];
}

/**
 * Arrival copy for the top club: two closest answered facets and the furthest.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=0.6]
 * @param {{group?: string|null}} [options]
 * @returns {{club: import("./clubs.js").CrestClub, score: number, greenFlags: CrestArrivalFlag[], rub: CrestArrivalFlag|null}}
 */
export function arrivalSummary(answers, alpha = 0.6, options = {}) {
  const [{ club, score }] = rankClubs(answers, alpha, options);
  const u = userVector(answers);
  const diffs = FACETS.map((_, i) => ({
    i,
    d: Math.abs(u.v[i] - blend(club, i, alpha)),
  })).filter((row) => u.w[row.i]);
  const green = [...diffs].sort((a, b) => a.d - b.d).slice(0, 2);
  const furthest = [...diffs].sort((a, b) => b.d - a.d)[0];

  const flag = (row) => ({
    facet: FACETS[row.i],
    userPhrase: phraseFor(row.i, u.v[row.i]),
    clubPhrase: phraseFor(row.i, blend(club, row.i, alpha)),
  });

  return {
    club,
    score,
    greenFlags: green.map(flag),
    rub: furthest ? flag(furthest) : null,
  };
}
