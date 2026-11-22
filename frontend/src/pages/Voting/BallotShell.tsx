import React, { useMemo, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import platformLogo from '@/assets/image.png'
import { Button } from '@/components/ui/button'
import type { BallotPosition, Branding, Selection } from '@/lib/api/types'

const SAFE_COLOR = /^#[0-9a-fA-F]{6}$/

/** Branded page frame for the voting and preview pages. */
export const VotingLayout: React.FC<{ branding?: Branding; title?: string; children: React.ReactNode; banner?: React.ReactNode }> = ({ branding, title, children, banner }) => {
  const accent = branding && SAFE_COLOR.test(branding.primaryColor) ? branding.primaryColor : '#1050ff'
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ ['--accent' as string]: accent }}>
      {banner}
      <header className="border-b border-slate-100 bg-white" style={{ borderTop: `4px solid ${accent}` }}>
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-4">
          <img src={branding?.logoUrl || platformLogo} alt="" className="h-10 w-auto max-w-[140px] object-contain" />
          {title && <h1 className="truncate text-lg font-semibold">{title}</h1>}
        </div>
      </header>
      {branding?.heroImageUrl && (
        <div className="mx-auto max-w-3xl px-5 pt-5">
          <img src={branding.heroImageUrl} alt="" className="h-40 w-full rounded-xl object-cover" />
        </div>
      )}
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  )
}

export const AccentButton: React.FC<React.ComponentProps<typeof Button>> = ({ className = '', style, ...props }) => (
  <Button className={`h-11 px-6 text-white hover:opacity-90 ${className}`} style={{ backgroundColor: 'var(--accent)', ...style }} {...props} />
)

interface BallotFormProps {
  ballot: BallotPosition[]
  submitting?: boolean
  submitLabel?: string
  onSubmit: (selections: Selection[]) => void
}

/** One choice per position, then a review screen, then submit. */
export const BallotForm: React.FC<BallotFormProps> = ({ ballot, submitting, submitLabel = 'Cast my vote', onSubmit }) => {
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [reviewing, setReviewing] = useState(false)
  const complete = ballot.every((position) => choices[position.id])
  const selections = useMemo(
    () => ballot.map((position) => ({ positionId: position.id, candidateId: choices[position.id] })),
    [ballot, choices],
  )

  if (reviewing) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold">Review your choices</h2>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
          {ballot.map((position) => {
            const candidate = position.candidates.find((c) => c.id === choices[position.id])
            return (
              <li key={position.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-sm text-slate-500">{position.title}</span>
                <span className="font-medium">{candidate?.name}</span>
              </li>
            )
          })}
        </ul>
        <p className="text-sm text-slate-500">Your vote is secret and can't be changed once submitted.</p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" className="h-11" onClick={() => setReviewing(false)} disabled={submitting}>Change choices</Button>
          <AccentButton onClick={() => onSubmit(selections)} disabled={submitting}>{submitting ? 'Submitting…' : submitLabel}</AccentButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ballot.map((position) => (
        <fieldset key={position.id} className="rounded-xl border border-slate-100 bg-white p-5">
          <legend className="px-1 text-base font-semibold">{position.title}</legend>
          <p className="mb-3 text-sm text-slate-500">Choose one</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {position.candidates.map((candidate) => {
              const selected = choices[position.id] === candidate.id
              return (
                <label
                  key={candidate.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${selected ? 'bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                  style={selected ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' } : undefined}
                >
                  <input
                    type="radio"
                    name={position.id}
                    value={candidate.id}
                    checked={selected}
                    onChange={() => setChoices((current) => ({ ...current, [position.id]: candidate.id }))}
                    className="sr-only"
                  />
                  {candidate.photoUrl ? (
                    <img src={candidate.photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8edff] text-lg font-semibold text-[#003dff]">{candidate.name.slice(0, 1).toUpperCase()}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{candidate.name}</span>
                    {candidate.description && <span className="mt-0.5 block text-sm text-slate-500">{candidate.description}</span>}
                  </span>
                  {selected && <FiCheck className="h-5 w-5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />}
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
      <div className="flex justify-end">
        <AccentButton disabled={!complete} onClick={() => setReviewing(true)}>Review choices</AccentButton>
      </div>
      {!complete && <p className="text-right text-sm text-slate-500">Make a choice for every position to continue.</p>}
    </div>
  )
}
