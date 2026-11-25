import { expect, test } from 'vitest'
import { legalActions, play, startRound } from './dealer'
import type { StandardCard } from './deck'
import { recommend } from './strategy'

const cards = (...values: StandardCard['value'][]): StandardCard[] => values.map(value => ({ suit: 'clubs', value }))

test('split hands play in order, double after splitting, settle against one dealer', () => {
  let r = play(startRound(cards(8, 6, 8, 10, 3, 10, 9, 4)), 'split')
  expect(r.hands.map(h => h.cards.length)).toEqual([2, 1])
  expect(r.balance).toBe(180)
  r = play(r, 'double')
  expect(r.active).toBe(1)
  expect(r.hands[0].wager).toBe(20)
  expect(r.balance).toBe(170)
  r = play(r, 'stand')
  expect(r.balance).toBe(210)
  expect(r.hands.map(h => h.result)).toEqual(['You win.', 'Dealer wins.'])
})

test('split aces take one card each, including another ace, and 21 pays even money', () => {
  const r = play(startRound(cards('A', 10, 'A', 9, 'A', 'K')), 'split')
  expect(r.hands.map(h => h.cards.length)).toEqual([2, 2])
  expect(r.balance).toBe(200)
  expect(legalActions(r)).toEqual([])
  expect(startRound(cards('A', 10, 'K', 9)).balance).toBe(215)
})

test('four-hand cap, funds, card count and peek constrain actions', () => {
  let r = startRound(cards(8, 5, 8, 9, 8, 8, 8))
  for (let i = 0; i < 3; i++) r = play(r, 'split')
  expect(r.hands).toHaveLength(4)
  expect(play(r, 'split')).toBe(r)
  expect(legalActions(startRound(cards('K', 7, 'J', 8)))).toContain('split')
  expect(legalActions(startRound(cards(8, 5, 8, 9), 10))).toEqual(['hit','stand'])
  expect(legalActions(play(startRound(cards(2, 5, 3, 9, 2)), 'hit'))).toEqual(['hit','stand'])
  expect(legalActions(startRound(cards(8, 'A', 8, 'K')))).toEqual([])
})

test('coach chooses eligible splits and doubles and resolves restricted hands', () => {
  function advice(hand: StandardCard[], up: StandardCard, balance = 200) {
    const round = startRound([hand[0], up, hand[1], ...cards(2)], balance)
    return recommend(hand, up, legalActions(round)).action
  }
  expect(advice(cards(8,8), cards(10)[0])).toBe('split')
  expect(advice(cards(8,8), cards(10)[0], 10)).toBe('hit')
  expect(advice(cards(5,5), cards(9)[0])).toBe('double')
  expect(advice(cards('A',7), cards(3)[0])).toBe('double')
  expect(advice(cards('A',7), cards(3)[0], 10)).toBe('stand')
})
