import React, { useMemo, useState, useCallback } from 'react'
import { FiCheck, FiChevronDown, FiMenu } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import BasicInformation from '@/pages/dashboard/CreateElection/BasicInformation'
import Ballot from '@/pages/dashboard/CreateElection/Ballot'
import Branding from '@/pages/dashboard/CreateElection/Branding'
import Emails from '@/pages/dashboard/CreateElection/Emails'
import Launch from '@/pages/dashboard/CreateElection/Launch'
import Preview from '@/pages/dashboard/CreateElection/Preview'
import { createElectionSteps, type CreateElectionStepId } from '@/pages/dashboard/CreateElection/step-data'
import Voters from '@/pages/dashboard/CreateElection/Voters'
import useCreateElectionStore from '@/store/createElection'

interface CreateElectionProps {
  onOpenMenu?: () => void
}

function StepIndicator({ completed, active }: { completed: boolean; active: boolean }) {
  if (completed) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[#003dff] text-white">
        <FiCheck size={13} strokeWidth={3} />
      </span>
    )
  }

  return <span className={`h-5 w-5 shrink-0 rounded-[4px] border ${active ? 'border-[#003dff] bg-[#efeff1]' : 'border-[#111528] bg-[#efeff1]'}`} />
}

const CreateElection: React.FC<CreateElectionProps> = ({ onOpenMenu }) => {
  const { title } = useCreateElectionStore()
  const [activeStep, setActiveStep] = useState<CreateElectionStepId>('basic')
  const [completed, setCompleted] = useState<Record<CreateElectionStepId, boolean>>(() => ({
    basic: false,
    voters: false,
    ballot: false,
    emails: false,
    branding: false,
    preview: false,
    launch: false,
  }))

  const stepIds = createElectionSteps.map((step) => step.id)

  const handleNext = useCallback(() => {
    const currentIndex = stepIds.indexOf(activeStep)
    setCompleted((previous) => ({ ...previous, [activeStep]: true }))
    if (currentIndex < stepIds.length - 1) setActiveStep(stepIds[currentIndex + 1])
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
    launch: <Launch onNext={handleNext} onEdit={(step) => setActiveStep(step)} />,
  }), [handleNext])

  return (
    <div className="min-h-full bg-[#f8f8f8] text-[#111528]">
      <header className="flex h-[72px] items-center justify-between border-b border-[#e3e3e3] bg-white px-8 max-[760px]:px-5">
        <p className="font-['Manrope'] text-[16px] font-medium leading-6">{title || 'Senate Elections 2026'}</p>
        <Button variant="ghost" size="icon" className="hidden max-[760px]:inline-flex" onClick={onOpenMenu} aria-label="Open menu">
          <FiMenu size={20} />
        </Button>
      </header>

      <div className="flex min-h-[calc(100vh-72px)] max-[760px]:flex-col">
        <aside className="w-[210px] shrink-0 border-r border-[#e3e3e3] px-4 pb-[10px] pt-7 max-[760px]:w-full max-[760px]:border-r-0 max-[760px]:px-5 max-[760px]:pb-0 max-[760px]:pt-5">
          <ul className="flex w-[178px] flex-col gap-2 max-[760px]:hidden">
            {createElectionSteps.map((step) => (
              <li key={step.id} className={`flex h-11 w-[178px] cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${activeStep === step.id ? 'bg-white text-[#003dff]' : 'text-[#111528] hover:bg-white/70'}`} onClick={() => setActiveStep(step.id)}>
                <StepIndicator completed={completed[step.id]} active={activeStep === step.id} />
                <step.icon className={`h-5 w-5 shrink-0 ${activeStep === step.id ? 'text-[#003dff]' : 'text-[#111528]'}`} />
                <span className="whitespace-nowrap font-['Manrope'] text-[16px] font-medium leading-6">{step.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden max-[760px]:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-full justify-between rounded-lg border-slate-200 bg-white px-3 text-left text-slate-700">
                  <span>{activeStepLabel}</span>
                  <FiChevronDown className="text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Sections</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {createElectionSteps.map((step) => (
                  <DropdownMenuItem key={step.id} onSelect={() => setActiveStep(step.id)}>
                    <StepIndicator completed={completed[step.id]} active={activeStep === step.id} />
                    <step.icon className="h-4 w-4 text-slate-500" />
                    <span>{step.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-7 pb-10 pt-9 max-[760px]:w-full max-[760px]:px-5 max-[760px]:pt-6">
          <div className="ml-12 max-w-[600px] max-[900px]:mx-auto max-[760px]:ml-0 max-[760px]:max-w-none">
            {stepContent[activeStep]}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateElection
