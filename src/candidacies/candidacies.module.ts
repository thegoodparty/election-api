import { Module } from '@nestjs/common'
import { CandidaciesController } from './candidacies.controller'
import { CandidaciesService } from './candidacies.service'

@Module({
  controllers: [CandidaciesController],
  providers: [CandidaciesService],
})
export class CandidaciesModule {}
