import React, { useRef, useState } from 'react'
import { FiCheck } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import useCreateElectionStore from '@/store/createElection'
import { ElectionDraftSync } from '@/lib/election-draft'
import { ApiError } from '@/lib/api/client'
import { MAX_SOURCE_IMAGE_BYTES, uploadImage } from '@/lib/image-upload'
import { requireElectionId, useSaveStep } from './useSaveStep'

/** Matches the recommended 500 × 500px, with a little room. */
const LOGO_SIDE = 512

interface BrandingProps {
  onNext?: () => void
  onBack?: () => void
}

const presetColors = [
  { value: '#1050FF', label: 'Blue (default)' },
  { value: '#6D28D9', label: 'Purple' },
  { value: '#0D9488', label: 'Teal' },
  { value: '#DB2777', label: 'Pink' },
  { value: '#D97706', label: 'Amber' },
]

const Branding: React.FC<BrandingProps> = ({ onNext, onBack }) => {
  const { branding, setBranding } = useCreateElectionStore()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const save = useSaveStep((draft) => ElectionDraftSync.saveBranding(requireElectionId(draft), draft.branding))

  const [uploadingLogo, setUploadingLogo] = useState(false)

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      toast.error('The logo must be 20 MB or smaller.')
      return
    }

    setUploadingLogo(true)
    try {
      const logo = await uploadImage(file, LOGO_SIDE)
      // Read the store again: the colour may have changed during the upload.
      setBranding({ ...useCreateElectionStore.getState().branding, logo })
    } catch (error) {
      toast.error(error instanceof ApiError ? error.details : 'We could not upload that image. Please try another file.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const current = branding.primaryColor.toLowerCase()
  const isPreset = presetColors.some((color) => color.value.toLowerCase() === current)

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
          <p className="text-base font-medium text-[#111528]">Theme color</p>
          <p className="mt-2 text-base leading-6 text-[#5A5F73]">Used for buttons, highlights and result bars on the voting page.</p>

          {/* Preset color swatches */}
          <div className="mt-4 flex flex-wrap items-center gap-3" role="radiogroup" aria-label="Theme color">
            {presetColors.map((color) => {
              const selected = color.value.toLowerCase() === current
              return (
                <button
                  key={color.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={color.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003dff] focus-visible:ring-offset-2 ${selected ? 'ring-2 ring-[#111528] ring-offset-2' : ''}`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.label}
                  onClick={() => setBranding({ ...branding, primaryColor: color.value })}
                >
                  {selected && <FiCheck className="h-4 w-4" strokeWidth={3} aria-hidden />}
                </button>
              )
            })}
            {/* Rainbow gradient swatch with plus */}
            <label
              className={`relative h-9 w-9 cursor-pointer rounded-full bg-gradient-to-br from-[#D90606] via-[#FFD400] to-[#4949FF] transition-all hover:scale-110 ${isPreset ? '' : 'ring-2 ring-[#111528] ring-offset-2'}`}
              title="Custom color"
            >
              <input
                type="color"
                aria-label="Custom color"
                value={branding.primaryColor}
                onChange={(event) => setBranding({ ...branding, primaryColor: event.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <svg className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 text-white" viewBox="0 0 10 10" fill="none">
                <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </label>
            <span className="ml-1 inline-flex items-center gap-2 text-sm text-[#5A5F73]">
              <span className="h-4 w-4 rounded border border-slate-200" style={{ backgroundColor: branding.primaryColor }} aria-hidden />
              <span className="font-mono uppercase">{branding.primaryColor}</span>
            </span>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="w-full" style={{ maxWidth: 544 }}>
          <div className="flex items-center gap-3">
            <p className="text-base font-medium text-[#111528]">Logo</p>
          </div>
          <p className="mt-2 text-base leading-6 text-[#5A5F73]">PNG, JPG, WebP or SVG. Recommended size: 500 × 500px. Shown at the top of the voting page.</p>

          <div className="mt-4 flex items-center gap-4">
            {branding.logo && (
              <img src={branding.logo} alt="Election logo preview" className="h-16 w-16 rounded-xl border border-slate-200 object-contain" />
            )}
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-lg border-[#9CA3AF] px-4 text-base text-[#111528] hover:bg-slate-50"
              disabled={uploadingLogo}
              onClick={() => logoInputRef.current?.click()}
            >
              {uploadingLogo ? 'Uploading…' : branding.logo ? 'Change logo' : 'Upload logo'}
            </Button>
            {branding.logo && (
              <Button variant="ghost" className="h-10 px-3 text-sm text-slate-500 hover:text-rose-600" onClick={() => setBranding({ ...branding, logo: null })}>
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* Save & Continue */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-12 px-5 text-base text-[#111528]" onClick={onBack}>Back</Button>
          <Button
            className="h-12 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]"
            disabled={save.isPending || uploadingLogo}
            onClick={() => save.mutate(undefined, { onSuccess: onNext })}
          >
            {save.isPending ? 'Saving…' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default Branding