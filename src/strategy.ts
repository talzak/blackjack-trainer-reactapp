import type { StandardCard } from './deck'
import { scoreHand, total } from './dealer'

import type { Action } from './dealer'

// Total-dependent basic strategy for the eight-deck S17 table.
// Chart and double fallbacks: https://wizardofodds.com/games/blackjack/basics/
export function recommend(cards: readonly StandardCard[], dealer: StandardCard, legal: readonly Action[] = ['hit', 'stand']): { action: Action; reason: string } {
  const hand = scoreHand(cards)
  const up = total([dealer])
  if (legal.includes('split')) {
    const pair = total([cards[0]])
    const split = pair === 11 || pair === 8 ||
      (pair === 9 && up <= 9 && up !== 7) ||
      (pair === 7 && up <= 7) || (pair === 6 && up <= 6) ||
      (pair === 4 && (up === 5 || up === 6)) ||
      ((pair === 2 || pair === 3) && up <= 7)
    if (split) return { action: 'split', reason: 'Playing this pair as two hands has the higher expected return against this upcard.' }
  }
  if (legal.includes('double')) {
    const n = hand.total
    const double = hand.soft
      ? ((n === 13 || n === 14) && up >= 5 && up <= 6) ||
        ((n === 15 || n === 16) && up >= 4 && up <= 6) ||
        ((n === 17 || n === 18) && up >= 3 && up <= 6)
      : (n === 9 && up >= 3 && up <= 6) || (n === 10 && up <= 9) || (n === 11 && up <= 10)
    if (double) return { action: 'double', reason: 'This hand is favorable enough to double the wager and take exactly one card.' }
  }
  if (hand.soft) {
    if (hand.total <= 17) return { action: 'hit', reason: 'Your flexible ace lets you draw without busting, and soft 17 or less is worth improving.' }
    if (hand.total === 18 && up >= 9) return { action: 'hit', reason: 'Against 9, 10, or ace, soft 18 gains more on average by drawing. Your ace can count as 1.' }
    return { action: 'stand', reason: 'Keeping this soft total has the better expected return against this upcard.' }
  }
  if (hand.total <= 11) return { action: 'hit', reason: 'You can improve this total without busting on the next card.' }
  if (hand.total >= 17) return { action: 'stand', reason: 'On hard 17 or higher, the risk of busting outweighs the potential gain from another card.' }
  const lowestStandUpcard = hand.total === 12 ? 4 : 2
  if (up >= lowestStandUpcard && up <= 6) return { action: 'stand', reason: 'Against this weak upcard, letting the dealer draw gives a better average return than risking a bust.' }
  return { action: 'hit', reason: hand.total === 12 && up <= 3
    ? 'A dealer 2 or 3 is too strong to justify standing on hard 12. Drawing has the better average return.'
    : 'Against this strong upcard, drawing to improve your hard total is worth the bust risk.' }
}
