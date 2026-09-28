/**
 * Crest swipe cards, deck v2.
 *
 * Twenty cards in three parts. Part 1 is personality, fixed order, weight 0.5.
 * Part 2 is likes and dislikes, weight 0.75. Part 3 is football situations,
 * weight 1. Parts 2 and 3 are chosen adaptively by the engine.
 *
 * Each card reads one facet. `leftValue` is the facet pole scored by a left
 * swipe (-1 left pole, +1 right pole, see ./facets.js); a right swipe scores
 * the opposite. Facets 0, 3, 8 and 11 are folded into one Stature axis by the
 * engine, so the deck carries 3.0 of its 15 weight on stature, 1.75 each on
 * style, talent and power, 1.5 on philosophy and time, 1.25 on climate, risk
 * and openness.
 */

/**
 * @typedef {Object} CrestCard
 * @property {number} id
 * @property {1|2|3} part
 * @property {string} question
 * @property {string} left
 * @property {string} right
 * @property {number} facet
 * @property {1|-1} leftValue
 */

/** @type {CrestCard[]} */
export const CARDS = [
  // Part 1: personality
  { id: 1, part: 1, question: "Calm or intense?", left: "Calm", right: "Intense", facet: 1, leftValue: -1 },
  { id: 2, part: 1, question: "Planner or spontaneous?", left: "Planner", right: "Spontaneous", facet: 5, leftValue: -1 },
  { id: 3, part: 1, question: "Head or heart?", left: "Head", right: "Heart", facet: 7, leftValue: -1 },
  { id: 4, part: 1, question: "Small circle or open house?", left: "Small circle", right: "Open house", facet: 2, leftValue: -1 },
  { id: 5, part: 1, question: "Old ways or new ways?", left: "Old ways", right: "New ways", facet: 9, leftValue: -1 },
  { id: 6, part: 1, question: "Glory this season, or still here in twenty years?", left: "Glory now", right: "Still here", facet: 0, leftValue: -1 },
  { id: 7, part: 1, question: "Hometown for life, or anywhere in the world?", left: "Hometown", right: "Anywhere", facet: 8, leftValue: -1 },

  // Part 2: likes and dislikes
  { id: 8, part: 2, question: "A 1-0 grind, or a 4-3?", left: "1-0 grind", right: "4-3", facet: 4, leftValue: 1 },
  { id: 9, part: 2, question: "Regulars' bar, or the place anyone walks into?", left: "Regulars' bar", right: "Anyone's place", facet: 2, leftValue: -1 },
  { id: 10, part: 2, question: "Build it yourself, or buy it ready?", left: "Build it", right: "Buy it", facet: 6, leftValue: -1 },
  { id: 11, part: 2, question: "Sunday stroll or rollercoaster?", left: "Stroll", right: "Rollercoaster", facet: 1, leftValue: -1 },
  { id: 12, part: 2, question: "Read the map, or follow your nose?", left: "The map", right: "Your nose", facet: 5, leftValue: -1 },
  { id: 13, part: 2, question: "Owner from the stands, or from a fund?", left: "The stands", right: "A fund", facet: 10, leftValue: -1 },

  // Part 3: football situations
  { id: 14, part: 3, question: "You win either way. Pass them dizzy, or park the bus?", left: "Pass them dizzy", right: "Park the bus", facet: 4, leftValue: -1 },
  { id: 15, part: 3, question: "Club's broke. Fans save it, or a billionaire does?", left: "Fans save it", right: "Billionaire", facet: 10, leftValue: -1 },
  { id: 16, part: 3, question: "Next team from the academy, or from the market?", left: "Academy", right: "Market", facet: 6, leftValue: -1 },
  { id: 17, part: 3, question: "Stay in the old ground, or build the new 60,000?", left: "Old ground", right: "New 60,000", facet: 9, leftValue: -1 },
  { id: 18, part: 3, question: "Beat your rival twice, or win a cup?", left: "Rival twice", right: "Win a cup", facet: 3, leftValue: -1 },
  { id: 19, part: 3, question: "Five straight losses. Sack the manager, or keep faith?", left: "Sack him", right: "Keep faith", facet: 7, leftValue: -1 },
  { id: 20, part: 3, question: "A principle that costs points. Keep it?", left: "Keep it", right: "Drop it", facet: 11, leftValue: -1 },
];

/** Part weights. */
export const PART_WEIGHT = { 1: 0.5, 2: 0.75, 3: 1 };

/** Part labels. */
export const PART_LABEL = {
  1: "Personality",
  2: "Likes and dislikes",
  3: "Football situations",
};

/** Total cards in the deck. */
export const TOTAL = 20;

/**
 * Answer-count bounds for each part, half-open `[start, end)`.
 * 0-6 Part 1, 7-12 Part 2, 13-19 Part 3.
 */
export const PART_BOUNDS = { 1: [0, 7], 2: [7, 13], 3: [13, 20] };
