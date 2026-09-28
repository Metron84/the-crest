# The Crest

Twenty swipes. One club.

The Crest is a swipe game from The Reflective Football. You answer twenty cards about yourself, your tastes and how you would run a football club, and it finds the club that sounds like you. This repo holds the scoring engine, the 184-club database and the swipe UI.

## Run it

```bash
npm install
npm run dev      # http://localhost:4343
npm run check    # database and engine sanity checks
npm run build
```

## How it works

### Twelve facets

Every club sits on twelve facets, grouped into Heart, Mind and Soul (`lib/crest/facets.js`). Each facet runs from a left pole (-1) to a right pole (+1):

| # | Facet | Left | Right |
|---|---|---|---|
| 0 | Winning or enduring | Winning | Enduring |
| 1 | Emotional climate | Calm | Intense |
| 2 | Openness | Tight-knit | Open |
| 3 | What gives it meaning | Belonging | Glory |
| 4 | Style | Beautiful | Effective |
| 5 | Risk | Planned | Gamble |
| 6 | Talent | Homegrown | Bought |
| 7 | Philosophy | Head | Heart |
| 8 | Reach | Rooted | Global |
| 9 | Time | Tradition | Modern |
| 10 | Power | Local hands | Big capital |
| 11 | Purpose | Stand for something | Win |

### Two voices per club

Each club has two vectors (`lib/crest/clubs.js`):

- `self`: how the club describes itself, scored only from the club's own voice in the research file.
- `others`: how the game sees it, scored only from outside voices.

Values use a seven-step scale: -1, -0.6, -0.3, 0, 0.3, 0.6, 1. A club may hold at most five outright poles (±1) per vector. The engine blends the voices as `0.6 * self + 0.4 * others`. Where a file carried no evidence for one voice on a facet (`selfMask` / `othersMask` false), the other voice is used alone.

Each club also carries `confidence` (1.0 for a full research file, 0.6 for thin files under 3 KB or files with no self voice), both one-line summaries, and `flags`:

- `narrow-gap`: self and others differ on fewer than two facets (Stevenage, Sunderland, Napoli, Udinese, PSV).
- `no-self-evidence`: the self vector is placeholder zeros; the engine uses others alone.
- `lines-pending`: the two lines need a human (Napoli, whose file lines were wrong).

Per-facet evidence notes for every club live in `data/crest/club-notes.json`.

### Twenty cards

`lib/crest/cards.js` holds the deck. Part 1 (7 personality cards, weight 0.5) comes in a fixed order. Parts 2 (likes and dislikes, weight 0.75) and 3 (football situations, weight 1) are adaptive: the engine picks the unused card with the highest expected information gain over the club probabilities.

There is no colour question in the flow. Colour is an output on the result screen.

### Scoring

`lib/crest/engine.js` treats each swipe as evidence, not as a term in an average. A club's score is the log-likelihood of the answers given that club's blended values. A club sitting strongly on the wrong side of one answer pays for it. A club sitting mildly on the right side of everything does not win by default. Thin-file clubs (confidence 0.6) get a flatter likelihood rather than values pulled toward zero.

- `rankClubs(answers, alpha, { group, colour })`: most likely first. `probability` is the softmax over the pool. `colour` filters the pool to that family (used when you tap a colour row).
- `nextCard(answers, alpha, { group })`: the next card to show.
- `arrivalSummary`: the top club, whether it is clearly ahead (1.5 times the runner-up), the two answers that counted most for it, and the one that counted most against it.
- `colourMap`: three closest clubs per colour family, for the result screen. White is not a family.
- `buildReport` in `lib/crest/report.js`: names why the top club won. Shared and The rub come from the engine flags. Italy is its own group.

`npm run check` runs the rule checks and a recovery test: 30 simulated fans per club answering from that club's own vector plus noise.

### Database

184 clubs: England 64 (including Cardiff), Germany 36, Italy 26, Spain 25, France 21, Rest of the World 12 (Netherlands, Scotland, Greece, Croatia, Czechia, Turkey). Vectors were scored from dual-voice research files, one club at a time, and checked for scale, pole caps, self/others separation, near-duplicates and behaviour on fixed test hands. Do not hand-edit vectors; re-score from the files.

`founded` is null where the file did not carry it. `color` is a display hint derived from the named colours, not an official brand hex.

## UI

`components/crest/`:

- `CrestHome.js`: opening screen, sample card, and the league bottom sheet.
- `CrestSwipe.js`: play screen, progress, and the journey between home, cards, arrival and report.
- `SwipeCard.js`: the draggable card. Drag, tap a side, or use the arrow keys.
- `CrestArrival.js`: your club (or "you sit between X and Y"), both lines, shared answers, the rub, a colour map you can tap to re-rank, and a door into the report.
- `CrestReport.js`: why this club, Heart/Mind/Soul tracks, two voices, leagues, and close behind.

Cards currently use typographic placeholder artwork. Each card is meant to carry its own still.

## Brand

Cream `#F2EDE4`, navy `#0A111F`, signal red `#D8232A`. Bodoni Moda for display, Archivo for UI. Dark, footage-led, editorial.

Football is nothing without the fans.
