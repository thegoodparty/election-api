import { Controller, Get, NotFoundException, Post, Query } from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'
import { ProjectedTurnoutPostDTO } from './projectedTurnout.schema'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {}

  @Get()
  async getProjectedTurnout(@Query('brPositionId') brPositionId: string) {
    console.log('Received request for: ', brPositionId)
    const record =
      await this.projectedTurnoutService.getProjectedTurnout(brPositionId)
    if (!record) {
      throw new NotFoundException(
        `Projected turnout not found for brPositionId ${brPositionId}`,
      )
    }
    return record
  }

  @Post()
  alterProjectedTurnout(@Query() dto: ProjectedTurnoutPostDTO) {
    return this.projectedTurnoutService.alterProjectedTurnout(dto)
  }
}
