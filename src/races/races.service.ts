import { Injectable, NotFoundException } from '@nestjs/common'
import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { RaceFilterDto } from './races.schema'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { getDedupedRacesBySlug } from './races.util'
import {
  extractFilingFee,
  FilingFeeResult,
} from 'src/positions/util/filingFee.util'

@Injectable()
export class RacesService extends createPrismaBase(MODELS.Race) {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findRaces(filterDto: RaceFilterDto) {
    const {
      includePlace,
      includeCandidacies,
      state,
      placeSlug,
      positionLevel,
      raceSlug,
      electionDateStart,
      electionDateEnd,
      isPrimary,
      isRunoff,
      raceColumns,
      placeColumns,
      candidacyColumns,
    } = filterDto

    const where: Prisma.RaceWhereInput = {
      ...(state ? { state } : {}),
      ...(placeSlug ? { Place: { slug: placeSlug } } : {}),
      ...(positionLevel ? { positionLevel } : {}),
      ...(raceSlug ? { slug: raceSlug } : {}),
      ...(isPrimary !== undefined ? { isPrimary } : {}),
      ...(isRunoff !== undefined ? { isRunoff } : {}),
      ...(electionDateStart || electionDateEnd
        ? {
            electionDate: {
              ...(electionDateStart
                ? { gte: new Date(electionDateStart) }
                : {}),
              ...(electionDateEnd ? { lte: new Date(electionDateEnd) } : {}),
            },
          }
        : {}),
    }

    const raceSelectBase: Prisma.RaceSelect | undefined = raceColumns
      ? (buildColumnSelect(raceColumns) as Prisma.RaceSelect)
      : undefined

    const placeInclude = this.buildPlaceInclude(placeColumns, includePlace)
    const candidacyInclude = this.buildCandidacyInclude(
      candidacyColumns,
      includeCandidacies,
    )

    const raceQueryObj = {
      ...(raceSelectBase ?? {}),
      ...(includePlace && { Place: placeInclude }),
      ...(includeCandidacies && { Candidacies: candidacyInclude }),
    }

    const races = raceSelectBase
      ? await this.model.findMany({
          where,
          select: raceQueryObj,
        })
      : await this.model.findMany({
          where,
          include: raceQueryObj,
        })

    if (!races || races.length === 0) {
      throw new NotFoundException(
        `No races found for query: ${JSON.stringify(where)}`,
      )
    }

    if (!races[0]?.positionNames || !races[0]?.slug) {
      return races
    }
    return getDedupedRacesBySlug(races)
  }

  /**
   * Resolve a filing fee for a Race by its BallotReady hash (`br_hash_id`).
   * Bypasses the Position-based `lookupFilingFee`, which depends on
   * `Position.placeId` not being populated in our data today.
   *
   * `brHashId` isn't unique in the schema, so order by isPrimary/isRunoff
   * (general → primary → runoff) and take one for a deterministic pick.
   *
   * Returns all-nulls for both "no match" and "matched but BR has no fee" —
   * gp-api treats them identically.
   */
  async findFilingFeeByBrHashId(brHashId: string): Promise<FilingFeeResult> {
    const races = await this.model.findMany({
      where: { brHashId },
      select: { filingRequirements: true, salary: true },
      // Postgres sorts NULLs before `false` in ASC order, so an imported
      // row with isPrimary=NULL would beat a real general (false). Force
      // NULLs last to keep the general → primary → runoff preference
      // robust against missing flags in upstream data.
      orderBy: [
        { isPrimary: { sort: 'asc', nulls: 'last' } },
        { isRunoff: { sort: 'asc', nulls: 'last' } },
      ],
      take: 1,
    })
    const race = races[0]
    if (!race) {
      return {
        filingFee: null,
        filingRequirementsText: null,
        extractionSource: null,
      }
    }
    return extractFilingFee(race.filingRequirements, race.salary)
  }

  private buildPlaceInclude(
    placeColumns: string | undefined | null,
    includePlace: boolean | undefined | null,
  ) {
    if (!placeColumns) return true
    if (!includePlace) return true

    return {
      select: buildColumnSelect(placeColumns) as Prisma.PlaceSelect,
    }
  }

  private buildCandidacyInclude(
    candidacyColumns: string | undefined | null,
    includeCandidacies: boolean | undefined | null,
  ) {
    if (!candidacyColumns) return true
    if (!includeCandidacies) return true

    return {
      select: buildColumnSelect(candidacyColumns) as Prisma.CandidacySelect,
    }
  }
}
