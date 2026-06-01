import React from 'react'

import { Card } from '@/components/ui/card'

const Ballot: React.FC = () => (
  <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">Ballot</h3>
    <p className="mt-2 text-sm text-slate-500">Configure positions, candidates, and ballot settings.</p>
  </Card>
)

export default Ballot