import React, { useMemo, useRef, useState } from 'react'
import { FiFileText, FiPlus, FiSearch, FiTrash2, FiUpload, FiUsers, FiX } from 'react-icons/fi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import spreadsheetAsset from '@/assets/voter-template.png'
import useCreateElectionStore from '@/store/createElection'
import type { Voter } from '@/store/createElection'

interface VotersProps {
  onNext?: () => void
}

type PanelMode = 'manual' | 'import' | null
type ImportRow = Pick<Voter, 'name' | 'email'>

const makeVoter = (row: ImportRow, index: number): Voter => {
  const sequence = String(index + 1).padStart(3, '0')
  return {
    id: crypto.randomUUID(),
    name: row.name,
    email: row.email,
    voterId: `SOV-${sequence}`,
    voterKey: `VKEY-${sequence}`,
  }
}

const parseCsv = (contents: string): ImportRow[] => {
  const lines = contents.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
  const nameIndex = headers.findIndex((header) => ['name', 'full name', 'fullname'].includes(header))
  const emailIndex = headers.findIndex((header) => header === 'email' || header === 'email address')
  if (nameIndex < 0 || emailIndex < 0) return []

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''))
    return { name: values[nameIndex] ?? '', email: values[emailIndex] ?? '' }
  }).filter((row) => row.name && row.email)
}

const parseSpreadsheet = async (file: File): Promise<ImportRow[]> => {
  if (file.name.toLowerCase().endsWith('.csv')) return parseCsv(await file.text())

  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const firstSheet = workbook.SheetNames[0]
  if (!firstSheet) return []

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], { defval: '' })
  return rows.map((row) => {
    const entries = Object.entries(row)
    const valueFor = (labels: string[]) => String(entries.find(([key]) => labels.includes(key.trim().toLowerCase()))?.[1] ?? '').trim()
    return { name: valueFor(['name', 'full name', 'fullname']), email: valueFor(['email', 'email address']) }
  }).filter((row) => row.name && row.email)
}

