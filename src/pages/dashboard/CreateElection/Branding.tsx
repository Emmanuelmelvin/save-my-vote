import React, { useRef } from 'react'
import { FiInfo } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'

interface BrandingProps {
  onNext?: () => void
}

const presetColors = [
  { value: '#6D28D9', label: 'Purple' },
  { value: '#0D9488', label: 'Teal' },
  { value: '#DB2777', label: 'Pink' },
  { value: '#D97706', label: 'Amber' },
]

const Branding: React.FC<BrandingProps> = ({ onNext }) => {
  const { branding, setBranding } = useCreateElectionStore()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setBranding({ ...branding, logo: String(reader.result ?? '') })
    reader.readAsDataURL(file)
  }

  return (
    <Card className="mx-auto max-w-[664px] rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-10 pt-10 max-[560px]:px-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 26V6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V26C28 27.1046 27.1046 28 26 28H6C4.89543 28 4 27.1046 4 26Z" fill="#7D8DF7" />
          <path d="M10 18L13 14L17 19L21 12L26 20V26H6V22L10 18Z" fill="#B2BBFB" fillOpacity="0.5" />
          <circle cx="11" cy="10" r="2" fill="#B2BBFB" />
        </svg>
        <h2 className="text-xl font-medium text-[#111528]">Branding (optional)</h2>
      </div>

      <div className="flex flex-col items-end gap-8 px-10 pb-10 pt-8 max-[560px]:px-6">
        {/* Theme Color */}
        <div className="w-full">
          <div className="flex items-center gap-3">
            <p className="text-base font-medium text-[#111528]">Theme color</p>
            <FiInfo className="h-6 w-6 text-[#9CA3AF]" />
          </div>
          <p className="mt-2 text-base leading-6 text-[#5A5F73]">Pick a main color for your election's interface.</p>

          {/* Preset color swatches */}
          <div className="mt-4 flex items-center gap-3">
            {presetColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className="h-9 w-9 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#003dff] focus:ring-offset-2"
                style={{ backgroundColor: color.value }}
                aria-label={color.label}
                onClick={() => setBranding({ ...branding, primaryColor: color.value })}
              />
            ))}
            {/* Rainbow gradient swatch with plus */}
            <label className="relative h-9 w-9 cursor-pointer rounded-full bg-gradient-to-br from-[#D90606] via-[#FFD400] to-[#4949FF] transition-all hover:scale-110" aria-label="Custom color">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(event) => setBranding({ ...branding, primaryColor: event.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <svg className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 text-white" viewBox="0 0 10 10" fill="none">
                <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </label>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="w-full" style={{ maxWidth: 544 }}>
          <div className="flex items-center gap-3">
            <p className="text-base font-medium text-[#111528]">Logo Upload</p>
          </div>
          <p className="mt-2 text-base leading-6 text-[#5A5F73]">Supported formats: PNG, JPG, SVG. Recommended size: 500 × 500px.</p>

          <div className="mt-4 flex items-center gap-4">
            {branding.logo && (
              <img src={branding.logo} alt="Election logo preview" className="h-16 w-16 rounded-xl border border-slate-200 object-contain" />
            )}
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-lg border-[#9CA3AF] px-4 text-base text-[#111528] hover:bg-slate-50"
              onClick={() => logoInputRef.current?.click()}
            >
              Upload Logo
            </Button>
          </div>
        </div>

        {/* Save & Continue */}
        <Button
          className="h-12 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]"
          onClick={onNext}
        >
          Save & Continue
        </Button>
      </div>
    </Card>
  )
}

export default Branding