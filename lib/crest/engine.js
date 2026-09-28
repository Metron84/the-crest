/**
 * The Crest scoring engine, v2. Pure functions, no React, no DOM.
 *
 * Every swipe is treated as evidence. A club's score is the log-likelihood of
 * the person's answers given the club's blended facet values, so a club that
 * is strongly on the wrong side of one answer pays for it, and a club that is
 * mildly on the right side of everything does not win by default.
 *
 * Facets 0 (winning), 3 (meaning), 8 (reach) and 11 (purpose) move together
 * across the database (|r| 0.5 to 0.74). They are still scored separately:
 * folding them into one Stature axis was tested and cost six points of
 * recovery (own-club hit@5 49% to 43%), because the likelihood model does not
 * double-count correlated evidence the way a weighted mean does. The deck
 * carries the correlation instead, with 3.0 of 15 weight across the four.
 */

import { CARDS, PART_BOUNDS, PART_WEIGHT, TOTAL } from "./cards.js";
import { CLUBS } from "./clubs.js";
import { FACETS } from "./facets.js";
import {
  CREST_COMPETITION_LABEL,
  CREST_COMPETITIONS,
  OTHER_COMPETITION,
  OTHER_COMPETITION_LABEL,
} from "./competitions.js";

/**
 * @typedef {{cardId: number, value: 1|-1}} CrestAnswer
 * @typedef {{v: number[], w: number[]}} CrestUserVector
 * @typedef {import("./clubs.js").CrestClub} CrestClub
 * @typedef {{club: CrestClub, score: number, probability: number, logLikelihood: number}} CrestRank
 * @typedef {{facet: import("./facets.js").CrestFacet, card: import("./cards.js").CrestCard, userPhrase: string, clubPhrase: string}} CrestArrivalFlag
 * @typedef {{group?: string|null, clubs?: CrestClub[], colour?: string|null, competition?: string|null}} CrestOptions
 */

/**
 * Ranking model. `likelihood` is z-scored evidence. `legacy` is the raw-blend
 * steepness model. Display tracks always use raw blend either way.
 * @type {'likelihood'|'legacy'}
 */
export let SCORING_MODE = "likelihood";

/**
 * @param {'likelihood'|'legacy'} mode
 */
export function setScoringMode(mode) {
  SCORING_MODE = mode === "legacy" ? "legacy" : "likelihood";
}

/** Steepness of the z-scored likelihood. */
export const LIKELIHOOD_K = 1.7;

/** Default self/others blend. Self leads; others corrects the club's own myth. */
export const DEFAULT_ALPHA = 0.6;

/** Blend used by the "through rival eyes" re-rank. */
export const RIVAL_ALPHA = 0.2;

/**
 * Steepness of the answer model on the -1..1 scale. At 5, a club sitting at
 * 0.3 on a facet is expected to pick that pole about 82 percent of the time,
 * at 0.6 about 95 percent. Thin-file clubs (confidence 0.6) use 5 * 0.6.
 */
export const STEEPNESS = 5;

/**
 * Kept for callers that still import it. Colour taps now filter the pool
 * to that family. A soft bonus was too weak to unseat a confident leader.
 */
export const COLOUR_BONUS = 1.5;

/** Leader must be this many times more probable than the runner-up to be shown alone. */
export const CONFIDENT_RATIO = 1.5;

/**
 * Facets that make up club stature (glory, global, winning). Not folded in
 * scoring; used by the result copy to name what a cluster shares.
 */
export const STATURE_FACETS = [0, 3, 8, 11];

/**
 * Colour families that get a row on the result screen, in display order.
 * White is excluded on purpose: 96 of 184 shirts carry it.
 */
export const COLOUR_FAMILIES = [
  "red",
  "blue",
  "sky blue",
  "black",
  "yellow",
  "green",
  "orange",
  "purple",
  "pink",
  "brown",
];

/**
 * Weighted mean of pole values per facet. Kept for the result copy and for
 * callers that want the raw profile; scoring no longer uses it.
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
  return { v: s.map((sum, i) => (w[i] ? sum / w[i] : 0)), w };
}

/**
 * Blend a club's self and others scores on one facet. Where one voice has no
 * evidence (mask false) the other is used alone. Neither, 0.
 *
 * @param {CrestClub} club
 * @param {number} facet
 * @param {number} [alpha=DEFAULT_ALPHA]
 * @returns {number}
 */
