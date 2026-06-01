import React, { useState } from 'react'
import { FiFileText, FiInfo, FiCalendar } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'
import { cn } from '@/lib/utils'

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

const BasicInformation: React.FC = () => {
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  return (
    <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FiFileText size={20} className="text-slate-700" />
        <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Election title*</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            className={cn(
              "mt-2 w-full h-11 rounded-md px-3 text-sm border focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:border-blue-400",
              titleTouched && !title.trim() ? 'border-rose-400' : 'border-slate-200'
            )}
            placeholder="Senate Elections 2025"
          />
          {titleTouched && !title.trim() && (
            <p className="mt-1.5 text-xs text-rose-500 font-medium">Please include your election name</p>
          )}
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
            onChange={(e) => setDescription(e.target.value)}
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
            <DateField label="Start date" date={startDate} onChange={setStartDate} />
            <DateField label="End date" date={endDate} onChange={setEndDate} />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-50">
          <Button className="px-6 h-11 font-medium rounded-md shadow-sm bg-[#1050ff] hover:bg-[#003fe6] text-white transition-colors">
            Save & Continue
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default BasicInformation