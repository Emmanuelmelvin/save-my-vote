import React, { useEffect } from 'react'
import { FiInfo, FiMail } from 'react-icons/fi'
import { toast } from 'sonner'

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
    fromName: '',
    subject: 'You are invited to vote',
    body: 'Hi %name%, please vote in the election with the details below...',
  },
  {
    id: 'reminder',
    type: 'reminder',
    fromName: '',
    subject: 'Reminder: voting is still open',
    body: 'Hi %name%, this is a reminder that you have not voted in the election...',
  },
]

const emailInfo: Record<string, { label: string; info: string }> = {
  invitation: {
    label: 'Voter Invitation',
    info: 'This is the email that is sent to voters when the election starts.',
  },
  reminder: {
    label: 'Voter Reminder',
    info: 'This is the email that is delivered to the voters when the election administrator sends out a voting reminder to voters that have not voted.',
  },
}

const Emails: React.FC<EmailsProps> = ({ onNext }) => {
  const { title, emailTemplates, setEmailTemplates } = useCreateElectionStore()

  useEffect(() => {
    if (emailTemplates.length === 0) setEmailTemplates(defaultTemplates)
  }, [emailTemplates.length, setEmailTemplates])

  const updateTemplate = (index: number, field: 'fromName' | 'subject' | 'body', value: string) => {
    const updated = [...emailTemplates]
    if (!updated[index]) return
    updated[index] = { ...updated[index], [field]: value }
    setEmailTemplates(updated)
  }

  return (
    <Card className="mx-auto max-w-[664px] rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
      {/* Header */}
      <div className="px-10 pt-10 max-[560px]:px-6">
        <div className="flex items-center gap-3">
          <FiMail className="h-8 w-8 text-[#7d8df7]" />
          <h2 className="text-xl font-medium text-[#111528]">Email Notifications</h2>
        </div>
      </div>

      <div className="mt-[21px] space-y-8 px-10 pb-10 max-[560px]:px-6">
        {(['invitation', 'reminder'] as const).map((type, index) => {
          const template = emailTemplates[index] || defaultTemplates[index]
          const info = emailInfo[type]

          return (
            <div key={type}>
              {/* Section heading */}
              <h3 className="text-lg font-medium text-[#111528]">{info.label}</h3>

              {/* Info banner */}
              <div className="mt-[21px] flex items-start gap-2 rounded-lg border-l-2 border-[#7DA2FF] bg-[#E8EDFF] p-2 text-sm leading-6 text-[#003DFF]">
                <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-[#7DA2FF]" />
                <p>{info.info}</p>
              </div>

              {/* From Name + Default */}
              <div className="mt-5 flex gap-[68px] max-[560px]:flex-col max-[560px]:gap-4">
                <div className="min-w-0 flex-1">
                  <label htmlFor={`${type}-from-name`} className="text-lg font-medium text-[#111528]">From Name</label>
                  <Input
                    id={`${type}-from-name`}
                    value={template.fromName}
                    onChange={(event) => updateTemplate(index, 'fromName', event.target.value)}
                    placeholder="e.g., Email From John Doe"
                    className="mt-2 h-12 border-[#e3e3e3] px-5 text-base"
                  />
                </div>
                <div className="w-[171px] shrink-0 max-[560px]:w-full">
                  <p className="text-lg font-medium text-[#111528]">Default:</p>
                  <div className="mt-2 flex h-12 items-center">
                    <p className="text-base text-[#111528]">{title || 'Election title'}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mt-5">
                <label htmlFor={`${type}-subject`} className="text-lg font-medium text-[#111528]">Subject</label>
                <Input
                  id={`${type}-subject`}
                  value={template.subject}
                  onChange={(event) => updateTemplate(index, 'subject', event.target.value)}
                  placeholder="e.g., You're invited to vote in the election: Senate Elections 2026"
                  className="mt-2 h-12 border-[#e3e3e3] px-5 text-base"
                />
              </div>

              {/* Body */}
              <div className="mt-5">
                <label htmlFor={`${type}-body`} className="text-lg font-medium text-[#111528]">Body</label>
                <Textarea
                  id={`${type}-body`}
                  value={template.body}
                  onChange={(event) => updateTemplate(index, 'body', event.target.value)}
                  placeholder="e.g., Hi %name%, please vote in the election with the details below..."
                  rows={4}
                  className="mt-2 min-h-[98px] resize-none border-[#e3e3e3] px-5 py-3 text-base"
                />
              </div>

              {/* Hint */}
              <p className="mt-3 text-base leading-6 text-[#111528]">
                You can add the token <strong>%name%</strong> to the email body, it will automatically be replaced by the voter's name
              </p>

              {/* Save button */}
              <div className="mt-3">
                <Button
                  className="h-12 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]"
                  onClick={() => index === 1 ? onNext?.() : toast.success('Email saved')}
                >
                  {index === 0 ? 'Save' : 'Save & Continue'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default Emails