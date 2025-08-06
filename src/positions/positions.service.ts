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
    electionDate?: string
  }) {
    const { brPositionId, includeDistrict, electionDate } = params
    if (includeDistrict && !electionDate) {
      throw new BadRequestException(
        'If includeDistrict is true, you must pass an electionCode or an electionDate',
      )
    }
    if (!includeDistrict) {
      const position = await this.model.findUnique({ where: { brPositionId } })
      if (!position) {
        throw new NotFoundException('No position with that brPositionId was found')
      }
      return position
    }

    const positionWithDistrict = await this.model.findUnique({
      where: { brPositionId },
      include: {
        district: {
          include: {
            ProjectedTurnouts: true,
          },
        },
      },
    })
    if (!positionWithDistrict) {
      throw new NotFoundException('No position with that brPositionId was found')
    }
    if (!positionWithDistrict?.district?.ProjectedTurnouts) {
      throw new InternalServerErrorException(
        'Failed to fetch projected turnouts',
      )
    }
    if (!electionDate) {
      throw new InternalServerErrorException(
        'It should be impossible to get to this line without electionDate defined',
      )
    }
    const electionCode = this.projectedTurnoutService.determineElectionCode(
      electionDate,
      positionWithDistrict.state,
    )
    const electionYear = new Date(electionDate).getFullYear()
    const filteredTurnout =
      positionWithDistrict.district.ProjectedTurnouts.filter(
        (turnout) =>
          turnout.electionYear === electionYear &&
          turnout.electionCode === electionCode,
      )

    if (filteredTurnout.length > 1) {
      throw new InternalServerErrorException(
        'Error: Data integrity issue - duplicate turnouts found for a given electionYear and electionCode',
      )
    }
    if (filteredTurnout.length === 0) {
      throw new InternalServerErrorException(
        'Error: No projected turnouts matched the electionDate input',
      )
    }
    const { id, brDatabaseId, district, districtId } = positionWithDistrict
    const { L2DistrictName, L2DistrictType } = district
    return {
      positionId: id,
      brPositionId,
      brDatabaseId,
      district: {
        id: districtId,
        L2DistrictType,
        L2DistrictName,
        projectedTurnout: filteredTurnout[0],
      },
    }
  }
}
