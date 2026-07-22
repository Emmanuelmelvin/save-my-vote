import React from 'react'
import { FiPlus } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LaunchProps {
  onNext?: () => void
}

const Launch: React.FC<LaunchProps> = ({ onNext }) => (
  <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <FiPlus size={20} className="text-slate-700" />
      <h3 className="text-lg font-semibold text-slate-800">Launch</h3>
    </div>
    <p className="text-sm text-slate-500 mb-6">Publish the election when everything is ready.</p>

    <div className="flex justify-end pt-4 border-t border-slate-50">
      <Button
        className="px-6 h-11 font-medium rounded-md shadow-sm bg-[#1050ff] hover:bg-[#003fe6] text-white transition-colors"
        onClick={onNext}
      >
        Launch
      </Button>
    </div>
  </Card>
)

export default Launch