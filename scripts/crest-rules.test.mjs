import assert from "node:assert/strict";
import test from "node:test";
import { BINARY_CARD_IDS, CARDS, DECKS, TOTAL } from "../lib/crest/cards.js";
import { RESULT_COUNTRIES } from "../lib/crest/competitions.js";
import { nextCard, rankClubs, readFacet } from "../lib/crest/engine.js";
import { buildOutcome } from "../lib/crest/outcome.js";
import { categoryOf, clubsForStake } from "../lib/crest/pools.js";
import { STAKES } from "../lib/crest/stakes.js";
import { liveStake } from "../lib/crest/stakes.js";

test("doors weigh more than likes, and a fight is not a blend", () => {
  const door = CARDS.find((card) => card.id === 14);
  const like = CARDS.find((card) => card.id === 6);
  const life = CARDS.find((card) => card.id === 1);
  const situation = CARDS.find((card) => card.id === 21);
  assert.equal(door.weight, 2);
  assert.equal(like.weight, 1);
  assert.equal(life.weight, 1.5);
  assert.equal(situation.weight, 1.5);
  assert.ok(BINARY_CARD_IDS.every((id) => CARDS.find((card) => card.id === id).weight === 2));
  const fight = {
    slug: "fight",
    name: "Fight",
    self: Array(12).fill(0.6),
    others: Array(12).fill(-0.6),
    selfMask: Array(12).fill(true),
    othersMask: Array(12).fill(true),
  };
  fight.self[0] = 1;
  fight.others[0] = -1;
  assert.equal(readFacet(fight, 0).contested, true);
  assert.equal(readFacet(fight, 1).contested, true);
});

test("every want plays the same 36, three questions on each room", () => {
  assert.equal(TOTAL, 36);
  const ids = DECKS.belonging.map((card) => card.id);
  for (const stake of STAKES) {
    const deck = DECKS[stake.id];
    assert.equal(deck.length, 36);
    assert.deepEqual(deck.map((card) => card.id), ids);
  }
  for (let facet = 0; facet < 12; facet++) {
    assert.equal(DECKS.belonging.filter((card) => card.facet === facet).length, 3);
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
    belonging: 14,
    love: 40,
    winning: 30,
    belonging_love: 39,
    love_winning: 17,
  });
});

test("belonging answers rank Everton ahead of Brighton", () => {
  const answers = [
    { cardId: 7, value: -1 },
    { cardId: 11, value: -1 },
    { cardId: 15, value: -1 },
  ];
  const ranked = rankClubs(answers, undefined, { stake: "belonging" });
  const everton = ranked.findIndex((row) => row.club.slug === "everton");
  const brighton = ranked.findIndex((row) => row.club.slug === "brighton");
  assert.ok(everton >= 0 && brighton >= 0);
  assert.ok(everton < brighton);
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
