# The Crest: refine the questions, the weights, and the math

You are working for Wajed on The Crest, also called Find Your FC. It is a twenty-swipe quiz. It names the football club a person belongs with. It is a likelihood match, not a personality average and not a vibe.

You have a database of philosophers that Wajed built. Use it. Do not answer from general knowledge of philosophy when that database has a record. For every question you keep or rewrite, name the database records you used. If a distinction in that database does not separate real clubs, do not turn it into a card.

## Your job

Return four things, in this order.

1. A revised set of identity traits, grouped as Heart, Mind, and Soul. Keep a trait only if clubs actually sit in different places on it. Add what is missing. Say what each new trait must not be confused with.
2. Twenty questions a person can answer about themselves. Each question maps to one trait. The wording should come from the philosopher database, then be said in plain speech a fan would swipe.
3. A weight for every question, with the formula, and why that question is allowed to count more or less than the others.
4. The math, including one worked numeric example with two real clubs. Show how one swipe moves one club ahead of another.

Stay inside the engine below unless you are changing it on purpose. If you change it, say what you changed and what evidence would justify it.

## What the quiz is

The person does this, in order.

1. Scope. Everywhere, or one of England, Germany, Italy, Spain, France, Rest of the World. Scope is a hard filter. A club outside it cannot win.
2. Roots. Family, where they grew up, where they got hooked. This is a prior. It does not replace the swipes.
3. One stake. What they want from a club: Belonging, Winning, Belonging and winning, Fame and fortune, Fortune, or Love. The stake multiplies weights. It does not reorder the cards.
4. Twenty swipes, fixed order.
5. A result: the club, then one club in each big-five league.

There are 215 clubs. Each club has twelve traits, each scored from −1 to +1, in two voices: how the club sees itself, and how others see it. Some voices are missing. A missing trait is not zero.

Negative is the left pole. Positive is the right pole.

The blend on a trait is `0.6 × self + 0.4 × others`. If only one voice exists, use that voice. If both are missing, the trait is missing for that club.

## Heart, Mind, Soul as they stand

These twelve traits are the live model. Facets 0, 3, 8, and 11 move together across the database. They stay separate. Do not merge them to tidy the math.

### Heart

| Index | Left −1 | Right +1 | What it is asking |
|---|---|---|---|
| 0 | Winning | Enduring | A peak, or a life that keeps going |
| 1 | Calm | Intense | Quiet control, or a match that never sits down |
| 2 | Tight-knit | Open | A closed room, or a club that lets people in |
| 3 | Belonging | Glory | My people, or the prize |

### Mind

| Index | Left −1 | Right +1 | What it is asking |
|---|---|---|---|
| 4 | Beautiful | Effective | How you play, or that you win |
| 5 | Planned | Gamble | Protect it, or risk it |
| 6 | Homegrown | Bought | Build it, or buy it |
| 7 | Head | Heart | The numbers, or the gut |

### Soul

| Index | Left −1 | Right +1 | What it is asking |
|---|---|---|---|
| 8 | Rooted | Global | One place, or the world |
| 9 | Tradition | Modern | The old ground, or the new plan |
| 10 | Local hands | Big capital | The fans own it, or big money owns it |
| 11 | Stand for something | Win | Principles, or whatever it takes |

## The twenty questions

Part weights today: Life 0.7, Likes 0.75, Football 1.

If two cards ask the same trait, each of those cards is multiplied by 0.7. A trait asked once keeps the full part weight.

`weight = partWeight × (0.7 if this trait has two cards, else 1) × stakeCoefficient`

Stake coefficients are only 2, 1.4, or 1. Nothing is zeroed. With no stake, every coefficient is 1.

| Stake | ×2 | ×1.4 |
|---|---|---|
| Belonging | meaning 3, openness 2, reach 8 | time 9, power 10, purpose 11 |
| Winning | winning 0, purpose 11 | meaning 3, style 4 |
| Belonging and winning | winning 0, meaning 3, purpose 11 | openness 2, reach 8 |
| Fame and fortune | reach 8, power 10, meaning 3 | talent 6, purpose 11 |
| Fortune | power 10, talent 6 | winning 0, reach 8, meaning 3 |
| Love | head/heart 7, climate 1, style 4 | meaning 3, purpose 11 |

`leftValue` is what a left swipe stores. A right swipe stores the opposite. Both stores 0, and only when Both is allowed.

