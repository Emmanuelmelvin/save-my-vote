import React from 'react'
import { useElections, useResults } from '@/lib/api/hooks'
import { errorMessage } from '@/lib/format'
import ResultsView from './ResultsView'

const Results: React.FC<{ electionId: string | null; onSelect: (id: string) => void }> = ({ electionId, onSelect }) => {
  const elections = useElections()
  const launched = (elections.data?.items ?? []).filter((election) => election.status === 'launched')
  const selectedId = electionId ?? launched[0]?.id ?? null
  const selected = launched.find((election) => election.id === selectedId)
  const results = useResults(selectedId, { live: selected?.phase === 'active' })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Results</h2>
        {launched.length > 0 && (
          <select
            aria-label="Election"
            value={selectedId ?? ''}
            onChange={(event) => onSelect(event.target.value)}
            className="h-10 min-w-[240px] rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {launched.map((election) => <option key={election.id} value={election.id}>{election.title}</option>)}
          </select>
        )}
      </div>

      {elections.isPending || (selectedId && results.isPending) ? (
        <div className="h-48 animate-pulse rounded-lg bg-white" />
      ) : launched.length === 0 ? (
        <div className="bg-white rounded-md p-6 border border-slate-100 text-sm text-slate-500">No results yet. Results appear here once an election is launched.</div>
      ) : results.isError ? (
        <p className="rounded-lg bg-white p-6 text-sm text-rose-600">{errorMessage(results.error)}</p>
      ) : results.data ? (
        <ResultsView results={results.data} accentColor={selected?.branding.primaryColor} />
      ) : null}
    </div>
  )
}

export default Results
