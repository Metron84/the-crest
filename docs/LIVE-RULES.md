# Live rules

What the engine and the quiz do now. `lib/crest/engine.js`, `cards.js`, `stakes.js`, `roots.js`, `outcome.js`, `clubs.js`.

## Flow

1. Scope. Everywhere, or one region: England, Germany, Italy, Spain, France, Rest of the World. This is a hard filter. A club outside it cannot win.
2. Roots. Four taps. See below.
3. Want. One of Belonging, Love, Winning, Belonging and love, Love and winning. The want chooses the deck and the club pool. It does not multiply weights.
4. Ten swipes, in that deck's order.
5. Reveal, then the result screen.

A new run sets answers, stake, roots, and card order back to empty, and scope back to everywhere when the player restarts. `clearCrestRunStorage` removes every `crest:*` key in localStorage and sessionStorage except the swipe hint `crest:hintSeen`. The quiz does not read a stored scope.

Progress is 4 roots taps + 10 swipes = 14.

A stored stake of `belonging_winning`, `fame_fortune`, or `fortune` is not a want. That run returns to the want menu.

## Deck

Five decks of ten cards. Three are about the footballer's temperament and mindset. Three are about the manager's. Two are about the chairman. Two are about belonging to the people who make the club. The want picks the deck. A left swipe stores `leftValue`. A right swipe stores `-leftValue`. Both stores 0, and only where the card allows it. Each card is one trait the club file already scores, read 50/50 from the two voices.

The decks live in `lib/crest/cards.js`. Belonging is ids 1 to 10, Love 11 to 20, Winning 21 to 30, Belonging and love 31 to 40, Love and winning 41 to 50.

## Score

The club's place on a trait is `0.5 × self + 0.5 × others`. One voice, if the other is missing. Both missing, and the trait drops out. Missing is not 0.

```
suit = mean of (1 - |swipe - place| / 2)
```

The percentage is that mean times 100, rounded. Same place is 100. Opposite poles is 0. No answers is 50.

The ranking is the clubs in the want's pool, inside the chosen scope. Sorted by suit, then the closest single trait, then name, then slug.

A close call is a gap of fewer than 3 points. At 3 points it is not a close call.

There is no card weight, no stake coefficient, and no steepness. `nextCard` walks the want's deck.

The two deciding cards are the answers with the largest suit gap. Tie: lower card id.

## Roots prior

Mass, before renormalising: family 0.55, grew up 0.30, hooked 0.15. The same database slug adds its weights. Divide by the sum of those weights. A typed name is not in this map.

Born to = highest mass among named identities, typed included. Ties: name, then slug.

Built for = top of the suit ranking. The prior does not move Built for.

If Born to is outside the want's pool, the line says the swipes decide. If both clubs are in the pool, the higher suit is the one the result line names. A tie stays with Built for.


## Result copy

- No Born to: "Your FC" when the leader is clearly ahead. "Closest match" on a close call. The 80 cut is not the label.
- A clear leader: "[n] points ahead of [runner-up]."
- Same club: "Your FC, by blood and by heart".
- Two database clubs in the pool: the two cards, then "Your roots outweigh your swipes, so [club] stays home." or "Your swipes outweigh your roots, so [club] is where you fit."
- Born to outside the want: "[club] sits outside this want, so your swipes decide."
- Typed Born to: "Not on our list yet" and "We can't score [club] yet, so your swipes decide."
- Close call line uses the runner-up's match percent.
- League list: England, Spain, Italy, Germany, France, then Rest of the World. Each heading shows that place's leagues, with the top club in the want's pool and that club's suit percentage. A league with nobody in the pool is omitted. Wales stays under England. Monaco stays under France. The winner's row is highlighted.

## Save

"Save your results" opens `https://thereflectivefootball.com/signin` with a resume token. The token carries the answers, stake, scope, roots, Born to, Built for, runner-up, the league rows, match percents, and app version `0.1.0`.

After the result screen renders, the app also posts the run to `/api/crest-runs`. The server inserts one `crest_runs` row with the Supabase anon key. A failed insert is ignored. The row has no player name, email, IP, or user agent.

## Clubs

215 clubs. `division` is the league name. `region` is one of the six. Rest of the World has `subregion` "Rest of Europe" or "Arab world" (United Arab Emirates, Saudi Arabia, Egypt, Tunisia).

Families are lowercase shirt colours. White is not a family. Claret is stored as red. Aston Villa's families are red and blue.
