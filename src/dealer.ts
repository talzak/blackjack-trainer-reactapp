import type { StandardCard } from './deck'

export function scoreHand(cards: readonly StandardCard[]) {
  let sum = 0
  let hasAce = false
  for (const { value } of cards) {
    if (value === 'A') {
      hasAce = true
      sum += 1
    } else {
      sum += typeof value === 'number' ? value : 10
    }
  }
  const soft = hasAce && sum <= 11
  return { total: soft ? sum + 10 : sum, soft }
}

export function total(cards: readonly StandardCard[]) {
  return scoreHand(cards).total
}

export type Action = 'hit' | 'stand' | 'double' | 'split'
type Hand = { cards: StandardCard[]; wager: number; result: string | null }
export type Round = {
  hands: Hand[]
  active: number
  dealer: StandardCard[]
  shoe: StandardCard[]
  balance: number
  result: string | null
}

export const openingBet = 10
export const startingBalance = 200

export function startRound(shoe: StandardCard[], balance = startingBalance): Round {
  if (shoe.length < 4 || balance < openingBet) throw new Error('Opening deal requires four cards and a funded wager')
  const player = [shoe[0], shoe[2]]
  const dealer = [shoe[1], shoe[3]]
  const natural = total(player) === 21
  const dealerNatural = total(dealer) === 21
  let result = null
  let returned = 0
  if (dealerNatural) {
    result = natural ? 'Both have blackjack. Push.' : 'Dealer blackjack.'
    returned = natural ? openingBet : 0
  } else if (natural) {
    result = 'Blackjack! You win.'
    returned = openingBet * 2.5
  }
  return { hands: [{ cards: player, wager: openingBet, result }], active: 0, dealer,
    shoe: shoe.slice(4), balance: balance - openingBet + returned, result }
}

export function legalActions(round: Round): Action[] {
  if (round.result) return []
  const hand = round.hands[round.active]
  const actions: Action[] = ['hit', 'stand']
  if (hand.cards.length === 2 && round.balance >= hand.wager) {
    actions.push('double')
    if (round.hands.length < 4 && total([hand.cards[0]]) === total([hand.cards[1]])) actions.push('split')
  }
  return actions
}

// These helpers operate on the private copy made by play().
function draw(round: Round) {
  const card = round.shoe.shift()
  if (!card) throw new Error('Shoe exhausted during round')
  return card
}

function finish(round: Round) {
  if (round.hands.some(hand => total(hand.cards) <= 21)) {
    while (total(round.dealer) < 17) round.dealer.push(draw(round))
  }
  const dealer = total(round.dealer)
  for (const hand of round.hands) {
    const player = total(hand.cards)
    if (player > 21) hand.result = 'You bust. Dealer wins.'
    else if (dealer > 21 || player > dealer) {
      hand.result = dealer > 21 ? 'Dealer busts. You win.' : 'You win.'
      round.balance += 2 * hand.wager
    } else if (player === dealer) {
      hand.result = 'Push.'
      round.balance += hand.wager
    } else hand.result = 'Dealer wins.'
  }
  round.result = round.hands.length === 1 ? round.hands[0].result : 'Round complete.'
}

function advance(round: Round) {
  while (round.active + 1 < round.hands.length) {
    const next = round.hands[++round.active]
    next.cards.push(draw(round))
    if (next.cards[0].value !== 'A' && total(next.cards) < 21) return
  }
  finish(round)
}

export function play(previous: Round, action: Action): Round {
  if (!legalActions(previous).includes(action)) return previous
  const round = structuredClone(previous)
  const hand = round.hands[round.active]
  if (action === 'split') {
    round.balance -= hand.wager
    const [left, right] = hand.cards
    hand.cards = [left, draw(round)]
    round.hands.splice(round.active + 1, 0, { cards: [right], wager: hand.wager, result: null })
    if (left.value === 'A' || total(hand.cards) === 21) advance(round)
  } else {
    if (action === 'double') {
      round.balance -= hand.wager
      hand.wager *= 2
    }
    if (action !== 'stand') hand.cards.push(draw(round))
    if (action !== 'hit' || total(hand.cards) >= 21) advance(round)
  }
  return round
}
