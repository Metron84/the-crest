# Live rules

What the engine and the quiz do now. `lib/crest/engine.js`, `cards.js`, `stakes.js`, `roots.js`, `outcome.js`, `clubs.js`.

## Flow

1. Scope. Everywhere, or one region: England, Germany, Italy, Spain, France, Rest of the World. This is a hard filter. A club outside it cannot win the swipe ranking.
2. Roots. Four taps. See below.
3. Stake. One of Belonging, Winning, Belonging and winning, Fame and fortune, Fortune, Love. It multiplies weights. It does not reorder cards.
4. Twenty swipes, in deck order.
5. Reveal, then the result screen.

A new run sets answers, stake, roots, and card order back to empty, and scope back to everywhere when the player restarts. `clearCrestRunStorage` removes every `crest:*` key in localStorage and sessionStorage except the swipe hint `crest:hintSeen`. The quiz does not read a stored scope.

Progress is 4 roots taps + 20 swipes = 24.

## Deck

Fixed order, ids 1 to 20. Part weights: life 0.7, likes 0.75, football 1.

A left swipe stores `leftValue`. A right swipe stores `-leftValue`. Both stores 0. Both is refused on cards 11, 14, 16, 17, 19, and 20.

| Id | Part | Left | Right | Facet | leftValue | Both |
|---|---|---|---|---|---|---|
| 1 | life | My gut | The numbers | 7 | +1 | yes |
| 2 | life | Perfect moment | Something that lasts | 0 | −1 | yes |
| 3 | life | With people | On my own | 2 | +1 | yes |
| 4 | life | Close to home | On the road | 8 | −1 | yes |
| 5 | life | Look back | Look ahead | 9 | −1 | yes |
| 6 | likes | A 4-3 | A 1-0 grind | 4 | −1 | yes |
| 7 | likes | Build it | Buy it | 6 | −1 | yes |
| 8 | likes | Calm stroll | Rollercoaster | 1 | −1 | yes |
| 9 | likes | All planned | No plan | 5 | −1 | yes |
| 10 | likes | My street | Famous for a day | 3 | −1 | yes |
| 11 | football | Safe mid-table | Title, then down | 0 | +1 | no |
| 12 | football | 3-0 at half-time | 94th-minute winner | 1 | −1 | yes |
| 13 | football | Sell out at home | Fans worldwide | 8 | −1 | yes |
| 14 | football | Park the bus | Go for the second | 5 | −1 | no |
| 15 | football | With flair | With defending | 4 | −1 | yes |
| 16 | football | The fans | A billionaire | 10 | −1 | no |
| 17 | football | Old ground | New stadium | 9 | −1 | no |
| 18 | football | Beat the rival | Win the cup | 3 | −1 | yes |
| 19 | football | Sack him | Keep faith | 7 | −1 | no |
| 20 | football | Never | Sign him | 11 | −1 | no |

Each card's `s` line is shown under the question.

Negative is the left-named pole. Positive is the right-named pole. Cards 1, 3, and 11 are the ones whose left label is the right-named pole, so a left swipe stores +1.

## Weights

```
weight = partWeight × (0.7 if the facet has two cards in the deck, else 1) × stakeCoeff
```

Facets with two cards: 0, 1, 3, 4, 5, 7, 8, 9.

Stake coefficients are only 2, 1.4, or 1. Nothing is zeroed.

| Stake | ×2 | ×1.4 |
|---|---|---|
| Belonging | 3 meaning, 2 openness, 8 reach | 9 time, 10 power, 11 purpose |
| Winning | 0 winning, 11 purpose | 3 meaning, 4 style |
| Belonging and winning | 0 winning, 3 meaning, 11 purpose | 2 openness, 8 reach |
| Fame and fortune | 8 reach, 10 power, 3 meaning | 6 talent, 11 purpose |
| Fortune | 10 power, 6 talent | 0 winning, 8 reach, 3 meaning |
| Love | 7 head/heart, 1 climate, 4 style | 3 meaning, 11 purpose |

