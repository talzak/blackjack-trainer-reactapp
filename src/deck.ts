import type { CardValue, Suit } from './PlayingCard'

export type StandardCard = { suit: Suit; value: CardValue }

const suits: readonly Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
const values: readonly CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A']

export function createDeck() {
  return createShoe(1)
}

export function createShoe(deckCount: number) {
  const deck = suits.flatMap((suit) => values.map((value) => ({ suit, value })))
  const cards = Array.from({ length: deckCount }, () => deck).flat()

  // At each step, put one randomly selected card into its final position.
  for (let index = cards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const selected = cards[randomIndex]
    cards[randomIndex] = cards[index]
    cards[index] = selected
  }

  return cards
}

export function deal(cards: readonly StandardCard[]) {
  if (cards.length < 2) return null

  return { dealt: cards.slice(0, 2), remaining: cards.slice(2) }
}
