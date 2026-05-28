import { Injectable, NotFoundException } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { ProjectedTurnoutService } from 'src/projectedTurnout/projectedTurnout.service'
import {
  CampaignStrategyContextCandidate,
  CampaignStrategyContextRequestDto,
  CampaignStrategyContextResponse,
} from './campaign-strategy-context.schema'

// Voter contact targets are typically sized at ~5x the win number to
// account for response rate and persuasion attrition.
const CONTACTS_NEEDED_MULTIPLIER = 5

@Injectable()
export class CampaignStrategyContextService extends createPrismaBase(MODELS.Race) {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {
    super()
  }

  async getCampaignStrategyContext(
    dto: CampaignStrategyContextRequestDto,
  ): Promise<CampaignStrategyContextResponse> {
    const { brHashId } = dto

    // brHashId has no @unique constraint (the dbt mart enforces it 1:1
    // upstream). If a re-import or BR-side quirk ever lands two rows for
    // the same hash, prefer the general (both flags false) over primary
    // over runoff so race-level fields (electionDate, filing window, win
    // numbers) reflect the stage the campaign plan is anchored on. Matches
    // RacesService.findFilingFeeByBrHashId so both brHashId-based lookups
    // resolve to the same row. NULLS LAST guards against imported rows
    // with NULL flags beating a real general (false) in ASC order.
    //
    // ProjectedTurnouts uses orderBy: inferenceAt desc to keep
    // resolveProjectedTurnout's .find() picking the latest snapshot when
    // multiple model_version rows share a (electionYear, electionCode).
    const race = await this.model.findFirst({
      where: { brHashId },
      orderBy: [
        { isPrimary: { sort: 'asc', nulls: 'last' } },
        { isRunoff: { sort: 'asc', nulls: 'last' } },
      ],
      include: {
        Candidacies: {
          select: {
            gpCandidateId: true,
            firstName: true,
            lastName: true,
            email: true,
            websiteUrl: true,
            party: true,
            isIncumbent: true,
          },
        },
        Position: {
          include: {
            district: {
              include: {
                ProjectedTurnouts: {
                  orderBy: { inferenceAt: 'desc' },
                },
              },
            },
          },
        },
      },
    })

    if (!race) {
      throw new NotFoundException(`Race not found for brHashId=${brHashId}`)
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

    const projectedVoterTurnout = this.resolveGeneralProjectedTurnout(
      race.Position?.district ?? null,
      race.electionDate,
    )

    const winNumberEstimate = this.computeWinNumberEstimate(projectedTurnout)
    const winNumberEffective = race.winNumber ?? winNumberEstimate
    const contactsNeededEstimate =
      winNumberEffective !== null
        ? CONTACTS_NEEDED_MULTIPLIER * winNumberEffective
        : null

    const candidates: CampaignStrategyContextCandidate[] = race.Candidacies.map(
      (c) => ({
        gp_candidate_id: c.gpCandidateId,
        first_name: c.firstName,
        last_name: c.lastName,
        full_name: `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        website_url: c.websiteUrl,
        party: c.party,
        is_incumbent: c.isIncumbent,
      }),
    )

    const district = race.Position?.district ?? null

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
      projected_voter_turnout: projectedVoterTurnout,
      registered_voters: district?.registeredVoters ?? null,
      unique_cellphones: district?.uniqueCellphones ?? null,
      unique_landlines: district?.uniqueLandlines ?? null,
      relevant_election_date: this.toIsoDate(race.electionDate),
      state: race.state,
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
    let primaryDate: Date | null = isPrimary ? electionDate : null
    let generalDate: Date | null = !isPrimary && !isRunoff ? electionDate : null

    if (!positionId) {
      return { primaryDate, generalDate }
    }

    // Window the sibling lookup ±6 months around the race's own
    // electionDate rather than calendar year. A calendar-year window
    // misses cross-year cycles (e.g. Louisiana jungle primaries in
    // Oct/Nov feeding a Dec runoff or Jan-of-next-year general). A wider
    // multi-year window would risk pulling in an unrelated cycle's
    // primary for positions that hold elections in both odd and even
    // years (the loop assigns the earliest matching primary/general it
    // sees). ±6 months catches realistic stage pairs (typically <4
    // months apart) without crossing into adjacent cycles.
    const windowStart = this.addMonthsClamped(electionDate, -6)
    const windowEnd = this.addMonthsClamped(electionDate, 6)

    const siblings = await this.client.race.findMany({
      where: {
        positionId,
        id: { not: excludeRaceId },
        electionDate: { gte: windowStart, lt: windowEnd },
      },
      select: { electionDate: true, isPrimary: true, isRunoff: true },
      orderBy: { electionDate: 'asc' },
    })

    // Require explicit booleans on stage flags. A sibling with
    // isPrimary=null / isRunoff=null would otherwise match the general
    // branch via `!null === true` and silently claim generalDate. dbt
    // can land null flags on TS-found sentinel races, so this guard
    // matters in practice.
    for (const sibling of siblings) {
      if (sibling.isPrimary === true && !primaryDate) {
        primaryDate = sibling.electionDate
      } else if (
        sibling.isPrimary === false &&
        sibling.isRunoff === false &&
        !generalDate
      ) {
        generalDate = sibling.electionDate
      }
    }

    return { primaryDate, generalDate }
  }

  // Add `months` (negative or positive) to a date in UTC, clamping the
  // day to the last valid day of the target month. JS's native
  // setUTCMonth overflows (e.g. Aug 31 - 6 months → "Feb 31" → Mar 3),
  // which shifts month-end window boundaries by 2-3 days and silently
  // excludes siblings at the edge.
  private addMonthsClamped(date: Date, months: number): Date {
    const result = new Date(date)
    const targetMonth = result.getUTCMonth() + months
    const year = result.getUTCFullYear() + Math.floor(targetMonth / 12)
    const month = ((targetMonth % 12) + 12) % 12
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    result.setUTCFullYear(year, month, Math.min(result.getUTCDate(), lastDay))
    return result
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

  // projected_voter_turnout is anchored to the General-election turnout for
  // the race's calendar year, regardless of whether the looked-up race is a
  // primary, general, or runoff. The campaign-plan template uses this as the
  // single voter-turnout baseline that win-number and contact targets are
  // sized against. Caller-provided include must order ProjectedTurnouts by
  // inferenceAt desc so the latest model snapshot wins on .find().
  private resolveGeneralProjectedTurnout(
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
  ): number | null {
    if (!district?.ProjectedTurnouts?.length) {
      return null
    }
    const electionYear = electionDate.getUTCFullYear()
    const match = district.ProjectedTurnouts.find(
      (t) => t.electionYear === electionYear && t.electionCode === 'General',
    )
    return match?.projectedTurnout ?? null
  }

  private computeWinNumberEstimate(
    projectedTurnout: number | null,
  ): number | null {
    // Treat any non-positive turnout as "unknown". The Postgres column
    // is an unconstrained Int with no upstream sign validation, so
    // values <= 0 can flow through from a bad projection run. The
    // majority of 0 voters is 0, not 1; negative inputs produce 0 or
    // negative win-number estimates — all are misleading signal for
    // the LLM compared to null.
    if (projectedTurnout === null || projectedTurnout <= 0) return null
    // Simple majority threshold: floor(turnout / 2) + 1 is the minimum
    // vote count that guarantees winning a head-to-head majority. Do
    // not divide by numberOfSeats; consumers that need a per-seat or
    // Droop-quota multi-seat estimate compute their own.
    return Math.floor(projectedTurnout / 2) + 1
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
