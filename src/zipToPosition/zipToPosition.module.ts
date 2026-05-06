import { Module } from '@nestjs/common'
import { ZipToPositionController } from './zipToPosition.controller'
import { ZipToPositionService } from './zipToPosition.service'

@Module({
  controllers: [ZipToPositionController],
  providers: [ZipToPositionService],
})
export class ZipToPositionModule {}
