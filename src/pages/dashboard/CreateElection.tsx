import React, { useState } from 'react';
import { FiList, FiUsers, FiMail, FiImage, FiEye, FiPlus, FiFileText, FiInfo } from 'react-icons/fi';
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'

const mergeDateAndTime = (base: Date | null, nextDate: Date | undefined) => {
  if (!nextDate) return base
  const current = base ?? new Date()
  const merged = new Date(nextDate)
  merged.setHours(current.getHours(), current.getMinutes(), 0, 0)
  return merged
}

const CreateElection: React.FC = () => {
  const [activeStep] = useState(0)
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const steps = [
    { key: 'basic', label: 'Basic Info', icon: <FiList /> },
    { key: 'voters', label: 'Voters', icon: <FiUsers /> },
    { key: 'ballot', label: 'Ballot', icon: <FiList /> },
    { key: 'emails', label: 'Emails', icon: <FiMail /> },
    { key: 'branding', label: 'Branding', icon: <FiImage /> },
    { key: 'preview', label: 'Preview', icon: <FiEye /> },
    { key: 'launch', label: 'Launch', icon: <FiPlus /> },
  ]

  return (
    <div className="flex gap-8">
      {/* desktop left steps */}
      <aside className="hidden md:block w-64">
        <div className="bg-white rounded-md p-4 border border-slate-100">
          <ul className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={s.key}
                className={`flex items-center gap-3 cursor-default p-2 rounded-md ${
                  i === activeStep ? 'bg-[#eef2ff] text-[#0b45e4] font-medium' : 'text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${i === activeStep ? 'bg-[#1050ff] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="ml-1">{s.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* mobile steps shown at top before the Basic Information card */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-md p-2 border border-slate-100 overflow-x-auto">
            <div className="flex gap-2">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                    i === activeStep ? 'bg-[#1050ff] text-white' : 'bg-white text-slate-700 border border-slate-100'
                  }`}
                >
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-sm">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                <FiFileText size={18} />
              </div>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Election title*</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitleTouched(true)}
                className={`mt-2 w-full rounded-md p-3 text-sm outline-none border ${titleTouched && !title.trim() ? 'border-rose-400' : 'border-slate-200'} focus:border-blue-400`}
                placeholder="Senate Elections 2025"
              />
              {titleTouched && !title.trim() && (
                <p className="mt-1 text-xs text-rose-500">Please include your election name</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <Button variant="ghost" size="icon" className="text-slate-500" aria-label="Description help">
                  <FiInfo size={16} />
                </Button>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-md p-3 text-sm h-24 outline-none focus:border-blue-400 resize-none"
                placeholder="This election will determine the new executives for the Faculty of Engineering for the 2025 academic year."
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-700">Election Date & Time</label>
                <Button variant="ghost" size="icon" className="text-slate-500" aria-label="Date and time help">
                  <FiInfo size={16} />
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Start date</label>
                  <div className="mt-1 rounded-md border border-slate-200 p-3">
                    <Calendar
                      mode="single"
                      selected={startDate ?? undefined}
                      onSelect={(date) => setStartDate(mergeDateAndTime(startDate, date))}
                      className="rounded-md border-0"
                    />
                    <label className="mt-3 block text-xs text-slate-500">Start time</label>
                    <Input
                      type="time"
                      value={startDate ? `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}` : ''}
                      onChange={(event) => {
                        const [hours, minutes] = event.target.value.split(':').map(Number)
                        if (!startDate || Number.isNaN(hours) || Number.isNaN(minutes)) return
                        const next = new Date(startDate)
                        next.setHours(hours, minutes, 0, 0)
                        setStartDate(next)
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">End date</label>
                  <div className="mt-1 rounded-md border border-slate-200 p-3">
                    <Calendar
                      mode="single"
                      selected={endDate ?? undefined}
                      onSelect={(date) => setEndDate(mergeDateAndTime(endDate, date))}
                      className="rounded-md border-0"
                    />
                    <label className="mt-3 block text-xs text-slate-500">End time</label>
                    <Input
                      type="time"
                      value={endDate ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}` : ''}
                      onChange={(event) => {
                        const [hours, minutes] = event.target.value.split(':').map(Number)
                        if (!endDate || Number.isNaN(hours) || Number.isNaN(minutes)) return
                        const next = new Date(endDate)
                        next.setHours(hours, minutes, 0, 0)
                        setEndDate(next)
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button className="px-6 py-3 rounded-md shadow-sm bg-[#1050ff] text-white">Save & Continue</Button>
            </div>
            </div>
        </Card>
      </div>
    </div>
  )
}

export default CreateElection
