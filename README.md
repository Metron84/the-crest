# The Crest

Twenty swipes, then the club.

The Crest is a swipe game from The Reflective Football. You pick where to look, answer four questions about how you came to football, say what you want a club for, then swipe twenty cards. The engine names the club you were born to and the club you are built for.

## Run it

```bash
npm install
npm run dev          # http://localhost:4343
npm test             # fixed-run determinism and pole signs
npm run check        # database and engine checks
node scripts/export-clubs.mjs
node scripts/validate-clubs.mjs research/all-clubs.json
```

`scripts/export-clubs.mjs` writes `research/all-clubs.json` from the live list. The validator reports errors and warnings. New clubs must have zero errors. Existing clubs are reported and not rewritten.

## The deck

Cards stay in this order. The stake does not reorder them. `s` is the line under the question. A left swipe stores `leftValue`. A right swipe stores `-leftValue`. Both stores `0`, and only where Both is allowed.

| # | Part | Question | Explanation | Left | Right | Facet | Left stores | Both |
|---|---|---|---|---|---|---|---|---|
| 1 | Life | When you make a big decision, do you trust your gut or the numbers? | Think of a job offer, a move, or a big purchase. | My gut | The numbers | 7 Head / Heart | +1 Heart | yes |
| 2 | Life | One perfect moment, or something that lasts? | A night you'll never forget, or good years that keep going. | Perfect moment | Something that lasts | 0 Winning / Enduring | −1 Winning | yes |
| 3 | Life | Do you recharge with people, or on your own? | After a long week, what fills you back up? | With people | On my own | 2 Tight-knit / Open | +1 Open | yes |
| 4 | Life | Is your best life close to home, or out on the road? | Staying near your roots, or seeing the world. | Close to home | On the road | 8 Rooted / Global | −1 Rooted | yes |
| 5 | Life | Do you look back, or look ahead? | Which excites you more: old memories or new plans? | Look back | Look ahead | 9 Tradition / Modern | −1 Tradition | yes |
| 6 | Likes | Would you rather watch a 4-3, or a 1-0 grind? | Goals and chaos, or control and a clean sheet. | A 4-3 | A 1-0 grind | 4 Beautiful / Effective | −1 Beautiful | yes |
| 7 | Likes | Do you build things yourself, or buy them ready-made? | Furniture, a business, a team: make it or buy it? | Build it | Buy it | 6 Homegrown / Bought | −1 Homegrown | yes |
| 8 | Likes | Your weekend: a calm stroll, or a rollercoaster? | How much drama do you want in your life? | Calm stroll | Rollercoaster | 1 Calm / Intense | −1 Calm | yes |
| 9 | Likes | A trip: everything planned, or no plan at all? | A booked itinerary, or see where the day takes you. | All planned | No plan | 5 Planned / Gamble | −1 Planned | yes |
| 10 | Likes | Known by your whole street, or famous for a day? | Deep local respect, or one big moment in the spotlight. | My street | Famous for a day | 3 Belonging / Glory | −1 Belonging | yes |
| 11 | Football | Ten years safe in mid-table, or one title then relegation? | Steady survival, or one glory season and a fall. | Safe mid-table | Title, then down | 0 Winning / Enduring | +1 Enduring | no |
| 12 | Football | Last day of the season: 3-0 up by half-time, or a 94th-minute winner? | Calm control, or the heart-attack finish. | 3-0 at half-time | 94th-minute winner | 1 Calm / Intense | −1 Calm | yes |
| 13 | Football | Should your club sell out at home, or have fans in 50 countries? | A local institution, or a global brand. | Sell out at home | Fans worldwide | 8 Rooted / Global | −1 Rooted | yes |
| 14 | Football | 1-0 up with ten men. Park the bus, or go for the second? | Protect what you have, or take the risk. | Park the bus | Go for the second | 5 Planned / Gamble | −1 Planned | no |
| 15 | Football | You win either way. With flair, or with defending? | Does how you win matter, or only that you win? | With flair | With defending | 4 Beautiful / Effective | −1 Beautiful | yes |
| 16 | Football | Your club is broke. Do the fans save it, or a billionaire? | Fan ownership, or big money and big ambition. | The fans | A billionaire | 10 Local hands / Big capital | −1 Local hands | no |
| 17 | Football | Stay in the old ground, or move to a new 60,000 stadium? | History and atmosphere, or size and revenue. | Old ground | New stadium | 9 Tradition / Modern | −1 Tradition | no |
| 18 | Football | Beat your rival twice, or win a cup? | Bragging rights at home, or silverware in the cabinet. | Beat the rival | Win the cup | 3 Belonging / Glory | −1 Belonging | yes |
| 19 | Football | Five straight losses. Sack the manager, or keep faith? | Cold logic, or loyalty through a bad run. | Sack him | Keep faith | 7 Head / Heart | −1 Head | no |
| 20 | Football | A top striker once mocked your fans. Do you sign him? | Principles first, or whatever it takes to win. | Never | Sign him | 11 Stand for something / Win | −1 Stand for something | no |

Negative is the left-named pole of the facet. Positive is the right-named pole. Progress is 4 roots taps plus these 20 swipes, 24 in all.

Part weights: Life 0.7, Likes 0.75, Football 1. A facet that has two cards in the deck multiplies both of those cards by 0.7. Those facets are 0, 1, 3, 4, 5, 7, 8, and 9.

## Roots

After the scope screen, four taps:

1. Did someone hand you a club? Yes opens the club picker.
2. Is there a club from where you grew up that you still feel for? Yes opens the picker.
3. What hooked you on football first? A player, a tournament, a match you were at, or nothing in particular. A player and a match open the picker.
4. Your team loses for three seasons. Do you stay? Always, Probably, or I'd drift.

