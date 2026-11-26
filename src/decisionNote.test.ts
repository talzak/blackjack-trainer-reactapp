import { expect, test } from 'vitest'
import { decisionNote, recommend } from './strategy'
import type { StandardCard } from './deck'
import type { Action } from './dealer'

function note(ranks: StandardCard['value'][], up: StandardCard['value'], choice: Action) {
  const cards = ranks.map(value => ({ value, suit: 'clubs' as const }))
  const dealer = { value: up, suit: 'diamonds' as const }
  return decisionNote(cards, dealer, choice, recommend(cards, dealer, ['hit','stand','double','split']))
}

test('correct split explains the decision after the verdict', () => {
  expect(note([8,8], 6, 'split')).toMatch(/^Correct\. 8 \+ 8.*dealer’s 6.*Split\. Splitting breaks up hard 16/)
})

test('missed and unnecessary splits explain the visible pair and upcard', () => {
  expect(note([8,8], 6, 'stand')).toMatch(/8 \+ 8.*dealer’s 6.*breaks up hard 16/)
  expect(note(['K','Q'], 9, 'split')).toMatch(/K \+ Q.*dealer’s 9.*gives up a made 20/)
})
