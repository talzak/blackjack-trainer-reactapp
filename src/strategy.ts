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

export function decisionNote(cards: readonly StandardCard[], dealer: StandardCard, choice: Action, advice: ReturnType<typeof recommend>) {
  const hand = scoreHand(cards)
  const ranks = cards.map(card => card.value).join(' + ')
  const context = `${ranks} gives you ${hand.soft ? 'soft' : 'hard'} ${hand.total} against the dealer’s ${dealer.value}.`
  const move = { hit: 'Hit', stand: 'Stand', double: 'Double down', split: 'Split' }[advice.action]
  let reason = advice.reason
  if (advice.action === 'split') {
    const pair = total([cards[0]])
    if (pair === 8) reason = 'Splitting breaks up hard 16 and gives each 8 a chance to draw to 18.'
    else if (pair === 11) reason = 'Each ace gets one more card. A ten-value draw makes 21 on that hand.'
    else reason = `Against this upcard, starting two hands with ${pair} each earns more on average than playing the pair together as ${hand.total}.`
  } else if (choice === 'split') {
    const pair = total([cards[0]])
    if (pair === 10) reason = 'Splitting gives up a made 20. Keeping it wins against every dealer total from 17 through 19.'
    else if (pair === 5) reason = 'Together your fives make 10, so a ten-value draw makes 20. Splitting leaves each hand starting at just 5.'
    else reason = `Keep the ${hand.total} together. Against this upcard, a second wager starting from ${pair} has a lower average return.`
  }
  const verdict = choice === advice.action ? 'Correct. ' : ''
  return `${verdict}${context} ${move}. ${reason}`
}
