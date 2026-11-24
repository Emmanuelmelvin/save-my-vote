import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FiCheckCircle } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api/client'
import { usePublicElection, usePublicResults } from '@/lib/api/hooks'
import { api } from '@/lib/api/services'
import type { Selection } from '@/lib/api/types'
import { errorMessage, formatDateTime } from '@/lib/format'
import LoadingScreen from '@/pages/LoadingScreen'
import ResultsView from '@/pages/dashboard/ResultsView'
import { AccentButton, BallotForm, VotingLayout } from './BallotShell'

type Step = 'signin' | 'ballot' | 'done'

/** The voter's page: sign in with email + one-time code, vote, done. */
const VotePage: React.FC<{ electionId: string }> = ({ electionId }) => {
  const election = usePublicElection(electionId)
  const ended = election.data?.phase === 'ended'
  const results = usePublicResults(electionId, ended)
  const [step, setStep] = useState<Step>('signin')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [voterName, setVoterName] = useState<string | null>(null)
  const [error, setError] = useState('')

  const verify = useMutation({
    mutationFn: () => api.voting.verify(electionId, { email: email.trim(), otp: code }),
    onSuccess: ({ voter }) => {
      setVoterName(voter.fullName)
      setError('')
      setStep('ballot')
    },
    onError: (err) => setError(errorMessage(err)),
  })

  const vote = useMutation({
    mutationFn: (selections: Selection[]) => api.voting.vote(electionId, { email: email.trim(), otp: code, selections }),
    onSuccess: () => setStep('done'),
    onError: (err) => {
      setError(errorMessage(err))
      // The code stopped working (already voted, locked out, closed): back to sign-in.
      if (err instanceof ApiError && [401, 403, 409].includes(err.status)) setStep('signin')
    },
  })

  if (election.isPending) return <LoadingScreen />
  if (election.isError) {
    return (
      <VotingLayout>
        <div className="rounded-xl bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">This election isn't available</h2>
          <p className="mt-2 text-sm text-slate-500">{election.error instanceof ApiError && election.error.status === 404 ? 'Check that you opened the link from your invitation email.' : errorMessage(election.error)}</p>
        </div>
      </VotingLayout>
    )
  }

  const data = election.data
  return (
    <VotingLayout branding={data.branding} title={data.title}>
      {data.description && step === 'signin' && <p className="mb-6 text-slate-600">{data.description}</p>}

      {data.phase === 'upcoming' && (
        <div className="rounded-xl bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">Voting hasn't opened yet</h2>
          <p className="mt-2 text-slate-500">It opens {formatDateTime(data.startAt)} and closes {formatDateTime(data.endAt)}.</p>
          <p className="mt-1 text-sm text-slate-400">Your one-time code arrives by email shortly before voting opens.</p>
        </div>
      )}

      {ended && (
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6">
            <h2 className="text-lg font-semibold">Voting has closed</h2>
            <p className="mt-1 text-sm text-slate-500">Closed {formatDateTime(data.endAt)}. Final results:</p>
          </div>
          {results.isPending ? (
            <div className="h-48 animate-pulse rounded-xl bg-white" aria-label="Loading results" />
          ) : results.isError ? (
            <p className="rounded-xl bg-white p-6 text-sm text-slate-500">Results aren’t available right now. Please try again shortly.</p>
          ) : (
            results.data && <ResultsView results={results.data} accentColor={data.branding.primaryColor} />
          )}
        </div>
      )}

      {data.phase === 'active' && step === 'signin' && (
        <form
          className="mx-auto max-w-md space-y-5 rounded-xl bg-white p-6"
          onSubmit={(event) => {
            event.preventDefault()
            setError('')
            verify.mutate()
          }}
        >
          <div>
            <h2 className="text-lg font-semibold">Sign in to vote</h2>
            <p className="mt-1 text-sm text-slate-500">Use the email address your invitation was sent to and the 6-character code in it. Voting closes {formatDateTime(data.endAt)}.</p>
          </div>
          <label className="block text-sm font-medium">
            Email address
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" />
          </label>
          <label className="block text-sm font-medium">
            One-time code
            <Input
              required
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
              placeholder="e.g. K7P2QX"
              className="mt-1.5 h-11 font-mono text-lg tracking-[0.3em]"
            />
          </label>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600" role="alert">{error}</p>}
          <AccentButton type="submit" className="w-full" disabled={verify.isPending || code.length !== 6}>
            {verify.isPending ? 'Checking…' : 'Continue to ballot'}
          </AccentButton>
        </form>
      )}

      {data.phase === 'active' && step === 'ballot' && (
        <div className="space-y-4">
          <p className="text-slate-600">{voterName ? `Welcome, ${voterName}.` : 'Welcome.'} Choose one candidate for each position.</p>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600" role="alert">{error}</p>}
          <BallotForm ballot={data.ballot} submitting={vote.isPending} onSubmit={(selections) => vote.mutate(selections)} />
        </div>
      )}

      {step === 'done' && (
        <div className="rounded-xl bg-white p-10 text-center">
          <FiCheckCircle className="mx-auto h-12 w-12" style={{ color: 'var(--accent)' }} />
          <h2 className="mt-4 text-xl font-semibold">Your vote has been recorded</h2>
          <p className="mt-2 text-slate-500">Thank you for voting. Results are published when voting closes on {formatDateTime(data.endAt)}.</p>
        </div>
      )}
    </VotingLayout>
  )
}

export default VotePage
