import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { ProjectedTurnoutService } from 'src/projectedTurnout/projectedTurnout.service'

@Injectable()
export class PositionsService extends createPrismaBase(MODELS.Position) {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {
    super()
  }

  async getPositionByBallotReadyId(params: {
    brPositionId: string
    includeDistrict?: boolean
    includeTurnout?: boolean
    electionDate?: string
  }) {
    const { brPositionId, includeDistrict, electionDate, includeTurnout } =
      params
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
    if (!includeDistrict) {
      const position = await this.model.findUnique({
        where: { brPositionId },
      })
      if (!position) {
        throw new NotFoundException(
          `Position not found for brPositionId=${brPositionId}`,
        )
      }
      return position
    }
    if (!includeTurnout) {
      // If the caller doesn't want projectedTurnout, no further processing is needed
      const position = await this.model.findUnique({
        where: { brPositionId },
        include: { district: true },
      })
      if (!position) {
        throw new NotFoundException(
          `Position not found for brPositionId=${brPositionId}`,
        )
      }
      return position
    }

    const position = await this.model.findUnique({
      where: { brPositionId },
      include: {
        district: {
          include: {
            ProjectedTurnouts: true,
          },
        },
      },
    })
    if (!position) {
      throw new NotFoundException(
        `Position not found for brPositionId=${brPositionId}`,
      )
    }
    if (!electionDate) {
      throw new InternalServerErrorException(
        'It should be impossible to get to this line without electionDate defined',
      )
    }
    // If district wasn't found (no precomputed match), just return the position
    if (!position?.district) return position

    const { id, brDatabaseId, district, districtId, state } = position
    const { L2DistrictName, L2DistrictType } = district
    const electionCode = this.projectedTurnoutService.determineElectionCode(
      electionDate,
      state,
    )

    const electionYear = new Date(electionDate).getFullYear()
    const filteredTurnout = position.district.ProjectedTurnouts.filter(
      (turnout) =>
        turnout.electionYear === electionYear &&
        turnout.electionCode === electionCode,
    )

    if (filteredTurnout.length > 1) {
      throw new InternalServerErrorException(
        'Error: Data integrity issue - duplicate turnouts found for a given electionYear and electionCode',
      )
    }
    return {
      positionId: id,
      brPositionId,
      brDatabaseId,
      district: {
        id: districtId,
        L2DistrictType,
        L2DistrictName,
        projectedTurnout:
          filteredTurnout.length > 0 ? filteredTurnout[0] : null,
      },
    }
  }
}
