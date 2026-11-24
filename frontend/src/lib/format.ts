import { ApiError } from '@/lib/api/client'
import type { ElectionPhase } from '@/lib/api/types'

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** A message safe to show in a toast for any thrown value. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) return error.details
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export const PHASE_LABELS: Record<ElectionPhase, string> = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  active: 'Active',
  ended: 'Completed',
}

export const PHASE_STYLES: Record<ElectionPhase, string> = {
  draft: 'bg-slate-100 text-slate-600',
  upcoming: 'bg-amber-50 text-amber-700',
  active: 'bg-emerald-50 text-emerald-700',
  ended: 'bg-[#e8edff] text-[#003dff]',
}

/** The friendly tokens organisers type in emails, and the API placeholders they stand for. */
export const EMAIL_TOKENS: Array<{ token: string; api: string; meaning: string }> = [
  { token: '%name%', api: 'voterName', meaning: 'the voter’s name' },
  { token: '%election%', api: 'electionTitle', meaning: 'the election title' },
  { token: '%start%', api: 'startAt', meaning: 'when voting opens' },
  { token: '%end%', api: 'endAt', meaning: 'when voting closes' },
]

export const toApiPlaceholders = (text: string) =>
  EMAIL_TOKENS.reduce((out, { token, api }) => out.replace(new RegExp(token, 'gi'), `{{${api}}}`), text)
export const fromApiPlaceholders = (text: string) =>
  EMAIL_TOKENS.reduce((out, { token, api }) => out.replace(new RegExp(`\\{\\{\\s*${api}\\s*\\}\\}`, 'g'), token), text)
