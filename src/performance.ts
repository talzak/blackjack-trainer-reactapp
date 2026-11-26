import { scoreHand, total, type Action } from './dealer'
import type { StandardCard } from './deck'

export type Decision = {
  hand: string
  dealer: string
  recommended: Action
  chosen: Action
  time: number
}
export type Group = 'situation' | 'hand' | 'dealer' | 'recommended'
export const historyPrefix = 'blackjack:decision:v1:'

export function describeDecision(cards: StandardCard[], dealer: StandardCard, recommended: Action, chosen: Action): Decision {
  const score = scoreHand(cards)
  const pair = cards.length === 2 && total([cards[0]]) === total([cards[1]])
  const rank = (card: StandardCard) => card.value === 'A' ? 'A' : String(total([card]))
  return {
    hand: pair ? `Pair of ${rank(cards[0])}s` : `${score.soft ? 'Soft' : 'Hard'} ${score.total}`,
    dealer: rank(dealer), recommended, chosen, time: Date.now(),
  }
}

type ChoicePair = { chosen: Action; recommended: Action; count: number }

export function summarize(decisions: Decision[], group: Group) {
  const rows = new Map<string, { name: string; correct: number; incorrect: number; pairs: ChoicePair[] }>()
  for (const d of decisions) {
    const name = group === 'situation' ? `${d.hand} vs ${d.dealer}` : d[group]
    const row = rows.get(name) ?? { name, correct: 0, incorrect: 0, pairs: [] as ChoicePair[] }
    if (d.chosen === d.recommended) row.correct++
    else row.incorrect++
    const pair = row.pairs.find(p => p.chosen === d.chosen && p.recommended === d.recommended)
    if (pair) pair.count++
    else row.pairs.push({ chosen: d.chosen, recommended: d.recommended, count: 1 })
    rows.set(name, row)
  }
  return [...rows.values()]
}

export function loadHistory(): Decision[] {
  const records: Decision[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(historyPrefix)) continue
    try {
      const d = JSON.parse(localStorage.getItem(key) ?? 'null')
      const moves = ['hit', 'stand', 'split', 'double']
      if (d && typeof d.hand === 'string' && typeof d.dealer === 'string' && Number.isFinite(d.time)
        && moves.includes(d.chosen) && moves.includes(d.recommended)) records.push(d)
    } catch { /* Skip incomplete records. */ }
  }
  return records
}
