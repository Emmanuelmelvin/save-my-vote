import React from 'react'
import { FiMail } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useCreateElectionStore from '@/store/createElection'

interface EmailsProps {
  onNext?: () => void
}

const Emails: React.FC<EmailsProps> = ({ onNext }) => {
  const { emailTemplates, setEmailTemplates } = useCreateElectionStore()

  const updateTemplate = (index: number, field: 'subject' | 'body', value: string) => {
    const updated = [...emailTemplates]
    if (!updated[index]) return
    updated[index] = { ...updated[index], [field]: value }
    setEmailTemplates(updated)
  }

  return (
    <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FiMail size={20} className="text-slate-700" />
        <h3 className="text-lg font-semibold text-slate-800">Emails</h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">Create the automated email messages for voters.</p>

      <div className="space-y-6">
        {(['invitation', 'reminder', 'confirmation'] as const).map((type, index) => {
          const template = emailTemplates[index] || { id: type, type, subject: '', body: '' }
          return (
            <div key={type} className="border border-slate-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-700 capitalize mb-3">{type} Email</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
                  <input
                    value={template.subject}
                    onChange={(e) => updateTemplate(index, 'subject', e.target.value)}
                    placeholder={`Your ${type} email subject...`}
                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Body</label>
                  <textarea
                    value={template.body}
                    onChange={(e) => updateTemplate(index, 'body', e.target.value)}
                    placeholder={`Your ${type} email body...`}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-none"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-50 mt-6">
        <Button
          className="px-6 h-11 font-medium rounded-md shadow-sm bg-[#1050ff] hover:bg-[#003fe6] text-white transition-colors"
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </Card>
  )
}

export default Emails