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

`lib/crest/cards.js` holds the deck. Part 1 (7 personality cards, weight 0.5) comes in a fixed order. Parts 2 (likes and dislikes, weight 0.75) and 3 (football situations, weight 1) are adaptive: the engine picks the unused card that best separates your six closest clubs.

### Scoring

`lib/crest/engine.js`:

- `userVector(answers)`: weighted mean of your swipes per facet.
- `rankClubs(answers, alpha, { group })`: score is the weighted mean of `1 - |you - club| / 2` over answered facets, pulled slightly toward neutral for low-confidence clubs. `group` limits the field to England, Germany, France, Spain or Rest of the World.
- `nextCard(answers, alpha, { group })`: the next card to show.
- `arrivalSummary(answers, alpha, { group })`: the winning club, the two facets you share most closely and the one where you differ most.

### Database

184 clubs: England 64 (including Cardiff), Germany 36, France 21, Spain 25, Rest of the World 38 (Italy, Netherlands, Scotland, Greece, Croatia, Czechia, Turkey). Vectors were scored from dual-voice research files, one club at a time, and checked for scale, pole caps, self/others separation, near-duplicates and behaviour on fixed test hands. Do not hand-edit vectors; re-score from the files.

`founded` is null where the file did not carry it. `color` is a display hint derived from the named colours, not an official brand hex.

## UI

`components/crest/`:

- `CrestSwipe.js`: scope picker, play screen, progress, tab bar.
- `SwipeCard.js`: the draggable card. Drag, tap a side, or use the arrow keys.
- `CrestArrival.js`: your club, both lines, shared facets, the rub, the clubs close behind, and the closest club in each league.

Cards currently use typographic placeholder artwork. Each card is meant to carry its own still.

## Brand

Cream `#F2EDE4`, navy `#0A111F`, signal red `#D8232A`. Bodoni Moda for display, Archivo for UI. Dark, footage-led, editorial.

Football is nothing without the fans.