export function blend(club, facet, alpha = DEFAULT_ALPHA) {
  const hasSelf = club.selfMask ? club.selfMask[facet] : true;
  const hasOthers = club.othersMask ? club.othersMask[facet] : true;
  if (hasSelf && hasOthers) return alpha * club.self[facet] + (1 - alpha) * club.others[facet];
  if (hasSelf) return club.self[facet];
  if (hasOthers) return club.others[facet];
  return 0;
}

/**
 * A club's value on the facet a card reads. Alias of `blend`, kept as the
 * single point where a different axis model could be plugged in.
 *
 * @param {CrestClub} club
 * @param {number} facet
 * @param {number} [alpha=DEFAULT_ALPHA]
 * @returns {number}
 */
export function axisValue(club, facet, alpha = DEFAULT_ALPHA) {
  return blend(club, facet, alpha);
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function voiceStats(voice, maskKey) {
  const means = [];
  const sds = [];
  for (let facet = 0; facet < 12; facet++) {
    const vals = CLUBS.filter((club) => (club[maskKey] ? club[maskKey][facet] : true)).map(
      (club) => club[voice][facet],
    );
    const n = vals.length || 1;
    const mean = vals.reduce((sum, v) => sum + v, 0) / n;
    const variance = vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
    means.push(mean);
    sds.push(Math.sqrt(variance) || 1);
  }
  return { means, sds };
}

const SELF_STATS = voiceStats("self", "selfMask");
const OTHERS_STATS = voiceStats("others", "othersMask");

/**
 * Z-score of one voice on one facet, centred on clubs that have evidence.
 *
 * @param {CrestClub} club
 * @param {number} facet
 * @param {'self'|'others'} voice
 */
export function zVoice(club, facet, voice) {
  const stats = voice === "self" ? SELF_STATS : OTHERS_STATS;
  return (club[voice][facet] - stats.means[facet]) / stats.sds[facet];
}

/**
 * Blended z on one facet. Empty voice falls back to the other.
 *
 * @param {CrestClub} club
 * @param {number} facet
 */
export function zClub(club, facet) {
  const hasSelf = club.selfMask ? club.selfMask[facet] : true;
  const hasOthers = club.othersMask ? club.othersMask[facet] : true;
  if (hasSelf && hasOthers) return 0.6 * zVoice(club, facet, "self") + 0.4 * zVoice(club, facet, "others");
  if (hasSelf) return zVoice(club, facet, "self");
  if (hasOthers) return zVoice(club, facet, "others");
  return 0;
}

/**
 * Euclidean norm of the club's 12-facet z vector. Tiebreak only.
 *
 * @param {CrestClub} club
 */
export function zNorm(club) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const z = zClub(club, i);
    sum += z * z;
  }
  return Math.sqrt(sum);
}

function confidenceOf(club) {
  return typeof club.confidence === "number" ? club.confidence : 1;
}

function steepness(club) {
  return STEEPNESS * confidenceOf(club);
}

/**
 * Probability that this club's fan answers `value` on this card.
 *
 * @param {CrestClub} club
 * @param {import("./cards.js").CrestCard} card
 * @param {1|-1} value pole value, already in facet terms
 * @param {number} alpha
 */
function answerProbability(club, card, value, alpha) {
  if (SCORING_MODE === "likelihood") {
    return sigmoid(value * LIKELIHOOD_K * confidenceOf(club) * zClub(club, card.facet));
  }
  return sigmoid(value * steepness(club) * axisValue(club, card.facet, alpha));
}

/**
 * Per-card log-likelihood terms for one club.
 *
 * @param {CrestClub} club
 * @param {CrestAnswer[]} answers
 * @param {number} alpha
 * @returns {{card: import("./cards.js").CrestCard, value: 1|-1, term: number}[]}
 */
function cardTerms(club, answers, alpha) {
  const terms = [];
  for (const answer of answers) {
    const card = CARDS.find((c) => c.id === answer.cardId);
    if (!card) continue;
    const p = answerProbability(club, card, answer.value, alpha);
    terms.push({ card, value: answer.value, term: PART_WEIGHT[card.part] * Math.log(Math.max(p, 1e-9)) });
  }
  return terms;
}

function pool(options = {}) {
  let clubs = options.clubs || CLUBS;
  if (options.group) clubs = clubs.filter((club) => club.group === options.group);
  if (options.colour) {
    clubs = clubs.filter((club) => club.colourFamilies && club.colourFamilies.includes(options.colour));
  }
  if (options.competition) {
    clubs = clubs.filter((club) => club.competition === options.competition);
  }
  return clubs;
}

