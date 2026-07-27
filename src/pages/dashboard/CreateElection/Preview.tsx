import React, { useState } from 'react'
import { FiCalendar, FiCopy, FiEdit2, FiInfo } from 'react-icons/fi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'
import type { CreateElectionStepId } from './step-data'

interface PreviewProps {
  onNext?: () => void
  onEdit?: (step: CreateElectionStepId) => void
}

const Preview: React.FC<PreviewProps> = ({ onNext, onEdit }) => {
  const [, setCopied] = useState(false)
  const { title, description, startDate, endDate } = useCreateElectionStore()

  const previewUrl = 'https://saveourvotes.com/preview/Tw8Q6/T4h7xbS7Ef03jeCy'

  const handleCopy = () => {
    navigator.clipboard.writeText(previewUrl).then(() => {
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
      {/* Preview link card */}
      <Card className="mx-auto max-w-[664px] rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex items-center gap-3 px-10 pt-10 max-[560px]:px-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.6667 8.66669L24 16L10.6667 23.3334V8.66669Z" fill="#7D8DF7" />
          </svg>
          <h2 className="text-xl font-medium text-[#111528]">Preview</h2>
        </div>

        <div className="flex flex-col items-end gap-8 px-10 pb-10 pt-4 max-[560px]:px-6">
          <p className="w-full text-base leading-6 text-[#111528]">
            Preview lets you see and test the election just like a voter — your test vote won't be counted.
          </p>

          <div className="w-full rounded-2xl border border-[#E3E3E3] bg-[#F3F4F6] p-6">
            <p className="text-sm leading-[22px] text-[#272935]">
              This link can be shared with anyone, but it only works while the election is still being set up
            </p>

            <div className="mt-2 flex items-center rounded-lg bg-white">
              <div className="flex-1 truncate px-3 py-2 text-sm leading-[22px] text-[#5A5F73]">
                {previewUrl}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-[34px] w-[35px] shrink-0 items-center justify-center bg-[#E8EDFF]"
                aria-label="Copy preview link"
              >
                <FiCopy className="h-5 w-5 text-[#5A5F73]" />
              </button>
            </div>
          </div>

          <Button
            className="h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]"
            onClick={onNext}
          >
            Preview Election
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.66667 5.41669L15 10L6.66667 14.5834V5.41669Z" fill="white" />
            </svg>
          </Button>
        </div>
      </Card>

      {/* Final Review card */}
      <Card className="mx-auto max-w-[664px] rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex items-center gap-3 px-10 pt-10 max-[560px]:px-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.6667 8.66669L24 16L10.6667 23.3334V8.66669Z" fill="#7D8DF7" />
          </svg>
          <h2 className="text-xl font-medium text-[#111528]">Final Review & Launch</h2>
        </div>

        <div className="flex flex-col items-end gap-8 px-10 pb-10 pt-4 max-[560px]:px-6">
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

export default Preview