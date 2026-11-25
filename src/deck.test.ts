import { expect, test } from 'vitest'
import { createDeck, createShoe, deal } from './deck'

test('the eight-deck shoe contains eight copies of every standard card', () => {
  const shoe = createShoe(8)
  expect(shoe).toHaveLength(416)
  for (const suit of ['clubs', 'diamonds', 'hearts', 'spades']) {
    for (const value of [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A']) {
      expect(shoe.filter(card => card.suit === suit && card.value === value)).toHaveLength(8)
    }
  }
})

test('deals 26 pairs without repeating a card, then stops', () => {
  let remaining = createDeck()
  expect(remaining).toHaveLength(52)
  const seen = new Set<string>()

  for (let turn = 1; turn <= 26; turn++) {
    const result = deal(remaining)
    if (!result) throw new Error(`Deck ran out on deal ${turn}`)

    expect(result.dealt).toHaveLength(2)
    for (const card of result.dealt) seen.add(`${card.suit}-${card.value}`)
    remaining = result.remaining
    expect(remaining).toHaveLength(52 - turn * 2)
  }

  expect(seen.size).toBe(52)
  expect(deal(remaining)).toBeNull()
})
