import React, { useState } from 'react'
import { FiCheckCircle, FiSend } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'

interface LaunchProps {
  onNext?: () => void
}

const Launch: React.FC<LaunchProps> = ({ onNext }) => {
  const { title, voters, positions, startDate } = useCreateElectionStore()
  const [isLaunched, setIsLaunched] = useState(false)

  const launchElection = () => {
    setIsLaunched(true)
    onNext?.()
  }

  return (
    <Card className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#1050ff]"><FiSend size={18} /></span>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Launch</h3>
          <p className="mt-0.5 text-sm text-slate-500">Publish your election when everything is ready.</p>
        </div>
      </div>

      {isLaunched ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-7 text-center">
          <FiCheckCircle className="mx-auto h-10 w-10 text-emerald-500" />
          <h4 className="mt-4 text-lg font-semibold text-emerald-800">Election ready to launch</h4>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-700">{title || 'Your election'} has passed the setup review and is ready for voters.</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-sm font-semibold text-slate-800">Final checklist</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4"><p className="text-xs text-slate-400">Election</p><p className="mt-1 truncate text-sm font-semibold text-slate-700">{title || 'Untitled'}</p></div>
              <div className="rounded-xl bg-white p-4"><p className="text-xs text-slate-400">Voters</p><p className="mt-1 text-sm font-semibold text-slate-700">{voters.length} registered</p></div>
              <div className="rounded-xl bg-white p-4"><p className="text-xs text-slate-400">Positions</p><p className="mt-1 text-sm font-semibold text-slate-700">{positions.length} configured</p></div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-500">Launching will make this election available to your voter list{startDate ? ` from ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}.</p>
        </>
      )}

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <Button className="h-11 rounded-lg bg-[#1050ff] px-6 font-medium text-white hover:bg-[#003fe6]" onClick={launchElection} disabled={isLaunched}>{isLaunched ? 'Launched' : 'Launch election'}</Button>
      </div>
    </Card>
  )
}

export default Launch
