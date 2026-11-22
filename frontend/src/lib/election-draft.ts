import { api } from '@/lib/api/services'
import type {
  ElectionDetail,
  ElectionInput,
  EmailTemplateInput,
  PositionInput,
  VoterSummary,
} from '@/lib/api/types'
import { fromApiPlaceholders, toApiPlaceholders } from '@/lib/format'
import type { BrandingData, ElectionDraft, EmailTemplate, Position, Voter } from '@/store/createElection'

const HEX = /^#[0-9a-fA-F]{6}$/

/** Converts between the wizard's draft and the API's request/response shapes. */
export class ElectionDraftMapper {
  static basics(draft: Pick<ElectionDraft, 'title' | 'description' | 'startDate' | 'endDate'>): ElectionInput {
    if (!draft.startDate || !draft.endDate) throw new Error('Set both the start and end date first.')
    return {
      title: draft.title.trim(),
      description: draft.description.trim(),
      startAt: draft.startDate,
      endAt: draft.endDate,
    }
  }

  static branding(branding: BrandingData): Partial<ElectionInput> {
    return {
      logoUrl: branding.logo || null,
      heroImageUrl: branding.heroImage || null,
      primaryColor: HEX.test(branding.primaryColor) ? branding.primaryColor : undefined,
    }
  }

  static ballot(positions: Position[]): PositionInput[] {
    return positions.map((position) => ({
      title: position.title.trim(),
      candidates: position.candidates
        .filter((candidate) => candidate.name.trim())
        .map((candidate) => ({
          name: candidate.name.trim(),
          ...(candidate.description?.trim() ? { description: candidate.description.trim() } : {}),
          ...(candidate.photo ? { photoUrl: candidate.photo } : {}),
        })),
    }))
  }

  /** "From name" falls back to the election title, as the Emails step shows. */
  static templates(templates: EmailTemplate[], electionTitle: string): EmailTemplateInput[] {
    return templates
      .filter((template) => template.subject.trim() && template.body.trim())
      .map((template) => ({
        type: template.type,
        fromName: (template.fromName.trim() || electionTitle.trim() || 'Electoral Committee').slice(0, 100),
        subject: template.subject.trim(),
        body: toApiPlaceholders(template.body),
      }))
  }

  /** Builds the wizard state for an existing draft. */
  static fromApi(detail: ElectionDetail, voters: VoterSummary[]): ElectionDraft {
    return {
      electionId: detail.id,
      title: detail.title,
      description: detail.description,
      startDate: new Date(detail.startAt),
      endDate: new Date(detail.endAt),
      voters: voters.map((voter) => ({
        id: voter.id,
        name: voter.fullName ?? '',
        email: voter.email,
      })),
      positions: detail.ballot.map((position) => ({
        id: position.id,
        title: position.title,
        candidates: position.candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          description: candidate.description ?? undefined,
          photo: candidate.photoUrl ?? undefined,
        })),
      })),
      emailTemplates: detail.emailTemplates
        .filter((template) => template.type !== 'confirmation')
        .map((template) => ({
          id: template.type,
          type: template.type,
          fromName: template.isDefault ? '' : template.fromName,
          subject: template.subject,
          body: fromApiPlaceholders(template.body),
        })),
      branding: {
        logo: detail.branding.logoUrl,
        primaryColor: detail.branding.primaryColor,
        heroImage: detail.branding.heroImageUrl,
      },
    }
  }
}

/** Saves each wizard step to the API. */
export class ElectionDraftSync {
  /** Creates the draft on first save, updates it afterwards. Returns its id. */
  static async saveBasics(draft: ElectionDraft): Promise<string> {
    const input = ElectionDraftMapper.basics(draft)
    if (draft.electionId) {
      await api.elections.update(draft.electionId, input)
      return draft.electionId
    }
    return (await api.elections.create(input)).id
  }

  /**
   * Makes the server roll match the wizard's list (matched by email): adds new
   * voters and removes ones taken off the list. Returns the saved roll.
   */
  static async saveVoters(electionId: string, voters: Voter[]): Promise<VoterSummary[]> {
    const current = await api.voters.listAll(electionId)
    const wanted = new Map(voters.map((voter) => [voter.email.trim().toLowerCase(), voter]))
    const existing = new Set(current.map((voter) => voter.email))

    const toRemove = current.filter((voter) => !wanted.has(voter.email))
    for (const voter of toRemove) await api.voters.remove(electionId, voter.id)

    const toAdd = [...wanted.entries()]
      .filter(([email]) => !existing.has(email))
      .map(([email, voter]) => ({ email, ...(voter.name.trim() ? { fullName: voter.name.trim() } : {}) }))
    for (let i = 0; i < toAdd.length; i += 5000) {
      await api.voters.add(electionId, toAdd.slice(i, i + 5000))
    }
    return api.voters.listAll(electionId)
  }

  static saveBallot(electionId: string, positions: Position[]) {
    return api.elections.replaceBallot(electionId, ElectionDraftMapper.ballot(positions))
  }

  static saveTemplates(electionId: string, templates: EmailTemplate[], title: string) {
    return api.elections.replaceEmailTemplates(electionId, ElectionDraftMapper.templates(templates, title))
  }

  static saveBranding(electionId: string, branding: BrandingData) {
    return api.elections.update(electionId, ElectionDraftMapper.branding(branding))
  }
}
