import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CampaignStrategyContextService } from './campaign-strategy-context.service'
import {
  CampaignStrategyContextRequestDto,
  CampaignStrategyContextResponse,
} from './campaign-strategy-context.schema'

@Controller('campaign-strategy-context')
export class CampaignStrategyContextController {
  constructor(
    private readonly campaignStrategyContextService: CampaignStrategyContextService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async getCampaignStrategyContext(
    @Body() body: CampaignStrategyContextRequestDto,
  ): Promise<CampaignStrategyContextResponse> {
    return this.campaignStrategyContextService.getCampaignStrategyContext(body)
  }
}
