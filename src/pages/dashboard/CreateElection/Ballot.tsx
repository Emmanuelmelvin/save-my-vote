import React, { useRef, useState } from 'react'
import { FiClipboard, FiEdit2, FiFileText, FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useCreateElectionStore from '@/store/createElection'
import type { Candidate, Position } from '@/store/createElection'

interface BallotProps {
  onNext?: () => void
}

type DraftPhoto = {
  name: string
  size: string
  url: string
}

const formatFileSize = (bytes: number) => `${(bytes / 1024).toFixed(1)}kb`

const Ballot: React.FC<BallotProps> = ({ onNext }) => {
  const { positions, setPositions } = useCreateElectionStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null)
  const [positionTitle, setPositionTitle] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [draftPhoto, setDraftPhoto] = useState<DraftPhoto | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const resetCandidate = () => {
    setCandidateName('')
    setDraftPhoto(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const openPositionDrawer = (position?: Position) => {
    setEditingPositionId(position?.id ?? null)
    setPositionTitle(position?.title ?? '')
    resetCandidate()
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingPositionId(null)
    resetCandidate()
  }

  const savePosition = (): string | null => {
    const title = positionTitle.trim()
    if (!title) {
      toast.error('Enter a position name before saving.')
      return null
    }

    if (editingPositionId) {
      setPositions(positions.map((position) => position.id === editingPositionId ? { ...position, title } : position))
      toast.success('Position saved')
      return editingPositionId
    }

    const position: Position = { id: crypto.randomUUID(), title, candidates: [] }
    setPositions([...positions, position])
    setEditingPositionId(position.id)
    toast.success('Position saved')
    return position.id
  }

  const saveCandidate = () => {
    const name = candidateName.trim()
    if (!name) {
      toast.error('Enter a candidate name before saving.')
      return
    }

    const title = positionTitle.trim()
    if (!title) {
      toast.error('Enter a position name before adding a candidate.')
      return
    }

    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name,
      photo: draftPhoto?.url,
    }

    if (editingPositionId) {
      setPositions(positions.map((position) => position.id === editingPositionId
        ? { ...position, title, candidates: [...position.candidates, candidate] }
        : position))
    } else {
      const position: Position = { id: crypto.randomUUID(), title, candidates: [candidate] }
      setPositions([...positions, position])
      setEditingPositionId(position.id)
    }

    toast.success('Candidate saved')
    resetCandidate()
  }

  const deletePosition = () => {
    if (!editingPositionId) {
      toast.error('Save the position before deleting it.')
      return
    }

    setPositions(positions.filter((position) => position.id !== editingPositionId))
    toast.success('Position deleted')
    closeDrawer()
  }

  const removeCandidate = (positionId: string, candidateId: string) => {
    setPositions(positions.map((position) => position.id === positionId
      ? { ...position, candidates: position.candidates.filter((candidate) => candidate.id !== candidateId) }
      : position))
    toast.success('Candidate removed')
  }

  const clearBallot = () => {
    setPositions([])
    toast.success('Ballot cleared')
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Candidate photos must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => setDraftPhoto({ name: file.name, size: formatFileSize(file.size), url: String(reader.result) })
    reader.onerror = () => toast.error('We could not read that photo. Please try another image.')
    reader.readAsDataURL(file)
  }

  return (
    <div className="w-full max-w-[600px]">
      {positions.length === 0 ? (
        <Card className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-[#e3e3e3] bg-white p-8 text-center shadow-none">
          <div className="flex items-center gap-3 text-[#111528]"><FiClipboard className="h-8 w-8 text-[#7d8df7]" /><h2 className="text-xl font-medium">Ballot</h2></div>
          <p className="mt-6 text-sm text-[#111528]">Set up the ballot voters will use.</p>
          <Button className="mt-6 h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base text-white hover:bg-[#0034d9]" onClick={() => openPositionDrawer()}>
            Build Ballot <FiPlus className="h-5 w-5" />
          </Button>
        </Card>
      ) : (
        <div>
          <div className="space-y-4">
            {positions.map((position) => (
              <Card key={position.id} className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white p-0 shadow-none">
                <div className="border-b border-[#e3e3e3] px-7 py-4"><h2 className="text-base font-medium text-[#111528]">{position.title}</h2></div>
                <div className="px-4 py-1">
                  {position.candidates.length > 0 ? position.candidates.map((candidate) => (
                    <div key={candidate.id} className="group flex items-center gap-4 border-b border-[#e3e3e3] px-2 py-3 last:border-0">
                      {candidate.photo ? <img src={candidate.photo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8edff] text-lg font-medium text-[#003dff]">{candidate.name.slice(0, 1).toUpperCase()}</div>}
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#111528]">{candidate.name}</p>
                      <button type="button" onClick={() => removeCandidate(position.id, candidate.id)} className="rounded p-2 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" aria-label={`Remove ${candidate.name}`}><FiTrash2 className="h-4 w-4" /></button>
                    </div>
                  )) : <p className="px-2 py-5 text-sm text-slate-400">No candidates added yet.</p>}
                </div>
                <div className="flex justify-end px-5 pb-5"><Button variant="secondary" className="h-9 gap-2 rounded-lg bg-[#e8edff] px-3 text-sm text-[#003dff] hover:bg-[#dce4ff]" onClick={() => openPositionDrawer(position)}>Edit <FiEdit2 className="h-4 w-4" /></Button></div>
              </Card>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3"><Button className="h-10 gap-2 rounded-lg bg-[#003dff] px-4 text-sm text-white hover:bg-[#0034d9]" onClick={() => openPositionDrawer()}>Add another position <FiPlus className="h-4 w-4" /></Button><Button variant="ghost" className="h-10 text-sm text-slate-500 hover:text-rose-600" onClick={clearBallot}>Clear Ballot</Button></div>
          <div className="mt-10 flex items-center justify-end gap-3"><Button variant="ghost" className="h-11 px-5 text-base text-[#111528]">Go Back</Button><Button className="h-12 rounded-lg bg-[#003dff] px-6 text-base text-white hover:bg-[#0034d9]" onClick={onNext}>Save and continue</Button></div>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/15 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add position">
          <button type="button" className="min-w-0 flex-1 cursor-default" aria-label="Close position panel" onClick={closeDrawer} />
          <aside className="flex h-full w-full max-w-[580px] flex-col bg-white shadow-2xl">
            <div className="flex justify-end px-6 pt-6"><button type="button" onClick={closeDrawer} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Close position panel"><FiX className="h-5 w-5" /></button></div>
            <div className="flex-1 overflow-y-auto px-10 pb-8 pt-3 max-[520px]:px-6">
              <h2 className="text-base font-medium text-[#111528]">Add Position</h2>
              <p className="mt-3 text-sm text-[#111528]">Add the offices people will vote for</p>
              <label htmlFor="position-name" className="mt-5 block text-sm font-medium text-[#111528]">Position Name<span className="text-rose-500">*</span></label>
              <Input id="position-name" value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} placeholder="e.g., President" className="mt-2 h-12 border-[#e3e3e3]" autoFocus />
              <div className="mt-4 flex items-center justify-between gap-3"><Button className="h-9 rounded-lg bg-[#003dff] px-4 text-sm text-white hover:bg-[#0034d9]" onClick={savePosition}>Save Position</Button><button type="button" onClick={deletePosition} className="flex items-center gap-2 px-2 py-2 text-sm text-slate-500 hover:text-rose-600"><FiTrash2 className="h-4 w-4" />Delete</button></div>

              <div className="mt-6"><h3 className="text-base font-medium text-[#111528]">Add Candidates</h3><p className="mt-3 text-sm text-[#111528]">Add the people running for this position</p></div>
              <label htmlFor="candidate-name" className="mt-5 block text-sm font-medium text-[#111528]">Candidate Name<span className="text-rose-500">*</span></label>
              <Input id="candidate-name" value={candidateName} onChange={(event) => setCandidateName(event.target.value)} placeholder="e.g., Bola Ahmed Tinubu" className="mt-2 h-12 border-[#e3e3e3]" />
              <p className="mt-4 text-sm font-medium text-[#111528]">Candidate photo <span className="font-normal">(optional)</span></p>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              {draftPhoto ? <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2"><img src={draftPhoto.url} alt="Selected candidate" className="h-9 w-9 rounded object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-700">{draftPhoto.name}</p><p className="mt-1 text-xs text-slate-500">{draftPhoto.size}</p></div><button type="button" onClick={resetCandidate} className="text-xs font-medium text-slate-700 hover:text-rose-600">Remove</button></div> : null}
              <Button type="button" variant="outline" className="mt-3 h-9 gap-2 border-slate-300 px-3 text-sm text-[#111528]" onClick={() => photoInputRef.current?.click()}><FiUpload className="h-4 w-4" />{draftPhoto ? 'Upload Image' : 'Upload File'}</Button>
              <p className="mt-2 text-xs text-slate-500">*Square photos look best. Max size 5MB.*</p>
              <div className="mt-4 flex items-center justify-between gap-3"><Button className="h-9 rounded-lg bg-[#003dff] px-4 text-sm text-white hover:bg-[#0034d9]" onClick={saveCandidate}>Save Candidate</Button><button type="button" onClick={resetCandidate} className="flex items-center gap-2 px-2 py-2 text-sm text-slate-500 hover:text-rose-600"><FiTrash2 className="h-4 w-4" />Delete</button></div>
              <Button variant="secondary" className="mt-5 h-9 gap-2 rounded-lg bg-[#eef2ff] px-4 text-sm text-[#3758f9] hover:bg-[#e3e9ff]" onClick={resetCandidate}>Add another candidate <FiPlus className="h-4 w-4" /></Button>
              {editingPositionId && <div className="mt-8 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500"><FiFileText className="mr-2 inline h-4 w-4" />Candidates you save will appear on the ballot.</div>}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default Ballot
