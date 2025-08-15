import { Controller, Get, Param, Query } from '@nestjs/common'
import { PositionsService } from './positions.service'
import {
  GetPositionByBrIdParamsDTO,
  GetPositionByBrIdQueryDTO,
} from './positions.schema'

@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get('by-ballotready-id/:brPositionId')
  async getPositionByBallotReadyId(
    @Param() params: GetPositionByBrIdParamsDTO,
    @Query() query: GetPositionByBrIdQueryDTO,
  ) {
    console.log('positions controller')
    return this.positions.getPositionByBallotReadyId({
      brPositionId: params.brPositionId,
      includeDistrict: query?.includeDistrict,
      electionDate: query?.electionDate,
    })
  }
}
