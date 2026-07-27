import React, { useRef, useState } from 'react'
import { FiClipboard, FiEdit2, FiFileText, FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useCreateElectionStore from '@/store/createElection'
import type { Candidate, Position } from '@/store/createElection'

interface BallotProps {
  onNext?: () => void
}

type CandidateForm = {
  id: string
  name: string
  photo?: string
}

const positionSchema = z.object({
  title: z.string().trim().min(1, 'Position name is required'),
})

const candidateLabel = (count: number) => `${count} candidate${count === 1 ? '' : 's'}`

const createCandidateForm = (): CandidateForm => ({
  id: crypto.randomUUID(),
  name: '',
})

const candidateToForm = (candidate: Candidate): CandidateForm => ({
  id: candidate.id,
  name: candidate.name,
  photo: candidate.photo,
})

const formToCandidate = (form: CandidateForm): Candidate => ({
  id: form.id,
  name: form.name.trim(),
  photo: form.photo,
})

const CandidateAvatar: React.FC<{ candidate: Candidate; className?: string }> = ({ candidate, className = 'h-8 w-8 text-xs' }) => (
  candidate.photo
    ? <img src={candidate.photo} alt={candidate.name} className={`shrink-0 rounded-full object-cover ${className}`} />
    : <span title={candidate.name} aria-label={candidate.name} className={`flex shrink-0 items-center justify-center rounded-full bg-[#e8edff] font-semibold text-[#003dff] ${className}`}>{candidate.name.slice(0, 1).toUpperCase()}</span>
)

const Ballot: React.FC<BallotProps> = ({ onNext }) => {
  const { positions, setPositions } = useCreateElectionStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null)
  const [positionTitle, setPositionTitle] = useState('')
  const [positionTitleEditing, setPositionTitleEditing] = useState(false)
  const [candidateForms, setCandidateForms] = useState<CandidateForm[]>([])
  const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>({})
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const activePosition = positions.find((position) => position.id === editingPositionId) ?? null

  const syncCandidateForms = (nextForms: CandidateForm[]) => {
    if (!editingPositionId) return

    const candidates = nextForms
      .filter((form) => form.name.trim())
      .map(formToCandidate)

    setPositions(positions.map((position) => position.id === editingPositionId
      ? { ...position, candidates }
      : position))
  }

  const resetDrawerState = () => {
    setEditingPositionId(null)
    setPositionTitle('')
    setPositionTitleEditing(false)
    setCandidateForms([])
    photoInputRefs.current = {}
  }

  const openPositionDrawer = (position?: Position) => {
    setEditingPositionId(position?.id ?? null)
    setPositionTitle(position?.title ?? '')
    setPositionTitleEditing(!position)
    setCandidateForms(position ? [...position.candidates.map(candidateToForm), createCandidateForm()] : [])
    photoInputRefs.current = {}
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    resetDrawerState()
  }

  const savePosition = () => {
    const result = positionSchema.safeParse({ title: positionTitle })
    if (!result.success) {
      toast.error(result.error.errors[0].message)
      return
    }

    const title = result.data.title

    // Check for duplicate position title
    const duplicateExists = positions.some(
      (position) => position.title.toLowerCase() === title.toLowerCase() && position.id !== editingPositionId
    )
    if (duplicateExists) {
      toast.error('A position with this name already exists.')
      return
    }

    if (editingPositionId) {
      setPositions(positions.map((position) => position.id === editingPositionId ? { ...position, title } : position))
      setPositionTitleEditing(false)
      toast.success('Position saved')
      return
    }

    const position: Position = { id: crypto.randomUUID(), title, candidates: [] }
    setPositions([...positions, position])
    setEditingPositionId(position.id)
    setCandidateForms([createCandidateForm()])
    setPositionTitleEditing(false)
    toast.success('Position saved')
  }

  const hasPartialCandidate = () => candidateForms.some((form) => {
    const trimmed = form.name.trim()
    return trimmed.length > 0 && trimmed.split(/\s+/).length < 2
  })

  const updateCandidateForm = (formId: string, value: string) => {
    const nextForms = candidateForms.map((form) => form.id === formId ? { ...form, name: value } : form)
    setCandidateForms(nextForms)
    syncCandidateForms(nextForms)
  }

  const handlePhotoChange = (formId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Candidate photos must be 5 MB or smaller.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const nextForms = candidateForms.map((form) => form.id === formId ? { ...form, photo: String(reader.result) } : form)
      setCandidateForms(nextForms)
      syncCandidateForms(nextForms)
    }
    reader.onerror = () => toast.error('We could not read that photo. Please try another image.')
    reader.readAsDataURL(file)
  }

  const deleteCandidateForm = (formId: string) => {
    const nextForms = candidateForms.filter((form) => form.id !== formId)
    const formsWithFallback = nextForms.length > 0 ? nextForms : [createCandidateForm()]
    setCandidateForms(formsWithFallback)
    syncCandidateForms(formsWithFallback)
  }

  const addCandidateForm = () => {
    if (hasPartialCandidate() || candidateForms.some((form) => !form.name.trim())) {
      toast.error('Enter a full name before adding another candidate.')
      return
    }

    setCandidateForms([...candidateForms, createCandidateForm()])
  }

  const startNewPosition = () => {
    if (hasPartialCandidate()) {
      toast.error('Complete the candidate name before changing positions.')
      return
    }

    setEditingPositionId(null)
    setPositionTitle('')
    setCandidateForms([])
    setPositionTitleEditing(true)
    photoInputRefs.current = {}
  }

  const handlePositionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value
    if (selectedId === 'new') {
      startNewPosition()
      return
    }

    if (hasPartialCandidate()) {
      toast.error('Complete the candidate name before changing positions.')
      return
    }

    const selectedPosition = positions.find((position) => position.id === selectedId)
    if (selectedPosition) openPositionDrawer(selectedPosition)
  }

  const deletePosition = (positionId: string) => {
    setPositions(positions.filter((position) => position.id !== positionId))
    toast.success('Position deleted')
    if (editingPositionId === positionId) closeDrawer()
  }

  const clearBallot = () => {
    setPositions([])
    closeDrawer()
    toast.success('Ballot cleared')
  }

  const togglePositionExpanded = (positionId: string) => {
    setExpandedPositions((current) => ({ ...current, [positionId]: !current[positionId] }))
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
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#111528]">Ballot positions</h2>
            <p className="mt-1 text-sm text-slate-500">Add the positions and candidates voters will choose from.</p>
          </div>

          <div className="space-y-3">
            {positions.map((position) => (
              <Card key={position.id} className="rounded-xl border border-[#e3e3e3] bg-white p-4 shadow-none">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="truncate text-base font-semibold text-[#111528]">{position.title}</p>
                      <p className="text-sm text-slate-500">{candidateLabel(position.candidates.length)}</p>
                    </div>
                    {position.candidates.length > 0 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {(expandedPositions[position.id] ? position.candidates : position.candidates.slice(0, 3)).map((candidate) => (
                          <div key={candidate.id} className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 py-1 pl-1 pr-3">
                            <CandidateAvatar candidate={candidate} />
                            <span className="max-w-[140px] truncate text-xs font-medium text-slate-700">{candidate.name}</span>
                          </div>
                        ))}
                        {position.candidates.length > 3 && <button type="button" onClick={() => togglePositionExpanded(position.id)} className="rounded-full px-2 py-1 text-xs font-medium text-[#003dff] hover:bg-[#eef2ff]">{expandedPositions[position.id] ? 'Show less' : `Show more +${position.candidates.length - 3}`}</button>}
                      </div>
                    ) : <p className="mt-3 text-sm text-slate-400">No candidates added yet.</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="secondary" className="h-9 gap-2 rounded-lg bg-[#e8edff] px-3 text-sm text-[#003dff] hover:bg-[#dce4ff]" onClick={() => openPositionDrawer(position)}>
                      <FiEdit2 className="h-4 w-4" />Edit
                    </Button>
                    <Button variant="ghost" className="h-9 gap-2 rounded-lg px-3 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => deletePosition(position.id)}>
                      <FiTrash2 className="h-4 w-4" />Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="outline" className="h-10 gap-2 rounded-lg border-[#3758f9] px-4 text-sm text-[#003dff] hover:bg-[#eef2ff] hover:text-[#003dff]" onClick={() => openPositionDrawer()}>
              <FiPlus className="h-4 w-4" />Add another position
            </Button>
            <Button variant="ghost" className="h-10 text-sm text-slate-500 hover:text-rose-600" onClick={clearBallot}>Clear ballot</Button>
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <Button variant="ghost" className="h-11 px-5 text-base text-[#111528]">Go Back</Button>
            <Button className="h-12 rounded-lg bg-[#003dff] px-6 text-base text-white hover:bg-[#0034d9]" onClick={onNext}>Save and continue</Button>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/15 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add position">
          <button type="button" className="min-w-0 flex-1 cursor-default" aria-label="Close position panel" onClick={closeDrawer} />
          <aside className="flex h-full w-full max-w-[580px] flex-col bg-white shadow-2xl">
            <div className="flex justify-end px-6 pt-6"><button type="button" onClick={closeDrawer} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Close position panel"><FiX className="h-5 w-5" /></button></div>
            <div className="flex-1 overflow-y-auto px-10 pb-28 pt-3 max-[520px]:px-6">
              <h2 className="text-base font-medium text-[#111528]">Add Position</h2>
              <p className="mt-3 text-sm text-[#111528]">Add the offices people will vote for</p>

              {positions.length > 0 && <div className="mt-5"><label htmlFor="position-picker" className="block text-sm font-medium text-[#111528]">Position</label><select id="position-picker" value={editingPositionId ?? 'new'} onChange={handlePositionChange} className="mt-2 h-12 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 text-sm text-[#111528] outline-none focus:border-[#003dff] focus:ring-3 focus:ring-[#003dff]/10"><option value="new">Add another position</option>{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></div>}

              {positionTitleEditing ? (
                <>
                  <label htmlFor="position-name" className="mt-5 block text-sm font-medium text-[#111528]">Position Name<span className="text-rose-500">*</span></label>
                  <Input id="position-name" value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} placeholder="e.g., President" className="mt-2 h-12 border-[#e3e3e3]" autoFocus />
                  <div className="mt-4 flex justify-end"><Button className="h-9 rounded-lg bg-[#003dff] px-4 text-sm text-white hover:bg-[#0034d9]" onClick={savePosition}>Save Position</Button></div>
                </>
              ) : activePosition ? (
                <div className="mt-5 rounded-xl border border-[#dbe3ff] bg-[#f7f8ff] p-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-[0.12em] text-[#7181d8]">Position</p><p className="mt-1 truncate text-base font-semibold text-[#111528]">{activePosition.title}</p></div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-[#003dff] hover:bg-white" onClick={() => setPositionTitleEditing(true)} aria-label={`Edit ${activePosition.title}`}><FiEdit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white hover:text-rose-600" onClick={() => deletePosition(activePosition.id)} aria-label={`Delete ${activePosition.title}`}><FiTrash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ) : null}

              {activePosition ? (
                <>
                  <div className="mt-6"><h3 className="text-base font-medium text-[#111528]">Add candidates</h3><p className="mt-3 text-sm text-[#111528]">Enter each candidate's full name and an optional photo.</p></div>
                  <div className="mt-5 space-y-3">
                    {candidateForms.map((form, index) => (
                      <div key={form.id} className="flex items-center gap-3">
                        <input ref={(element) => { photoInputRefs.current[form.id] = element }} id={`candidate-photo-${form.id}`} type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoChange(form.id, event)} />
                        {form.photo ? (
                          <button type="button" onClick={() => photoInputRefs.current[form.id]?.click()} className="shrink-0 self-start mt-7" aria-label="Change photo">
                            <img src={form.photo} alt={form.name || 'Candidate'} className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200 hover:ring-[#003dff] transition-all" />
                          </button>
                        ) : (
                          <Button type="button" variant="outline" className="shrink-0 self-start mt-7 h-10 w-10 rounded-full border-slate-300 p-0 text-slate-700" onClick={() => photoInputRefs.current[form.id]?.click()} aria-label="Upload photo">
                            <FiUpload className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="min-w-0 flex-1">
                          <label htmlFor={`candidate-name-${form.id}`} className="block text-xs font-medium text-slate-600">Full name<span className="text-rose-500">*</span></label>
                          <Input id={`candidate-name-${form.id}`} value={form.name} onChange={(event) => updateCandidateForm(form.id, event.target.value)} placeholder="Bola Tinubu" className="mt-1.5 h-10 border-slate-200 text-sm" required />
                        </div>
                        <button type="button" onClick={() => deleteCandidateForm(form.id)} className="shrink-0 self-start mt-7 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete candidate ${index + 1}`}><FiTrash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-500"><FiFileText className="mr-2 inline h-4 w-4" />Save the position above to add candidates.</div>
              )}
            </div>

            {activePosition && <div className="sticky bottom-0 border-t border-slate-100 bg-white px-10 py-4 shadow-[0_-8px_20px_-18px_rgba(15,23,42,0.45)] max-[520px]:px-6"><div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant="secondary" className="h-10 gap-2 rounded-lg bg-[#eef2ff] px-3 text-sm text-[#3758f9] hover:bg-[#e3e9ff]" onClick={addCandidateForm}><FiPlus className="h-4 w-4" />Add another candidate</Button><Button type="button" variant="outline" className="h-10 gap-2 rounded-lg border-[#3758f9] px-3 text-sm text-[#003dff] hover:bg-[#eef2ff] hover:text-[#003dff]" onClick={startNewPosition}><FiPlus className="h-4 w-4" />Add another position</Button></div></div>}
          </aside>
        </div>
      )}
    </div>
  )
}

export default Ballot