The `life` arrays in `stakes.js` are not read.

## Club blend

```
0.6 × self + 0.4 × others
```

One masked voice: use the other. Both masked: the facet is missing. Missing is not 0.

`K = 3.0`, uncalibrated. Steepness `k = K × confidence`. Confidence is 1, or 0.6 for a thin file. A thin file is not pulled toward the middle. Its curve is flatter.

```
P(left)  ∝ exp(k × axis × leftValue)
P(right) ∝ exp(k × axis × −leftValue)
P(Both)  ∝ exp(−k × |axis|)     when Both is allowed
```

Normalized to sum to 1. A club missing the facet uses the mean of that swipe's probability across every club that has evidence on the facet. The same mean is used for every club missing it, so the card does not separate them.

Term = `weight × ln(P)`. Club score = sum of terms.

## One ranking

Every club in scope. Sorted by log-likelihood, then distinctiveness, then name, then slug.

Distinctiveness is the Euclidean norm of the blended z-scores on facets that have evidence. It is a tiebreak only.

Match percent = `round(exp(logLikelihood / totalWeight) × 100)`, clipped to 0–100. With no answers it is 50.

Softmax share is `exp(logLikelihood)` normalized over this same list. Close call when the leader's share is under 1.5 times the runner-up's. At exactly 1.5 it is not a close call.

There is no Life gate, no opposite-side cut, no top-3 protection, and no three-club floor. `playPool` returns the scoped list and does not remove clubs.

`nextCard` returns the first unused card in deck order.

Region rows, league rows, and colour rows keep this order and drop the clubs that are outside the filter. They do not softmax again.

The two deciding cards are the answers with the largest `(heroTerm − runnerTerm)`. Tie: lower card id.

## Roots prior

Mass, before renormalising: family 0.55, grew up 0.30, hooked 0.15. The same database slug adds its weights. Divide by the sum of those weights. A typed name is not in this map.

`P = 0.15 / N + 0.85 × mass` for a named database club. Unnamed clubs in scope get `0.15 / N`. N is the size of the scoped ranking. With no database club named, P is `1 / N` and λ is 0.

λ: Always 1, Probably 0.6, I'd drift 0.15, no database club 0.

Lean = `λ × ln(P) + logLikelihood`.

Born to = highest mass among named identities, typed included. Ties: name, then slug.

Built for = top of the swipe ranking. The prior does not move Built for.

If Born to and Built for are both in the database, the higher lean score is the one the result line names. A tie stays with Built for.

## Result copy

- No Born to: "Your FC" when the leader is clearly ahead. "Closest match" on a close call. The 80 cut is not the label.
- A clear leader: "[n] points ahead of [runner-up]."
- Same club: "Your FC, by blood and by heart".
- Two database clubs: the two cards, then "Your roots outweigh your swipes, so [club] stays home." or "Your swipes outweigh your roots, so [club] is where you fit."
- Typed Born to: "Not on our list yet" and "We can't score [club] yet, so your swipes decide."
- Close call line uses the runner-up's match percent.
- League rows, in order: England, Germany, Italy, Spain, France, Rest of the World. Rest of the World opens "Rest of Europe" and "Arab world". The row that holds the answer is highlighted. An empty filter says "None in this search".

## Save

"Save your results" opens `https://thereflectivefootball.com/signin` with a resume token. The token carries the answers, stake, scope, roots, Born to, Built for, runner-up, the league rows, match percents, and app version `0.1.0`.

After the result screen renders, the app also posts the run to `/api/crest-runs`. The server inserts one `crest_runs` row with the Supabase anon key. A failed insert is ignored. The row has no player name, email, IP, or user agent.

## Clubs

215 clubs. `division` is the league name. `region` is one of the six. Rest of the World has `subregion` "Rest of Europe" or "Arab world" (United Arab Emirates, Saudi Arabia, Egypt, Tunisia).

Families are lowercase shirt colours. White is not a family. Claret is stored as red. Aston Villa's families are red and blue.
