import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { District, Position, Prisma, ProjectedTurnout } from '@prisma/client'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { ProjectedTurnoutService } from 'src/projectedTurnout/projectedTurnout.service'
import { PositionWithOptionalDistrict } from './positions.types'
import { extractFilingFee, FilingFeeResult } from './util/filingFee.util'
import { pickRelevantRace } from './util/pickRelevantRace.util'

type PositionLookupOptions = {
  includeDistrict?: boolean
  includeTurnout?: boolean
  includeFilingFee?: boolean
  electionDate?: string
}

type FindPositionWithOptionsParams = PositionLookupOptions & {
  where: Prisma.PositionWhereUniqueInput
  notFoundMessage: string
}

type PositionWithOptionalDistrictAndTurnouts = {
  id: Position['id']
  brPositionId: Position['brPositionId']
  brDatabaseId: Position['brDatabaseId']
  state: Position['state']
  name: Position['name']
  level: Position['level']
  placeId?: Position['placeId'] | null
  district?: {
    id: District['id']
    L2DistrictType: District['L2DistrictType']
    L2DistrictName: District['L2DistrictName']
    ProjectedTurnouts?: ProjectedTurnout[]
  } | null
}

@Injectable()
export class PositionsService extends createPrismaBase(MODELS.Position) {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {
    super()
  }

  async getPositionById(params: {
    id: string
    includeDistrict?: boolean
    includeTurnout?: boolean
    includeFilingFee?: boolean
    electionDate?: string
  }): Promise<PositionWithOptionalDistrict> {
    const { id } = params
    return this.findPositionWithOptions({
      ...params,
      where: { id },
      notFoundMessage: `Position not found for id=${id}`,
    })
  }

  async getPositionByBallotReadyId(params: {
    brPositionId: string
    includeDistrict?: boolean
    includeTurnout?: boolean
    includeFilingFee?: boolean
    electionDate?: string
  }): Promise<PositionWithOptionalDistrict> {
    const { brPositionId } = params
    return this.findPositionWithOptions({
      ...params,
      where: { brPositionId },
      notFoundMessage: `Position not found for brPositionId=${brPositionId}`,
    })
  }

  private validateOptions({
    includeDistrict,
    includeTurnout,
    electionDate,
  }: PositionLookupOptions): void {
    if (includeTurnout && !electionDate) {
      throw new BadRequestException(
        'If includeTurnout is true, you must pass an electionDate',
      )
    }
    if (includeTurnout && !includeDistrict) {
      throw new BadRequestException(
        'A district must be included in the response to return a turnout',
      )
    }
  }

  private async findPositionWithOptions(
    params: FindPositionWithOptionsParams,
  ): Promise<PositionWithOptionalDistrict> {
    const {
      where,
      notFoundMessage,
      includeDistrict,
      includeTurnout,
      includeFilingFee,
      electionDate,
    } = params
    this.validateOptions({ includeDistrict, includeTurnout, electionDate })

    const baseSelect: Prisma.PositionSelect = {
      id: true,
      brPositionId: true,
      brDatabaseId: true,
      state: true,
      name: true,
      level: true,
      ...(includeFilingFee ? { placeId: true } : {}),
    }

    if (!includeDistrict) {
      const position: PositionWithOptionalDistrictAndTurnouts | null =
        await this.model.findUnique({ where, select: baseSelect })
      if (!position) {
        throw new NotFoundException(notFoundMessage)
      }
      const filingFee = includeFilingFee
        ? await this.lookupFilingFee(position, electionDate)
        : undefined
      return this.shapePositionResponse(position, undefined, filingFee)
    }

    if (!includeTurnout) {
      const position: PositionWithOptionalDistrictAndTurnouts | null =
        await this.model.findUnique({
          where,
          include: { district: true },
        })
      if (!position) {
        throw new NotFoundException(notFoundMessage)
      }
      const filingFee = includeFilingFee
        ? await this.lookupFilingFee(position, electionDate)
        : undefined
      return this.shapePositionResponse(position, undefined, filingFee)
    }

    const position: PositionWithOptionalDistrictAndTurnouts | null =
      await this.model.findUnique({
        where,
        include: {
          district: {
            include: {
              ProjectedTurnouts: true,
            },
          },
        },
      })
    if (!position) {
      throw new NotFoundException(notFoundMessage)
    }
    if (!electionDate) {
      throw new InternalServerErrorException(
        'It should be impossible to get to this line without electionDate defined',
      )
    }
    const filingFee = includeFilingFee
      ? await this.lookupFilingFee(position, electionDate)
      : undefined
    return this.shapePositionResponse(position, electionDate, filingFee)
  }

