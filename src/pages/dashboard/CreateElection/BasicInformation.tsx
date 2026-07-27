import React from 'react'
import { FiCalendar, FiFileText, FiInfo } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { TimePicker } from '@/components/ui/time-picker'
import { cn } from '@/lib/utils'
import useCreateElectionStore from '@/store/createElection'

interface DateFieldProps {
  label: string
  date: Date | null
  onChange: (date: Date | null) => void
}

const DateField: React.FC<DateFieldProps> = ({ label, date, onChange }) => {
  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) return
    const baseDate = date ? new Date(date) : new Date()
    const updatedDate = new Date(selectedDay)
    updatedDate.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0)
    onChange(updatedDate)
  }

  const formattedDate = date
    ? `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    : null

  return (
    <div className="flex flex-1 flex-col space-y-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('h-11 w-full justify-start border-slate-200 px-4 text-left font-normal transition-colors hover:border-[#1050ff] hover:bg-white', !date && 'text-muted-foreground')}>
            <FiCalendar className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
            <span className={date ? 'font-medium text-slate-800' : 'text-slate-400'}>{formattedDate ?? 'Select date & time'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl" align="start">
          <Calendar mode="single" selected={date ?? undefined} onSelect={handleDateSelect} className="border-0 p-0" />
          <TimePicker date={date} setDate={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface BasicInformationProps {
  onNext?: () => void
}

const BasicInformation: React.FC<BasicInformationProps> = ({ onNext }) => {
  const { title, description, startDate, endDate, setBasicInfo } = useCreateElectionStore()
  const datesAreValid = Boolean(startDate && endDate && endDate > startDate)
  const canProceed = title.trim().length > 0 && datesAreValid

  return (
    <Card className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#1050ff]"><FiFileText size={18} /></span>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
          <p className="mt-0.5 text-sm text-slate-500">Set the details voters will see before they cast a ballot.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="election-title" className="block text-sm font-medium text-slate-700">Election title<span className="text-rose-500">*</span></label>
          <Input id="election-title" value={title} onChange={(event) => setBasicInfo({ title: event.target.value, description, startDate, endDate })} className="mt-2 h-11 rounded-lg border-slate-200 text-sm focus-visible:border-[#1050ff]" placeholder="Senate Elections 2026" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="election-description" className="block text-sm font-medium text-slate-700">Description</label>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" aria-label="Description help"><FiInfo size={14} /></Button>
          </div>
          <Textarea id="election-description" value={description} onChange={(event) => setBasicInfo({ title, description: event.target.value, startDate, endDate })} className="mt-2 h-28 resize-none rounded-lg border-slate-200 p-3 text-sm focus-visible:border-[#1050ff]" placeholder="This election will determine the new executives..." />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Election date & time</label>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" aria-label="Date and time help"><FiInfo size={14} /></Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <DateField label="Start date" date={startDate} onChange={(date) => setBasicInfo({ title, description, startDate: date, endDate })} />
            <DateField label="End date" date={endDate} onChange={(date) => setBasicInfo({ title, description, startDate, endDate: date })} />
          </div>
        </div>

        {startDate && endDate && endDate <= startDate && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">End date and time must be after the start date and time.</p>}

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button className="h-11 rounded-lg bg-[#1050ff] px-6 font-medium text-white hover:bg-[#003fe6] disabled:cursor-not-allowed disabled:opacity-50" disabled={!canProceed} onClick={onNext}>Next</Button>
        </div>
      </div>
    </Card>
  )
}

export default BasicInformation
