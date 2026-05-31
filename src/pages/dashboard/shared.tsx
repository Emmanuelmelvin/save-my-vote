import React from 'react'
import { Button } from '@/components/ui/button'

export const FilterPill: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <Button variant={active ? 'default' : 'outline'} className="px-3 py-1 rounded-md text-sm font-medium">
    {children}
  </Button>
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
