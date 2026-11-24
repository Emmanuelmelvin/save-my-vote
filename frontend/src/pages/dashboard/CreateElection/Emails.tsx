import React, { useEffect } from 'react'
import { FiInfo, FiMail } from 'react-icons/fi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useCreateElectionStore, { type EmailTemplate } from '@/store/createElection'
import { ElectionDraftSync } from '@/lib/election-draft'
import { EMAIL_TOKENS } from '@/lib/format'
import { requireElectionId, useSaveStep } from './useSaveStep'

interface EmailsProps {
  onNext?: () => void
  onBack?: () => void
}

type EditableType = 'invitation' | 'reminder'

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

const emailInfo: Record<EditableType, { label: string; info: string }> = {
  invitation: {
    label: 'Voter Invitation',
    info: 'Sent to every voter automatically, shortly before voting opens, with their one-time code.',
  },
  reminder: {
    label: 'Voter Reminder',
    info: 'Sent to voters who haven’t voted yet when you choose “Remind non-voters” on the election’s Manage page.',
  },
}

const Emails: React.FC<EmailsProps> = ({ onNext, onBack }) => {
  const { title, emailTemplates, setEmailTemplates } = useCreateElectionStore()

  // Both emails are saved together. The voter's one-time code and the voting link
  // are added to invitations and reminders automatically.
  const save = useSaveStep((draft) =>
    ElectionDraftSync.saveTemplates(requireElectionId(draft), draft.emailTemplates, draft.title),
  )

  // Make sure both editable templates exist (a reopened draft may have only some).
  useEffect(() => {
    const missing = defaultTemplates.filter((d) => !emailTemplates.some((t) => t.type === d.type))
    if (missing.length) setEmailTemplates([...emailTemplates, ...missing])
  }, [emailTemplates, setEmailTemplates])

  const templateFor = (type: EditableType) =>
    emailTemplates.find((t) => t.type === type) ?? defaultTemplates.find((t) => t.type === type)!

  const updateTemplate = (type: EditableType, field: 'fromName' | 'subject' | 'body', value: string) => {
    const current = templateFor(type)
    const next = { ...current, [field]: value }
    const exists = emailTemplates.some((t) => t.type === type)
    setEmailTemplates(exists ? emailTemplates.map((t) => (t.type === type ? next : t)) : [...emailTemplates, next])
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
          const template = templateFor(type)
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
                    onChange={(event) => updateTemplate(type, 'fromName', event.target.value)}
                    placeholder="e.g., Email From John Doe"
                    className="mt-2 h-12 border-[#e3e3e3] px-5 text-base"
                  />
                </div>
                <div className="w-[171px] shrink-0 max-[560px]:w-full">
                  <p className="text-lg font-medium text-[#111528]">If left blank</p>
                  <div className="mt-2 flex h-12 items-center">
                    <p className="truncate text-base text-[#5A5F73]">{title || 'Your election title'}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mt-5">
                <label htmlFor={`${type}-subject`} className="text-lg font-medium text-[#111528]">Subject</label>
                <Input
                  id={`${type}-subject`}
                  value={template.subject}
                  onChange={(event) => updateTemplate(type, 'subject', event.target.value)}
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
                  onChange={(event) => updateTemplate(type, 'body', event.target.value)}
                  placeholder="e.g., Hi %name%, please vote in the election with the details below..."
                  rows={4}
                  className="mt-2 min-h-[98px] resize-none border-[#e3e3e3] px-5 py-3 text-base"
                />
              </div>

              {/* Hint */}
              <div className="mt-3 text-sm leading-6 text-[#111528]">
                <p>Use these in the subject or body and they’re filled in for each voter:</p>
                <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {EMAIL_TOKENS.map(({ token, meaning }) => (
                    <li key={token}><code className="rounded bg-[#E8EDFF] px-1.5 py-0.5 text-[#003DFF]">{token}</code> {meaning}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[#5A5F73]">Each voter’s one-time code and the voting link are added below your message.</p>
              </div>

              {/* Save button */}
              <div className="mt-3 flex items-center gap-3">
                {index === 1 && (
                  <Button variant="ghost" className="h-12 px-5 text-base text-[#111528]" onClick={onBack}>Back</Button>
                )}
                <Button
                  className="h-12 rounded-lg bg-[#003dff] px-6 text-base font-medium text-white hover:bg-[#0034d9]"
                  disabled={save.isPending}
                  onClick={() =>
                    save.mutate(undefined, {
                      onSuccess: () => (index === 1 ? onNext?.() : toast.success('Email saved')),
                    })
                  }
                >
                  {save.isPending ? 'Saving…' : index === 0 ? 'Save' : 'Save & Continue'}
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