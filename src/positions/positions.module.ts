import { Module } from '@nestjs/common'
import { PositionsService } from './positions.service'
import { PositionsController } from './positions.controller'
import { ProjectedTurnoutModule } from 'src/projectedTurnout/projectedTurnout.module'

@Module({
  controllers: [PositionsController],
  providers: [PositionsService],
  imports: [ProjectedTurnoutModule],
})
export class PositionsModule {}
