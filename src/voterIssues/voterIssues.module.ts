import { Module } from '@nestjs/common'
import { VoterIssuesController } from './voterIssues.controller'
import { VoterIssuesService } from './voterIssues.service'

@Module({
  controllers: [VoterIssuesController],
  providers: [VoterIssuesService],
})
export class VoterIssuesModule {}
