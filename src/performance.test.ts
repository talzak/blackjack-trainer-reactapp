import { expect, test } from 'vitest'
import { describeDecision, summarize } from './performance'
import type { StandardCard } from './deck'
const card = (value: StandardCard['value']): StandardCard => ({ suit: 'clubs', value })

test('equivalent ten-value upcards group together and legal strategy fallbacks stay distinct', () => {
  const hand = [card(8),card(8)]
  const right = describeDecision(hand, card('Q'), 'split', 'split')
  const wrong = describeDecision(hand, card(10), 'split', 'hit')
  const restricted = describeDecision(hand, card('K'), 'hit', 'hit')
  expect(summarize([right, wrong, restricted], 'situation')).toMatchObject([
    { name: 'Pair of 8s vs 10', correct: 2, incorrect: 1 },
  ])
  expect(summarize([right, wrong, wrong, restricted], 'dealer')[0].pairs).toEqual([
    { chosen: 'split', recommended: 'split', count: 1 },
    { chosen: 'hit', recommended: 'split', count: 2 },
    { chosen: 'hit', recommended: 'hit', count: 1 },
  ])
  expect(summarize([right, wrong, restricted], 'dealer')).toMatchObject([{ name: '10', correct: 2, incorrect: 1 }])
})
