import React from 'react'
import { FiDownload, FiPlus, FiUsers } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface VotersProps {
  onNext?: () => void
}

const Voters: React.FC<VotersProps> = ({ onNext }) => (
  <Card className="border border-slate-100 bg-white p-0 shadow-sm">
    <div className="flex min-h-[330px] flex-col px-6 py-8 sm:px-8 md:min-h-[460px] md:items-center md:justify-center md:px-10 md:py-12">
      <div className="flex w-full max-w-[470px] flex-col gap-7 md:items-center md:text-center">
        <div className="flex items-center gap-3 md:justify-center">
          <FiUsers className="h-10 w-10 text-sky-400 md:h-11 md:w-11" />
          <h3 className="text-[1.65rem] font-medium tracking-[-0.03em] text-slate-900 md:text-[1.7rem]">
            Voters
          </h3>
        </div>

        <p className="text-base leading-7 text-slate-700 md:text-lg md:leading-8">
          Manage who can participate in your election.
        </p>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-4">
          <Button
            variant="outline"
            className="h-12 w-full max-w-[188px] justify-center gap-2 rounded-lg border-[#4f67ff] bg-white px-5 text-[15px] font-medium text-[#4f67ff] hover:border-[#2f49ff] hover:bg-[#f7f9ff] hover:text-[#2f49ff] md:w-auto md:max-w-none"
          >
            <FiDownload className="h-4 w-4" />
            <span>Import voter's list</span>
          </Button>

          <Button className="h-12 w-full max-w-[188px] justify-center gap-3 rounded-lg bg-[#0f43ff] px-5 text-[15px] font-medium text-white hover:bg-[#0838e0] md:w-auto md:max-w-none">
            <span>Add voter</span>
            <FiPlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-50 w-full">
          <Button
            className="px-6 h-11 font-medium rounded-md shadow-sm bg-[#1050ff] hover:bg-[#003fe6] text-white transition-colors"
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </Card>
)

export default Voters