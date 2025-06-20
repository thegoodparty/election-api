import { Module } from '@nestjs/common'
import { ProjectedTurnoutController } from './projectedTurnout.controller'
import { ProjectedTurnoutService } from './projectedTurnout.service'

@Module({
  controllers: [ProjectedTurnoutController],
  providers: [ProjectedTurnoutService],
})
export class ProjectedTurnoutModule {}
