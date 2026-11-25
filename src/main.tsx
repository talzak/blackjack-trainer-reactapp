import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PlayingCard } from './PlayingCard'
import { PlayingDeck } from './PlayingDeck'
import { GameController } from './GameController'

const root = document.getElementById('root')
const path = window.location.pathname.replace(/\/$/, '')

if (!root) {
  throw new Error('Missing React root element')
}

createRoot(root).render(
  <StrictMode>
    <main>
      {(path === '' || path === '/dealer-test') ? <GameController /> : path === '/deck-test' ? (
        <>
          <h1>Deck Test</h1>
          <PlayingDeck />
        </>
      ) : (
        <>
          <h1>Blackjack Trainer</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <PlayingCard suit="hearts" value="A" />
            <PlayingCard suit="spades" value={10} />
            <PlayingCard suit="joker" value="red" />
            <PlayingCard suit="joker" value="black" />
          </div>
          <p><a href="/deck-test">Test the deck</a></p>
          <p><a href="/dealer-test">Play against the dealer</a></p>
        </>
      )}
    </main>
  </StrictMode>,
)
