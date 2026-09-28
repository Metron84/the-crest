/**
 * Crest swipe cards, deck v2.
 *
 * Twenty cards in three parts. Part 1 is personality, fixed order, weight 0.5.
 * Part 2 is likes and dislikes, weight 0.75. Part 3 is football situations,
 * weight 1. Parts 2 and 3 are chosen adaptively by the engine.
 *
 * Each card reads one facet. `leftValue` is the facet pole scored by a left
 * swipe (-1 left pole, +1 right pole, see ./facets.js). `leftLabel` is always
 * the left pole, `rightLabel` the right pole.
 */

/**
 * @typedef {Object} CrestCard
 * @property {number} id
 * @property {1|2|3} part
 * @property {string} question
 * @property {string} leftLabel
 * @property {string} rightLabel
 * @property {string} left
 * @property {string} right
 * @property {number} facet
 * @property {1|-1} leftValue
 */

/** @type {CrestCard[]} */
export const CARDS = [
  // Part 1: personality
  card(1, 1, "Calm or intense?", "Calm", "Intense", 1, -1),
  card(2, 1, "Planner or spontaneous?", "Planner", "Spontaneous", 5, -1),
  card(3, 1, "Head or heart?", "Head", "Heart", 7, -1),
  card(4, 1, "Small circle or open house?", "Small circle", "Open house", 2, -1),
  card(5, 1, "Old ways or new ways?", "Old ways", "New ways", 9, -1),
  card(6, 1, "Glory this season, or still here in twenty years?", "Glory now", "Still here", 0, -1),
  card(7, 1, "Hometown for life, or anywhere in the world?", "Hometown", "Anywhere", 8, -1),

  // Part 2: likes and dislikes
  card(8, 2, "A 4-3, or a 1-0 grind?", "4-3", "1-0 grind", 4, -1),
  card(9, 2, "Regulars' bar, or the place anyone walks into?", "Regulars' bar", "Anyone's place", 2, -1),
  card(10, 2, "Build it yourself, or buy it ready?", "Build it", "Buy it", 6, -1),
  card(11, 2, "Sunday stroll or rollercoaster?", "Stroll", "Rollercoaster", 1, -1),
  card(12, 2, "A trip: fully planned, or no plan at all?", "Fully planned", "No plan", 5, -1),
  card(13, 2, "Owner from the stands, or from a fund?", "The stands", "A fund", 10, -1),

  // Part 3: football situations
  card(14, 3, "You win either way. With flair, or with defending?", "Flair", "Defending", 4, -1),
  card(15, 3, "Club's broke. Fans save it, or a billionaire does?", "The fans", "Billionaire", 10, -1),
  card(16, 3, "Build the next team from the academy, or through transfers?", "Academy", "Transfers", 6, -1),
  card(17, 3, "Stay in the old ground, or build the new 60,000?", "Old ground", "New 60,000", 9, -1),
  card(18, 3, "Beat your rival twice, or win a cup?", "Rival twice", "The cup", 3, -1),
  card(19, 3, "Five straight losses. Sack the manager, or keep faith?", "Sack him", "Keep faith", 7, -1),
  card(20, 3, "A top striker is available. He once mocked your fans. Sign him?", "Never", "Sign him", 11, -1),
];

/**
 * @param {number} id
 * @param {1|2|3} part
 * @param {string} question
 * @param {string} leftLabel
 * @param {string} rightLabel
 * @param {number} facet
 * @param {1|-1} leftValue
 */
function card(id, part, question, leftLabel, rightLabel, facet, leftValue) {
  return { id, part, question, leftLabel, rightLabel, left: leftLabel, right: rightLabel, facet, leftValue };
}

/** Part weights. */
export const PART_WEIGHT = { 1: 0.5, 2: 0.75, 3: 1 };

/** Part labels for the play header: "{part} of 3 · {name}". */
export const PART_LABEL = {
  1: "Personality",
  2: "Likes",
  3: "Football situations",
};

/** Total cards in the deck. */
export const TOTAL = 20;

/**
 * Answer-count bounds for each part, half-open `[start, end)`.
 * 0-6 Part 1, 7-12 Part 2, 13-19 Part 3.
 */
export const PART_BOUNDS = { 1: [0, 7], 2: [7, 13], 3: [13, 20] };
