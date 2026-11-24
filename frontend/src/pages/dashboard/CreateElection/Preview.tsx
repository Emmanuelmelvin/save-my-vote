import React from 'react'
import { FiCopy } from 'react-icons/fi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'

interface PreviewProps {
  onNext?: () => void
  onBack?: () => void
}

const Preview: React.FC<PreviewProps> = ({ onNext, onBack }) => {
  const electionId = useCreateElectionStore((state) => state.electionId)
  const previewUrl = electionId ? `${window.location.origin}/preview/${electionId}` : ''

  const handleCopy = () => {
    if (!previewUrl) return
    navigator.clipboard
      .writeText(previewUrl)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Couldn’t copy the link. Select it and copy it instead.'))
  }

  return (
    <Card className="mx-auto max-w-[664px] rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
      <div className="flex items-center gap-3 px-10 pt-10 max-[560px]:px-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.6667 8.66669L24 16L10.6667 23.3334V8.66669Z" fill="#7D8DF7" />
        </svg>
        <h2 className="text-xl font-medium text-[#111528]">Preview</h2>
      </div>

      <div className="flex flex-col items-end gap-8 px-10 pb-10 pt-4 max-[560px]:px-6">
        <p className="w-full text-base leading-6 text-[#111528]">
          Preview lets you see and test the election just like a voter — your test vote won't be counted.
        </p>

        {previewUrl ? (
          <div className="w-full rounded-2xl border border-[#E3E3E3] bg-[#F3F4F6] p-6">
            <p className="text-sm leading-[22px] text-[#272935]">
              This link works for you (and anyone signed in to your account) while you set the election up.
            </p>

            <div className="mt-2 flex items-center rounded-lg bg-white">
              <div className="flex-1 select-all truncate px-3 py-2 text-sm leading-[22px] text-[#5A5F73]">{previewUrl}</div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-[34px] w-[35px] shrink-0 items-center justify-center bg-[#E8EDFF]"
                aria-label="Copy preview link"
              >
                <FiCopy className="h-5 w-5 text-[#5A5F73]" />
              </button>
            </div>
          </div>
        ) : (
          <p className="w-full rounded-lg bg-amber-50 p-4 text-sm text-amber-700">Save the Basic Info step first to get a preview link.</p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 self-end">
          <Button variant="ghost" className="h-12 px-5 text-base text-[#111528]" onClick={onBack}>Back</Button>
          <Button
            className="h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]"
            disabled={!previewUrl}
            onClick={() => window.open(previewUrl, '_blank', 'noopener')}
          >
            Preview Election
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.66667 5.41669L15 10L6.66667 14.5834V5.41669Z" fill="white" />
            </svg>
          </Button>
          <Button
            className="h-12 gap-2 rounded-lg border-[#003dff] bg-white px-6 text-base font-medium text-[#003dff] hover:bg-[#eef2ff]"
            variant="outline"
            onClick={onNext}
          >
            Continue
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.16666 10H15.8333M10 4.16669L15.8333 10L10 15.8334" stroke="#003dff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default Preview