/**
 * Rank clubs against the answers, most likely first.
 *
 * `score` is the geometric-mean per-weight agreement, 0 to 1, for display as
 * a percentage. `probability` is the softmax over the pool and drives the
 * confident/undecided rule. With no answers every club is equally likely.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=DEFAULT_ALPHA]
 * @param {CrestOptions} [options]
 * @returns {CrestRank[]}
 */
export function rankClubs(answers, alpha = DEFAULT_ALPHA, options = {}) {
  const clubs = pool(options);
  const totalWeight = answers.reduce((sum, a) => {
    const card = CARDS.find((c) => c.id === a.cardId);
    return sum + (card ? PART_WEIGHT[card.part] : 0);
  }, 0);

  const rows = clubs.map((club) => {
    let logLikelihood = cardTerms(club, answers, alpha).reduce((sum, t) => sum + t.term, 0);
    return { club, logLikelihood, score: totalWeight ? Math.exp(logLikelihood / totalWeight) : 0.5 };
  });

  const max = rows.reduce((m, r) => Math.max(m, r.logLikelihood), -Infinity);
  const z = rows.reduce((sum, r) => sum + Math.exp(r.logLikelihood - max), 0);
  for (const row of rows) row.probability = Math.exp(row.logLikelihood - max) / z;

  return rows.sort((a, b) => {
    if (Math.abs(a.logLikelihood - b.logLikelihood) >= 1e-9) {
      return b.logLikelihood - a.logLikelihood;
    }
    const na = zNorm(a.club);
    const nb = zNorm(b.club);
    if (Math.abs(na - nb) >= 1e-9) return nb - na;
    return a.club.name.localeCompare(b.club.name);
  });
}

function entropy(ps) {
  let h = 0;
  for (const p of ps) if (p > 0) h -= p * Math.log(p);
  return h;
}

/**
 * Next unused card, or null after 18 answers.
 * Part 1 (life) is fixed order. Parts 2 and 3 pick the unused card in the
 * current part with the highest expected information gain over the club
 * probabilities.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=DEFAULT_ALPHA]
 * @param {CrestOptions} [options]
 * @returns {{card: import("./cards.js").CrestCard, reason: string}|null}
 */
export function nextCard(answers, alpha = DEFAULT_ALPHA, options = {}) {
  const n = answers.length;
  if (n >= TOTAL) return null;
  const used = new Set(answers.map((a) => a.cardId));

  if (n < PART_BOUNDS[1][1]) {
    const card = CARDS.find((c) => c.part === 1 && !used.has(c.id));
    if (!card) return null;
    return { card, reason: "Life cards come in a fixed order for everyone." };
  }

  const part = n < PART_BOUNDS[2][1] ? 2 : 3;
  const ranked = rankClubs(answers, alpha, options);
  const prior = ranked.map((r) => r.probability);
  const h0 = entropy(prior);

  let best = null;
  let bestGain = -Infinity;

  for (const card of CARDS) {
    if (card.part !== part || used.has(card.id)) continue;
    const pLeftGiven = ranked.map((r) => answerProbability(r.club, card, card.leftValue, alpha));
    const pLeft = prior.reduce((sum, p, i) => sum + p * pLeftGiven[i], 0);
    const pRight = 1 - pLeft;
    const postLeft = prior.map((p, i) => (p * pLeftGiven[i]) / (pLeft || 1));
    const postRight = prior.map((p, i) => (p * (1 - pLeftGiven[i])) / (pRight || 1));
    const gain = h0 - (pLeft * entropy(postLeft) + pRight * entropy(postRight));
    if (gain > bestGain) {
      bestGain = gain;
      best = card;
    }
  }

  if (!best) return null;
  return {
    card: best,
    reason: `Picked because it tells us most about your closest clubs on ${FACETS[best.facet].label}.`,
  };
}

/**
 * Phrase for a pole value. Zero and positive use the right phrase.
 *
 * @param {number} facet
 * @param {number} value
 */
function phraseFor(facet, value) {
  return FACETS[facet].phrases[value < 0 ? 0 : 1];
}

/**
 * Arrival copy for the top club.
 *
 * `confident` is true when the leader is CONFIDENT_RATIO times more probable
 * than the runner-up; otherwise the screen should show both. `greenFlags` are
 * the two answers that counted most for the club, `rub` the one that counted
 * most against it.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=DEFAULT_ALPHA]
 * @param {CrestOptions} [options]
 */
