import { Module } from '@nestjs/common'
import { PlaceController } from './places.controller'
import { PlacesService } from './places.service'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [PlaceController],
  providers: [PlacesService],
  imports: [PrismaModule],
})
export class PlacesModule {}
