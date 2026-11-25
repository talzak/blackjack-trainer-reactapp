import { scoreHand, type Action } from './dealer'
import type { StandardCard } from './deck'

// Independent draws: ace through nine each have one rank, ten-valued cards have four.
const ranks = Array.from({ length: 10 }, (_, i) => i + 1)
const weight = (rank: number) => rank === 10 ? 4 : 1
const average = (value: (rank: number) => number) =>
  ranks.reduce((sum, rank) => sum + weight(rank) * value(rank), 0) / 13

type Score = ReturnType<typeof scoreHand>
function add(hand: Score, rank: number): Score {
  const low = hand.total - (hand.soft ? 10 : 0) + rank
  const soft = (hand.soft || rank === 1) && low <= 11
  return { total: low + (soft ? 10 : 0), soft }
}

export function decisionMath(cards: StandardCard[], upcard: StandardCard, legal: Action[], funds: number, splitSlots: number) {
  const hand = scoreHand(cards)
  const up = scoreHand([upcard])
  const dealer = Array<number>(23).fill(0) // Index 22 represents a bust.
  function dealerDraw(score: Score, probability: number) {
    if (score.total >= 17) {
      dealer[Math.min(score.total, 22)] += probability
      return
    }
    for (const rank of ranks) dealerDraw(add(score, rank), probability * weight(rank) / 13)
  }
  const holes = ranks.filter(rank => add(up, rank).total !== 21)
  const holeWeight = holes.reduce((sum, rank) => sum + weight(rank), 0)
  for (const rank of holes) dealerDraw(add(up, rank), weight(rank) / holeWeight)

  function stand(total: number) {
    if (total > 21) return -1
    return dealer.reduce((net, probability, outcome) =>
      net + probability * (outcome === 22 ? 1 : Math.sign(total - outcome)), 0)
  }
  const cache = new Map<string, number>()
  function best(score: Score): number {
    if (score.total >= 21) return stand(score.total)
    const key = score.total + '/' + score.soft
    const known = cache.get(key)
    if (known !== undefined) return known
    const value = Math.max(stand(score.total), hit(score))
    cache.set(key, value)
    return value
  }
  function hit(score: Score) { return average(rank => best(add(score, rank))) }
  function double(score: Score) { return 2 * average(rank => stand(add(score, rank).total)) }

  // Each pending split hand starts with the same rank. Carry the shared wager
  // budget forward because spending a unit here affects the next hand's options.
  const root = scoreHand([cards[0]])
  const splitCache = new Map<string, number>()
  function splitHands(pending: number, budget: number, slots: number): number {
    if (!pending) return 0
    const key = [pending, budget, slots].join('/')
    const known = splitCache.get(key)
    if (known !== undefined) return known
    const rest = splitHands(pending - 1, budget, slots)
    const value = average(rank => {
      const score = add(root, rank)
      if (root.soft || score.total === 21) return stand(score.total) + rest
      let value = best(score) + rest
      if (budget > 0) {
        value = Math.max(value, double(score) + splitHands(pending - 1, budget - 1, slots))
        if (rank === root.total && slots > 0)
          value = Math.max(value, splitHands(pending + 1, budget - 1, slots - 1))
      }
      return value
    })
    splitCache.set(key, value)
    return value
  }
  const values = { stand: () => stand(hand.total), hit: () => hit(hand), double: () => double(hand),
    split: () => splitHands(2, funds - 1, splitSlots - 1) }
  return {
    returns: legal.map(action => ({ action, net: values[action]() })),
    bust: average(rank => Number(add(hand, rank).total > 21)),
    dealerBust: dealer[22],
  }
}
