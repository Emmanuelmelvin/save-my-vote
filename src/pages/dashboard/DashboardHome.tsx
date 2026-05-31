import React from 'react'
import { FilterPill, BallotSvg } from './shared'

const DashboardHome: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
  return (
    <div>
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">All Elections</h2>
        <div className="flex gap-3">
          <FilterPill active>All</FilterPill>
          <FilterPill>Active</FilterPill>
          <FilterPill>Upcoming</FilterPill>
          <FilterPill>Drafts</FilterPill>
          <FilterPill>Completed</FilterPill>
        </div>
      </section>

      <section className="bg-white rounded-lg p-16 mt-6 text-center border border-slate-100">
        <div className="flex flex-col items-center gap-5">
          <BallotSvg />
          <h3 className="text-lg font-semibold">You don’t have any elections created</h3>
          <p className="text-sm text-slate-400">Start by creating your first election</p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg" onClick={onCreate}>Create new Election</button>
        </div>
      </section>
    </div>
  )
}

export default DashboardHome
