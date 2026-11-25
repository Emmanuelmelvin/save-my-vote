import { http, type ApiClient } from './client'
import type {
  AddVotersResult,
  DispatchResult,
  ElectionDetail,
  ElectionInput,
  ElectionResults,
  ElectionSummary,
  EmailTemplateContent,
  EmailTemplateInput,
  OrganizationType,
  Page,
  PositionInput,
  PublicElection,
  BallotPosition,
  Selection,
  Session,
  UserProfile,
  VoteReceipt,
  VoterInput,
  VoterSummary,
} from './types'

type Message = { message: string }

export class AuthApi {
  private readonly http: ApiClient
  constructor(client: ApiClient) {
    this.http = client
  }

  me() {
    return this.http.get<{ user: UserProfile }>('/auth/me')
  }

  /** Signed UserJot identity for the feedback widget; null when the API has no UserJot secret. */
  userJotToken() {
    return this.http.get<{ token: string | null }>('/auth/userjot-token')
  }

  signUp(input: {
    fullName: string
    email: string
    password: string
    organizationType?: OrganizationType
    organizationName?: string
  }) {
    return this.http.post<{ user: UserProfile; message: string }>('/auth/signup', input)
  }

  login(input: { email: string; password: string }) {
    return this.http.post<Session>('/auth/login', input)
  }

  logout() {
    return this.http.post<Message>('/auth/logout')
  }

  resendVerification(email: string) {
    return this.http.post<Message>('/auth/resend-verification', { email })
  }

  forgotPassword(email: string) {
    return this.http.post<Message>('/auth/forgot-password', { email })
  }

  resetPassword(input: { token: string; password: string; passwordConfirm: string }) {
    return this.http.patch<Session>('/auth/reset-password', input)
  }

  /** Full-page navigation target: the API redirects to Google and back. */
  googleSignInUrl() {
    return this.http.url('/auth/google')
  }
}

export class ElectionsApi {
  private readonly http: ApiClient
  constructor(client: ApiClient) {
    this.http = client
  }

  list(params: { limit?: number; offset?: number } = {}) {
    return this.http.get<Page<ElectionSummary>>('/elections', params)
  }

  get(id: string) {
    return this.http.get<ElectionDetail>(`/elections/${id}`)
  }

  create(input: ElectionInput) {
    return this.http.post<ElectionDetail>('/elections', input)
  }

  update(id: string, input: Partial<ElectionInput>) {
    return this.http.patch<ElectionDetail>(`/elections/${id}`, input)
  }

  remove(id: string) {
    return this.http.delete(`/elections/${id}`)
  }

  launch(id: string) {
    return this.http.post<ElectionDetail>(`/elections/${id}/launch`)
  }

  extend(id: string, endAt: Date) {
    return this.http.post<ElectionDetail>(`/elections/${id}/extend`, { endAt })
  }

  close(id: string) {
    return this.http.post<ElectionDetail>(`/elections/${id}/close`)
  }

  replaceBallot(id: string, positions: PositionInput[]) {
    return this.http.put<BallotPosition[]>(`/elections/${id}/ballot`, { positions })
  }

  replaceEmailTemplates(id: string, templates: EmailTemplateInput[]) {
    return this.http.put<EmailTemplateContent[]>(`/elections/${id}/email-templates`, { templates })
  }

  results(id: string) {
    return this.http.get<ElectionResults>(`/elections/${id}/results`)
  }
}

export class VotersApi {
  private readonly http: ApiClient
  constructor(client: ApiClient) {
    this.http = client
  }

  list(electionId: string, params: { limit?: number; offset?: number; search?: string } = {}) {
    return this.http.get<Page<VoterSummary>>(`/elections/${electionId}/voters`, params)
  }

  /** Every voter on the roll, following pagination. */
  async listAll(electionId: string): Promise<VoterSummary[]> {
    const all: VoterSummary[] = []
    for (let offset = 0; ; offset += 100) {
      const page = await this.list(electionId, { limit: 100, offset })
      all.push(...page.items)
      if (all.length >= page.pagination.total || page.items.length === 0) return all
    }
  }

  add(electionId: string, voters: VoterInput[]) {
    return this.http.post<AddVotersResult>(`/elections/${electionId}/voters`, { voters })
  }

  remove(electionId: string, voterId: string) {
    return this.http.delete(`/elections/${electionId}/voters/${voterId}`)
  }

  resendInvitation(electionId: string, voterId: string) {
    return this.http.post<VoterSummary>(`/elections/${electionId}/voters/${voterId}/resend-invitation`)
  }

  sendInvitations(electionId: string) {
    return this.http.post<DispatchResult>(`/elections/${electionId}/invitations/send`)
  }

  sendReminders(electionId: string) {
    return this.http.post<DispatchResult>(`/elections/${electionId}/reminders/send`)
  }
}

/** Voter-facing endpoints: no account, just email + one-time code. */
export class VotingApi {
  private readonly http: ApiClient
  constructor(client: ApiClient) {
    this.http = client
  }

  election(id: string) {
    return this.http.get<PublicElection>(`/public/elections/${id}`)
  }

  verify(id: string, credentials: { email: string; otp: string }) {
    return this.http.post<{ voter: { email: string; fullName: string | null }; hasVoted: boolean }>(
      `/public/elections/${id}/verify`,
      credentials,
    )
  }

  vote(id: string, input: { email: string; otp: string; selections: Selection[] }) {
    return this.http.post<VoteReceipt>(`/public/elections/${id}/vote`, input)
  }

  results(id: string) {
    return this.http.get<ElectionResults>(`/public/elections/${id}/results`)
  }
}

export class UploadsApi {
  private readonly http: ApiClient
  constructor(client: ApiClient) {
    this.http = client
  }

  /** Stores a candidate photo or logo and returns its public URL. */
  async image(file: Blob, filename = 'image'): Promise<string> {
    const form = new FormData()
    form.append('file', file, filename)
    const { url } = await this.http.upload<{ url: string }>('/uploads/images', form)
    return url
  }
}

export const api = {
  auth: new AuthApi(http),
  uploads: new UploadsApi(http),
  elections: new ElectionsApi(http),
  voters: new VotersApi(http),
  voting: new VotingApi(http),
}