export function arrivalSummary(answers, alpha = DEFAULT_ALPHA, options = {}) {
  const ranked = rankClubs(answers, alpha, options);
  const [top, second] = ranked;
  const user = userVector(answers);
  const byFacet = [];
  const seen = new Set();
  for (const answer of answers) {
    const card = CARDS.find((c) => c.id === answer.cardId);
    if (!card || seen.has(card.facet)) continue;
    seen.add(card.facet);
    const them = blend(top.club, card.facet, alpha);
    byFacet.push({
      card,
      value: answer.value,
      gap: Math.abs(user.v[card.facet] - them),
    });
  }
  const byGap = [...byFacet].sort((a, b) => a.gap - b.gap);

  const flag = (t) => ({
    facet: FACETS[t.card.facet],
    card: t.card,
    userPhrase: phraseFor(t.card.facet, t.value),
    clubPhrase: phraseFor(t.card.facet, blend(top.club, t.card.facet, alpha)),
  });

  return {
    club: top.club,
    score: top.score,
    probability: top.probability,
    confident: !second || top.probability >= CONFIDENT_RATIO * second.probability,
    runnerUp: second ? second.club : null,
    greenFlags: byGap.slice(0, 2).map(flag),
    rub: byGap.length ? flag(byGap[byGap.length - 1]) : null,
    ranked,
  };
}

/**
 * The colour map for the result screen: for each colour family present in the
 * pool, the closest clubs wearing it, in the person's own ranking order.
 * Families are ordered by the rank of their best club.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=DEFAULT_ALPHA]
 * @param {CrestOptions} [options]
 * @param {number} [perFamily=3]
 * @returns {{family: string, clubs: CrestRank[]}[]}
 */
export function colourMap(answers, alpha = DEFAULT_ALPHA, options = {}, perFamily = 5) {
  const ranked = rankClubs(answers, alpha, { ...options, colour: null });
  const rows = [];
  for (const family of COLOUR_FAMILIES) {
    const clubs = ranked.filter((r) => r.club.colourFamilies && r.club.colourFamilies.includes(family));
    if (!clubs.length) continue;
    rows.push({ family, clubs: clubs.slice(0, perFamily), bestRank: ranked.indexOf(clubs[0]) });
  }
  return rows.sort((a, b) => a.bestRank - b.bestRank).map(({ family, clubs }) => ({ family, clubs }));
}

/**
 * The league map for the result screen: for each competition present in the
 * pool, the closest clubs in it, in the person's own ranking order.
 * Rows are ordered by the rank of their best club. Clubs with no competition
 * sit in a final Other row.
 *
 * @param {CrestAnswer[]} answers
 * @param {number} [alpha=DEFAULT_ALPHA]
 * @param {CrestOptions} [options]
 * @param {number} [perCompetition=5]
 * @returns {{competition: string, label: string, clubs: CrestRank[]}[]}
 */
export function leagueMap(answers, alpha = DEFAULT_ALPHA, options = {}, perCompetition = 5) {
  const ranked = rankClubs(answers, alpha, { ...options, colour: null, competition: null });
  const rows = [];
  for (const competition of CREST_COMPETITIONS) {
    const clubs = ranked.filter((r) => r.club.competition === competition);
    if (!clubs.length) continue;
    rows.push({
      competition,
      label: CREST_COMPETITION_LABEL[competition] || competition,
      clubs: clubs.slice(0, perCompetition),
      bestRank: ranked.indexOf(clubs[0]),
    });
  }
  const other = ranked.filter((r) => !r.club.competition);
  if (other.length) {
    rows.push({
      competition: OTHER_COMPETITION,
      label: OTHER_COMPETITION_LABEL,
      clubs: other.slice(0, perCompetition),
      bestRank: ranked.indexOf(other[0]),
    });
  }
  return rows
    .sort((a, b) => a.bestRank - b.bestRank)
    .map(({ competition, label, clubs }) => ({ competition, label, clubs }));
}

/**
 * Clubs in the same blood as the top club: within `gap` log-likelihood of it.
 *
 * @param {CrestRank[]} ranked
 * @param {number} [gap=0.4]
 * @returns {CrestClub[]}
 */
export function cluster(ranked, gap = 0.4) {
  if (!ranked.length) return [];
  const top = ranked[0].logLikelihood;
  return ranked.filter((r) => top - r.logLikelihood <= gap).map((r) => r.club);
}
