import {
  Controller,
  Get,
  NotImplementedException,
  Post,
  Query,
} from '@nestjs/common'
import { ProjectedTurnoutService } from './projectedTurnout.service'
import { ProjectedTurnoutPostDTO } from './projectedTurnout.schema'

@Controller('projectedTurnout')
export class ProjectedTurnoutController {
  constructor(
    private readonly projectedTurnoutService: ProjectedTurnoutService,
  ) {}

  @Get()
  async getProjectedTurnout() {
    throw new NotImplementedException('This endpoint is not supported')
  }

  @Post()
  alterProjectedTurnout(@Query() dto: ProjectedTurnoutPostDTO) {
    return this.projectedTurnoutService.alterProjectedTurnout(dto)
  }
}
