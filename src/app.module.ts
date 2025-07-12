import { Module } from '@nestjs/common'
import { RacesModule } from './races/races.module'
import { PlacesModule } from './places/places.module'
import { HealthModule } from './health/health.module'
import { CandidaciesModule } from './candidacies/candidacies.module'
import { ProjectedTurnoutModule } from './projectedTurnout/projectedTurnout.module'
import { DistrictsModule } from './districts/districts.module'

@Module({
  imports: [
    RacesModule,
    PlacesModule,
    HealthModule,
    CandidaciesModule,
    ProjectedTurnoutModule,
    DistrictsModule,
  ],
})
export class AppModule {}
