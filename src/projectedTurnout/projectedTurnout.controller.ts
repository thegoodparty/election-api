import { Controller, Get, Param } from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {}

  @Get(':id')
  getProjectedTurnout(@Param('id') id: string) {
    return this.projectedTurnoutService.getProjectedTurnout(id)
  }
}
