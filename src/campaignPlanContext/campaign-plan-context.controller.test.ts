import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CampaignPlanContextController } from './campaign-plan-context.controller'
import { CampaignPlanContextService } from './campaign-plan-context.service'
import {
  CampaignPlanContextRequestDto,
  CampaignPlanContextResponse,
} from './campaign-plan-context.schema'

describe('CampaignPlanContextController', () => {
  let controller: CampaignPlanContextController
  let getCampaignPlanContext: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getCampaignPlanContext = vi.fn()
    controller = new CampaignPlanContextController({
      getCampaignPlanContext,
    } as unknown as CampaignPlanContextService)
  })

  it('forwards the body to the service and returns its result', async () => {
    const body: CampaignPlanContextRequestDto = {
      brDatabaseId: 2027085,
      user: {
        id: 1,
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        fullName: 'A B',
        phoneNumber: null,
        partyAffiliation: 'Nonpartisan',
        isIncumbent: null,
        createdAt: null,
      },
    }
    const expected: Partial<CampaignPlanContextResponse> = {
      candidate_count: 0,
      candidates: [],
      state: 'AL',
    }
    getCampaignPlanContext.mockResolvedValue(expected)

    const result = await controller.getCampaignPlanContext(body)

    expect(getCampaignPlanContext).toHaveBeenCalledWith(body)
    expect(result).toBe(expected)
  })
})
