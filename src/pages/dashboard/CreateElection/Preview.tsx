import React from 'react'
import { FiCalendar, FiCheckCircle, FiEye, FiList, FiMail, FiUsers } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'

interface PreviewProps {
  onNext?: () => void
}

const formatDate = (date: Date | null) => date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'

const Preview: React.FC<PreviewProps> = ({ onNext }) => {
  const { title, description, startDate, endDate, voters, positions, emailTemplates, branding } = useCreateElectionStore()

  return (
    <Card className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#1050ff]"><FiEye size={18} /></span>
        <div>
          <h3 className="text-base font-semibold text-slate-800">Preview</h3>
          <p className="mt-0.5 text-sm text-slate-500">Review the election before you publish it.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="p-5 text-white" style={{ background: branding.heroImage ? `linear-gradient(90deg, ${branding.primaryColor}e6, ${branding.primaryColor}99), url(${branding.heroImage}) center/cover` : branding.primaryColor }}>
          <div className="flex items-center gap-3">
            {branding.logo ? <img src={branding.logo} alt="Election logo" className="h-10 w-10 rounded-lg bg-white object-contain p-1" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20"><FiEye className="h-5 w-5" /></div>}
            <span className="text-sm font-medium text-white/80">Save our vote</span>
          </div>
          <h4 className="mt-8 text-2xl font-semibold">{title || 'Untitled election'}</h4>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">{description || 'Your election description will appear here.'}</p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4"><FiCalendar className="h-4 w-4 text-[#1050ff]" /><p className="mt-3 text-xs text-slate-400">Voting window</p><p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(startDate)} – {formatDate(endDate)}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><FiUsers className="h-4 w-4 text-[#1050ff]" /><p className="mt-3 text-xs text-slate-400">Voters</p><p className="mt-1 text-sm font-semibold text-slate-700">{voters.length} registered</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><FiList className="h-4 w-4 text-[#1050ff]" /><p className="mt-3 text-xs text-slate-400">Ballot</p><p className="mt-1 text-sm font-semibold text-slate-700">{positions.length} position{positions.length === 1 ? '' : 's'}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><FiMail className="h-4 w-4 text-[#1050ff]" /><p className="mt-3 text-xs text-slate-400">Email messages</p><p className="mt-1 text-sm font-semibold text-slate-700">{emailTemplates.length} configured</p></div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          <p className="flex items-center gap-2 font-medium text-emerald-600"><FiCheckCircle className="h-4 w-4" /> Your setup is ready for launch.</p>
          <p className="mt-1">You can still return to a previous step using the menu on the left.</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <Button className="h-11 rounded-lg bg-[#1050ff] px-6 font-medium text-white hover:bg-[#003fe6]" onClick={onNext}>Continue to launch</Button>
      </div>
    </Card>
  )
}

export default Preview
