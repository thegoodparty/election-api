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
    findMany.mockResolvedValue([{ issueLabel: 'Education', score: 88 }])

    const result = await service.getVoterIssues({
      districtId: 'd-1',
      limit: 5,
    })

    expect(findMany).toHaveBeenCalledWith({
      where: { districtId: 'd-1' },
      orderBy: { issueRank: 'asc' },
      take: 5,
      select: { issueLabel: true, score: true },
    })
    expect(result).toEqual([
      { label: 'Education', score: 88, priority: 'high' },
    ])
  })

  it('assigns priority by position-in-result, not by precomputed issueRank', async () => {
    // Mock with non-contiguous "ranks" implied by ordering; the service no
    // longer reads issueRank from the row. Position 1-3 -> high, 4-6 ->
    // medium, 7+ -> low. This matters for filtered queries where the
    // overall ranks of returned rows are typically much higher than 3.
    findMany.mockResolvedValue([
      { issueLabel: 'A', score: 90 },
      { issueLabel: 'B', score: 85 },
      { issueLabel: 'C', score: 80 },
      { issueLabel: 'D', score: 75 },
      { issueLabel: 'E', score: 70 },
      { issueLabel: 'F', score: 65 },
      { issueLabel: 'G', score: 60 },
    ])

    const result = await service.getVoterIssues({
      districtId: 'd-1',
      limit: 10,
    })

    expect(result).toEqual([
      { label: 'A', score: 90, priority: 'high' },
      { label: 'B', score: 85, priority: 'high' },
      { label: 'C', score: 80, priority: 'high' },
      { label: 'D', score: 75, priority: 'medium' },
      { label: 'E', score: 70, priority: 'medium' },
      { label: 'F', score: 65, priority: 'medium' },
      { label: 'G', score: 60, priority: 'low' },
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
      { issueLabel: 'First', score: 95 },
      { issueLabel: 'Second', score: 70 },
      { issueLabel: 'Third', score: 40 },
    ])

    const result = await service.getVoterIssues({
      districtId: 'd-1',
      limit: 10,
    })

    expect(result.map((r) => r.label)).toEqual(['First', 'Second', 'Third'])
  })

  it.each([
    ['local', 'isLocal'] as const,
    ['regional', 'isRegional'] as const,
    ['state', 'isState'] as const,
    ['federal', 'isFederal'] as const,
  ])(
    'adds the %s jurisdictional flag to the where clause when level=%s',
    async (level, flagColumn) => {
      findMany.mockResolvedValue([])

      await service.getVoterIssues({
        districtId: 'd-1',
        limit: 10,
        level,
      })

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { districtId: 'd-1', [flagColumn]: true },
        }),
      )
    },
  )

  it('applies no jurisdictional filter when level is undefined', async () => {
    findMany.mockResolvedValue([])

    await service.getVoterIssues({ districtId: 'd-1', limit: 10 })

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { districtId: 'd-1' },
      }),
    )
  })
})
