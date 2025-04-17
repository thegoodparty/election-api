import { Module } from '@nestjs/common'
import { RacesService } from './races.service.js'
import { RacesController } from './races.controller'
import { PrismaModule } from 'src/prisma/prisma.module.js'

@Module({
  controllers: [RacesController],
  providers: [RacesService],
  imports: [PrismaModule],
})
export class RacesModule {}