| Id | Part | Question | Line under it | Left | Right | Trait | leftValue | Both |
|---|---|---|---|---|---|---|---|---|
| 1 | Life | When you make a big decision, do you trust your gut or the numbers? | Think of a job offer, a move, or a big purchase. | My gut | The numbers | 7 | +1 | yes |
| 2 | Life | One perfect moment, or something that lasts? | A night you'll never forget, or good years that keep going. | Perfect moment | Something that lasts | 0 | −1 | yes |
| 3 | Life | Do you recharge with people, or on your own? | After a long week, what fills you back up? | With people | On my own | 2 | +1 | yes |
| 4 | Life | Is your best life close to home, or out on the road? | Staying near your roots, or seeing the world. | Close to home | On the road | 8 | −1 | yes |
| 5 | Life | Do you look back, or look ahead? | Which excites you more: old memories or new plans? | Look back | Look ahead | 9 | −1 | yes |
| 6 | Likes | Would you rather watch a 4-3, or a 1-0 grind? | Goals and chaos, or control and a clean sheet. | A 4-3 | A 1-0 grind | 4 | −1 | yes |
| 7 | Likes | Do you build things yourself, or buy them ready-made? | Furniture, a business, a team: make it or buy it? | Build it | Buy it | 6 | −1 | yes |
| 8 | Likes | What kind of match do you want? | A quiet game you can sit through, or one that never lets you sit down. | A calm one | A rollercoaster | 1 | −1 | yes |
| 9 | Likes | A trip: everything planned, or no plan at all? | A booked itinerary, or see where the day takes you. | All planned | No plan | 5 | −1 | yes |
| 10 | Likes | Known by your whole street, or famous for a day? | Deep local respect, or one big moment in the spotlight. | My street | Famous for a day | 3 | −1 | yes |
| 11 | Football | Ten years safe in mid-table, or one title then relegation? | Steady survival, or one glory season and a fall. | Safe mid-table | Title, then down | 0 | +1 | no |
| 12 | Football | Last day of the season: 3-0 up by half-time, or a 94th-minute winner? | Calm control, or the heart-attack finish. | 3-0 at half-time | 94th-minute winner | 1 | −1 | yes |
| 13 | Football | Should your club sell out at home, or have fans in 50 countries? | A local institution, or a global brand. | Sell out at home | Fans worldwide | 8 | −1 | yes |
| 14 | Football | 1-0 up with ten men. Park the bus, or go for the second? | Protect what you have, or take the risk. | Park the bus | Go for the second | 5 | −1 | no |
| 15 | Football | You win either way. With flair, or with defending? | Does how you win matter, or only that you win? | With flair | With defending | 4 | −1 | yes |
| 16 | Football | Your club is broke. Do the fans save it, or a billionaire? | Fan ownership, or big money and big ambition. | The fans | A billionaire | 10 | −1 | no |
| 17 | Football | Stay in the old ground, or move to a new 60,000 stadium? | History and atmosphere, or size and revenue. | Old ground | New stadium | 9 | −1 | no |
| 18 | Football | Beat your rival twice, or win a cup? | Bragging rights at home, or silverware in the cabinet. | Beat the rival | Win the cup | 3 | −1 | yes |
| 19 | Football | Five straight losses. Sack the manager, or keep faith? | Cold logic, or loyalty through a bad run. | Sack him | Keep faith | 7 | −1 | no |
| 20 | Football | A top striker once mocked your fans. Do you sign him? | Principles first, or whatever it takes to win. | Never | Sign him | 11 | −1 | no |

Cards 1, 3, and 11 are the ones whose left label is the right-named pole, so a left swipe stores +1.

## Which questions actually name a club

A question has identity value when two things are true: the clubs disagree on that trait, and the question is allowed to count. The score below is how far a left swipe and a right swipe spread the 215 clubs, averaged, then scaled so the strongest question is 100. No stake is selected. This is evidence from the live club file, not a guess.

