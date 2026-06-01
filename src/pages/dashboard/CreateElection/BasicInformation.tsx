import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiFileText, FiInfo, FiCalendar, FiClock, FiChevronLeft } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const mergeDateAndTime = (base: Date | null, nextDate: Date | undefined) => {
  if (!nextDate) return base
  const current = base ?? new Date()
  const merged = new Date(nextDate)
  merged.setHours(current.getHours(), current.getMinutes(), 0, 0)
  return merged
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = ['00', '15', '30', '45']

const DateField: React.FC<{
  label: string
  date: Date | null
  onChange: (date: Date | null) => void
}> = ({ label, date, onChange }) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'date' | 'time'>('date')
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM')
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Position popup relative to trigger using viewport coords
  const updatePosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popupHeight = 420
    const spaceBelow = window.innerHeight - rect.bottom
    const showAbove = spaceBelow < popupHeight && rect.top > popupHeight

    setPopupStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width < 300 ? 300 : rect.width,
      ...(showAbove
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
      zIndex: 9999,
    })
  }

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setStep('date')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleDateSelect = (nextDate: Date | undefined) => {
    if (!nextDate) return
    onChange(mergeDateAndTime(date, nextDate))
    setStep('time')
  }

  const handleTimeSelect = (hours: number, minuteStr: string) => {
    const minutes = parseInt(minuteStr)
    const base = date ?? new Date()
    const next = new Date(base)
    let h = hours % 12
    if (ampm === 'PM') h += 12
    next.setHours(h, minutes, 0, 0)
    onChange(next)
    setOpen(false)
    setStep('date')
  }

  const formattedDate = date
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  const popup = open ? (
    <div
      ref={popupRef}
      style={popupStyle}
      className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        {step === 'time' ? (
          <button
            type="button"
            onClick={() => setStep('date')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <FiChevronLeft size={14} />
            Back
          </button>
        ) : (
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <FiCalendar size={12} /> Pick a date
          </span>
        )}
        {step === 'time' && (
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <FiClock size={12} /> Pick a time
          </span>
        )}
        <button
          type="button"
          onClick={() => { setOpen(false); setStep('date') }}
          className="text-xs text-slate-400 hover:text-slate-600 ml-auto"
        >
          ✕
        </button>
      </div>

      {step === 'date' && (
        <div className="p-2">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={handleDateSelect}
            className="rounded-md border-0"
          />
        </div>
      )}

      {step === 'time' && (
        <div className="p-4 space-y-4">
          {/* AM/PM toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 text-sm">
            {(['AM', 'PM'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setAmpm(period)}
                className={`flex-1 py-2 font-medium transition-colors ${
                  ampm === period
                    ? 'bg-[#1050ff] text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Hour grid */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Hour</p>
            <div className="grid grid-cols-4 gap-1">
              {HOURS.map((h) => {
                const currentHour = date ? ((date.getHours() % 12) || 12) : null
                const isSelected = currentHour === h
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      const mins = date ? String(date.getMinutes()).padStart(2, '0') : '00'
                      handleTimeSelect(h, mins)
                    }}
                    className={`rounded-md py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1050ff] text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Minute grid */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Minute</p>
            <div className="grid grid-cols-4 gap-1">
              {MINUTES.map((m) => {
                const currentMin = date ? String(date.getMinutes()).padStart(2, '0') : null
                const isSelected = currentMin === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      const h = date ? ((date.getHours() % 12) || 12) : 12
                      handleTimeSelect(h, m)
                    }}
                    className={`rounded-md py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1050ff] text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    :{m}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          setStep('date')
        }}
        className="mt-1 flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-[#1050ff]"
      >
        <FiCalendar size={14} className="text-slate-400 shrink-0" />
        <span className={date ? 'text-slate-700' : 'text-slate-400'}>
          {formattedDate ?? 'Select date & time'}
        </span>
      </button>

      {/* Portal renders outside all parent containers — no clipping */}
      {createPortal(popup, document.body)}
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
    <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <FiFileText size={20} className="text-slate-700" />
        <h3 className="text-lg font-semibold">Basic Information</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Election title*</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            className={`mt-2 w-full rounded-md p-3 text-sm outline-none border ${
              titleTouched && !title.trim() ? 'border-rose-400' : 'border-slate-200'
            } focus:border-blue-400`}
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
            placeholder="This election will determine the new executives..."
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
            <DateField label="Start date" date={startDate} onChange={setStartDate} />
            <DateField label="End date" date={endDate} onChange={setEndDate} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button className="px-6 py-3 rounded-md shadow-sm bg-[#1050ff] text-white">
            Save & Continue
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default BasicInformation