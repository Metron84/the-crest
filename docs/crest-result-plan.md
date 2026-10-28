# Crest result plan

What to change, and make live. The ranking math stays. Written 28 October 2026 from a run of the live scorer.

## The problem

The number on the result is not confidence. It is how often that club would have made the same swipes.

```
match percent = round(exp(logLikelihood / totalWeight) × 100)
```

50 means a coin flip. 100 means every swipe was the one that club would make. With no answers it is 50.

On 200 ordinary answer sheets, the best club landed at a median of 44. 178 of the 200 were 50 or under. The highest was 61. Answering every card to the same side reached about 59. Answering Both on the cards that allow it pulled the best club toward 33.

Copying a real club's own answers, the typical score was 74. Only 37 of the 215 clubs can reach 80 that way. The maximum was 91.

The result still says "Your FC" only at 80, in `CrestArrival` and in `shareKicker`. Almost every real run is labelled "Closest match".

Clubs sit near the middle. Half of all blended trait values are only 0.30 from the centre. Most cards allow Both, so the odds split three ways. One disagreement pulls the geometric mean down, which is what the formula is for. Raising or lowering `K` does not turn a normal sheet into an 80. A steeper curve helps a perfect copy and punishes a normal person. A flatter curve pulls everyone back to a coin flip.

The reveal and the share card show a second number, the softmax share across every club in scope (`roomPercent`). On those same 200 sheets the leader's share had a median of 16. That number and the match percent must not be treated as the same thing.

## Do not change

- The log-likelihood ranking, the blend, `K`, the weights, the stakes, and the tie breaks.
- Roots, scope, and the league list.
- Commercialization and resiliency. They do not lift a 44 into the 80s. Dropping the 4–3 and the rollercoaster moves a typical best club from about 45 to about 46.

## Make live

### 1. The label follows the gap

"Your FC" when the leader is clearly ahead. "Closest match" only on a close call.

A close call is already defined. The leader's softmax share is under 1.5 times the runner-up. At exactly 1.5 it is not a close call. `outcome.closeCall` and `CONFIDENT_RATIO` already implement this.

Stop using `CONFIDENT_ROOM_PCT` (80) for the label. The places that still do:

- `components/crest/CrestArrival.js`, the no-roots card. It sets "Your FC" when `built.percentage >= 80`.
- `lib/crest/shareCard.js`, `shareKicker`. It returns "Closest match" when the percent is under 80.
- `lib/crest/results.js`, `regionLabel`, same 80 cut. Only if that helper is still on a screen.

Born-to and Built-for copy stays as it is. Same club stays "Your FC, by blood and by heart".

### 2. Lead with the club, then the gap

The club name is the result. The coin-flip percent stays in the engine and can stay on the card as a smaller line, labelled as agreement, not as a mark out of 100 that someone failed.

Add one line under the club: how far ahead it is of the next club, using the same match percent.

- Clear: "8 points ahead of [runner-up]."
- Close call: the arrival screen already says the runner-up is right behind. Keep that one sentence. Do not add a second.

Do not rescale the percent to look like 80. A 46 that is clear of the next club is Your FC. A 52 and a 50 is a close call.

### 3. One copy line on card 13

The line under "Should your club sell out at home, or have fans in 50 countries?" says "A local institution, or a global brand." Change it to "A full ground in one city, or supporters everywhere."

The buttons stay "Sell out at home" and "Fans worldwide." The trait stays rooted against global. No club scores change. This does not move the match percent. It stops that card sounding like a question about the club as a product.

## Checks before it ships

- A sheet whose leader is well clear of the runner-up says Your FC even when the match percent is under 50.
- A sheet inside the 1.5 close-call rule says Closest match.
- The share card uses that same label, not the 80 cut and not the softmax share as if it were the match percent.
- The order of clubs is unchanged for a fixed answer sheet.
- Card 13 still scores trait 8, rooted against global.

## Evidence

Live scorer, 28 October 2026, no stake, blend 0.6, all 215 clubs.

| Sheet | Best match percent |
|---|---|
| 200 mixed sheets, median | 44 |
| 200 mixed sheets at or under 50 | 178 |
| 200 mixed sheets, highest | 61 |
| Every card to one side | about 59 |
| Both, where Both is allowed | about 33 |
| Answers copied from a real club, median | 74 |
| Copied answers that reach 80 | 37 clubs |
| Copied answers, highest | 91 |
