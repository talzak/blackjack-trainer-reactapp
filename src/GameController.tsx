import { useState } from 'react'
import { createShoe } from './deck'
import { legalActions, openingBet, play, startingBalance, startRound, total, type Action, type Round } from './dealer'
import { PlayingCard } from './PlayingCard'
import { decisionNote, recommend } from './strategy'
import { DecisionDetails } from './DecisionDetails'
import { Performance } from './PerformancePanel'
import { describeDecision, historyPrefix, loadHistory, type Decision } from './performance'
import './casino.css'

const labels = { hit: 'Hit', stand: 'Stand', double: 'Double down', split: 'Split' }

export function GameController() {
  const [round, setRound] = useState<Round | null>(null)
  const [choice, setChoice] = useState<Action | null>(null)
  const [stats, setStats] = useState(() => {
    try { return { history: loadHistory(), sessionOnly: false } }
    catch { return { history: [] as Decision[], sessionOnly: true } }
  })
  const actions = round ? legalActions(round) : []
  const advice = round && choice ? recommend(round.hands[round.active].cards, round.dealer[0], actions) : null
  const balance = round?.balance ?? startingBalance
  const needsRefill = balance < openingBet

  function choose(action: Action) {
    if (!round || choice || !actions.includes(action)) return
    const cards = round.hands[round.active].cards
    const dealer = round.dealer[0]
    const record = describeDecision(cards, dealer, recommend(cards, dealer, actions).action, action)
    let sessionOnly = stats.sessionOnly
    try { localStorage.setItem(historyPrefix + crypto.randomUUID(), JSON.stringify(record)) }
    catch { sessionOnly = true }
    setStats(previous => ({ history: [...previous.history, record], sessionOnly }))
    setChoice(action)
  }

  function dealRound() {
    const shoe = round && !needsRefill && round.shoe.length > 104 ? round.shoe : createShoe(8)
    setRound(startRound(shoe, needsRefill ? startingBalance : balance))
  }

  return (
    <div className="casino">
      <header className="casino-header">
        <h1><span aria-hidden="true">♠</span> Blackjack Trainer</h1>
        <div className="bank"><i className="chip" aria-hidden="true" /> <span>Virtual chips <b>{balance}</b></span></div>
      </header>
      <div className="rail"><div className="felt">
        <section className="seat">
          <h2>Dealer {round?.result && <small>{total(round.dealer)}</small>}</h2>
          <div className="cards">
            {round ? round.dealer.map((card, index) => index === 1 && !round.result
              ? <div key={index} className="card-back" role="img" aria-label="Face-down card" />
              : <PlayingCard key={index} {...card} />) : <div className="shoe-back card-back" aria-hidden="true" />}
          </div>
        </section>
        <div className="imprint"><span>Atlantic City</span><strong>Blackjack</strong><span>Pays 3 to 2 · Dealer stands on 17</span></div>
        <div className="seats">
          {round ? round.hands.map((hand, index) => <section className="seat player" key={index} data-active={!round.result && round.active === index}>
            <h2>{round.hands.length === 1 ? 'Your hand' : `Hand ${index + 1}`} <small>{total(hand.cards)}</small></h2>
            <div className="cards">{hand.cards.map((card, i) => <PlayingCard key={i} {...card} />)}</div>
            <p>{hand.wager} chips{hand.result && ` · ${hand.result}`}</p>
          </section>) : <section className="seat"><h2>Your wager</h2><div className="bet-spot"><i className="chip">{openingBet}</i></div></section>}
        </div>
      </div></div>
      <section className="table-controls" aria-label="Table controls">
        <p role="status">{round?.result ?? (round ? `Playing hand ${round.active + 1}.` : 'Ready to deal.')}</p>
        {choice && advice && round ? <section aria-label="Strategy feedback">
          <p role="status">{decisionNote(round.hands[round.active].cards, round.dealer[0], choice, advice)}</p>
          {choice !== advice.action && <DecisionDetails round={round} legal={actions} choice={choice} recommended={advice.action} />}
          <button onClick={() => {
            setRound(play(round, choice))
            setChoice(null)
          }}>Continue</button>
        </section> : actions.length ? <div className="moves">
          {actions.filter(action => action !== 'split').map(action => <button key={action} onClick={() => choose(action)}>{labels[action]}</button>)}
          <button disabled={!actions.includes('split')} onClick={() => choose('split')}>Split</button>
        </div> : <button onClick={dealRound}>{needsRefill ? 'Start fresh with 200 chips' : round ? 'Next round' : 'Deal'} · {openingBet} chips</button>}
        {!!actions.length && !choice && !actions.includes('split') && (
          <p className="split-note">To split, you need two equal-value cards, enough chips to match the wager, and fewer than four hands.</p>
        )}
      </section>
      <Performance {...stats} />
    </div>
  )
}
