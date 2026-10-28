# Crest identity plan

Locked on 27 October 2026. This is the design the quiz will follow. The live deck is unchanged until the remaining clubs are scored and the spread check passes.

The engine stays a likelihood match. One ranking. Blend `0.6 × self + 0.4 × others`. A missing voice stays missing. `k = 3.0 × confidence`. `term = weight × ln(P)`. A stake multiplies weights and does not reorder cards.

## Traits to add

| Index | Group | Left −1 | Right +1 | The question asks |
|---|---|---|---|---|
| 12 | Heart | I go while it hurts | It has to be worth going | How many bad years are already in the price of belonging |
| 13 | Soul | The club is the people | The club is a product | Whether the name, the shirt, and the fan are for sale |

Resiliency is the years a person still pays for. A squad rule, a safe mid-table decade, and five games of faith in a manager stay on their own traits.

Commercialization is selling the name. Who owns a broke club, where the fans live, and a new stadium stay on their own traits.

## Cards that change

Cards 6 and 8 are replaced. Both are binary. A left swipe stores `−1`. Both is off. Part is Football, so each weighs `1.0` with no stake. They stay in positions 6 and 8 so the person meets them early.

**6. Commercialization.** A sponsor will pay for a title-winning squad. The price is their name on the ground and their mark on the shirt. Take it, or the name stays ours.

- Left: The name stays ours
- Right: Take the money

**8. Resiliency.** The club finishes in the bottom half for five years. The ground is half empty. You still pay to go, or you come back when they are good.

- Left: I still go
- Right: I come back when they're good

Cards 1–5, 7, 9–11, and 13–20 keep their current wording. Card 7 stays Likes. Card 9 stays Likes. Card 10 stays Likes.

## Weights

```
weight = partWeight × (0.7 if the trait has two cards, else 1) × stakeCoefficient
```

Part weights stay Life `0.7`, Likes `0.75`, Football `1`.

Removing cards 6 and 8 from their old traits leaves one card each on climate and on style. These two get heavier on purpose:

| Card | Trait | Weight now | Weight after |
|---|---|---|---|
| 12 | Calm / Intense | 0.70 | 1.00 |
| 15 | Beautiful / Effective | 0.70 | 1.00 |
| 6 | Commercialization | 0.53 on the old trait | 1.00 |
| 8 | Resiliency | 0.53 on the old trait | 1.00 |

## Stakes

A stake doubles a trait only when that stake is that trait. The existing coefficients stay. The new ones are:

| Stake | ×2 | ×1.4 |
|---|---|---|
| Belonging | Resiliency | Commercialization |
| Belonging and winning | | Resiliency |
| Fame and fortune | Commercialization | |
| Fortune | Commercialization | |
| Love | | Resiliency |
| Winning | | |

Belonging does not double commercialization. Fame and fortune does.

## Pilot

Seven clubs. Reach and power are the live blend, `0.6 × self + 0.4 × others`. Commercialization and resiliency are new scores, each from its own fact. An owner is a power fact. A sold ground name, a sponsor across the shirt, or a tour is a commercial fact. A written rule about who may play is not a resiliency fact.

Scale: commercialization `−1` the people, `+1` the product. Resiliency `−1` I go while it hurts, `+1` it has to be worth going.

| Club | Reach | Power | Commercial | Resiliency | Commercial fact | Resiliency fact |
|---|---|---|---|---|---|---|
| Manchester City | +0.42 | +0.76 | +0.90 | +0.80 | The ground carries a sponsor's name, the Etihad. The file calls it a resourced project built to control the future. | The project is built so the losing stops. |
| Real Madrid | +0.76 | +0.22 | +0.40 | +0.70 | The ground is still the Bernabéu. Others call it a winning machine, which is a power fact, not a sold name. | The file is excellence and trophies. Suffering is not the price of belonging. |
| Athletic Club | −0.48 | −0.48 | −0.70 | −0.20 | San Mamés kept its name. The file is "our own" and the localist exception. | The hardship is a chosen rule about who plays, and they still compete. Unsure. Do not treat this as a drought. |
| AFC Wimbledon | −0.48 | −0.84 | −0.90 | −0.85 | Supporters rebuilt the club. Plough Lane. The file is ownership by the people. | They were erased and the supporters stayed through the rebuild. |
| FC St. Pauli | −0.12 | −0.84 | −0.75 | −0.70 | Millerntor in common hands. The file refuses the product. The skull sells shirts around the world, and that doubt does not move them onto the product pole. | Others say they cannot stay in the Bundesliga. The club accepts that price. |
| Sunderland | −0.30 | +0.60 | +0.20 | −0.90 | The ground is the Stadium of Light, not a sponsor's name. Power is high because of capital. That number was not copied. | "A city's pain became its power." Sunderland 'Til I Die. |
| Hamburger SV | +0.30 | +0.06 | +0.10 | −0.75 | The name stayed HSV. Volksparkstadion. A Hanseatic institution, not a sold brand. | Seven years out, "proving the nickname," then home again. The supporters waited the exile out. |

### Tests

| Test | Result |
|---|---|
| City's commercialization is at least 0.3 above Madrid's | +0.90 against +0.40. Gap 0.50. Pass. |
| St. Pauli is within 0.3 of Wimbledon, and at least 0.8 below City | −0.75 against −0.90, and 1.65 below City. Pass. |
| Sunderland and City differ by at least 0.6 on resiliency, Sunderland toward "I still go" | −0.90 against +0.80. Gap 1.70. Pass. |
| Athletic is not at Sunderland's end of resiliency | −0.20 against −0.90. Pass. |
| Commercialization does not sort like power | Power puts Sunderland above Madrid, and Wimbledon above St. Pauli. Commercialization reverses both. Pass on order. |
| Commercialization does not sort like reach | Reach puts Madrid first and St. Pauli in the middle. Commercialization puts City first and St. Pauli with Wimbledon. Pass. |

Rank correlation is still high: commercialization against power is `0.93`, against reach `0.79`. The order tests pass because of two swaps, Madrid with Sunderland and St. Pauli with Wimbledon. Those swaps are the whole proof that the trait is its own thing. When the other clubs are scored, a sold name has to be able to move a club off its power score. Copying power will fail this pilot in disguise.

## Worked swipe

Commercialization card, weight `1`, `k = 3`, left swipe "The name stays ours", `leftValue = −1`. Both is off. Axes are the pilot scores above.

City at `+0.90`:

```
P(left) = exp(3 × 0.90 × −1) / (exp(−2.70) + exp(2.70)) ≈ 0.0045
term = 1 × ln(0.0045) ≈ −5.41
```

St. Pauli at `−0.75`:

```
P(left) ≈ 0.989
term ≈ −0.011
```

One left swipe puts St. Pauli about `5.4` ahead of City on this card alone. A right swipe reverses it.

## What happens next

1. Philosopher pass. For each of the twenty questions, the philosopher database either changes the sentence and names the record, or it has no usable distinction and this wording stands. That pass does not add a trait and does not move a pole.
2. Score the other clubs on traits 12 and 13 only. Missing is allowed. A power score is not a commercial score.
3. Recompute the spread of all twenty cards. Cards 6 and 8 should land with "fans or a billionaire," not with the old likes cards.
4. Then change the code: `facets.js`, cards 6 and 8, the stake coefficients, the two new club fields, and the pole test.

The live quiz does not change in this step.
