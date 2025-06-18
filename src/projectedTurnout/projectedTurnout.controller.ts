import { Controller, Get, NotFoundException, Post, Query } from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'
import { ProjectedTurnoutPostDTO } from './projectedTurnout.schema'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {}

  @Get()
  async getProjectedTurnout(
    @Query('brPositionId') brPositionDatabaseId: string,
  ) {
    console.log('Received request for: ', brPositionDatabaseId)
    const record =
      await this.projectedTurnoutService.getProjectedTurnout(
        brPositionDatabaseId,
      )
    if (!record) {
      throw new NotFoundException(
        `Projected turnout not found for brPositionId ${brPositionDatabaseId}`,
      )
    }
    return record
  }

  @Post()
  alterProjectedTurnout(@Query() dto: ProjectedTurnoutPostDTO) {
    return this.projectedTurnoutService.alterProjectedTurnout(dto)
  }
}
