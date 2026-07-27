import React, { useMemo, useRef, useState } from 'react'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiDownload,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiUpload,
  FiUsers,
  FiX,
} from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useCreateElectionStore from '@/store/createElection'
import type { Voter } from '@/store/createElection'

interface VotersProps {
  onNext?: () => void
}

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
  const lines = contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
  const nameIndex = headers.findIndex((header) => ['name', 'full name', 'fullname'].includes(header))
  const emailIndex = headers.findIndex((header) => header === 'email' || header === 'email address')

  if (nameIndex < 0 || emailIndex < 0) return []

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''))
      return { name: values[nameIndex] ?? '', email: values[emailIndex] ?? '' }
    })
    .filter((row) => row.name && row.email)
}

const Voters: React.FC<VotersProps> = ({ onNext }) => {
  const { voters, setVoters } = useCreateElectionStore()
  const [isImporting, setIsImporting] = useState(voters.length === 0)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [search, setSearch] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [importError, setImportError] = useState('')
  const [notice, setNotice] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredVoters = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return voters
    return voters.filter((voter) => `${voter.name} ${voter.email}`.toLowerCase().includes(query))
  }, [search, voters])

  const downloadSample = () => {
    const sample = 'name,email\nJohn Doe,john.doe@example.com\nJane Doe,jane.doe@example.com\n'
    const url = URL.createObjectURL(new Blob([sample], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sample-voters.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    setImportError('')

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportRows([])
      setImportError('For this preview, upload the CSV sample file. XLSX support can use the same column format.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const rows = parseCsv(String(reader.result ?? ''))
      setImportRows(rows)
      if (rows.length === 0) {
        setImportError('We could not find name and email columns. Download the sample file to use the correct format.')
      }
    }
    reader.readAsText(file)
  }

  const importVoters = () => {
    if (importRows.length === 0) return
    setVoters(importRows.map((row, index) => makeVoter(row, index)))
    setIsImporting(false)
    setNotice('Voters list was successfully imported')
  }

  const addVoter = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim()) return

    setVoters([...voters, makeVoter({ name: name.trim(), email: email.trim() }, voters.length)])
    setName('')
    setEmail('')
    setIsAddOpen(false)
    setNotice('Voter was added successfully')
  }

  const removeVoter = (id: string) => {
    setVoters(voters.filter((voter) => voter.id !== id))
  }

  return (
    <div className="relative">
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1050ff]">Voters</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">Senate Elections 2026</h2>
            <p className="mt-1 text-sm text-slate-500">Manage who can participate in your election.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-9 gap-2 rounded-lg border-slate-200 bg-white px-3 text-slate-700"
              onClick={() => {
                setIsImporting(true)
                setImportError('')
              }}
            >
              <FiUpload className="h-4 w-4" />
              Import
            </Button>
            <Button
              className="h-9 gap-2 rounded-lg bg-[#1050ff] px-3 text-white hover:bg-[#003fe6]"
              onClick={() => setIsAddOpen(true)}
            >
              <FiPlus className="h-4 w-4" />
              Add voter
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400" aria-label="More voter actions">
              <FiMoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isImporting ? (
          <div className="grid gap-8 px-5 py-7 md:grid-cols-[minmax(0,1fr)_280px] md:px-7 md:py-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#1050ff]">
                  <FiUsers className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Import voters</h3>
                  <p className="text-sm text-slate-500">Upload a spreadsheet to add your voter list.</p>
                </div>
              </div>

              <ol className="mt-7 space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">1</span>
                  <span>Click here to <button type="button" onClick={downloadSample} className="font-semibold text-[#1050ff] hover:underline">download the sample file</button>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">2</span>
                  <span>Fill in voter details. Keep the spreadsheet columns matched to the sample template.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">3</span>
                  <span>Upload your completed CSV file to continue.</span>
                </li>
              </ol>

              {importError && <p className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{importError}</p>}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" />
                <Button
                  variant="outline"
                  className="h-10 gap-2 rounded-lg border-[#4f67ff] px-4 text-[#4f67ff] hover:bg-[#f7f9ff]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload className="h-4 w-4" />
                  Upload file
                </Button>
                {selectedFileName && <span className="text-sm text-slate-500">{selectedFileName}</span>}
                <Button
                  className="h-10 rounded-lg bg-[#1050ff] px-5 text-white hover:bg-[#003fe6]"
                  disabled={importRows.length === 0}
                  onClick={importVoters}
                >
                  Continue
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                <FiDownload className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-slate-800">Your voter list</h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">The sample file includes the required name and email columns.</p>
              <button type="button" onClick={downloadSample} className="mt-5 text-sm font-semibold text-[#1050ff] hover:underline">
                Download sample file
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-sm font-semibold text-slate-800">{voters.length} voter{voters.length === 1 ? '' : 's'}</p>
                <p className="text-xs text-slate-500">Only people on this list can vote.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search voters" className="h-9 rounded-lg border-slate-200 pl-9 text-sm" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    <th className="px-5 py-3 sm:px-7">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Voter ID</th>
                    <th className="px-5 py-3">Voter key</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVoters.map((voter) => (
                    <tr key={voter.id} className="text-slate-700">
                      <td className="px-5 py-3.5 font-medium sm:px-7">{voter.name}</td>
                      <td className="px-5 py-3.5 text-slate-500">{voter.email}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{voter.voterId ?? '—'}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{voter.voterKey ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <button type="button" onClick={() => removeVoter(voter.id)} className="text-xs font-semibold text-rose-500 hover:text-rose-700">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVoters.length === 0 && <p className="px-7 py-10 text-center text-sm text-slate-500">No voters match your search.</p>}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <button type="button" onClick={() => setIsImporting(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
                <FiArrowLeft className="h-4 w-4" />
                Back to import
              </button>
              <Button className="h-10 rounded-lg bg-[#1050ff] px-5 text-white hover:bg-[#003fe6]" onClick={onNext} disabled={voters.length === 0}>
                Save and Continue
              </Button>
            </div>
          </>
        )
      </Card>

      {notice && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <FiCheckCircle className="h-4 w-4 shrink-0" />
          {notice}
          <button type="button" onClick={() => setNotice('')} className="ml-auto text-emerald-500 hover:text-emerald-700" aria-label="Dismiss notice">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/20" role="dialog" aria-modal="true" aria-label="Add voter">
          <button type="button" className="flex-1 cursor-default" aria-label="Close add voter drawer" onClick={() => setIsAddOpen(false)} />
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1050ff]">Voters</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Add Voter</h3>
              </div>
              <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close add voter drawer">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addVoter} className="flex flex-1 flex-col px-6 py-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="voter-name" className="text-sm font-medium text-slate-700">Name</label>
                  <Input id="voter-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" className="mt-2 h-11 border-slate-200" autoFocus />
                </div>
                <div>
                  <label htmlFor="voter-email" className="text-sm font-medium text-slate-700">Email<span className="text-rose-500">*</span></label>
                  <Input id="voter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voteremail@gmail.com" className="mt-2 h-11 border-slate-200" required />
                </div>
              </div>
              <div className="mt-auto flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="h-10 rounded-lg border-slate-200 px-4">Cancel</Button>
                <Button type="submit" className="h-10 rounded-lg bg-[#1050ff] px-5 text-white hover:bg-[#003fe6]">Add voter</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Voters
