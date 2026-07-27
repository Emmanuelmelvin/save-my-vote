import React, { useMemo, useState, useCallback } from 'react'
import { FiCheck, FiChevronDown, FiCircle } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import BasicInformation from './CreateElection/BasicInformation'
import Ballot from './CreateElection/Ballot'
import Branding from './CreateElection/Branding'
import Emails from './CreateElection/Emails'
import Launch from './CreateElection/Launch'
import Preview from './CreateElection/Preview'
import { createElectionSteps, type CreateElectionStepId } from './CreateElection/step-data'
import Voters from './CreateElection/Voters'

function StepIndicator({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1050ff] text-white shrink-0">
        <FiCheck size={12} strokeWidth={3} />
      </span>
    )
  }
  return (
    <span className="flex items-center justify-center w-5 h-5 shrink-0">
      <FiCircle size={14} className="text-slate-300" />
    </span>
  )
}

const CreateElection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<CreateElectionStepId>('basic')
  const [launched, setLaunched] = useState(false)
  const [completed, setCompleted] = useState<Record<CreateElectionStepId, boolean>>(() => ({
    basic: false,
    voters: false,
    ballot: false,
    emails: false,
    branding: false,
    preview: false,
    launch: false,
  }))

  const stepIds = createElectionSteps.map((s) => s.id)

  const handleNext = useCallback(() => {
    const currentIndex = stepIds.indexOf(activeStep)
    if (currentIndex < stepIds.length - 1) {
      setCompleted((prev) => ({ ...prev, [activeStep]: true }))
      const nextStep = stepIds[currentIndex + 1]
      setActiveStep(nextStep)
      return
    }

    setCompleted((prev) => ({ ...prev, [activeStep]: true }))
    setLaunched(true)
  }, [activeStep, stepIds])

  const activeStepLabel = useMemo(
    () => createElectionSteps.find((step) => step.id === activeStep)?.label ?? 'Basic Info',
    [activeStep],
  )

  const stepContent = useMemo<Record<CreateElectionStepId, React.ReactNode>>(() => ({
    basic: <BasicInformation onNext={handleNext} />,
    voters: <Voters onNext={handleNext} />,
    ballot: <Ballot onNext={handleNext} />,
    emails: <Emails onNext={handleNext} />,
    branding: <Branding onNext={handleNext} />,
    preview: <Preview onNext={handleNext} />,
    launch: <Launch onNext={handleNext} />,
  }), [handleNext])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-slate-500">Choose a section and continue building your election.</p>
          </div>
        </div>

        {/* Mobile dropdown only */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-56 justify-between rounded-md border-slate-200 bg-white px-4 py-3 text-left text-slate-700 shadow-sm hover:bg-slate-50">
                <span>{activeStepLabel}</span>
                <FiChevronDown className="text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Sections</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {createElectionSteps.map((step) => (
                <DropdownMenuItem key={step.id} onSelect={() => setActiveStep(step.id)} className={activeStep === step.id ? 'bg-[#eef2ff] text-[#0b45e4]' : ''}>
                  <div className="flex items-center gap-2">
                    <StepIndicator completed={completed[step.id]} />
                    <step.icon className="h-4 w-4 text-slate-500" />
                    <span>{step.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {launched && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <FiCheck className="h-4 w-4" />
          Your election is ready to launch. You can still revisit any step before publishing.
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop steps sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <ul className="space-y-1">
            {createElectionSteps.map((step) => (
              <li
                key={step.id}
                className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-colors ${activeStep === step.id ? 'bg-[#eef2ff] font-semibold text-[#0b45e4]' : 'text-slate-600 hover:bg-slate-50'}`}
                onClick={() => setActiveStep(step.id)}
              >
                <StepIndicator completed={completed[step.id]} />
                <step.icon className={`h-4 w-4 ${activeStep === step.id ? 'text-[#0b45e4]' : 'text-slate-400'}`} />
                <span className="text-sm">{step.label}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1">{stepContent[activeStep]}</div>
      </div>
    </div>
  )
}

export default CreateElection
