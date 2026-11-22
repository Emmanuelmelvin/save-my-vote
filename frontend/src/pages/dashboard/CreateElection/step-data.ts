import type { IconType } from 'react-icons'
import { FiEye, FiFileText, FiImage, FiList, FiMail, FiPlus, FiUsers } from 'react-icons/fi'

export type CreateElectionStepId = 'basic' | 'voters' | 'ballot' | 'emails' | 'branding' | 'preview' | 'launch'

export const createElectionSteps: Array<{
  id: CreateElectionStepId
  label: string
  icon: IconType
}> = [
  { id: 'basic', label: 'Basic Info', icon: FiFileText },
  { id: 'voters', label: 'Voters', icon: FiUsers },
  { id: 'ballot', label: 'Ballot', icon: FiList },
  { id: 'emails', label: 'Emails', icon: FiMail },
  { id: 'branding', label: 'Branding', icon: FiImage },
  { id: 'preview', label: 'Preview', icon: FiEye },
  { id: 'launch', label: 'Launch', icon: FiPlus },
]