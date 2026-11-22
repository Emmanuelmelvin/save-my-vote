// Shapes returned by the SaveMyVote API (backend/src). Dates arrive as ISO strings.

export type OrganizationType = 'institution' | 'organisation'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  organizationType: OrganizationType | null
  organizationName: string | null
  isVerified: boolean
  hasGoogleAccount: boolean
  createdAt: string
}

export interface Session {
  user: UserProfile
  accessToken: string
}

export type ElectionStatus = 'draft' | 'launched'
export type ElectionPhase = 'draft' | 'upcoming' | 'active' | 'ended'

export interface Branding {
  logoUrl: string | null
  primaryColor: string
  heroImageUrl: string | null
}

export interface Analytics {
  totalVoters: number
  votersWhoVoted: number
  /** Percentage of the roll that voted, one decimal place. */
  turnout: number
  totalVotes: number
}

export interface ElectionSummary {
  id: string
  title: string
  description: string
  startAt: string
  endAt: string
  status: ElectionStatus
  phase: ElectionPhase
  launchedAt: string | null
  branding: Branding
  createdAt: string
  updatedAt: string
  analytics: Analytics
}

export interface BallotCandidate {
  id: string
  name: string
  description: string | null
  photoUrl: string | null
}

export interface BallotPosition {
  id: string
  title: string
  candidates: BallotCandidate[]
}

export type EmailTemplateType = 'invitation' | 'reminder' | 'confirmation'

export interface EmailTemplateContent {
  type: EmailTemplateType
  fromName: string
  subject: string
  body: string
  isDefault: boolean
}

export interface ElectionDetail extends ElectionSummary {
  ballot: BallotPosition[]
  emailTemplates: EmailTemplateContent[]
  votingLink: string
}

export interface Page<T> {
  items: T[]
  pagination: { total: number; limit: number; offset: number; page: number; totalPages: number }
}

export interface VoterSummary {
  id: string
  email: string
  fullName: string | null
  invited: boolean
  invitationSentAt: string | null
  hasVoted: boolean
  votedAt: string | null
  locked: boolean
}

export interface AddVotersResult {
  added: number
  skipped: number
  totalVoters: number
}

export interface DispatchResult {
  sent: number
  failed: number
}

export interface PublicElection {
  id: string
  title: string
  description: string
  startAt: string
  endAt: string
  phase: ElectionPhase
  branding: Branding
  ballot: BallotPosition[]
}

export interface VoteReceipt {
  votedAt: string
  positionsVoted: number
}

export interface CandidateResult {
  candidateId: string
  name: string
  photoUrl: string | null
  votes: number
  percentage: number
}

export interface PositionResult {
  positionId: string
  title: string
  totalVotes: number
  candidates: CandidateResult[]
  winnerIds: string[]
  isTie: boolean
}

export interface ElectionResults {
  election: { id: string; title: string; startAt: string; endAt: string; phase: ElectionPhase }
  isFinal: boolean
  analytics: Analytics
  positions: PositionResult[]
}

// ---- Request bodies ----

export interface ElectionInput {
  title: string
  description?: string
  startAt: Date
  endAt: Date
  logoUrl?: string | null
  primaryColor?: string
  heroImageUrl?: string | null
}

export interface CandidateInput {
  name: string
  description?: string
  photoUrl?: string
}

export interface PositionInput {
  title: string
  candidates: CandidateInput[]
}

export interface EmailTemplateInput {
  type: EmailTemplateType
  fromName: string
  subject: string
  body: string
}

export interface VoterInput {
  email: string
  fullName?: string
}

export interface Selection {
  positionId: string
  candidateId: string
}
