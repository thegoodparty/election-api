import { Controller, Get, NotImplementedException } from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {}

  @Get()
  async getProjectedTurnout() {
    throw new NotImplementedException('This endpoint is not supported')
  }
}
