# The Crest

Ten swipes, then the club.

The Crest is a swipe game from The Reflective Football. You pick where to look, answer four questions about how you came to football, say what you want a club for, then swipe ten cards. The engine names the club you were born to and the club you are built for.

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

Five decks of ten cards. Three ask about the footballer, three about the manager, two about the chairman, and two about the people who make the club. The want chooses the deck. A left swipe stores `leftValue`. A right swipe stores the opposite. Both stores 0, and only where the card allows it. The cards are in `lib/crest/cards.js`.

Progress is 4 roots taps plus these 10 swipes, 14 in all.

## Roots

After the scope screen, four taps:

1. Did someone hand you a club? Yes opens the club picker.
2. Is there a club from where you grew up that you still feel for? Yes opens the picker.
3. What hooked you on football first? A player, a tournament, a match you were at, or nothing in particular. A player and a match open the picker.
4. Your team loses for three seasons. Do you stay? Always, Probably, or I'd drift.

The picker is country, then division, then club, from `clubs.js`. The countries are England, Germany, Italy, Spain, France, and Rest of the World. For Rest of the World the second tap is the league. Under the picker, "Can't find it? Type it" searches every club, accent-insensitive, top 6, and offers "Use what I typed" when that text is not a club name.

Named clubs get mass: family 0.55, grew up 0.30, hooked 0.15, renormalised over the database clubs that were named.

Born to is the highest-mass named club, typed or not. Built for is the top of the suit ranking inside the want. A typed club that is not in the database is shown as Born to and is never scored. If Born to is outside the want, the swipes decide.

The want comes after roots. It chooses the deck and the pool. See `lib/crest/stakes.js`.

## Engine

`lib/crest/engine.js`. One ranking of the clubs in the want, inside the chosen scope.

The result blend is `0.5 × self + 0.5 × others`. One voice, if the other is missing. A missing trait drops out.

```
suit = mean of (1 - |swipe - place| / 2)
```

Match percent is that mean times 100. Fifty is the middle of a trait against a pole, or no answers. A clear leader, 3 points or more ahead, is "Your FC". Under 3 points is "Closest match".

Sort is suit, then the closest single trait, then name, then slug.

Scope is a hard filter on `region`: England, Germany, Italy, Spain, France, Rest of the World, or everywhere.

## Result screen

- Same Born to and Built for: one card, "Your FC, by blood and by heart", with match percent.
- They differ, and Born to is in the want: "Born to" and "Built for" side by side, then either "Your roots outweigh your swipes, so [club] stays home." or "Your swipes outweigh your roots, so [club] is where you fit."
- Born to is outside the want: "[club] sits outside this want, so your swipes decide."
- Born to is typed and not in the database: "Not on our list yet", and "We can't score [club] yet, so your swipes decide."
- No roots: "Your FC" when the leader is clearly ahead, "Closest match" on a close call. The gap line says how many points of agreement separate them.
- "Your club in every league": England, Spain, Italy, Germany, France, then Rest of the World. Under each heading, each league shows its top club in the want and that club's percentage. Rest of the World still lists its leagues. Wales stays in England. Monaco stays in France. The row that holds the answer is highlighted.

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
