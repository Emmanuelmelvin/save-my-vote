import React from 'react'
import type { ElectionPhase } from '@/lib/api/types'
import { PHASE_LABELS, PHASE_STYLES } from '@/lib/format'

export const FilterPill: React.FC<{ children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ children, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-[#1050ff] text-white hover:bg-[#0b45e4]'
        : 'bg-white text-[#374151] border border-slate-200 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
)

export const PhaseBadge: React.FC<{ phase: ElectionPhase }> = ({ phase }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PHASE_STYLES[phase]}`}>
    {PHASE_LABELS[phase]}
  </span>
)

export const StatTile: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-lg border border-slate-100 bg-white p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
  </div>
)

export const BallotSvg: React.FC = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="30" width="100" height="60" rx="8" fill="#0B61FF"/>
    <path d="M25 30L95 30" stroke="#ffffff" strokeWidth="2" opacity="0.15"/>
    <rect x="48" y="14" width="24" height="18" rx="3" fill="#E6F0FF" transform="rotate(20 48 14)"/>
    <circle cx="44" cy="52" r="3" fill="#ffffff"/>
  </svg>
)

export default null
