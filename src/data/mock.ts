export type UserRole = 'admin' | 'voter'

export type User = {
  id: string
  name: string
  email?: string
  phone?: string
  role: UserRole
  verified: boolean
}

export type OTP = {
  id: string
  recipient: string
  code: string
  expiresAt: string // ISO
}

export type Candidate = {
  id: string
  name: string
  party?: string
  bio?: string
  votes: number
}

export type ElectionStatus = 'draft' | 'published' | 'active' | 'finished'

export type Election = {
  id: string
  title: string
  description?: string
  startsAt?: string
  endsAt?: string
  status: ElectionStatus
  candidates: Candidate[]
  totalVotes: number
}

export type Result = {
  electionId: string
  byCandidate: { candidateId: string; votes: number }[]
  totalVotes: number
}

// Mock users
export const mockUsers: User[] = [
  {
    id: 'u_admin_1',
    name: 'Alice Admin',
    email: 'alice@example.com',
    role: 'admin',
    verified: true,
  },
  {
    id: 'u_voter_1',
    name: 'Bob Voter',
    email: 'bob@example.com',
    phone: '+15551234567',
    role: 'voter',
    verified: false,
  },
]

// Example elections
export const mockElections: Election[] = [
  {
    id: 'election_2026_01',
    title: 'Student Council President',
    description: 'Election for the student council president for term 2026.',
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    status: 'active',
    candidates: [
      { id: 'c_1', name: 'Jane Doe', party: 'Unity', votes: 120 },
      { id: 'c_2', name: 'John Roe', party: 'Progress', votes: 95 },
    ],
    totalVotes: 215,
  },
  {
    id: 'election_2026_02',
    title: 'City Mayor (Draft)',
    description: 'Draft election for city mayor.',
    status: 'draft',
    candidates: [
      { id: 'c_3', name: 'Emma Mayor', party: 'Forward', votes: 0 },
      { id: 'c_4', name: 'Liam Mayor', party: 'Renew', votes: 0 },
    ],
    totalVotes: 0,
  },
]

export const mockResults: Result[] = mockElections
  .filter((e) => e.status === 'finished' || e.totalVotes > 0)
  .map((e) => ({
    electionId: e.id,
    byCandidate: e.candidates.map((c) => ({ candidateId: c.id, votes: c.votes })),
    totalVotes: e.totalVotes,
  }))

export const mockOTPs: OTP[] = [
  {
    id: 'otp_1',
    recipient: 'bob@example.com',
    code: '123456',
    expiresAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
  },
]

export default {
  users: mockUsers,
  elections: mockElections,
  results: mockResults,
  otps: mockOTPs,
}
