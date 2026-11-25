import { expect, test } from 'vitest'
import { decisionMath } from './decisionMath'
import type { StandardCard } from './deck'
const card = (value: StandardCard['value']): StandardCard => ({ suit: 'clubs', value })

test('hard 16 busts on eight of thirteen ranks and standing wins exactly on dealer bust', () => {
  const math = decisionMath([card(10), card(6)], card('A'), ['hit','stand'], 0, 3)
  expect(math.bust).toBeCloseTo(8/13)
  expect(math.returns[1].net).toBeCloseTo(2 * math.dealerBust - 1)
  expect(math.dealerBust).toBeCloseTo(0.16652, 4)
})

test('split aces have twice the one-draw stand return, including the extra stake', () => {
  const aces = [card('A'),card('A')]
  const split = decisionMath(aces, card(6), ['split'], 1, 3).returns[0].net
  const ranks = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'] as const
  const expected = ranks.reduce((sum, rank) => sum + decisionMath([card('A'),card(rank)], card(6), ['stand'], 0, 0).returns[0].net, 0)
  expect(split).toBeCloseTo(2 * expected / 13)
})
