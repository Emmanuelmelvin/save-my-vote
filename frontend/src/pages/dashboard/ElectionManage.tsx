import React, { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FiArrowLeft, FiBarChart2, FiCopy, FiMail, FiPlus, FiRefreshCw, FiSend, FiTrash2 } from 'react-icons/fi'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { invalidateElection, queryKeys, useElection, useVoters } from '@/lib/api/hooks'
import { api } from '@/lib/api/services'
import type { VoterSummary } from '@/lib/api/types'
import { errorMessage, formatDateTime } from '@/lib/format'
import { PhaseBadge, StatTile } from './shared'

interface ElectionManageProps {
  electionId: string
  onBack: () => void
  onResults: (id: string) => void
}

const toLocalInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const VoterStatus: React.FC<{ voter: VoterSummary }> = ({ voter }) => {
  if (voter.hasVoted) return <span className="text-emerald-600">Voted</span>
  if (voter.locked) return <span className="text-rose-600">Locked out</span>
  if (voter.invited) return <span className="text-slate-600">Invited</span>
  return <span className="text-slate-400">Not invited yet</span>
}

/** Day-to-day controls for a launched election. */
const ElectionManage: React.FC<ElectionManageProps> = ({ electionId, onBack, onResults }) => {
  const client = useQueryClient()
  const election = useElection(electionId)
  const voters = useVoters(electionId)
  const [newEndAt, setNewEndAt] = useState('')
  const [voterName, setVoterName] = useState('')
  const [voterEmail, setVoterEmail] = useState('')
  const [search, setSearch] = useState('')

  const refresh = () =>
    Promise.all([
      invalidateElection(client, electionId),
      client.invalidateQueries({ queryKey: queryKeys.voters(electionId) }),
    ])

  const onError = (error: unknown) => toast.error(errorMessage(error))

  const sendInvitations = useMutation({
    mutationFn: () => api.voters.sendInvitations(electionId),
    onSuccess: (result) => {
      toast.success(result.sent ? `${result.sent} invitation${result.sent === 1 ? '' : 's'} sent` : 'Everyone has already been invited')
      if (result.failed) toast.error(`${result.failed} invitation${result.failed === 1 ? '' : 's'} could not be sent`)
      void refresh()
    },
    onError,
  })
  const sendReminders = useMutation({
    mutationFn: () => api.voters.sendReminders(electionId),
    onSuccess: (result) => {
      toast.success(`${result.sent} reminder${result.sent === 1 ? '' : 's'} sent`)
      if (result.failed) toast.error(`${result.failed} reminder${result.failed === 1 ? '' : 's'} could not be sent`)
    },
    onError,
  })
  const extend = useMutation({
    mutationFn: () => api.elections.extend(electionId, new Date(newEndAt)),
    onSuccess: () => {
      toast.success('End time extended')
      setNewEndAt('')
      void refresh()
    },
    onError,
  })
  const close = useMutation({
    mutationFn: () => api.elections.close(electionId),
    onSuccess: () => {
      toast.success('Voting closed')
      void refresh()
    },
    onError,
  })
  const addVoter = useMutation({
    mutationFn: () => api.voters.add(electionId, [{ email: voterEmail.trim(), ...(voterName.trim() ? { fullName: voterName.trim() } : {}) }]),
    onSuccess: (result) => {
      toast.success(result.added ? 'Voter added. They’ll get their invitation automatically.' : 'That voter is already on the list')
      setVoterName('')
      setVoterEmail('')
      void refresh()
    },
    onError,
  })
  const removeVoter = useMutation({
    mutationFn: (voterId: string) => api.voters.remove(electionId, voterId),
    onSuccess: () => {
      toast.success('Voter removed')
      void refresh()
    },
    onError,
  })
  const resend = useMutation({
    mutationFn: (voterId: string) => api.voters.resendInvitation(electionId, voterId),
    onSuccess: () => {
      toast.success('A new code was sent')
      void refresh()
    },
    onError,
  })

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const list = voters.data ?? []
    return query ? list.filter((v) => `${v.fullName ?? ''} ${v.email}`.toLowerCase().includes(query)) : list
  }, [search, voters.data])

  if (election.isPending) return <div className="h-64 animate-pulse rounded-lg bg-white" />
  if (election.isError) return <p className="rounded-lg bg-white p-6 text-sm text-rose-600">{errorMessage(election.error)}</p>

  const data = election.data
  const { phase, analytics } = data
  const open = phase === 'upcoming' || phase === 'active'

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <FiArrowLeft className="h-4 w-4" />All elections
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-800">{data.title}</h2>
          <PhaseBadge phase={phase} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{formatDateTime(data.startAt)} – {formatDateTime(data.endAt)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Voters" value={analytics.totalVoters} />
        <StatTile label="Voted" value={analytics.votersWhoVoted} />
        <StatTile label="Turnout" value={`${analytics.turnout}%`} />
        <StatTile label="Votes cast" value={analytics.totalVotes} />
      </div>

      <section className="rounded-lg border border-slate-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700">Voting link</h3>
        <p className="mt-1 text-sm text-slate-500">Voters sign in here with their email and the one-time code from their invitation.</p>
        <div className="mt-3 flex items-center rounded-lg border border-slate-200">
          <span className="flex-1 select-all truncate px-3 py-2 text-sm text-slate-600">{data.votingLink}</span>
          <button
            type="button"
            className="flex h-9 w-10 items-center justify-center bg-[#e8edff] text-slate-600"
            aria-label="Copy voting link"
            onClick={() =>
              navigator.clipboard
                .writeText(data.votingLink)
                .then(() => toast.success('Link copied'))
                .catch(() => toast.error('Couldn’t copy the link. Select it and copy it instead.'))
            }
          >
            <FiCopy className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700">Actions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" disabled={!open || sendInvitations.isPending} onClick={() => sendInvitations.mutate()}>
            <FiSend className="h-4 w-4" />Send invitations now
          </Button>
          <Button variant="outline" className="gap-2" disabled={phase !== 'active' || sendReminders.isPending} onClick={() => sendReminders.mutate()}>
            <FiMail className="h-4 w-4" />Remind non-voters
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => onResults(electionId)}>
            <FiBarChart2 className="h-4 w-4" />View results
          </Button>
          <Button
            variant="ghost"
            className="gap-2 text-rose-600 hover:bg-rose-50"
            disabled={!open || close.isPending}
            onClick={() => {
              if (window.confirm('Close voting now? Voters will no longer be able to vote.')) close.mutate()
            }}
          >
            Close election
          </Button>
        </div>
        {phase === 'upcoming' && (
          <p className="mt-3 text-xs text-slate-500">Invitations with one-time codes go out automatically shortly before voting opens.</p>
        )}

        {open && (
          <form
            className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (newEndAt) extend.mutate()
            }}
          >
            <label className="text-sm text-slate-600">
              Extend end time
              <Input
                type="datetime-local"
                value={newEndAt}
                min={toLocalInputValue(new Date(data.endAt))}
                onChange={(event) => setNewEndAt(event.target.value)}
                className="mt-1 h-10 w-full sm:w-[240px]"
              />
            </label>
            <Button type="submit" className="h-10 bg-[#003dff] text-white" disabled={!newEndAt || extend.isPending}>Extend</Button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-slate-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-700">Voters</h3>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search voters…" aria-label="Search voters" className="h-9 w-full sm:w-[220px]" />
        </div>

        {open && (
          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (voterEmail.trim()) addVoter.mutate()
            }}
          >
            <Input value={voterName} onChange={(event) => setVoterName(event.target.value)} placeholder="Full name" aria-label="New voter's full name" className="h-10 w-full sm:w-[200px]" />
            <Input type="email" required value={voterEmail} onChange={(event) => setVoterEmail(event.target.value)} placeholder="Email address" aria-label="New voter's email address" className="h-10 w-full sm:w-[240px]" />
            <Button type="submit" variant="outline" className="h-10 gap-2 border-[#3758f9] text-[#3758f9]" disabled={addVoter.isPending}>
              <FiPlus className="h-4 w-4" />Add voter
            </Button>
          </form>
        )}

        {voters.isPending ? (
          <div className="mt-4 h-24 animate-pulse rounded bg-slate-50" />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-[#e5e7eb] text-xs font-medium uppercase text-[#111928]">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((voter) => (
                  <tr key={voter.id}>
                    <td className="px-3 py-2">{voter.fullName || '—'}</td>
                    <td className="px-3 py-2">{voter.email}</td>
                    <td className="px-3 py-2"><VoterStatus voter={voter} /></td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        {open && !voter.hasVoted && (
                          <>
                            <button type="button" title="Send a new code" aria-label={`Send ${voter.email} a new code`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#003dff]" disabled={resend.isPending} onClick={() => resend.mutate(voter.id)}>
                              <FiRefreshCw className="h-4 w-4" />
                            </button>
                            <button type="button" title="Remove voter" aria-label={`Remove ${voter.email}`} className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" disabled={removeVoter.isPending} onClick={() => {
                              if (window.confirm(`Remove ${voter.fullName || voter.email} from this election? Their code will stop working.`)) removeVoter.mutate(voter.id)
                            }}>
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">No voters found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default ElectionManage
