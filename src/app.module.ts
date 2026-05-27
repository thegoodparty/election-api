import { Module } from '@nestjs/common'
import { RacesModule } from './races/races.module'
import { PlacesModule } from './places/places.module'
import { HealthModule } from './health/health.module'
import { CandidaciesModule } from './candidacies/candidacies.module'
import { CampaignStrategyContextModule } from './campaignStrategyContext/campaign-strategy-context.module'
import { ProjectedTurnoutModule } from './projectedTurnout/projectedTurnout.module'
import { DistrictsModule } from './districts/districts.module'
import { PositionsModule } from './positions/positions.module'
import { VoterIssuesModule } from './voterIssues/voterIssues.module'
import { ZipToPositionModule } from './zipToPosition/zipToPosition.module'
import { loggerModule } from './observability/logging/logger-module'

@Module({
  imports: [
    loggerModule,
    RacesModule,
    PlacesModule,
    HealthModule,
    CandidaciesModule,
    CampaignStrategyContextModule,
    ProjectedTurnoutModule,
    DistrictsModule,
    PositionsModule,
    VoterIssuesModule,
    ZipToPositionModule,
  ],
})
export class AppModule {}
