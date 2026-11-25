type Props = { rank: 'J' | 'Q' | 'K'; symbol: string }

export function CourtFace({ rank, symbol }: Props) {
  const figure = (
    <g stroke="#231f26" strokeWidth="1.3" strokeLinejoin="round">
      <path fill="#9c252f" d="M1 49 6 34 23 26 36 26 52 37 59 50Z" />
      <path fill="#263c59" d="m4 48 15-18 7 1-13 19zm27 2 12-19 6 4-8 15z" />
      <path fill="none" stroke="#e2b74f" strokeWidth="3" d="m9 49 15-20m9 21 13-18" />
      <path fill="#dab054" d="M17 28q-5-15 5-19 17-7 19 9l-2 13-5-4-4 4-6-4-5 4z" />
      <path fill="#ffdfad" d="m22 12 14 1 1 7 3 3-4 1-2 5-6 1-6-5z" />
      <path fill="none" d="m31 17 4 1m-3 8 3-1" />
      {rank === 'K' && <path fill="#ae833c" d="m23 22 5 3 4-2 4 2-4 8-7-3z" />}
      {rank === 'J'
        ? <path fill="#a92c36" d="M16 13q1-13 15-9l9 6-4 4-13-2z" />
        : <path fill="#e5b742" d="m17 4 7 5 4-8 5 8 7-6-3 11-17-1z" />}
      {rank === 'Q'
        ? <g transform="translate(48 24)"><path d="m0 0-4 14" /><path fill="#dbad44" d="M0-5q5-3 4 2 6 1 1 5-1 5-5 1-5 2-5-3-3-5 2-4z" /></g>
        : <path fill="#dcb952" d="m47 34 2-22 3-7 2 7-4 23 4 1-1 3-12-2 1-3z" />}
      <text x="3" y="14" fontSize="13" stroke="none" fill="currentColor">{symbol}</text>
    </g>
  )
  return <svg className="court-face" viewBox="0 0 60 100" aria-hidden="true">
    <rect x=".7" y=".7" width="58.6" height="98.6" rx="1" fill="#fffbec" stroke="#242025" />
    {figure}<g transform="rotate(180 30 50)">{figure}</g>
  </svg>
}
