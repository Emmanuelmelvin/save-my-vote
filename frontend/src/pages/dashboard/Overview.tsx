import React, { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FiBarChart2, FiCalendar, FiEdit2, FiSettings, FiTrash2, FiUsers } from 'react-icons/fi'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { queryKeys, useElections } from '@/lib/api/hooks'
import { api } from '@/lib/api/services'
import type { ElectionPhase, ElectionSummary } from '@/lib/api/types'
import { errorMessage, formatDateTime } from '@/lib/format'
import { BallotSvg, FilterPill, PhaseBadge } from './shared'

type Filter = 'all' | ElectionPhase

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'draft', label: 'Drafts' },
  { key: 'ended', label: 'Completed' },
]

interface OverviewProps {
  onCreate: () => void
  onEdit: (id: string) => void
  onManage: (id: string) => void
  onResults: (id: string) => void
}

const ElectionCard: React.FC<{ election: ElectionSummary } & Omit<OverviewProps, 'onCreate'>> = ({ election, onEdit, onManage, onResults }) => {
  const client = useQueryClient()
  const remove = useMutation({
    mutationFn: () => api.elections.remove(election.id),
    onSuccess: () => {
      toast.success('Election deleted')
      void client.invalidateQueries({ queryKey: queryKeys.elections })
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
  const { analytics, phase } = election
  const canDelete = phase === 'draft' || phase === 'ended'

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-white p-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-slate-800">{election.title}</h3>
          <PhaseBadge phase={phase} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5"><FiCalendar className="h-4 w-4" />{formatDateTime(election.startAt)} – {formatDateTime(election.endAt)}</span>
          <span className="inline-flex items-center gap-1.5"><FiUsers className="h-4 w-4" />{analytics.totalVoters} voter{analytics.totalVoters === 1 ? '' : 's'}</span>
          {phase !== 'draft' && <span>{analytics.turnout}% turnout</span>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {phase === 'draft' ? (
          <Button variant="secondary" className="h-9 gap-2 bg-[#e8edff] text-[#003dff] hover:bg-[#dce4ff]" onClick={() => onEdit(election.id)}>
            <FiEdit2 className="h-4 w-4" />Continue editing
          </Button>
        ) : (
          <>
            <Button variant="secondary" className="h-9 gap-2 bg-[#e8edff] text-[#003dff] hover:bg-[#dce4ff]" onClick={() => onManage(election.id)}>
              <FiSettings className="h-4 w-4" />Manage
            </Button>
            <Button variant="outline" className="h-9 gap-2 border-slate-200" onClick={() => onResults(election.id)}>
              <FiBarChart2 className="h-4 w-4" />Results
            </Button>
          </>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            className="h-9 gap-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(`Delete "${election.title}"? This can't be undone.`)) remove.mutate()
            }}
          >
            <FiTrash2 className="h-4 w-4" />Delete
          </Button>
        )}
      </div>
    </article>
  )
}

const DashboardHome: React.FC<OverviewProps> = ({ onCreate, onEdit, onManage, onResults }) => {
  const [filter, setFilter] = useState<Filter>('all')
  const elections = useElections()
  const items = useMemo(() => elections.data?.items ?? [], [elections.data])
  const visible = useMemo(() => (filter === 'all' ? items : items.filter((e) => e.phase === filter)), [filter, items])

  return (
    <div>
      <section className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">All Elections</h2>
          {items.length > 0 && <Button className="h-9 bg-blue-600 px-4 text-white" onClick={onCreate}>Create new Election</Button>}
        </div>
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((option) => (
            <FilterPill key={option.key} active={filter === option.key} onClick={() => setFilter(option.key)}>
              {option.label}
            </FilterPill>
          ))}
        </div>
      </section>

      {elections.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => <div key={key} className="h-24 animate-pulse rounded-lg bg-white" />)}
        </div>
      ) : elections.isError ? (
        <section className="rounded-lg border border-rose-100 bg-white p-8 text-center">
          <p className="text-sm text-rose-600">{errorMessage(elections.error)}</p>
          <Button variant="outline" className="mt-4" onClick={() => elections.refetch()}>Try again</Button>
        </section>
      ) : items.length === 0 ? (
        <section className="bg-white rounded-lg p-16 mt-6 text-center border border-slate-100">
          <div className="flex flex-col items-center gap-5">
            <BallotSvg />
            <h3 className="text-lg font-semibold">You don’t have any elections created</h3>
            <p className="text-sm text-slate-400">Start by creating your first election</p>
            <Button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg" onClick={onCreate}>Create new Election</Button>
          </div>
        </section>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">No elections in this category.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((election) => (
            <ElectionCard key={election.id} election={election} onEdit={onEdit} onManage={onManage} onResults={onResults} />
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardHome
