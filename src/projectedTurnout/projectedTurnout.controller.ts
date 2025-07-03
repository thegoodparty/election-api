import { Controller, Get, NotFoundException, Query } from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'
import { ProjectedTurnoutQueryDTO } from './projectedTurnout.schema'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {}

  @Get()
  async getProjectedTurnout(@Query() dto: ProjectedTurnoutQueryDTO) {
    const record = await this.projectedTurnoutService.getProjectedTurnout(dto)
    if (!record) {
      throw new NotFoundException(`Projected turnout not found for ${dto}`)
    }
    return record
  }
}
