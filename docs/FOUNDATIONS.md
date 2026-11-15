# Foundations

The result screen says which of the ten foundations a fan and Your FC share most, for example "You and Arsenal are matched on Trust and Love." The ten come from the thinkers database: Truth, Understanding, Authenticity, Justice, Clear Communication, Love, Goodness, Trust, Respect, Peace.

## It explains, it does not rank

- The ranking is unchanged (`engine.js`).
- Foundations were tested as the score on 15 November 2026 and lost accuracy: a fan who swipes the way a club would found that club first 22% of the time on foundations alone, against 59% on the current engine (10 cards, no noise). Half and half reached 49%.
- So the line is worked out from the same swipes after the ranking, and can never contradict it.

## How it is worked out (`lib/crest/foundations.js`)

- Each of the twelve facets has two poles, and each pole leans toward one foundation (`POLE_FOUNDATION`).
- A swipe pushes weight onto the foundation of the pole it chose. A club's agreed position on each facet does the same, scaled by how far it sits toward the pole. Contested and missing facets are left out.
- Both profiles are scaled to sum to 1. The line names the two foundations with the largest shared share.

## The pole map (editorial; change it here and every club follows)

| Facet | Left pole | Right pole |
|---|---|---|
| Winning / Enduring | Truth | Trust |
| Calm / Intense | Peace | Love |
| Tight-knit / Open | Trust | Respect |
| Belonging / Glory | Love | Truth |
| Beautiful / Effective | Goodness | Truth |
| Planned / Gamble | Understanding | Authenticity |
| Homegrown / Bought | Trust | Understanding |
| Head / Heart | Understanding | Love |
| Rooted / Global | Authenticity | Clear Communication |
| Tradition / Modern | Respect | Understanding |
| Local hands / Big capital | Justice | Truth |
| Stand for something / Win | Justice | Truth |
