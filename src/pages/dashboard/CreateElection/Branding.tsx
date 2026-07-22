import React from 'react'
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

  return (
    <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FiImage size={20} className="text-slate-700" />
        <h3 className="text-lg font-semibold text-slate-800">Branding</h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">Upload logos, colors, and hero imagery.</p>

      <div className="space-y-6">
        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
          <div className="flex items-center gap-4">
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" className="h-16 w-16 object-contain rounded-lg border border-slate-200" />
            ) : (
              <div className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                <FiUpload size={20} />
              </div>
            )}
            <Button variant="outline" className="h-10 text-sm border-slate-200">
              Upload logo
            </Button>
          </div>
        </div>

        {/* Primary color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={branding.primaryColor}
              onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              className="h-10 w-10 rounded border border-slate-200 cursor-pointer"
            />
            <Input
              value={branding.primaryColor}
              onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              className="h-10 w-32 text-sm border-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Hero image */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Hero Image</label>
          <div className="flex items-center gap-4">
            {branding.heroImage ? (
              <img src={branding.heroImage} alt="Hero" className="h-24 w-40 object-cover rounded-lg border border-slate-200" />
            ) : (
              <div className="h-24 w-40 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                <FiUpload size={24} />
              </div>
            )}
            <Button variant="outline" className="h-10 text-sm border-slate-200">
              Upload image
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-50 mt-6">
        <Button
          className="px-6 h-11 font-medium rounded-md shadow-sm bg-[#1050ff] hover:bg-[#003fe6] text-white transition-colors"
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </Card>
  )
}

export default Branding