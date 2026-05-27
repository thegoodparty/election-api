import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignStrategyContextController } from './campaign-strategy-context.controller'
import { CampaignStrategyContextService } from './campaign-strategy-context.service'
import {
  CampaignStrategyContextRequestDto,
  CampaignStrategyContextResponse,
} from './campaign-strategy-context.schema'

describe('CampaignStrategyContextController', () => {
  let controller: CampaignStrategyContextController
  let getCampaignStrategyContext: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getCampaignStrategyContext = vi.fn()
    controller = new CampaignStrategyContextController({
      getCampaignStrategyContext,
    } as unknown as CampaignStrategyContextService)
  })

  it('forwards the body to the service and returns its result', async () => {
    const body: CampaignStrategyContextRequestDto = { brHashId: 'br-race-hash-1' }
    const expected: Partial<CampaignStrategyContextResponse> = {
      candidate_count: 0,
      candidates: [],
      state: 'AL',
    }
    getCampaignStrategyContext.mockResolvedValue(expected)

    const result = await controller.getCampaignStrategyContext(body)

    expect(getCampaignStrategyContext).toHaveBeenCalledWith(body)
    expect(result).toBe(expected)
  })
})
