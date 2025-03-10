import { Module } from '@nestjs/common'
import { RacesModule } from './races/races.module';

@Module({
  imports: [RacesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
