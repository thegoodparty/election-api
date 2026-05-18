import { Module } from '@nestjs/common'
import { ProjectedTurnoutModule } from 'src/projectedTurnout/projectedTurnout.module'
import { CampaignPlanContextController } from './campaign-plan-context.controller'
import { CampaignPlanContextService } from './campaign-plan-context.service'

@Module({
  imports: [ProjectedTurnoutModule],
  controllers: [CampaignPlanContextController],
  providers: [CampaignPlanContextService],
})
export class CampaignPlanContextModule {}
