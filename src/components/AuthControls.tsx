import React, { useEffect, useRef, useState } from 'react'
import { FaEye, FaEyeSlash, FaGoogle, FaMicrosoft, FaLock } from 'react-icons/fa6'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiMail } from 'react-icons/fi'

export const TextField: React.FC<{
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete?: string
}> = ({ id, label, type = 'text', placeholder, value, onChange, error, autoComplete }) => {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-[14px] font-medium text-[#111528]">{label}</span>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-[8px] border border-[#E3E3E3] bg-white px-4 py-3 text-[16px] text-[#111528] placeholder:text-[#9CA3AF] shadow-sm outline-none transition focus:border-[#3758F9] focus:ring-2 focus:ring-[#3758F9]/12"
      />
      {error ? <span className="text-sm text-[#d43939]">{error}</span> : null}
    </label>
  )
}

export const PasswordField: React.FC<{
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}> = ({ id, label, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-[14px] font-medium text-[#111528]">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#9CA3AF]">
          <FaLock className="h-4 w-4" />
        </span>
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-[8px] border border-[#E3E3E3] bg-white px-11 py-3 text-[16px] text-[#111528] placeholder:text-[#9CA3AF] shadow-sm outline-none transition focus:border-[#3758F9] focus:ring-2 focus:ring-[#3758F9]/12"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute inset-y-0 right-3 flex items-center rounded-full px-2 text-[#6b7280] transition hover:text-[#111528]"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
        >
          {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
        </Button>
      </div>
      {error ? <span className="text-sm text-[#d43939]">{error}</span> : null}
    </label>
  )
}

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => {
  return (
    <Button variant="default" className={`w-full ${className}`} {...props}>
      {children}
    </Button>
  )
}

export const SocialButton: React.FC<{
  label: string
  icon: 'google' | 'microsoft'
  onClick?: () => void
}> = ({ label, icon, onClick }) => {
  const Icon = icon === 'google' ? FaGoogle : FaMicrosoft

  return (
    <Button variant="outline" className="w-full inline-flex items-center justify-center gap-3 rounded-[8px] px-4 py-3 text-[14px] font-medium text-[#111528]" onClick={onClick}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  )
}

export const Divider: React.FC<{ label?: string }> = ({ label = 'OR' }) => {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-[#E3E3E3]" />
      <span className="text-[14px] font-medium uppercase tracking-[0.24em] text-[#9CA3AF]">{label}</span>
      <span className="h-px flex-1 bg-[#E3E3E3]" />
    </div>
  )
}

export const RadioGroup: React.FC<{
  label: string
  value: 'institution' | 'organisation'
  onChange: (value: 'institution' | 'organisation') => void
}> = ({ label, value, onChange }) => {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[14px] font-medium text-[#111528]">{label}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { key: 'institution' as const, title: 'Institution', description: 'School, college, NGO' },
          { key: 'organisation' as const, title: 'Organisation', description: 'Company, union, group' },
        ].map((option) => {
          const selected = value === option.key
          return (
            <Button
              key={option.key}
              variant={selected ? 'default' : 'outline'}
              onClick={() => onChange(option.key)}
              className={`rounded-[12px] px-4 py-4 text-left transition ${selected ? 'border-[#3758F9] bg-[#3758F9]/5' : 'border-[#E3E3E3] bg-white hover:border-[#3758F9]/60'}`}
            >
              <span className="flex items-center gap-3">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-[#3758F9]' : 'border-[#CBD5E1]'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full bg-[#3758F9] transition ${selected ? 'scale-100' : 'scale-0'}`} />
                </span>
                <span className="font-medium text-[#111528]">{option.title}</span>
              </span>
              <span className="mt-2 block pl-8 text-sm text-[#6b7280]">{option.description}</span>
            </Button>
          )
        })}
      </div>
    </fieldset>
  )
}

export const OtpInput: React.FC<{
  value: string
  onChange: (value: string) => void
}> = ({ value, onChange }) => {
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const digits = Array.from({ length: 4 }, (_, index) => value[index] ?? '')

  useEffect(() => {
    if (value.length < 4) return
  }, [value])

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join('').slice(0, 4))
  }

  return (
    <div className="flex items-center gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={refs[index]}
          inputMode="numeric"
          maxLength={4}
          aria-label={`Digit ${index + 1}`}
          value={digit}
          onChange={(event) => {
            const cleaned = event.target.value.replace(/\D/g, '')
            if (!cleaned) {
              const nextDigits = [...digits]
              nextDigits[index] = ''
              updateValue(nextDigits)
              return
            }

            const nextDigits = [...digits]
            nextDigits[index] = cleaned[0] ?? ''
            updateValue(nextDigits)
            if (cleaned[0] && index < refs.length - 1) {
              refs[index + 1].current?.focus()
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digit && index > 0) {
              refs[index - 1].current?.focus()
            }
          }}
          onPaste={(event) => {
            event.preventDefault()
            const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
            if (!pasted) return
            updateValue(pasted.split('').concat(Array(4).fill('')).slice(0, 4))
            const nextIndex = Math.min(pasted.length, 3)
            refs[nextIndex].current?.focus()
          }}
          className="h-[46px] w-[46px] rounded-[12px] border border-[#E3E3E3] bg-white text-center text-[18px] font-medium text-[#111528] shadow-sm outline-none transition focus:border-[#3758F9] focus:ring-2 focus:ring-[#3758F9]/12"
        />
      ))}
    </div>
  )
}

export const HelperLink: React.FC<{
  label: string
  href: string
  align?: 'left' | 'right' | 'center'
}> = ({ label, href, align = 'left' }) => {
  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'

  return (
    <div className={`flex ${alignClass}`}>
      <a href={href} className="text-[14px] font-medium text-[#3758F9] transition hover:text-[#003dff]">
        {label}
      </a>
    </div>
  )
}

export const InlineLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[14px] text-[#6b7280]">{children}</p>
)

export const SocialIconText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[#111528]">{children}</span>
)

export const MailIcon = FiMail
