import { Injectable, NotFoundException } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { ProjectedTurnoutService } from 'src/projectedTurnout/projectedTurnout.service'
import {
  CampaignPlanContextCandidate,
  CampaignPlanContextRequestDto,
  CampaignPlanContextResponse,
} from './campaign-plan-context.schema'

@Injectable()
export class CampaignPlanContextService extends createPrismaBase(MODELS.Race) {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {
    super()
  }

  async getCampaignPlanContext(
    dto: CampaignPlanContextRequestDto,
  ): Promise<CampaignPlanContextResponse> {
    const { brDatabaseId, user } = dto

    const race = await this.model.findFirst({
      where: { brDatabaseId },
      include: {
        Candidacies: {
          select: {
            gpCandidateId: true,
            firstName: true,
            lastName: true,
            email: true,
            party: true,
          },
        },
        Position: {
          include: {
            district: { include: { ProjectedTurnouts: true } },
          },
        },
      },
    })

    if (!race) {
      throw new NotFoundException(
        `Race not found for brDatabaseId=${brDatabaseId}`,
      )
    }

    const { primaryDate, generalDate } = await this.lookupSiblingStageDates(
      race.positionId,
      race.electionDate,
      race.isPrimary,
      race.isRunoff,
      race.id,
    )

    const projectedTurnout = this.resolveProjectedTurnout(
      race.Position?.district ?? null,
      race.electionDate,
      race.state,
    )

    const winNumberEstimate = this.computeWinNumberEstimate(
      projectedTurnout,
      race.numberOfSeats,
    )
    const winNumberEffective = race.winNumber ?? winNumberEstimate
    const contactsNeededEstimate =
      winNumberEffective !== null ? 5 * winNumberEffective : null

    const userEmail = user.email ?? null
    const candidates: CampaignPlanContextCandidate[] = race.Candidacies.map(
      (c) => ({
        gp_candidate_id: c.gpCandidateId,
        first_name: c.firstName,
        last_name: c.lastName,
        full_name: `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        party: c.party,
        is_user: this.isSameEmail(c.email, userEmail),
      }),
    )

    return {
      candidate_count: candidates.length,
      candidate_office: this.composeCandidateOffice(
        race.positionNames,
        race.normalizedPositionName,
      ),
      candidates,
      civics_win_number: race.winNumber,
      contacts_needed_estimate: contactsNeededEstimate,
      general_election_date: this.toIsoDate(generalDate),
      number_of_seats: race.numberOfSeats,
      office_level: race.officeLevel,
      office_type: race.officeType,
      official_office_name: race.officialOfficeName,
      primary_election_date: this.toIsoDate(primaryDate),
      projected_turnout: projectedTurnout,
      relevant_election_date: this.toIsoDate(race.electionDate),
      state: race.state,
      user_created_at: user.createdAt ?? null,
      user_email: userEmail,
      user_first_name: user.firstName ?? null,
      user_full_name: user.fullName ?? null,
      user_id: user.id ?? null,
      user_is_incumbent: user.isIncumbent ?? null,
      user_last_name: user.lastName ?? null,
      user_party_affiliation: user.partyAffiliation ?? null,
      user_phone_number: user.phoneNumber ?? null,
      win_number_effective: winNumberEffective,
      win_number_estimate: winNumberEstimate,
    }
  }

  private async lookupSiblingStageDates(
    positionId: string | null,
    electionDate: Date,
    isPrimary: boolean | null,
    isRunoff: boolean | null,
    excludeRaceId: string,
  ): Promise<{ primaryDate: Date | null; generalDate: Date | null }> {
    // Seed with the looked-up race's own date for whichever stage it represents.
    let primaryDate: Date | null = isPrimary ? electionDate : null
    let generalDate: Date | null = !isPrimary && !isRunoff ? electionDate : null

    if (!positionId) {
      return { primaryDate, generalDate }
    }

    const year = electionDate.getUTCFullYear()
    const yearStart = new Date(Date.UTC(year, 0, 1))
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1))

    const siblings = await this.client.race.findMany({
      where: {
        positionId,
        id: { not: excludeRaceId },
        electionDate: { gte: yearStart, lt: yearEnd },
      },
      select: { electionDate: true, isPrimary: true, isRunoff: true },
    })

    for (const sibling of siblings) {
      if (sibling.isPrimary && !primaryDate) {
        primaryDate = sibling.electionDate
      } else if (!sibling.isPrimary && !sibling.isRunoff && !generalDate) {
        generalDate = sibling.electionDate
      }
    }

    return { primaryDate, generalDate }
  }

  private resolveProjectedTurnout(
    district:
      | {
          ProjectedTurnouts: Array<{
            electionYear: number
            electionCode: string
            projectedTurnout: number
          }>
        }
      | null
      | undefined,
    electionDate: Date,
    state: string,
  ): number | null {
    if (!district?.ProjectedTurnouts?.length) {
      return null
    }
    const isoDate = electionDate.toISOString().slice(0, 10)
    const electionYear = electionDate.getUTCFullYear()
    const electionCode = this.projectedTurnoutService.determineElectionCode(
      isoDate,
      state,
    )
    const match = district.ProjectedTurnouts.find(
      (t) => t.electionYear === electionYear && t.electionCode === electionCode,
    )
    return match?.projectedTurnout ?? null
  }

  private computeWinNumberEstimate(
    projectedTurnout: number | null,
    numberOfSeats: number | null,
  ): number | null {
    if (projectedTurnout === null) return null
    const seats = numberOfSeats && numberOfSeats > 0 ? numberOfSeats : 1
    return Math.ceil((projectedTurnout * 0.51) / seats)
  }

  private isSameEmail(a: string | null, b: string | null): boolean {
    if (!a || !b) return false
    return a.trim().toLowerCase() === b.trim().toLowerCase()
  }

  private composeCandidateOffice(
    positionNames: string[] | null | undefined,
    normalizedPositionName: string | null | undefined,
  ): string | null {
    if (positionNames && positionNames.length > 0) {
      return positionNames[0]
    }
    return normalizedPositionName ?? null
  }

  private toIsoDate(date: Date | null): string | null {
    if (!date) return null
    return date.toISOString().slice(0, 10)
  }
}
