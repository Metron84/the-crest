import assert from "node:assert/strict";
import test from "node:test";
import { CARDS, TOTAL } from "../lib/crest/cards.js";
import { FACETS } from "../lib/crest/facets.js";
import { DEFAULT_ALPHA, nextCard, rankClubs } from "../lib/crest/engine.js";
import { loyaltyLambda, priorMass, rootProbability } from "../lib/crest/roots.js";
import { crestRunInsert } from "../lib/crest/runLog.js";

/**
 * Left label, and the sign a left swipe stores.
 * Negative is the left-named pole of that facet. Positive is the right-named pole.
 */
const LEFT_POLE = {
  1: ["My gut", 7, 1],
  2: ["Perfect moment", 0, -1],
  3: ["With people", 2, 1],
  4: ["Close to home", 8, -1],
  5: ["Look back", 9, -1],
  6: ["A 4-3", 4, -1],
  7: ["Build it", 6, -1],
  8: ["Calm stroll", 1, -1],
  9: ["All planned", 5, -1],
  10: ["My street", 3, -1],
  11: ["Safe mid-table", 0, 1],
  12: ["3-0 at half-time", 1, -1],
  13: ["Sell out at home", 8, -1],
  14: ["Park the bus", 5, -1],
  15: ["With flair", 4, -1],
  16: ["The fans", 10, -1],
  17: ["Old ground", 9, -1],
  18: ["Beat the rival", 3, -1],
  19: ["Sack him", 7, -1],
  20: ["Never", 11, -1],
};

test("each left label stores the correct pole sign", () => {
  assert.equal(CARDS.length, 20);
  for (const card of CARDS) {
    const expected = LEFT_POLE[card.id];
    assert.ok(expected, `missing pole for card ${card.id}`);
    const [label, facet, leftValue] = expected;
    assert.equal(card.L, label);
    assert.equal(card.facet, facet);
    assert.equal(card.leftValue, leftValue);
    const pole = leftValue < 0 ? FACETS[facet].left : FACETS[facet].right;
    assert.equal(Math.sign(card.leftValue) || 0, leftValue);
    assert.ok(pole);
  }
});

test("one fixed run is the same hero and card order 100 times", () => {
  const stake = "belonging";
  const scope = "England";
  let hero = "";
  let order = "";
  for (let run = 0; run < 100; run++) {
    const answers = [];
    const ids = [];
    while (answers.length < TOTAL) {
      const next = nextCard(answers, DEFAULT_ALPHA, { group: scope, stake });
      assert.ok(next);
      ids.push(next.card.id);
      answers.push({ cardId: next.card.id, value: next.card.leftValue });
    }
    const ranked = rankClubs(answers, DEFAULT_ALPHA, { group: scope, stake });
    const slug = ranked[0].club.slug;
    const joined = ids.join(",");
    if (run === 0) {
      hero = slug;
      order = joined;
    } else {
      assert.equal(slug, hero);
      assert.equal(joined, order);
    }
  }
  assert.equal(order, CARDS.map((card) => card.id).join(","));
  assert.ok(hero);
});

test("a finished run keeps clubs and drops a player email", () => {
  const row = crestRunInsert(
    {
      appVersion: "0.1.0",
      scope: "England",
      stake: "love",
      roots: {
        family: { slug: "arsenal", name: "Arsenal", typed: false },
        grew: null,
        hooked: { source: "player", club: { slug: null, name: "Sunday Rovers", typed: true } },
        stay: "always",
      },
      answers: [
        { cardId: 1, value: 1 },
        { cardId: 11, value: -1 },
        { cardId: 99, value: 1 },
      ],
      built: { slug: "arsenal", percentage: 81 },
      runnerUp: { slug: "chelsea", percentage: 70 },
      born: { slug: null, name: "Sunday Rovers", typed: true, percentage: null },
      regions: [{ region: "England", top: { slug: "arsenal", percentage: 81 } }],
      email: "fan@example.com",
      name: "Fan",
      ip: "127.0.0.1",
      userAgent: "Mozilla",
    },
    "2026-10-27T00:00:00.000Z",
  );
  assert.deepEqual(Object.keys(row), [
    "created_at",
    "app_version",
    "scope",
    "stake",
    "roots",
    "answers",
    "hero_slug",
    "runner_up_slug",
    "born_to",
    "match_percents",
  ]);
  assert.equal(row.born_to, "Sunday Rovers");
  assert.equal(row.roots.hooked.club.typed, true);
  assert.equal(row.answers.length, 2);
  assert.equal(row.match_percents.hero, 81);
  assert.equal("email" in row, false);
  assert.equal("userAgent" in row, false);
});

test("roots prior renormalises and a typed club is not scored", () => {
  const roots = {
    family: { slug: "arsenal", name: "Arsenal", typed: false },
    grew: { slug: "arsenal", name: "Arsenal", typed: false },
    hooked: { source: "player", club: { slug: null, name: "My Sunday team", typed: true } },
    stay: "always",
  };
  const mass = priorMass(roots);
  assert.equal(mass.size, 1);
  assert.equal(mass.get("arsenal"), 1);
  assert.equal(loyaltyLambda(roots), 1);
  assert.equal(loyaltyLambda({ ...roots, stay: "probably" }), 0.6);
  assert.equal(loyaltyLambda({ ...roots, stay: "drift" }), 0.15);
  const typedOnly = {
    family: { slug: null, name: "My Sunday team", typed: true },
    grew: null,
    hooked: null,
    stay: "always",
  };
  assert.equal(loyaltyLambda(typedOnly), 0);
  const n = 4;
  const pNamed = rootProbability("arsenal", mass, n, false);
  const pOther = rootProbability("other", mass, n, false);
  assert.ok(Math.abs(pNamed + pOther * (n - 1) - 1) < 1e-9);
});
