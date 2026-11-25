import { decisionMath } from './decisionMath'
import type { Action, Round } from './dealer'

const percent = (n: number) => (100 * n).toFixed(1) + '%'
export function DecisionDetails({ round, legal, choice, recommended }: {
  round: Round; legal: Action[]; choice: Action; recommended: Action
}) {
  const hand = round.hands[round.active]
  const math = decisionMath(hand.cards, round.dealer[0], legal, Math.floor(round.balance / hand.wager), 4 - round.hands.length)
  return <details className="decision-details" open>
    <summary>Decision math</summary>
    <p>Estimated net chips per {hand.wager}-chip wager, averaged over repeated plays. Higher is better. A negative value means an average loss.</p>
    <table><thead><tr><th>Move</th><th>Expected net chips</th></tr></thead>
      <tbody>{math.returns.map(({ action, net }) => <tr key={action}>
        <th>{action}{action === recommended && ' · basic strategy'}{action === choice && ' · your move'}</th>
        <td>{(net * hand.wager).toFixed(2)}</td>
      </tr>)}</tbody></table>
    <p>Bust chance on your next hit: {percent(math.bust)}. Dealer bust chance if required to play: {percent(math.dealerBust)}.</p>
    <small>Estimates use independent draws at full-shoe rank frequencies after the dealer blackjack check. Values include extra wagers and optimal follow-up play for this hand and its splits. The eight-deck basic strategy chart determines your grade. Close decisions can differ in this approximation.</small>
  </details>
}
