import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VoterIssuesController } from './voterIssues.controller'
import { VoterIssuesService } from './voterIssues.service'

describe('VoterIssuesController', () => {
  let controller: VoterIssuesController
  let getVoterIssues: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getVoterIssues = vi.fn()
    controller = new VoterIssuesController({
      getVoterIssues,
    } as unknown as VoterIssuesService)
  })

  it('forwards districtId and limit to the service and returns the result', async () => {
    const issues = [
      { label: 'Education', score: 88, priority: 'high' as const },
    ]
    getVoterIssues.mockResolvedValue(issues)

    const result = await controller.getVoterIssues({
      districtId: 'd-1',
      limit: 10,
    })

    expect(getVoterIssues).toHaveBeenCalledWith({
      districtId: 'd-1',
      limit: 10,
    })
    expect(result).toEqual(issues)
  })
})
