import { Controller, Get, Query } from '@nestjs/common'
import { CandidaciesService } from './candidacies.service'
import { CandidacyFilterDto } from './candidacies.schema'

@Controller('candidacies')
export class CandidaciesController {
  constructor(private readonly candidaciesService: CandidaciesService) {}

  @Get()
  async getCandidates(@Query() filterDto: CandidacyFilterDto) {
    return await this.candidaciesService.getCandidacies(filterDto)
  }
}
