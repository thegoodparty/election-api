import { Controller, Get, Param, Query } from '@nestjs/common'
import { PositionsService } from './positions.service'
import {
  GetPositionByBrIdParamsDTO,
  GetPositionByBrIdQueryDTO,
} from './positions.schema'
import { PositionWithOptionalDistrict } from './positions.types'

@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get('by-ballotready-id/:brPositionId')
  async getPositionByBallotReadyId(
    @Param() params: GetPositionByBrIdParamsDTO,
    @Query() query: GetPositionByBrIdQueryDTO,
  ): Promise<PositionWithOptionalDistrict> {
    return this.positions.getPositionByBallotReadyId({
      brPositionId: params.brPositionId,
      includeDistrict: query?.includeDistrict,
      electionDate: query?.electionDate,
      includeTurnout: query?.includeTurnout,
    })
  }
}
