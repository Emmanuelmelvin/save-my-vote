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
  firstName?: string
  lastName?: string
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
  fromName: string
  subject: string
  body: string
}

export type BrandingData = {
  logo: string | null
  primaryColor: string
  heroImage: string | null
}

/** Everything the create-election wizard edits; saved to the API step by step. */
export type ElectionDraft = {
  /** Set once the draft exists on the server (after the first step is saved). */
  electionId: string | null

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
}

type CreateElectionState = ElectionDraft & {
  setElectionId: (id: string) => void
  setBasicInfo: (data: { title: string; description: string; startDate: Date | null; endDate: Date | null }) => void
  setVoters: (voters: Voter[]) => void
  setPositions: (positions: Position[]) => void
  setEmailTemplates: (templates: EmailTemplate[]) => void
  setBranding: (branding: BrandingData) => void
  /** Loads an existing draft (from the API) into the wizard. */
  hydrate: (draft: ElectionDraft) => void
  reset: () => void
}

const initialState: ElectionDraft = {
  electionId: null,
  title: '',
  description: '',
  startDate: null,
  endDate: null,
  voters: [],
  positions: [],
  emailTemplates: [],
  branding: {
    logo: null,
    primaryColor: '#1050ff',
    heroImage: null,
  },
}

const useCreateElectionStore = create<CreateElectionState>((set) => ({
  ...initialState,

  setElectionId: (electionId) => set({ electionId }),

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

  hydrate: (draft) => set({ ...draft }),

  reset: () => set({ ...initialState }),
}))

export default useCreateElectionStore
