import React from 'react'
import { Card } from '@/components/ui/card'

const Branding: React.FC = () => (
  <Card className="bg-white rounded-xl p-6 md:p-8 border border-slate-100 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">Branding</h3>
    <p className="mt-2 text-sm text-slate-500">Upload logos, colors, and hero imagery.</p>
  </Card>
)

export default Branding