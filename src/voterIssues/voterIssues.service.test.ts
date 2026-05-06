import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VoterIssuesService } from './voterIssues.service'

describe('VoterIssuesService', () => {
  let service: VoterIssuesService
  let findMany: ReturnType<typeof vi.fn>

  beforeEach(() => {
    findMany = vi.fn()
    service = new VoterIssuesService()
    Object.defineProperty(service, '_prisma', {
      value: {
        districtTopIssue: { findMany },
      },
    })
  })

  it('queries DistrictTopIssue with the given districtId, ordered by issueRank, capped by limit', async () => {
    findMany.mockResolvedValue([
      { issueLabel: 'Education', score: 88, issueRank: 1 },
    ])

    const result = await service.getVoterIssues({
      districtId: 'd-1',
      limit: 5,
    })

    expect(findMany).toHaveBeenCalledWith({
      where: { districtId: 'd-1' },
      orderBy: { issueRank: 'asc' },
      take: 5,
      select: { issueLabel: true, score: true, issueRank: true },
    })
    expect(result).toEqual([
      { label: 'Education', score: 88, priority: 'high' },
    ])
  })

  it('maps issueLabel to label and assigns priority by rank boundary', async () => {
    findMany.mockResolvedValue([
      { issueLabel: 'A', score: 90, issueRank: 1 },
      { issueLabel: 'B', score: 80, issueRank: 3 },
      { issueLabel: 'C', score: 70, issueRank: 4 },
      { issueLabel: 'D', score: 60, issueRank: 6 },
      { issueLabel: 'E', score: 50, issueRank: 7 },
    ])

    const result = await service.getVoterIssues({
      districtId: 'd-1',
      limit: 10,
    })

    expect(result).toEqual([
      { label: 'A', score: 90, priority: 'high' },
      { label: 'B', score: 80, priority: 'high' },
      { label: 'C', score: 70, priority: 'medium' },
      { label: 'D', score: 60, priority: 'medium' },
      { label: 'E', score: 50, priority: 'low' },
    ])
  })

  it('returns an empty array when no rows are found', async () => {
    findMany.mockResolvedValue([])

    const result = await service.getVoterIssues({
      districtId: 'd-empty',
      limit: 10,
    })

    expect(result).toEqual([])
  })

  it('forwards a custom limit to take', async () => {
    findMany.mockResolvedValue([])

    await service.getVoterIssues({ districtId: 'd-1', limit: 25 })

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 25 }))
  })

  it('preserves DB order (issueRank asc) in the output', async () => {
    findMany.mockResolvedValue([
      { issueLabel: 'First', score: 95, issueRank: 1 },
      { issueLabel: 'Second', score: 70, issueRank: 2 },
      { issueLabel: 'Third', score: 40, issueRank: 5 },
    ])

    const result = await service.getVoterIssues({
      districtId: 'd-1',
      limit: 10,
    })

    expect(result.map((r) => r.label)).toEqual(['First', 'Second', 'Third'])
  })
})
