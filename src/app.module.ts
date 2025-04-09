import { Module } from '@nestjs/common'
import { RacesModule } from './races/races.module'
import { PlacesModule } from './places/places.module'

@Module({
  imports: [RacesModule, PlacesModule],
})
export class AppModule {}
