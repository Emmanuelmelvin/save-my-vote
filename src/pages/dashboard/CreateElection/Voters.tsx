import React from 'react'

import { Card } from '@/components/ui/card'

const Voters: React.FC = () => (
  <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">Voters</h3>
    <p className="mt-2 text-sm text-slate-500">Add the eligible voters for this election.</p>
  </Card>
)

export default Voters