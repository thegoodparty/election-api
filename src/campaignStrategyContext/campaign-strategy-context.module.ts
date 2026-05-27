import { Module } from '@nestjs/common'
import { ProjectedTurnoutModule } from 'src/projectedTurnout/projectedTurnout.module'
import { CampaignStrategyContextController } from './campaign-strategy-context.controller'
import { CampaignStrategyContextService } from './campaign-strategy-context.service'

@Module({
  imports: [ProjectedTurnoutModule],
  controllers: [CampaignStrategyContextController],
  providers: [CampaignStrategyContextService],
})
export class CampaignStrategyContextModule {}
