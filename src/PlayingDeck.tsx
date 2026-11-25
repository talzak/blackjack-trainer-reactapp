import { useState } from 'react'
import { createDeck, deal, type StandardCard } from './deck'
import { PlayingCard } from './PlayingCard'
import './playing-deck.css'

export function PlayingDeck() {
  const [deck, setDeck] = useState<{ remaining: StandardCard[]; dealt: StandardCard[] }>(() => ({
    remaining: createDeck(),
    dealt: [],
  }))
  const canDeal = deck.remaining.length >= 2

  return (
    <section aria-label="Playing deck" className="playing-deck">
      <div className="playing-deck__box" role="status">
        <strong>Deck</strong>
        <span>{deck.remaining.length} cards left</span>
      </div>
      <button type="button" disabled={!canDeal} onClick={() => setDeck((current) => deal(current.remaining) ?? current)}>
        Deal
      </button>
      <div className="playing-deck__hand" role="group" aria-label="Dealt cards" aria-live="polite">
        {deck.dealt.map((card) => <PlayingCard key={`${card.suit}-${card.value}`} {...card} />)}
      </div>
    </section>
  )
}
