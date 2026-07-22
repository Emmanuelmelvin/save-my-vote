import React, { useState } from 'react'
import { FiDownload, FiPlus, FiUsers, FiX } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useCreateElectionStore from '@/store/createElection'
import type { Voter } from '@/store/createElection'

interface VotersProps {
  onNext?: () => void
}

const Voters: React.FC<VotersProps> = ({ onNext }) => {
  const { voters, setVoters } = useCreateElectionStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const addVoter = () => {
    if (!name.trim() || !email.trim()) return
    const newVoter: Voter = { id: crypto.randomUUID(), name: name.trim(), email: email.trim() }
    setVoters([...voters, newVoter])
    setName('')
    setEmail('')
  }

  const removeVoter = (id: string) => {
    setVoters(voters.filter((v) => v.id !== id))
  }

  return (
    <Card className="border border-slate-100 bg-white p-0 shadow-sm">
      <div className="flex min-h-[330px] flex-col px-6 py-8 sm:px-8 md:px-10 md:py-12">
        <div className="flex w-full max-w-[600px] flex-col gap-6">
          <div className="flex items-center gap-3">
            <FiUsers className="h-10 w-10 text-sky-400 md:h-11 md:w-11" />
            <h3 className="text-[1.65rem] font-medium tracking-[-0.03em] text-slate-900 md:text-[1.7rem]">
              Voters
            </h3>
          </div>

          <p className="text-base leading-7 text-slate-700 md:text-lg md:leading-8">
            Manage who can participate in your election.
          </p>

          {/* Add voter form */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="h-11 border-slate-200 text-sm"
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="h-11 border-slate-200 text-sm"
            />
            <Button
              className="h-11 px-5 rounded-lg bg-[#0f43ff] text-white hover:bg-[#0838e0] shrink-0"
              onClick={addVoter}
            >
              <FiPlus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Voter list */}
          {voters.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {voters.map((v) => (
                <div key={v.id} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{v.name}</p>
                    <p className="text-xs text-slate-400">{v.email}</p>
                  </div>
                  <button
                    onClick={() => removeVoter(v.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {voters.length === 0 && (
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-4">
              <Button
                variant="outline"
                className="h-12 w-full max-w-[188px] justify-center gap-2 rounded-lg border-[#4f67ff] bg-white px-5 text-[15px] font-medium text-[#4f67ff] hover:border-[#2f49ff] hover:bg-[#f7f9ff] hover:text-[#2f49ff] md:w-auto md:max-w-none"
              >
                <FiDownload className="h-4 w-4" />
                <span>Import voter's list</span>
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-50">
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
}

export default Voters