import './playing-card.css'
import { CourtFace } from './CourtFace'

const suitSymbols = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
} as const

export type Suit = keyof typeof suitSymbols
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'J' | 'Q' | 'K' | 'A'

type PlayingCardProps =
  | { suit: Suit; value: CardValue }
  | { suit: 'joker'; value: 'red' | 'black' }

const rankNames = { J: 'Jack', Q: 'Queen', K: 'King', A: 'Ace' }

// Each row runs left to right. A dot marks an empty position.
const pipRows: Record<Extract<CardValue, number>, string[]> = {
  2: ['.x.', '.x.'],
  3: ['.x.', '.x.', '.x.'],
  4: ['x.x', 'x.x'],
  5: ['x.x', '.x.', 'x.x'],
  6: ['x.x', 'x.x', 'x.x'],
  7: ['x.x', '.x.', 'x.x', '...', 'x.x'],
  8: ['x.x', '.x.', 'x.x', '.x.', 'x.x'],
  9: ['x.x', '...', 'x.x', '.x.', 'x.x', '...', 'x.x'],
  10: ['x.x', '.x.', 'x.x', '...', 'x.x', '.x.', 'x.x'],
}

export function PlayingCard(props: PlayingCardProps) {
  const isJoker = props.suit === 'joker'
  const isRed = isJoker
    ? props.value === 'red'
    : props.suit === 'diamonds' || props.suit === 'hearts'
  const symbol = isJoker ? '★' : suitSymbols[props.suit]
  const cornerValue = isJoker ? '★' : props.value
  const label = isJoker
    ? `${props.value} joker`
    : `${typeof props.value === 'number' ? props.value : rankNames[props.value]} of ${props.suit}`

  return (
    <div className={`playing-card${isRed ? ' playing-card--red' : ''}`} role="img" aria-label={label}>
      <span className="playing-card__corner" aria-hidden="true">
        {cornerValue}
        {!isJoker && <span>{symbol}</span>}
      </span>
      {typeof props.value === 'number' ? (
        <span className="playing-card__pips" aria-hidden="true">
          {pipRows[props.value].flatMap((row, y, rows) =>
            Array.from(row, (mark, x) => mark === 'x' && (
              <span key={`${x}-${y}`} style={{
                left: `${x * 50}%`,
                top: `${y / (rows.length - 1) * 100}%`,
                rotate: y > (rows.length - 1) / 2 ? '180deg' : '0deg',
              }}>{symbol}</span>
            )),
          )}
        </span>
      ) : props.value === 'J' || props.value === 'Q' || props.value === 'K' ? (
        <CourtFace rank={props.value} symbol={symbol} />
      ) : (
      <span className={isJoker ? 'playing-card__joker' : props.suit === 'spades' ? 'playing-card__center ace-spades' : 'playing-card__center'} aria-hidden="true">
        {isJoker ? 'JOKER' : symbol}
      </span>
      )}
      <span className="playing-card__corner playing-card__corner--bottom" aria-hidden="true">
        {cornerValue}
        {!isJoker && <span>{symbol}</span>}
      </span>
    </div>
  )
}
