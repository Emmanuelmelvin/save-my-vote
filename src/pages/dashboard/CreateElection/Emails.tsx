import React, { useEffect } from 'react'
import { FiMail } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useCreateElectionStore, { type EmailTemplate } from '@/store/createElection'

interface EmailsProps {
  onNext?: () => void
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'invitation',
    type: 'invitation',
    subject: 'You are invited to vote',
    body: 'Your secure voting link is ready. Use the link below to cast your vote.',
  },
  {
    id: 'reminder',
    type: 'reminder',
    subject: 'Reminder: voting is still open',
    body: 'You have not voted yet. Your secure voting link is still available.',
  },
  {
    id: 'confirmation',
    type: 'confirmation',
    subject: 'Your vote has been recorded',
    body: 'Thank you for voting. Your response has been securely recorded.',
  },
]

const Emails: React.FC<EmailsProps> = ({ onNext }) => {
  const { emailTemplates, setEmailTemplates } = useCreateElectionStore()

  useEffect(() => {
    if (emailTemplates.length === 0) setEmailTemplates(defaultTemplates)
  }, [emailTemplates.length, setEmailTemplates])

  const updateTemplate = (index: number, field: 'subject' | 'body', value: string) => {
    const updated = [...emailTemplates]
    if (!updated[index]) return
    updated[index] = { ...updated[index], [field]: value }
    setEmailTemplates(updated)
  }

  return (
    <Card className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#1050ff]"><FiMail size={18} /></span>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Emails</h3>
          <p className="mt-0.5 text-sm text-slate-500">Create the automated messages voters receive during the election.</p>
        </div>
      </div>

      <div className="space-y-4">
        {(['invitation', 'reminder', 'confirmation'] as const).map((type, index) => {
          const template = emailTemplates[index] || defaultTemplates[index]
          return (
            <div key={type} className="rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold capitalize text-slate-800">{type} email</h4>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-500">Automated</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor={`${type}-subject`} className="text-xs font-medium text-slate-500">Subject</label>
                  <Input id={`${type}-subject`} value={template.subject} onChange={(event) => updateTemplate(index, 'subject', event.target.value)} placeholder={`Your ${type} email subject...`} className="mt-1.5 h-10 border-slate-200" />
                </div>
                <div>
                  <label htmlFor={`${type}-body`} className="text-xs font-medium text-slate-500">Body</label>
                  <Textarea id={`${type}-body`} value={template.body} onChange={(event) => updateTemplate(index, 'body', event.target.value)} placeholder={`Your ${type} email body...`} rows={3} className="mt-1.5 resize-none border-slate-200" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <Button className="h-11 rounded-lg bg-[#1050ff] px-6 font-medium text-white hover:bg-[#003fe6]" onClick={onNext}>Next</Button>
      </div>
    </Card>
  )
}

export default Emails