  private shapePositionResponse(
    position: PositionWithOptionalDistrictAndTurnouts,
    electionDate?: string,
    filingFee?: FilingFeeResult,
  ): PositionWithOptionalDistrict {
    const { id, brPositionId, brDatabaseId, state, level, name, district } =
      position
    const filingFeeFields: Pick<
      PositionWithOptionalDistrict,
      'filingFee' | 'filingRequirementsText' | 'filingFeeExtractionSource'
    > = filingFee
      ? {
          filingFee: filingFee.filingFee,
          filingRequirementsText: filingFee.filingRequirementsText,
          filingFeeExtractionSource: filingFee.extractionSource,
        }
      : {}

    if (!district) {
      return {
        id,
        brPositionId,
        brDatabaseId,
        state,
        name,
        level,
        ...filingFeeFields,
      }
    }

    const {
      id: districtId,
      L2DistrictType,
      L2DistrictName,
      ProjectedTurnouts,
    } = district
    const districtResponse = {
      id: districtId,
      L2DistrictType,
      L2DistrictName,
      projectedTurnout: null as ProjectedTurnout | null,
    }

    if (!electionDate || !ProjectedTurnouts) {
      return {
        id,
        brPositionId,
        brDatabaseId,
        state,
        name,
        district: districtResponse,
        level,
        ...filingFeeFields,
      }
    }

    const electionCode = this.projectedTurnoutService.determineElectionCode(
      electionDate,
      state,
    )
    const electionYear = new Date(electionDate).getFullYear()
    const filteredTurnout = ProjectedTurnouts.filter(
      (turnout) =>
        turnout.electionYear === electionYear &&
        turnout.electionCode === electionCode,
    )
    const [projectedTurnout] = filteredTurnout

    if (filteredTurnout.length > 1) {
      throw new InternalServerErrorException(
        'Error: Data integrity issue - duplicate turnouts found for a given electionYear and electionCode',
      )
    }
    return {
      id,
      brPositionId,
      brDatabaseId,
      state,
      name,
      level,
      district: {
        ...districtResponse,
        projectedTurnout: projectedTurnout ?? null,
      },
      ...filingFeeFields,
    }
  }

  /**
   * BallotReady stores filing fees on the Race row, not the Position. There's
   * no FK between Position and Race — the de-facto join is shared `placeId`
   * plus a position-name match against Race.positionNames. One Position can
   * have many Races (different election dates, primary vs. general), so we
   * pick the most relevant one: matching electionDate exact > nearest future
   * general > nearest future > latest historical. Returns an empty result if
   * no candidate race exists or its filingRequirements yields nothing.
   */
  private async lookupFilingFee(
    position: PositionWithOptionalDistrictAndTurnouts,
    electionDate?: string,
  ): Promise<FilingFeeResult> {
    const empty: FilingFeeResult = {
      filingFee: null,
      filingRequirementsText: null,
      extractionSource: null,
    }
    if (!position.placeId || !position.name) {
      this.logger.debug({
        event: 'FilingFeeLookup',
        outcome: 'skipped',
        reason: !position.placeId ? 'no_place_id' : 'no_name',
        positionId: position.id,
        positionName: position.name,
      })
      return empty
    }

    const races = await this.client.race.findMany({
      where: {
        placeId: position.placeId,
        positionNames: { has: position.name },
      },
      select: {
        electionDate: true,
        isPrimary: true,
        isRunoff: true,
        filingRequirements: true,
        salary: true,
      },
    })

    if (races.length === 0) {
      // Diagnose: peek at what positionNames exist for this place so we can
      // see whether the join is failing because the name string differs from
      // what's stored on Race rows.
      const sampleNames = await this.client.race.findMany({
        where: { placeId: position.placeId },
        select: { positionNames: true },
        take: 5,
      })
      this.logger.debug({
        event: 'FilingFeeLookup',
        outcome: 'no_race_match',
        positionId: position.id,
        positionName: position.name,
        placeId: position.placeId,
        sampleRacePositionNames: sampleNames.flatMap((r) => r.positionNames),
      })
      return empty
    }

    const chosen = pickRelevantRace(races, electionDate)
    if (!chosen) return empty

    const fee = extractFilingFee(chosen.filingRequirements, chosen.salary)

    this.logger.debug({
      event: 'FilingFeeLookup',
      outcome: 'matched',
      positionId: position.id,
      positionName: position.name,
      placeId: position.placeId,
      racesMatched: races.length,
      chosenElectionDate: chosen.electionDate,
      chosenIsPrimary: chosen.isPrimary,
      chosenIsRunoff: chosen.isRunoff,
      hasFilingRequirements: Boolean(chosen.filingRequirements),
      hasSalary: Boolean(chosen.salary),
      filingFee: fee.filingFee,
      extractionSource: fee.extractionSource,
    })

    return fee
  }
}
