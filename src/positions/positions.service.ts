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

type PositionLookupOptions = {
  includeDistrict?: boolean
  includeTurnout?: boolean
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
      electionDate,
    } = params
    this.validateOptions({ includeDistrict, includeTurnout, electionDate })

    if (!includeDistrict) {
      const position: PositionWithOptionalDistrictAndTurnouts | null =
        await this.model.findUnique({
          where,
          select: {
            id: true,
            brPositionId: true,
            brDatabaseId: true,
            state: true,
            name: true,
          },
        })
      if (!position) {
        throw new NotFoundException(notFoundMessage)
      }
      return this.shapePositionResponse(position)
    }

    if (!includeTurnout) {
      // If the caller doesn't want projectedTurnout, no further processing is needed
      const position: PositionWithOptionalDistrictAndTurnouts | null =
        await this.model.findUnique({
          where,
          include: { district: true },
        })
      if (!position) {
        throw new NotFoundException(notFoundMessage)
      }
      return this.shapePositionResponse(position)
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
    return this.shapePositionResponse(position, electionDate)
  }

  private shapePositionResponse(
    position: PositionWithOptionalDistrictAndTurnouts,
    electionDate?: string,
  ): PositionWithOptionalDistrict {
    const { id, brPositionId, brDatabaseId, state, name, district } = position
    if (!district) {
      return { id, brPositionId, brDatabaseId, state, name }
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
      district: {
        ...districtResponse,
        projectedTurnout: projectedTurnout ?? null,
      },
    }
  }
}
