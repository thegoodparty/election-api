import { Controller, Get } from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(private readonly projectedTurnout: ProjectedTurnoutService) {}

  @Get()
  getProjectedTurnout() {}
}
