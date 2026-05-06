import { Controller, Get, Query } from '@nestjs/common'
import { VoterIssuesService } from './voterIssues.service'
import { GetVoterIssuesQueryDTO, VoterIssue } from './voterIssues.schema'

@Controller('voter-issues')
export class VoterIssuesController {
  constructor(private readonly voterIssues: VoterIssuesService) {}

  @Get()
  async getVoterIssues(
    @Query() query: GetVoterIssuesQueryDTO,
  ): Promise<VoterIssue[]> {
    return this.voterIssues.getVoterIssues({
      districtId: query.districtId,
      limit: query.limit,
    })
  }
}