The picker is country, then division, then club, from `clubs.js`. The countries are England, Germany, Italy, Spain, France, and Rest of the World. For Rest of the World the second tap is the league. Under the picker, "Can't find it? Type it" searches every club, accent-insensitive, top 6, and offers "Use what I typed" when that text is not a club name.

Named clubs get mass: family 0.55, grew up 0.30, hooked 0.15, renormalised over the database clubs that were named. The same club named twice adds its weights, then the map is divided by the total.

`P(club | roots) = 0.15 / N + 0.85 × mass`, where N is the number of clubs in scope. With no database club named, the prior is uniform and λ is 0.

λ is 1 for Always, 0.6 for Probably, 0.15 for I'd drift, and 0 if no database club was named.

Lean score = λ × ln P(club | roots) + swipe log-likelihood.

Born to is the highest-mass named club, typed or not. Built for is the top of the swipe ranking. A typed club that is not in the database is shown as Born to and is never scored.

The stake comes after roots. It only multiplies weights. See `lib/crest/stakes.js`.

## Engine

`lib/crest/engine.js`. One ranking of every club in the chosen scope.

Blend is `0.6 × self + 0.4 × others`. If one voice is masked, use the other. If both are masked, the facet is missing. A missing facet is not zero. For that card, every club missing it gets the average probability of the swipe across clubs that have evidence on the facet.

`K` is 3.0 and uncalibrated. Steepness is `K × confidence`.

For a club at `axis` on the card's facet:

```
P(left)  ∝ exp(k × axis × leftValue)
P(right) ∝ exp(k × axis × −leftValue)
P(Both)  ∝ exp(−k × |axis|)    only if Both is allowed
```

The card's term is `weight × ln(P of the swipe)`. Weight is part weight × 0.7 if the facet has two cards × the stake coefficient. The club's score is the sum.

Match percent is the weighted geometric mean of those probabilities, `exp(sum / totalWeight)`, shown from 0 to 100. Fifty is a coin flip. With no roots, 80 or above is "Your FC". Under 80 is "Closest match".

The share used for a close call is the softmax of the log-likelihoods over the scope. It is a close call when the leader's share is under 1.5 times the runner-up's.

Sort is log-likelihood, then distinctiveness (the norm of the evidenced facet z-scores), then name, then slug. The swipe hero is the top of that list. There is no Life gate, no opposite-side cut, and no adaptive card order.

Region rows, league rows, and colour rows are filters of this same list. They are not ranked again.

The result also gets the two cards with the largest weighted log-likelihood gap between the swipe hero and the runner-up. A tie breaks by card id.

Scope is a hard filter on `region`: England, Germany, Italy, Spain, France, Rest of the World, or everywhere.

## Result screen

- Same Born to and Built for: one card, "Your FC, by blood and by heart", with match percent.
- They differ: "Born to" and "Built for" side by side, then either "Your roots outweigh your swipes, so [club] stays home." or "Your swipes outweigh your roots, so [club] is where you fit." The lean score picks the line. A tie stays with the swipes.
- Born to is typed and not in the database: "Not on our list yet", and "We can't score [club] yet, so your swipes decide."
- No roots: "Your FC" at 80% or above, otherwise "Closest match".
- Close call: "Close call: [runner-up] is right behind at [x]%." The percent is the match percent.
- Under that, "What decided it over [runner-up]" with the two deciding cards, the question and the answer.
- "Your club in every league": England, Germany, Italy, Spain, France, Rest of the World. Each row is the top club from the same ranking, with match percent. Rest of the World opens Rest of Europe and Arab world. The row that holds the answer is highlighted.

Save your results sends Born to, Built for, every league row, and the match percents to My Program. That is the sign-in handoff in `lib/crest/signup.js` and `lib/crest/resume.js`: `https://thereflectivefootball.com/signin` with a resume token.

After the result screen renders, `/api/crest-runs` inserts one row into Supabase `crest_runs`. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the server environment. Do not use the service key, and do not prefix either name with `NEXT_PUBLIC`. A failed insert is ignored. The row stores the run, not a name, email, IP, or user agent.

Starting again clears answers, stake, scope, roots, and card order, including `crest:*` keys in localStorage and sessionStorage. The swipe hint is left alone. Nothing in the quiz reads a stored scope.

## Club data

215 clubs in `lib/crest/clubs.js`. Each record carries:

`slug`, `name`, `league`, `division` (the same league name), `country`, `region`, `city`, `stadium`, `founded`, `colours`, `families`, `color`, `confidence`, `self`, `selfMask`, `others`, `othersMask`, `selfLine`, `othersLine`.

`arabicLine` is kept when the research had one. Evidence notes and sources are not shipped.

`region` is England, Germany, Italy, Spain, France, or Rest of the World. Inside Rest of the World, `subregion` is "Rest of Europe" or "Arab world".

The twelve numbers run from −1 to +1 on the steps −1, −0.6, −0.3, 0, 0.3, 0.6, 1. Order: winning vs enduring, calm vs intense, tight-knit vs open, belonging vs glory, beautiful vs effective, planned vs gamble, homegrown vs bought, head vs heart, rooted vs global, tradition vs modern, local hands vs big capital, stand for something vs win.

`self` is the club's own voice. `others` is how the game sees it. A false mask means that voice has no evidence. `confidence` is 1, or 0.6 for a thin file. `color` is a display hint, not an official brand hex. Families are shirt colours, lowercase, never white. Claret is stored as red. Aston Villa's families are red and blue.

Older records also keep `competition`, `home`, `colourFamilies`, and `group`. They match `league`, `stadium`, and `families`.
