import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CampaignPlanContextService } from './campaign-plan-context.service'
import {
  CampaignPlanContextRequestDto,
  CampaignPlanContextResponse,
} from './campaign-plan-context.schema'

@Controller('campaign-plan-context')
export class CampaignPlanContextController {
  constructor(
    private readonly campaignPlanContextService: CampaignPlanContextService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async getCampaignPlanContext(
    @Body() body: CampaignPlanContextRequestDto,
  ): Promise<CampaignPlanContextResponse> {
    return this.campaignPlanContextService.getCampaignPlanContext(body)
  }
}
