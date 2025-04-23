import { Controller, Get } from '@nestjs/common'
import { CandidaciesService } from './candidacies.service'

@Controller('candidacies')
export class CandidaciesController {
  constructor(private readonly candidaciesService: CandidaciesService) {}

  @Get()
  async getCandidates() {
    return await this.candidaciesService.getCandidacies()
  }
}
