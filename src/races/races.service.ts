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
   * Resolve a filing fee directly from a Race row identified by its
   * BallotReady GraphQL Node ID (`br_hash_id`). Unlike the Position-based
   * `lookupFilingFee` in PositionsService, this path doesn't depend on
   * Position.placeId being populated — the campaign carries the BR race hash
   * on `details.raceId`, which uniquely identifies one Race row, so we can
   * read filing_requirements off it directly and run the existing extractor.
   *
   * Returns an empty result (filingFee: null, filingRequirementsText: null)
   * when no matching Race exists, distinct from "matched but couldn't
   * extract a clean fee" — that case carries the raw text through so the
   * UI can still show "click for full text from BallotReady".
   */
  async findFilingFeeByBrHashId(brHashId: string): Promise<FilingFeeResult> {
    const race = await this.model.findFirst({
      where: { brHashId },
      select: { filingRequirements: true, salary: true },
    })
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
