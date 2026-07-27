import { create } from 'zustand'

export type Voter = {
  id: string
  name: string
  email: string
  voterId?: string
  voterKey?: string
}

export type Candidate = {
  id: string
  name: string
  description?: string
  photo?: string
}

export type Position = {
  id: string
  title: string
  candidates: Candidate[]
}

export type EmailTemplate = {
  id: string
  type: 'invitation' | 'reminder' | 'confirmation'
  subject: string
  body: string
}

export type BrandingData = {
  logo: string | null
  primaryColor: string
  heroImage: string | null
}

type CreateElectionState = {
  // Basic Information
  title: string
  description: string
  startDate: Date | null
  endDate: Date | null

  // Voters
  voters: Voter[]

  // Ballot
  positions: Position[]

  // Emails
  emailTemplates: EmailTemplate[]

  // Branding
  branding: BrandingData

  // Actions
  setBasicInfo: (data: { title: string; description: string; startDate: Date | null; endDate: Date | null }) => void
  setVoters: (voters: Voter[]) => void
  setPositions: (positions: Position[]) => void
  setEmailTemplates: (templates: EmailTemplate[]) => void
  setBranding: (branding: BrandingData) => void
  reset: () => void
}

const initialState = {
  title: '',
  description: '',
  startDate: null as Date | null,
  endDate: null as Date | null,
  voters: [] as Voter[],
  positions: [] as Position[],
  emailTemplates: [] as EmailTemplate[],
  branding: {
    logo: null as string | null,
    primaryColor: '#1050ff',
    heroImage: null as string | null,
  },
}

const useCreateElectionStore = create<CreateElectionState>((set) => ({
  ...initialState,

  setBasicInfo: (data) =>
    set({
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    }),

  setVoters: (voters) => set({ voters }),

  setPositions: (positions) => set({ positions }),

  setEmailTemplates: (templates) => set({ emailTemplates: templates }),

  setBranding: (branding) => set({ branding }),

  reset: () => set({ ...initialState }),
}))

export default useCreateElectionStore
