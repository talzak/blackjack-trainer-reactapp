import { expect, test } from 'vitest'
import { createShoe, type StandardCard } from './deck'
import { play, startRound, total, type Round } from './dealer'

function cards(...values: StandardCard['value'][]): StandardCard[] {
  return values.map(value => ({ suit: 'clubs', value }))
}

test('dealer peeks with either blackjack upcard and resolves both naturals', () => {
  for (const shoe of [cards(7, 'A', 10, 'K'), cards(7, 'K', 10, 'A')]) {
    expect(startRound(shoe).result).toBe('Dealer blackjack.')
  }
  expect(startRound(cards('A', 'K', 10, 'A')).result).toContain('Push')
  expect(startRound(cards('A', 5, 'Q', 10)).result).toBe('Blackjack! You win.')
})

test('dealer stands on soft 17 and hits soft 16, adjusting aces after a draw', () => {
  expect(stand(startRound(cards(9, 'A', 9, 6, 2))).shoe).toEqual(cards(2))
  const round = stand(startRound(cards(9, 'A', 9, 5, 'K', 4, 3)))
  expect(total(round.dealer)).toBe(20)
  expect(round.shoe).toEqual(cards(3))
  expect(total(cards('A', 'A', 9))).toBe(21)
})

test('player bust ends play immediately and a hit to 21 resolves the dealer turn', () => {
  const bust = hit(startRound(cards(10, 5, 8, 6, 5, 9)))
  expect(bust.shoe).toEqual(cards(9))
  expect(stand(bust)).toBe(bust)
  const win = hit(startRound(cards(10, 5, 8, 9, 3, 10)))
  expect(win.result).toBe('Dealer busts. You win.')
})

test('successive deals consume cards from the same eight-deck shoe', () => {
  const shoe = createShoe(8)
  expect(shoe).toHaveLength(416)
  const first = startRound(shoe)
  const second = startRound(first.shoe)
  expect(second.hands[0].cards).toEqual([shoe[4], shoe[6]])
  expect(second.shoe).toEqual(shoe.slice(8))
})

function hit(round: Round) { return play(round, 'hit') }
function stand(round: Round) { return play(round, 'stand') }