const Voters: React.FC<VotersProps> = ({ onNext }) => {
  const { voters, setVoters } = useCreateElectionStore()
  const [panelMode, setPanelMode] = useState<PanelMode>(null)
  const [showList, setShowList] = useState(voters.length > 0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [draftVoters, setDraftVoters] = useState<ImportRow[]>([])
  const [selectedFileName, setSelectedFileName] = useState('')
  const [selectedFileSize, setSelectedFileSize] = useState('')
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredVoters = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return voters
    return voters.filter((voter) => `${voter.name} ${voter.email}`.toLowerCase().includes(query))
  }, [search, voters])

  const openPanel = (mode: Exclude<PanelMode, null>) => {
    setPanelMode(mode)
    if (mode === 'manual') {
      setName('')
      setEmail('')
      setDraftVoters([])
    }
  }

  const closePanel = () => {
    setPanelMode(null)
  }

  const addToDraft = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim()) return
    setDraftVoters((current) => [...current, { name: name.trim(), email: email.trim() }])
    setName('')
    setEmail('')
  }

  const saveManualVoters = () => {
    if (draftVoters.length === 0) {
      toast.error('Add at least one voter before saving.')
      return
    }
    setVoters([...voters, ...draftVoters.map((row, index) => makeVoter(row, voters.length + index))])
    setShowList(true)
    toast.success(`${draftVoters.length} voter${draftVoters.length === 1 ? '' : 's'} added successfully`)
    closePanel()
  }

  const downloadSample = () => {
    const sample = 'name,email\nJohn Doe,john.doe@example.com\nJane Doe,jane.doe@example.com\n'
    const url = URL.createObjectURL(new Blob([sample], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sample-voters.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    setSelectedFileSize(`${(file.size / 1024).toFixed(1)}kb`)
    try {
      const rows = await parseSpreadsheet(file)
      setImportRows(rows)
      if (rows.length === 0) toast.error('Use name and email columns, as shown in the sample file.')
    } catch {
      setImportRows([])
      toast.error('We could not read that file. Try a CSV or XLSX file with name and email columns.')
    }
  }

  const removeFile = () => {
    setSelectedFileName('')
    setSelectedFileSize('')
    setImportRows([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const saveImportedVoters = () => {
    if (importRows.length === 0) {
      toast.error('Choose a valid CSV or XLSX file before importing.')
      return
    }
    setVoters([...voters, ...importRows.map((row, index) => makeVoter(row, voters.length + index))])
    setShowList(true)
    toast.success('Voters list was successfully imported')
    closePanel()
  }

  const removeVoter = (id: string) => setVoters(voters.filter((voter) => voter.id !== id))

  return (
    <div className="w-full">
      {!showList ? (
        <Card className="min-h-[430px] w-full max-w-[600px] rounded-2xl border border-[#e3e3e3] bg-white p-0 shadow-none">
          <div className="flex min-h-[430px] flex-col items-center px-6 py-10 text-center sm:px-10">
            <div className="flex items-center gap-3"><FiUsers className="h-8 w-8 text-sky-400" /><h2 className="text-xl font-medium text-[#111528]">Voters</h2></div>
            <p className="mt-9 text-base text-[#111528]">Manage who can participate in your election.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button variant="outline" className="h-12 gap-2 rounded-lg border-[#3758f9] px-6 text-base font-medium text-[#3758f9] hover:bg-[#eef2ff] hover:text-[#3758f9]" onClick={() => openPanel('import')}><FiUpload className="h-5 w-5" />Import voter's list</Button>
              <Button className="h-12 gap-2 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]" onClick={() => openPanel('manual')}>Add voter<FiPlus className="h-5 w-5" /></Button>
            </div>
            {voters.length > 0 && <button type="button" onClick={() => setShowList(true)} className="mt-6 text-sm font-medium text-[#003dff] hover:underline">View {voters.length} saved voter{voters.length === 1 ? '' : 's'}</button>}
          </div>
        </Card>
      ) : (
        <div className="w-full max-w-[824px]">
          <div className="relative mb-7 max-w-[600px]"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="h-12 rounded-full border-slate-200 bg-white pl-12 text-base" /></div>
          <div className="hidden overflow-x-auto rounded-t-lg bg-white sm:block"><table className="w-full min-w-[430px] text-left"><thead className="bg-[#e5e7eb] text-sm font-medium text-[#111928]"><tr><th className="rounded-tl-lg px-4 py-3">NAME</th><th className="px-4 py-3">EMAIL</th><th className="rounded-tr-lg px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-[#e3e3e3]">{filteredVoters.map((voter) => <tr key={voter.id} className="text-sm text-[#111528]"><td className="px-4 py-3">{voter.name}</td><td className="px-4 py-3">{voter.email}</td><td className="px-4 py-3"><button type="button" onClick={() => removeVoter(voter.id)} className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-rose-600" aria-label={`Remove ${voter.name}`}><FiTrash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table><p className="border-t border-[#e3e3e3] px-4 py-3 text-sm text-[#111528]">{voters.length} voter{voters.length === 1 ? '' : 's'}</p></div>
          <div className="space-y-3 sm:hidden">{filteredVoters.map((voter) => <div key={voter.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"><div><p className="font-medium text-slate-800">{voter.name}</p><p className="mt-1 text-sm text-slate-500">{voter.email}</p></div><button type="button" onClick={() => removeVoter(voter.id)} className="text-rose-500" aria-label={`Remove ${voter.name}`}><FiTrash2 className="h-4 w-4" /></button></div>)}{filteredVoters.length === 0 && <p className="rounded-lg bg-white p-6 text-center text-sm text-slate-500">No voters match your search.</p>}</div>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end"><Button variant="ghost" className="h-11 px-5 text-base text-[#111528] hover:bg-white" onClick={() => setShowList(false)}>Go Back</Button><Button className="h-12 rounded-lg bg-[#003dff] px-6 text-base text-white hover:bg-[#0034d9]" onClick={onNext} disabled={voters.length === 0}>Save and continue</Button></div>
        </div>
      )}

      {panelMode && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/20" role="dialog" aria-modal="true" aria-label={panelMode === 'manual' ? 'Add voters manually' : 'Import voters'}>
          <button type="button" className="flex-1 cursor-default" aria-label="Close voter panel" onClick={closePanel} />
          <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#003dff]">Voters</p><h3 className="mt-1 text-xl font-semibold text-slate-900">{panelMode === 'manual' ? 'Add voters manually' : 'Import voter list'}</h3></div><button type="button" onClick={closePanel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close voter panel"><FiX className="h-5 w-5" /></button></div>

            {panelMode === 'manual' ? (
              <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
                <p className="text-sm leading-6 text-slate-500">Add as many voters as you need, then save the list when you are ready.</p>
                <form onSubmit={addToDraft} className="mt-6 space-y-4"><div><label htmlFor="voter-name" className="text-sm font-medium text-slate-700">Full name</label><Input id="voter-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" className="mt-2 h-11 border-slate-200" autoFocus required /></div><div><label htmlFor="voter-email" className="text-sm font-medium text-slate-700">Email address</label><Input id="voter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="john@example.com" className="mt-2 h-11 border-slate-200" required /></div><Button type="submit" variant="outline" className="h-10 w-full border-[#3758f9] text-[#3758f9] hover:bg-[#eef2ff] hover:text-[#3758f9]"><FiPlus className="h-4 w-4" />Add to list</Button></form>
                {draftVoters.length > 0 && <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-sm font-semibold text-slate-700">Ready to add ({draftVoters.length})</p><div className="mt-3 space-y-2">{draftVoters.map((voter, index) => <div key={`${voter.email}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{voter.name}</p><p className="truncate text-xs text-slate-500">{voter.email}</p></div><button type="button" onClick={() => setDraftVoters((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="p-1 text-slate-400 hover:text-rose-600" aria-label={`Remove ${voter.name}`}><FiX className="h-4 w-4" /></button></div>)}</div></div>}
                <div className="mt-auto flex justify-end gap-3 border-t border-slate-100 pt-5"><Button type="button" variant="outline" className="h-10 border-slate-200" onClick={closePanel}>Cancel</Button><Button type="button" className="h-10 bg-[#003dff] px-5 text-white hover:bg-[#0034d9]" onClick={saveManualVoters}>Save {draftVoters.length || ''} voter{draftVoters.length === 1 ? '' : 's'}</Button></div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6"><p className="text-sm leading-6 text-slate-500">Upload a CSV or XLSX file with <strong>name</strong> and <strong>email</strong> columns.</p><button type="button" onClick={downloadSample} className="mt-4 self-start text-sm font-medium text-[#003dff] hover:underline">Download the sample CSV</button><img src={spreadsheetAsset} alt="Voter spreadsheet template" className="mt-4 h-20 w-full rounded-lg border border-slate-200 object-cover object-top" /><input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" />{selectedFileName ? <div className="relative mt-5 rounded-lg bg-slate-100 px-4 py-3"><p className="pr-20 text-sm font-medium text-slate-700">{selectedFileName}</p><p className="mt-1 text-xs text-slate-500">{selectedFileSize}{importRows.length > 0 ? ` · ${importRows.length} voter${importRows.length === 1 ? '' : 's'} found` : ''}</p><button type="button" onClick={removeFile} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-600" aria-label="Remove selected file"><FiTrash2 className="h-4 w-4" /></button></div> : <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 flex w-full flex-col items-center rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center hover:border-[#003dff] hover:bg-[#f7f8ff]"><FiFileText className="h-6 w-6 text-[#003dff]" /><span className="mt-2 text-sm font-medium text-slate-700">Choose CSV or XLSX file</span><span className="mt-1 text-xs text-slate-400">Maximum file size: 5 MB</span></button>}<div className="mt-auto flex justify-end gap-3 border-t border-slate-100 pt-5"><Button type="button" variant="outline" className="h-10 border-slate-200" onClick={closePanel}>Cancel</Button><Button type="button" className="h-10 bg-[#003dff] px-5 text-white hover:bg-[#0034d9]" onClick={saveImportedVoters} disabled={importRows.length === 0}>Import voters</Button></div></div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

export default Voters
