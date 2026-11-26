import { useState } from 'react'
import { summarize, type Decision, type Group } from './performance'

const groupLabels: Record<Group, string> = {
  situation: 'Hand vs upcard',
  hand: 'Player hand',
  dealer: 'Dealer upcard',
  recommended: 'Recommended move',
}

const moveLabels = { hit: 'Hit', stand: 'Stand', double: 'Double down', split: 'Split' }

export function Performance({ history, sessionOnly }: { history: Decision[]; sessionOnly: boolean }) {
  const [group, setGroup] = useState<Group>('situation')
  const [sort, setSort] = useState<'incorrect' | 'correct'>('incorrect')
  const [days, setDays] = useState(0)
  const [result, setResult] = useState<'all' | 'incorrect' | 'correct'>('all')
  const cutoff = Date.now() - days * 86400000
  const data = history.filter(d => {
    const grade = d.chosen === d.recommended ? 'correct' : 'incorrect'
    return (!days || d.time >= cutoff) && (result === 'all' || grade === result)
  })
  const correct = data.filter(d => d.chosen === d.recommended).length
  const rows = summarize(data, group).sort((a,b) => b[sort] - a[sort] || a.name.localeCompare(b.name))
  return <details className="performance">
    <summary>Your performance</summary>
    <p>{sessionOnly ? 'Browser storage is unavailable. New decisions are tracked for this session.' : 'Strategy decisions saved in this browser.'}</p>
    <div className="performance-filters">
      <label>Period <select value={days} onChange={e => setDays(Number(e.target.value))}>
        <option value={0}>All time</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option>
      </select></label>
      <label>Decision result <select value={result} onChange={e => setResult(e.target.value as typeof result)}>
        <option value="all">All decisions</option><option value="incorrect">Incorrect only</option><option value="correct">Correct only</option>
      </select></label>
      <label>Group by <select value={group} onChange={e => setGroup(e.target.value as Group)}>
        {Object.entries(groupLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      <label>Show first <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
        <option value="incorrect">Most incorrect</option><option value="correct">Most correct</option>
      </select></label>
    </div>
    {data.length ? <>
      <p>{correct} of {data.length} decisions correct · {Math.round(100 * correct / data.length)}% accuracy</p>
      <div className="performance-scroll">
        <table>
          <thead><tr><th>{groupLabels[group]}</th><th>Your choice</th><th>Correct choice</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr></thead>
          {rows.map(row => <tbody key={row.name}>
            {row.pairs.map((pair, index) => <tr key={pair.chosen + pair.recommended}>
              {index === 0 && <th scope="rowgroup" rowSpan={row.pairs.length}>{row.name}</th>}
              <td>{moveLabels[pair.chosen]} ×{pair.count}</td>
              <td>{moveLabels[pair.recommended]}</td>
              {index === 0 && <>
                <td rowSpan={row.pairs.length}>{row.correct}</td>
                <td rowSpan={row.pairs.length}>{row.incorrect}</td>
                <td rowSpan={row.pairs.length}>{Math.round(100 * row.correct / (row.correct + row.incorrect))}%</td>
              </>}
            </tr>)}
          </tbody>)}
        </table>
      </div>
    </> : <p>{history.length ? 'No decisions match these filters.' : 'Choose a move at the table to record your first decision.'}</p>}
  </details>
}
