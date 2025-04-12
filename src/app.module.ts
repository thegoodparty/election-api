import { Module } from '@nestjs/common'
import { RacesModule } from './races/races.module'
import { PlacesModule } from './places/places.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [RacesModule, PlacesModule, HealthModule],
})
export class AppModule {}
