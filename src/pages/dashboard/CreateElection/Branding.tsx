import React, { useRef } from 'react'
import { FiImage, FiUpload } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useCreateElectionStore from '@/store/createElection'

interface BrandingProps {
  onNext?: () => void
}

const Branding: React.FC<BrandingProps> = ({ onNext }) => {
  const { branding, setBranding } = useCreateElectionStore()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  const readImage = (file: File, field: 'logo' | 'heroImage') => {
    const reader = new FileReader()
    reader.onload = () => setBranding({ ...branding, [field]: String(reader.result ?? '') })
    reader.readAsDataURL(file)
  }

  return (
    <Card className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#1050ff]"><FiImage size={18} /></span>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Branding</h3>
          <p className="mt-0.5 text-sm text-slate-500">Give the voting experience a visual identity your voters recognize.</p>
        </div>
      </div>

      <div className="space-y-7">
        <div>
          <label className="text-sm font-medium text-slate-700">Logo</label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {branding.logo ? (
              <img src={branding.logo} alt="Election logo preview" className="h-16 w-16 rounded-xl border border-slate-200 object-contain" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-300"><FiUpload size={20} /></div>
            )}
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && readImage(event.target.files[0], 'logo')} />
            <div>
              <Button variant="outline" className="h-10 rounded-lg border-slate-200" onClick={() => logoInputRef.current?.click()}>Upload logo</Button>
              <p className="mt-1.5 text-xs text-slate-400">PNG, JPG or SVG up to 2 MB</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="primary-color" className="text-sm font-medium text-slate-700">Primary color</label>
          <div className="mt-2 flex items-center gap-3">
            <input id="primary-color" type="color" value={branding.primaryColor} onChange={(event) => setBranding({ ...branding, primaryColor: event.target.value })} className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
            <Input value={branding.primaryColor} onChange={(event) => setBranding({ ...branding, primaryColor: event.target.value })} className="h-10 w-32 border-slate-200 font-mono text-sm" />
            <span className="text-sm text-slate-500">Used for buttons and highlights</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Hero image</label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {branding.heroImage ? (
              <img src={branding.heroImage} alt="Hero preview" className="h-24 w-40 rounded-xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-24 w-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-300"><FiUpload size={24} /></div>
            )}
            <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && readImage(event.target.files[0], 'heroImage')} />
            <div>
              <Button variant="outline" className="h-10 rounded-lg border-slate-200" onClick={() => heroInputRef.current?.click()}>Upload image</Button>
              <p className="mt-1.5 text-xs text-slate-400">Recommended size: 1200 × 500 px</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Live preview</p>
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-white" style={{ backgroundColor: branding.primaryColor }}>
              {branding.logo ? <img src={branding.logo} alt="" className="h-full w-full object-contain" /> : <FiImage className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">Your election</p><p className="text-xs text-slate-400">A branded voter experience</p></div>
            <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: branding.primaryColor }}>Vote</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <Button className="h-11 rounded-lg bg-[#1050ff] px-6 font-medium text-white hover:bg-[#003fe6]" onClick={onNext}>Next</Button>
      </div>
    </Card>
  )
}

export default Branding
