import React from 'react'
import type { ElectionResults } from '@/lib/api/types'
import { StatTile } from './shared'

/** Per-position result bars. Used by the organiser's Results page and the public results. */
const ResultsView: React.FC<{ results: ElectionResults; accentColor?: string }> = ({ results, accentColor = '#003dff' }) => {
  const { analytics } = results
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Voters" value={analytics.totalVoters} />
        <StatTile label="Voted" value={analytics.votersWhoVoted} />
        <StatTile label="Turnout" value={`${analytics.turnout}%`} />
        <StatTile label="Votes cast" value={analytics.totalVotes} />
      </div>

      {!results.isFinal && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">Voting is still open; these numbers can change.</p>
      )}

      {results.positions.map((position) => (
        <section key={position.positionId} className="rounded-lg border border-slate-100 bg-white p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-800">{position.title}</h3>
            <span className="text-sm text-slate-500">{position.totalVotes} vote{position.totalVotes === 1 ? '' : 's'}{position.isTie ? ' · tie' : ''}</span>
          </div>
          <ul className="mt-4 space-y-3">
            {position.candidates.map((candidate) => {
              const leading = position.winnerIds.includes(candidate.candidateId)
              return (
                <li key={candidate.candidateId}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8edff] text-xs font-semibold text-[#003dff]">{candidate.name.slice(0, 1).toUpperCase()}</span>
                      )}
                      <span className={`truncate ${leading ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{candidate.name}</span>
                      {leading && results.isFinal && !position.isTie && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">Winner</span>}
                    </span>
                    <span className="shrink-0 tabular-nums text-slate-600">{candidate.votes} · {candidate.percentage}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" role="presentation">
                    <div className="h-full rounded-full transition-[width]" style={{ width: `${candidate.percentage}%`, backgroundColor: accentColor }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default ResultsView
