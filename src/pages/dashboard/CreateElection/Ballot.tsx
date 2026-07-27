import React, { useState } from 'react'
import { FiList, FiPlus, FiX } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useCreateElectionStore from '@/store/createElection'
import type { Position, Candidate } from '@/store/createElection'

interface BallotProps {
  onNext?: () => void
}

const Ballot: React.FC<BallotProps> = ({ onNext }) => {
  const { positions, setPositions } = useCreateElectionStore()
  const [positionTitle, setPositionTitle] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [activePosition, setActivePosition] = useState<string | null>(null)

  const addPosition = () => {
    if (!positionTitle.trim()) return
    const newPos: Position = { id: crypto.randomUUID(), title: positionTitle.trim(), candidates: [] }
    setPositions([...positions, newPos])
    setPositionTitle('')
    setActivePosition(newPos.id)
  }

  const removePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id))
    if (activePosition === id) setActivePosition(null)
  }

  const addCandidate = (positionId: string) => {
    if (!candidateName.trim()) return
    const candidate: Candidate = { id: crypto.randomUUID(), name: candidateName.trim() }
    setPositions(
      positions.map((p) =>
        p.id === positionId ? { ...p, candidates: [...p.candidates, candidate] } : p
      )
    )
    setCandidateName('')
  }

  const removeCandidate = (positionId: string, candidateId: string) => {
    setPositions(
      positions.map((p) =>
        p.id === positionId
          ? { ...p, candidates: p.candidates.filter((c) => c.id !== candidateId) }
          : p
      )
    )
  }

  return (
    <Card className="bg-white rounded-xl p-5 md:p-6 border border-slate-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FiList size={20} className="text-slate-700" />
        <h3 className="text-base font-semibold text-slate-800">Ballot</h3>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-slate-500">Configure positions, candidates, and ballot settings.</p>

        {/* Add position */}
        <div className="flex gap-3">
          <Input
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            placeholder="e.g. President, Secretary, Treasurer"
            className="h-11 border-slate-200 text-sm flex-1"
          />
          <Button
            className="h-11 px-5 rounded-lg bg-[#0f43ff] text-white hover:bg-[#0838e0] shrink-0"
            onClick={addPosition}
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Add Position
          </Button>
        </div>

        {/* Positions list */}
        <div className="space-y-4">
          {positions.map((pos) => (
            <div key={pos.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-800 text-sm">{pos.title}</span>
                <button
                  onClick={() => removePosition(pos.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>

              {activePosition === pos.id && (
                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Candidate name"
                      className="h-9 border-slate-200 text-sm flex-1"
                    />
                    <Button
                      className="h-9 px-4 rounded-md bg-[#0f43ff] text-white hover:bg-[#0838e0] text-xs shrink-0"
                      onClick={() => addCandidate(pos.id)}
                    >
                      Add
                    </Button>
                  </div>

                  {pos.candidates.length > 0 && (
                    <div className="space-y-1.5">
                      {pos.candidates.map((c) => (
                        <div key={c.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-100">
                          <span className="text-sm text-slate-700">{c.name}</span>
                          <button
                            onClick={() => removeCandidate(pos.id, c.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activePosition !== pos.id && (
                <button
                  onClick={() => setActivePosition(pos.id)}
                  className="w-full px-4 py-2 text-xs text-[#0f43ff] font-medium hover:bg-slate-50 transition-colors border-t border-slate-100"
                >
                  {pos.candidates.length > 0
                    ? `${pos.candidates.length} candidate${pos.candidates.length > 1 ? 's' : ''}`
                    : 'Add candidates'}
                </button>
              )}
            </div>
          ))}

          {positions.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No positions added yet. Add a position above to get started.</p>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-50">
          <Button
            className="px-6 h-11 font-medium rounded-md shadow-sm bg-[#1050ff] hover:bg-[#003fe6] text-white transition-colors"
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default Ballot
