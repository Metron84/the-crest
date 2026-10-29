import assert from "node:assert/strict";
import test from "node:test";
import { DECKS, TOTAL, allowsBoth } from "../lib/crest/cards.js";
import { RESULT_COUNTRIES } from "../lib/crest/competitions.js";
import { nextCard, rankClubs } from "../lib/crest/engine.js";
import { buildOutcome } from "../lib/crest/outcome.js";
import { categoryOf, clubsForStake } from "../lib/crest/pools.js";
import { STAKES } from "../lib/crest/stakes.js";
import { liveStake } from "../lib/crest/stakes.js";

const POLES = [
  ["A calm one", 1, -1, true],
  ["From the heart", 7, 1, true],
  ["How he plays", 4, -1, true],
  ["A careful plan", 5, -1, false],
  ["For the life", 0, 1, true],
  ["Stands for something", 11, -1, false],
  ["One of ours", 10, -1, false],
  ["Keeps what we have", 9, -1, false],
  ["The people who make it", 2, -1, true],
  ["Those people", 3, -1, true],
];

const LEFT = Object.fromEntries(STAKES.map((row) => [row.id, POLES]));

test("each want has ten cards and the left pole it stores", () => {
  assert.equal(TOTAL, 10);
  assert.deepEqual(STAKES.map((row) => row.id), Object.keys(LEFT));
  for (const [id, expected] of Object.entries(LEFT)) {
    const deck = DECKS[id];
    assert.equal(deck.length, 10);
    deck.forEach((card, index) => {
      const [label, facet, leftValue, both] = expected[index];
      assert.equal(card.L, label);
      assert.equal(card.facet, facet);
      assert.equal(card.leftValue, leftValue);
      assert.equal(allowsBoth(card), both);
    });
  }
});

test("a want walks its own deck, and a removed want has none", () => {
  assert.equal(liveStake("fortune"), null);
  assert.equal(liveStake("fame_fortune"), null);
  assert.equal(liveStake("belonging_winning"), null);
  for (const stake of STAKES) {
    const answers = [];
    const ids = [];
    while (answers.length < TOTAL) {
      const next = nextCard(answers, undefined, { stake: stake.id });
      assert.ok(next);
      ids.push(next.card.id);
      answers.push({ cardId: next.card.id, value: next.card.leftValue });
    }
    assert.equal(nextCard(answers, undefined, { stake: stake.id }), null);
    assert.deepEqual(ids, DECKS[stake.id].map((card) => card.id));
    const ranked = rankClubs(answers, undefined, { stake: stake.id });
    assert.ok(ranked.length);
    assert.ok(ranked.every((row) => categoryOf(row.club.slug) === stake.id));
  }
});

test("Slavia Prague is Belonging and the five pools cover every club", () => {
  assert.equal(categoryOf("slavia-prague"), "belonging");
  const counts = Object.fromEntries(STAKES.map((row) => [row.id, clubsForStake(row.id).length]));
  assert.deepEqual(counts, {
    belonging: 41,
    love: 64,
    winning: 33,
    belonging_love: 59,
    love_winning: 18,
  });
});

test("three Belonging answers put Millwall at 60 and Brighton at 25", () => {
  const answers = [
    { cardId: 9, value: -1 },
    { cardId: 8, value: -1 },
    { cardId: 7, value: -1 },
  ];
  const ranked = rankClubs(answers, undefined, { stake: "belonging" });
  const millwall = ranked.find((row) => row.club.slug === "millwall");
  const brighton = ranked.find((row) => row.club.slug === "brighton");
  assert.ok(millwall);
  assert.ok(brighton);
  assert.equal(Math.round(millwall.score * 100), 60);
  assert.equal(Math.round(brighton.score * 100), 25);
  assert.ok(ranked.findIndex((row) => row.club.slug === "millwall") < ranked.findIndex((row) => row.club.slug === "brighton"));
});

test("the same Belonging sheet names the same club every time", () => {
  const answers = DECKS.belonging.map((card) => ({ cardId: card.id, value: card.leftValue }));
  let hero = "";
  for (let run = 0; run < 20; run++) {
    const ranked = rankClubs(answers, undefined, { stake: "belonging", group: "England" });
    const slug = ranked[0].club.slug;
    if (run === 0) hero = slug;
    else assert.equal(slug, hero);
  }
  assert.ok(hero);
});

test("the league list is five countries and then Rest of the World", () => {
  const answers = DECKS.love.map((card) => ({ cardId: card.id, value: card.leftValue }));
  const outcome = buildOutcome(answers, { stake: "love" });
  const names = outcome.countries.map((row) => row.country);
  assert.deepEqual(names.slice(0, 5), ["England", "Spain", "Italy", "Germany", "France"]);
  assert.equal(names.at(-1), "Rest of the World");
  assert.ok(!names.includes("Wales"));
  assert.ok(!names.includes("Monaco"));
  assert.ok(!names.includes("Netherlands"));
  const rest = outcome.countries.at(-1);
  assert.ok(rest.leagues.length > 1);
  assert.ok(rest.leagues.every((league) => Number.isFinite(league.top.percentage)));
  assert.deepEqual(
    RESULT_COUNTRIES.map((row) => row.country),
    ["England", "Spain", "Italy", "Germany", "France", "Rest of the World"],
  );
});
