import React, { useState } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import { useElection } from '@/lib/api/hooks'
import { errorMessage, formatDateTime } from '@/lib/format'
import LoadingScreen from '@/pages/LoadingScreen'
import { BallotForm, VotingLayout } from './BallotShell'

/** The organiser sees the ballot exactly as voters will; nothing is submitted. */
const PreviewPage: React.FC<{ electionId: string }> = ({ electionId }) => {
  const election = useElection(electionId)
  const [submitted, setSubmitted] = useState(false)

  if (election.isPending) return <LoadingScreen />
  if (election.isError) {
    return (
      <VotingLayout>
        <p className="rounded-xl bg-white p-8 text-center text-rose-600">{errorMessage(election.error)}</p>
      </VotingLayout>
    )
  }

  const data = election.data
  const banner = (
    <div className="bg-amber-100 px-5 py-2 text-center text-sm font-medium text-amber-800">
      Preview mode: this is what voters will see. Test votes are not recorded.
    </div>
  )

  return (
    <VotingLayout branding={data.branding} title={data.title} banner={banner}>
      {data.description && <p className="mb-6 text-slate-600">{data.description}</p>}
      <p className="mb-6 text-sm text-slate-500">Voting {formatDateTime(data.startAt)} – {formatDateTime(data.endAt)}</p>

      {data.ballot.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500">The ballot is empty. Add positions and candidates in the Ballot step.</p>
      ) : submitted ? (
        <div className="rounded-xl bg-white p-10 text-center">
          <FiCheckCircle className="mx-auto h-12 w-12" style={{ color: 'var(--accent)' }} />
          <h2 className="mt-4 text-xl font-semibold">Preview vote finished</h2>
          <p className="mt-2 text-slate-500">Voters see this confirmation after voting. Nothing was recorded.</p>
          <button type="button" className="mt-6 text-sm font-medium underline" onClick={() => setSubmitted(false)}>Try again</button>
        </div>
      ) : (
        <BallotForm ballot={data.ballot} submitLabel="Finish preview" onSubmit={() => setSubmitted(true)} />
      )}
    </VotingLayout>
  )
}

export default PreviewPage
