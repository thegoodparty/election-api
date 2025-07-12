import { Module } from '@nestjs/common'
import { DistrictsController } from './districts.controller'
import { DistrictsService } from './districts.service'

@Module({
  controllers: [DistrictsController],
  providers: [DistrictsService],
})
export class DistrictsModule {}
