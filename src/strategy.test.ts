import { expect, test } from 'vitest'
import { recommend } from './strategy'
import type { StandardCard } from './deck'

const card = (value: StandardCard['value']): StandardCard => ({ suit: 'clubs', value })
const upcards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'A'] as const

// Independent chart transcription, in dealer-upcard order 2 through ace.
const hardRows = [
  ...Array(8).fill('HHHHHHHHHH'), // 4–11
  'HHSSSHHHHH', // 12
  ...Array(4).fill('SSSSSHHHHH'), // 13–16
  ...Array(4).fill('SSSSSSSSSS'), // 17–20
]
const softRows = [
  ...Array(6).fill('HHHHHHHHHH'), // 12–17
  'SSSSSSSHHH', // 18
  'SSSSSSSSSS', 'SSSSSSSSSS', // 19–20
]

test('every playable total matches the hit/stand chart across all ten upcards', () => {
  for (const [soft, rows] of [[false, hardRows], [true, softRows]] as const) {
    rows.forEach((expected, index) => {
      const score = index + (soft ? 12 : 4)
      const first = Math.min(10, Math.floor(score / 2))
      const hand = soft
        ? [card('A'), card(index === 0 ? 'A' : (index + 1) as StandardCard['value'])]
        : [card(first as StandardCard['value']), card((score - first) as StandardCard['value'])]
      const row = upcards.map(up => recommend(hand, card(up)).action === 'hit' ? 'H' : 'S').join('')
      expect(row, (soft ? 'soft ' : 'hard ') + score).toBe(expected)
    })
  }
})