| Rank | Card | Question | Score |
|---|---|---|---|
| 1 | 16 | Fans, or a billionaire? | 100 |
| 2 | 20 | Sign the striker who mocked the fans? | 95 |
| 3 | 11 | Ten years safe, or one title then down? | 80 |
| 4 | 13 | Sell out at home, or fans worldwide? | 73 |
| 5 | 18 | Beat the rival, or win the cup? | 65 |
| 6 | 17 | Old ground, or a new stadium? | 65 |
| 7 | 19 | Sack him, or keep faith? | 56 |
| 8 | 14 | Park the bus, or go for the second? | 55 |
| 9 | 2 | One perfect moment, or something that lasts? | 55 |
| 10 | 7 | Build it, or buy it? | 53 |
| 11 | 4 | Close to home, or on the road? | 51 |
| 12 | 12 | 3-0 at half-time, or a 94th-minute winner? | 50 |
| 13 | 10 | Known by your street, or famous for a day? | 49 |
| 14 | 3 | Recharge with people, or on your own? | 47 |
| 15 | 15 | Win with flair, or with defending? | 45 |
| 16 | 5 | Look back, or look ahead? | 44 |
| 17 | 9 | All planned, or no plan? | 40 |
| 18 | 1 | Gut, or the numbers? | 38 |
| 19 | 8 | A calm match, or a rollercoaster? | 38 |
| 20 | 6 | A 4-3, or a 1-0 grind? | 34 |

Football counts more than life. A trait asked once counts more than a trait asked twice, because the two cards share it. Cards 6 and 8 are the light copy of traits that football asks again. They are the first cards to replace if you need the slots.

If the person taps Belonging, place, people, and meaning double. Card 13 then becomes the strongest question. That does not make card 13 a good question. It makes a muddy trait louder.

## The gap you must close

The founder’s point: apply the logic of the clubs. Some clubs are a commercial product. Some are not. Some clubs ask the person to suffer. Some do not. The current deck mixes those with other traits.

### Commercialization is not “global”

Card 13 asks where the people are: one ground, or fans in fifty countries. That is reach, trait 8. It is not whether the club is a product.

Card 16 asks who owns it: the fans, or a billionaire. That is power, trait 10. It is the strongest card in the deck. It is still not the whole of commercialization. Commercialization is the shirt, the sponsor’s name on the ground, the tour, the fan treated as a customer.

These are three different answers. Keep them separate.

Blended scores from the live file, `0.6 × self + 0.4 × others`. Reach: −1 rooted, +1 global. Power: −1 local hands, +1 big capital.

| Club | Reach | Power | What the file is saying |
|---|---|---|---|
| Manchester City | +0.42 | +0.76 | A resourced project. Others call it modern football’s most resourced English club. |
| Real Madrid | +0.76 | +0.22 | Global, and a winning machine. The club’s own voice does not sit at the far end of big capital. Others do. |
| Athletic Club | −0.48 | −0.48 | Elite, local, only their own. Talent is −1 on both voices. |
| AFC Wimbledon | −0.48 | −0.84 | Supporters rebuilt what relocation tried to erase. |
| FC St. Pauli | −0.12 | −0.84 | The club says one neighbourhood. Others say the world knows the skull. Power stays with the people. The reach score falls in the middle, which is the misread. |
| Sunderland | −0.30 | +0.60 | A city’s pain became its power. The ownership number is commercial. The pain is not in that number. |

St. Pauli is the proof that “fans worldwide” is the wrong question for commercialization. The world adopted them. They did not become a product. A global swipe pulls them toward the middle. A commercialization swipe should put them with Wimbledon, far from City.

Madrid and City must not share a commercial score just because both are global.

### Suffering is not “something that lasts”

Trait 0, Enduring, is a life that keeps going: ten years safe in mid-table, good years. That is stability.

Card 19, keep faith, is loyalty to one manager through five losses. That is a short bad run.

Suffering is how much losing, waiting, and humiliation is part of belonging. One end: I go while it hurts. The other: I need it to be worth going. Sunderland’s file says the pain became the power, and no trait holds that number. Wimbledon were erased and rebuilt. St. Pauli will accept the second division to stay who they are. City is built so the suffering stops.

Chosen hardship is not the same as a club whose story is the wait. Athletic choosing only their own is a rule. Sunderland’s years of nothing are a price. Do not give those the same resiliency score.

## The math you must keep, unless you replace it in the open

Steepness `k = 3.0 × confidence`. Confidence is 1, or 0.6 when the file is thin. `K = 3.0` is uncalibrated. A thin file is not pulled to the middle. Its curve is flatter.

For a club’s position `axis` on the card’s trait:

