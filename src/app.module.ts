import { Module } from '@nestjs/common'
import { RacesModule } from './races/races.module'
import { PlacesModule } from './places/places.module'
import { HealthModule } from './health/health.module'
import { CandidaciesModule } from './candidacies/candidacies.module'

@Module({
  imports: [RacesModule, PlacesModule, HealthModule, CandidaciesModule],
})
export class AppModule {}
