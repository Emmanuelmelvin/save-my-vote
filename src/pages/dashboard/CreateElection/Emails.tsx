import React from 'react'

import { Card } from '@/components/ui/card'

const Emails: React.FC = () => (
  <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">Emails</h3>
    <p className="mt-2 text-sm text-slate-500">Create the automated email messages for voters.</p>
  </Card>
)

export default Emails