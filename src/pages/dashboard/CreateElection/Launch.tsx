import React from 'react'
import { FiCalendar, FiEdit2, FiInfo } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'
import type { CreateElectionStepId } from '@/pages/dashboard/CreateElection/step-data'

interface LaunchProps {
  onNext?: () => void
  onEdit?: (step: CreateElectionStepId) => void
}

const tabs = ['Confirm Details', 'Confirm Ballot', 'Terms', 'Launch'] as const

const Launch: React.FC<LaunchProps> = ({ onNext, onEdit }) => {
  const { title, description, startDate, endDate } = useCreateElectionStore()

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      : '—'

  const formatTime = (date: Date | null) =>
    date
      ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      : '—'

  return (
    <div className="space-y-8">
      {/* Final Review card */}
      <Card className="mx-auto max-w-[664px] rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex items-center gap-3 px-10 pt-10 max-[560px]:px-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.6667 8.66669L24 16L10.6667 23.3334V8.66669Z" fill="#7D8DF7" />
          </svg>
          <h2 className="text-xl font-medium text-[#111528]">Final Review & Launch</h2>
        </div>

        {/* Navigation tabs */}
        <div className="mt-4 flex border-b border-slate-200 px-10 max-[560px]:px-6">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`border-b-2 px-4 py-3 text-base font-medium transition-colors ${index === 0
                ? 'border-[#003dff] text-[#003dff]'
                : 'border-transparent text-[#111528]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-end gap-8 px-10 pb-10 pt-6 max-[560px]:px-6">
          {/* Election title */}
          <div className="w-full">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-[#202024]">Election title *</p>
              <Button
                variant="ghost"
                className="h-7 gap-1 rounded bg-[#E8EDFF] px-3 text-sm text-[#003dff] hover:bg-[#dce4ff]"
                onClick={() => onEdit?.('basic')}
              >
                <FiEdit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
            <div className="mt-2 flex items-center rounded-lg border border-[#E3E3E3] px-5 py-3">
              <p className="text-base text-[#111528]">{title || 'Untitled election'}</p>
            </div>
          </div>

          {/* Description */}
          <div className="w-full">
            <div className="flex items-center gap-1">
              <p className="text-lg font-medium text-[#202024]">Description</p>
              <FiInfo className="h-5 w-5 text-[#9CA3AF]" />
            </div>
            <div className="mt-2 flex items-start rounded-lg border border-[#E3E3E3] px-5 py-3">
              <p className="text-base leading-6 text-[#5A5F73]">{description || 'No description provided'}</p>
            </div>
          </div>

          {/* Election date & time */}
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="text-lg font-medium text-[#202024]">Election Date & Time</p>
                <FiInfo className="h-5 w-5 text-[#9CA3AF]" />
              </div>
              <Button
                variant="ghost"
                className="h-7 gap-1 rounded bg-[#E8EDFF] px-3 text-sm text-[#003dff] hover:bg-[#dce4ff]"
                onClick={() => onEdit?.('basic')}
              >
                <FiEdit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-[#111528]">Start Date</p>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-[#E3E3E3] px-5 py-3">
                  <p className="text-base text-[#111528]">{formatDate(startDate)}</p>
                  <FiCalendar className="h-4 w-4 text-[#9CA3AF]" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#111528]">End Date</p>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-[#E3E3E3] px-5 py-3">
                  <p className="text-base text-[#111528]">{formatDate(endDate)}</p>
                  <FiCalendar className="h-4 w-4 text-[#9CA3AF]" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#111528]">Start Time</p>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-[#E3E3E3] px-5 py-3">
                  <p className="text-base text-[#111528]">{formatTime(startDate)}</p>
                  <svg className="h-4 w-4 text-[#9CA3AF]" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#111528]">End Time</p>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-[#E3E3E3] px-5 py-3">
                  <p className="text-base text-[#111528]">{formatTime(endDate)}</p>
                  <svg className="h-4 w-4 text-[#9CA3AF]" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <Button
            className="h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]"
            onClick={onNext}
          >
            Continue
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.16666 10H15.8333M10 4.16669L15.8333 10L10 15.8334" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Launch