```
P(left)  ∝ exp(k × axis × leftValue)
P(right) ∝ exp(k × axis × −leftValue)
P(Both)  ∝ exp(−k × |axis|)    only when Both is allowed
```

Those three, or two, are normalized to sum to 1.

If the club is missing the trait, use the mean probability of that swipe across every club that has evidence. The same mean is used for every club missing it, so the card does not separate them.

One answer’s contribution:

```
term = weight × ln(P)
```

The club’s swipe score is the sum of the terms. One strong miss costs more than being mildly right on everything. Do not replace this with a mean of the twelve traits.

Sort every club in scope by that sum, then by distinctiveness, then by name, then by slug. Distinctiveness is the size of the club’s z-score vector. It breaks ties only. It does not pick the club.

Match percent = `round(exp(score / totalWeight) × 100)`, clipped to 0–100. With no answers it is 50.

There is one ranking. League rows are a filter of that ranking, not a second ranking. The leagues on the result are Premier League, Championship, League 1, League 2, Ligue 1, Ligue 2, Bundesliga, Bundesliga 2, Serie A, Serie B, LaLiga, LaLiga 2. League 2 has no clubs yet.

Roots, if you need them: family 0.55, grew up 0.30, hooked 0.15, renormalised over named database clubs. `P = 0.15 / N + 0.85 × mass`. λ is 1 Always, 0.6 Probably, 0.15 I'd drift, and 0 if no database club was named. Lean = `λ × ln(P) + swipe score`. Born to is the highest-mass named club. Built for is the swipe winner. The prior does not move Built for.

No randomness. No Life gate. No cutting clubs for answering the “wrong” side.

## How to do the work

1. Read the philosopher database for distinctions that map onto Heart, Mind, and Soul as a person belonging to a club. Cite the records.
2. Write the two missing traits in one sentence each.
   - Commercialization: the club is a product, or the club is the people. It is not reach. It is not who signs the cheque.
   - Resiliency: how much pain is in the price of belonging. It is not a stable mid-table life. It is not five games of faith in a manager.
3. Place a pilot of clubs on those two traits before you trust the question. Use at least Manchester City, Real Madrid, Athletic Club, AFC Wimbledon, FC St. Pauli, Sunderland, and one fallen big club. Give each a score from −1 to +1 and one line of evidence. If you cannot separate City from Madrid, or St. Pauli from a global brand, the trait is not ready.
4. Rewrite the deck to twenty questions. Prefer replacing cards 6 and 8 if you need room. You may rewrite others. Do not add a twenty-first card unless you name which card it replaces.
5. Give every question its weight under the formula, with no stake and under Belonging. Say which questions should count more because the clubs disagree there.
6. Do the math on paper for one swipe. Pick the new commercialization question or the new resiliency question. Use two of the pilot clubs, a real axis for each, `k = 3`, and a weight you chose. Show `P`, `ln(P)`, the term, and which club moves ahead.
7. Say what still has to be scored on the other clubs before the card can go into the live file. Do not invent those 215 scores in this pass.

## What to return

Use these headings.

### Traits

A table: group, name, left pole, right pole, one sentence, what it must not be confused with, kept or new.

### Questions

A table of twenty rows: id, Heart or Mind or Soul, trait, question, line under it, left label, right label, Both allowed or not, part, weight with no stake, weight if the person chose Belonging, which current card it keeps or replaces, philosopher records used.

The question is one sentence. The line under it is one sentence. The labels are short enough to sit on a swipe button.

### Weights

The formula. Then a short note on any weight you changed, and why the clubs justify it.

### Math

The formulas. Then the worked example with the two clubs and the arithmetic written out.

### Club pilot

The pilot table for commercialization and resiliency only. Scores and one line each. Mark any score you are unsure of.

### Do not ship yet

The list of club scores that still have to be written before these cards are live.

## Rules for your answer

- Use the philosopher database. Cite it. Do not decorate a football question with a philosopher who does not change the distinction.
- A question tests the person. The club file is what makes that answer point at a club. Write the question only after you can say where the pilot clubs sit.
- Plain speech. No jargon on the card. The philosophy stays in your notes, not on the button.
- Do not collapse commercialization into global, ownership, or a new stadium.
- Do not collapse resiliency into enduring, intensity, or keeping the manager.
- Do not turn the quiz into an average of traits.
- Do not add randomness.
- If the database has nothing on a trait, say so, and write the question from the club evidence instead of inventing a citation.
