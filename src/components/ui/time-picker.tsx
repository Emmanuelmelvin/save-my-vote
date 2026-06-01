// components/ui/time-picker.tsx
import * as React from "react"
import { FiClock } from "react-icons/fi"
import { Input } from "@/components/ui/input"

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: "hours" | "minutes" | "12hours"
  date: Date | null
  setDate: (date: Date | null) => void
  onRightFocus?: () => void
  onLeftFocus?: () => void
}

export const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      picker,
      date,
      setDate,
      onRightFocus,
      onLeftFocus,
      id,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState("")

    React.useEffect(() => {
      if (!date) {
        setValue("")
        return
      }
      const hours = date.getHours()
      const minutes = date.getMinutes()

      if (picker === "hours") {
        const hours12 = hours % 12 || 12
        setValue(String(hours12).padStart(2, "0"))
      } else if (picker === "minutes") {
        setValue(String(minutes).padStart(2, "0"))
      }
    }, [date, picker])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowRight") onRightFocus?.()
      if (e.key === "ArrowLeft") onLeftFocus?.()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.slice(-2)
      setValue(val)

      if (!date) return

      const numVal = parseInt(val, 10)
      if (isNaN(numVal)) return

      const newDate = new Date(date)
      if (picker === "hours") {
        const currentHours = newDate.getHours()
        const isPM = currentHours >= 12
        let targetHours = numVal % 12
        if (isPM) targetHours += 12
        newDate.setHours(targetHours)
      } else if (picker === "minutes") {
        newDate.setMinutes(Math.min(59, Math.max(0, numVal)))
      }
      setDate(newDate)
    }

    return (
      <Input
        ref={ref}
        id={id}
        className="w-[48px] text-center font-mono text-sm focus:bg-accent focus:text-accent-foreground"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="00"
        type="tel"
        {...props}
      />
    )
  }
)
TimePickerInput.displayName = "TimePickerInput"

// Combined Picker Control block
interface TimePickerProps {
  date: Date | null
  setDate: (date: Date | null) => void
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const ampmRef = React.useRef<HTMLButtonElement>(null)

  const togglePeriod = () => {
    if (!date) return
    const newDate = new Date(date)
    const hours = newDate.getHours()
    if (hours >= 12) {
      newDate.setHours(hours - 12)
    } else {
      newDate.setHours(hours + 12)
    }
    setDate(newDate)
  }

  const isPM = date ? date.getHours() >= 12 : false

  return (
    <div className="flex items-center justify-center gap-2 border-t border-border pt-3 mt-2">
      <div className="flex items-center gap-1 text-muted-foreground pr-1">
        <FiClock className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Time</span>
      </div>
      <div className="flex items-end gap-1">
        <div className="grid gap-1 text-center">
          <TimePickerInput
            picker="hours"
            date={date}
            setDate={setDate}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
        </div>
        <div className="text-sm font-semibold mb-2">:</div>
        <div className="grid gap-1 text-center">
          <TimePickerInput
            picker="minutes"
            date={date}
            setDate={setDate}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
            onRightFocus={() => ampmRef.current?.focus()}
          />
        </div>
        <button
          ref={ampmRef}
          type="button"
          onClick={togglePeriod}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") minuteRef.current?.focus()
          }}
          className="h-9 w-12 rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold uppercase hover:bg-accent hover:text-accent-foreground select-none transition-colors"
        >
          {isPM ? "PM" : "AM"}
        </button>
      </div>
    </div>
  )
}