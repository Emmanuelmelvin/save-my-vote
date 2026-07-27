import React from 'react'
import { FiFileText, FiInfo, FiCalendar } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

  const handleTimeChange = (newDate: Date | null) => {
    onChange(newDate)
  }

  const formattedDate = date
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null

  return (
    <div className="flex flex-col space-y-1.5 flex-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-11 px-4 border-slate-200 hover:border-[#1050ff] hover:bg-white transition-colors",
              !date && "text-muted-foreground"
            )}
          >
            <FiCalendar className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
            <span className={date ? 'text-slate-800 font-medium' : 'text-slate-400'}>
              {formattedDate ?? 'Select date & time'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-white border border-slate-200 shadow-xl rounded-xl" align="start">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={handleDateSelect}
            className="p-0 border-0"
          />
          <TimePicker date={date} setDate={handleTimeChange} />
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

  const canProceed = title.trim().length > 0 && Boolean(startDate && endDate && endDate > startDate)

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
          <label className="block text-sm font-medium text-slate-700">Election title*</label>
          <Input
            value={title}
            onChange={(e) => setBasicInfo({ title: e.target.value, description, startDate, endDate })}
            className={cn(
              "mt-2 w-full h-11 rounded-md px-3 text-sm border focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:border-blue-400 border-slate-200"
            )}
            placeholder="Senate Elections 2025"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" aria-label="Description help">
              <FiInfo size={14} />
            </Button>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setBasicInfo({ title, description: e.target.value, startDate, endDate })}
            className="mt-2 w-full border border-slate-200 rounded-md p-3 text-sm h-28 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:border-blue-400 resize-none"
            placeholder="This election will determine the new executives..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">Election Date & Time</label>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" aria-label="Date and time help">
              <FiInfo size={14} />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <DateField label="Start date" date={startDate} onChange={(d) => setBasicInfo({ title, description, startDate: d, endDate })} />
            <DateField label="End date" date={endDate} onChange={(d) => setBasicInfo({ title, description, startDate, endDate: d })} />
          </div>
        </div>

        {startDate && endDate && endDate <= startDate && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">End date and time must be after the start date and time.</p>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button
            className="px-6 h-11 font-medium rounded-md shadow-sm bg-[#1050ff] hover:bg-[#003fe6] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canProceed}
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default BasicInformation
