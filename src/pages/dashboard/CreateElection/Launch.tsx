import React, { useState } from 'react'
import { FiCalendar, FiEdit2, FiInfo } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'
import type { CreateElectionStepId } from '@/pages/dashboard/CreateElection/step-data'

interface LaunchProps {
  onEdit?: (step: CreateElectionStepId) => void
}

const tabs = ['Confirm Details', 'Confirm Ballot', 'Terms', 'Launch'] as const

const Launch: React.FC<LaunchProps> = ({ onEdit }) => {
  const { title, description, startDate, endDate, positions } = useCreateElectionStore()
  const [activeTab, setActiveTab] = useState<string>(tabs[0])
  const [agreed, setAgreed] = useState(false)

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
      <Card className="mx-auto max-w-[664px] rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex items-center gap-3 px-10 pt-10 max-[560px]:px-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.6667 8.66669L24 16L10.6667 23.3334V8.66669Z" fill="#7D8DF7" />
          </svg>
          <h2 className="text-xl font-medium text-[#111528]">Final Review & Launch</h2>
        </div>

        {/* Navigation tabs */}
        <div className="mt-4 flex border-b border-slate-200 px-10 max-[560px]:px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-3 text-base font-medium transition-colors ${activeTab === tab
                ? 'border-[#003dff] text-[#003dff]'
                : 'border-transparent text-[#111528]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Confirm Details' && (
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

            <Button className="h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]" onClick={() => setActiveTab('Confirm Ballot')}>
              Continue
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.16666 10H15.8333M10 4.16669L15.8333 10L10 15.8334" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        )}

        {activeTab === 'Confirm Ballot' && (
          <div className="flex flex-col items-end gap-6 px-10 pb-10 pt-6 max-[560px]:px-6">
            <div className="w-full space-y-4">
              {positions.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No positions added yet.</p>
              ) : (
                positions.map((position) => (
                  <div key={position.id} className="rounded-xl border border-[#E3E3E3] bg-[#F9FAFB] p-0 pb-3">
                    {/* Position header */}
                    <div className="flex items-center justify-between border-b border-[#E3E3E3] px-6 py-4">
                      <p className="text-xl font-medium text-[#111528]">{position.title}</p>
                      <Button
                        variant="ghost"
                        className="h-7 gap-1 rounded bg-[#E8EDFF] px-3 text-sm text-[#003dff] hover:bg-[#dce4ff]"
                        onClick={() => onEdit?.('ballot')}
                      >
                        <FiEdit2 className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </div>

                    {/* Candidates */}
                    <div className="space-y-0">
                      {position.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center gap-5 border-b border-[#E3E3E3]/50 px-[15px] py-[10px] last:border-b-0"
                        >
                          {candidate.photo ? (
                            <img
                              src={candidate.photo}
                              alt={candidate.name}
                              className="h-[84px] w-[84px] rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#e8edff] text-2xl font-semibold text-[#003dff]">
                              {candidate.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <p className="text-base font-medium text-[#111528]">{candidate.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button className="h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]" onClick={() => setActiveTab('Terms')}>
              Continue
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.16666 10H15.8333M10 4.16669L15.8333 10L10 15.8334" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        )}

        {activeTab === 'Terms' && (
          <div className="flex flex-col items-end gap-6 px-10 pb-10 pt-6 max-[560px]:px-6">
            <div className="w-full space-y-4">
              {/* After launch, you cannot */}
              <div>
                <p className="text-base font-bold text-[#111528]">After launch, <span className="font-bold">you cannot</span>:</p>
                <div className="mt-2 rounded-2xl border border-[#E3E3E3] bg-[#F3F4F6] p-6">
                  <ul className="space-y-3 text-base leading-6 text-[#272935]">
                    <li>- Edit or delete positions or candidates</li>
                    <li>- Change the election start date & Time</li>
                  </ul>
                  <p className="mt-4 text-base leading-6 text-[#272935]">To make these changes, you must cancel and recreate the election</p>
                </div>
              </div>

              {/* After launch, you can */}
              <div>
                <p className="text-base font-bold text-[#111528]">After launch, <span className="font-bold">you can</span>:</p>
                <div className="mt-2 rounded-2xl border border-[#E3E3E3] bg-[#F3F4F6] p-6">
                  <ul className="space-y-3 text-base leading-6 text-[#272935]">
                    <li>- Add, edit, or remove voters</li>
                    <li>- Extend the end date</li>
                    <li>- Close the election</li>
                  </ul>
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-[#003dff] focus:ring-[#003dff]"
                />
                <span className="text-sm text-[#5A5F73]">By continuing, you agree to the Privacy Policy and Terms of Service</span>
              </label>
            </div>

            <Button
              className="h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!agreed}
              onClick={() => setActiveTab('Launch')}
            >
              Continue
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.16666 10H15.8333M10 4.16669L15.8333 10L10 15.8334" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Launch