/**
 * Crest swipe cards. Extracted from docs/crest-road-prototype.html (`C`, `W`, `PART`).
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
  { id: 1, part: 1, question: "Night in or night out?", left: "In", right: "Out", facet: 2, leftValue: -1 },
  { id: 2, part: 1, question: "Calm or intense?", left: "Calm", right: "Intense", facet: 1, leftValue: -1 },
  { id: 3, part: 1, question: "Loyal to a fault or quick to move on?", left: "Loyal", right: "Move on", facet: 0, leftValue: 1 },
  { id: 4, part: 1, question: "Planner or spontaneous?", left: "Planner", right: "Spontaneous", facet: 5, leftValue: -1 },
  { id: 5, part: 1, question: "Head or heart?", left: "Head", right: "Heart", facet: 7, leftValue: -1 },
  { id: 6, part: 1, question: "Rooted or restless?", left: "Rooted", right: "Restless", facet: 8, leftValue: -1 },
  { id: 7, part: 1, question: "Make a name or make a difference?", left: "Name", right: "Difference", facet: 11, leftValue: 1 },
  { id: 8, part: 2, question: "Vinyl or streaming?", left: "Vinyl", right: "Streaming", facet: 9, leftValue: -1 },
  { id: 9, part: 2, question: "Corner café or famous restaurant?", left: "Café", right: "Famous", facet: 8, leftValue: -1 },
  { id: 10, part: 2, question: "Handmade or designer?", left: "Handmade", right: "Designer", facet: 6, leftValue: -1 },
  { id: 11, part: 2, question: "Underdog film or blockbuster?", left: "Underdog", right: "Blockbuster", facet: 0, leftValue: 1 },
  { id: 12, part: 2, question: "Art gallery or action film?", left: "Gallery", right: "Action", facet: 4, leftValue: -1 },
  { id: 13, part: 2, question: "Family recipe or chef's experiment?", left: "Recipe", right: "Experiment", facet: 7, leftValue: -1 },
  { id: 14, part: 3, question: "Win the league playing ugly, or finish 4th playing beautiful?", left: "Ugly title", right: "Beautiful 4th", facet: 4, leftValue: 1 },
  { id: 15, part: 3, question: "A billionaire buys your club promising trophies. Yes or no?", left: "Yes", right: "No", facet: 10, leftValue: 1 },
  { id: 16, part: 3, question: "Cup final, last minute. Who takes the penalty?", left: "Academy kid", right: "€100m star", facet: 6, leftValue: -1 },
  { id: 17, part: 3, question: "New 60,000 stadium or stay in the old ground?", left: "New", right: "Old", facet: 9, leftValue: 1 },
  { id: 18, part: 3, question: "Beat your rival twice, or win a cup?", left: "Rival", right: "Cup", facet: 3, leftValue: -1 },
  { id: 19, part: 3, question: "Fans in Dubai and Tokyo, or your city's secret?", left: "Global", right: "Secret", facet: 8, leftValue: 1 },
  { id: 20, part: 3, question: "Your club wins, or your club stands for something?", left: "Wins", right: "Stands", facet: 11, leftValue: 1 },
];

/** Part weights from the prototype `W`. */
export const PART_WEIGHT = { 1: 0.5, 2: 0.75, 3: 1 };

/** Part labels from the prototype `PART`. */
export const PART_LABEL = {
  1: "Personality",
  2: "Likes and dislikes",
  3: "Football situations",
};

/** Total cards in the deck. */
export const TOTAL = 20;

/**
 * Answer-count bounds for each part, half-open `[start, end)`.
 * Matches the prototype: 0-6 Part 1, 7-12 Part 2, 13-19 Part 3.
 */
export const PART_BOUNDS = { 1: [0, 7], 2: [7, 13], 3: [13, 20] };
