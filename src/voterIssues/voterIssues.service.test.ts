import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VoterIssuesService } from './voterIssues.service'

describe('VoterIssuesService', () => {
  let service: VoterIssuesService
  let findMany: ReturnType<typeof vi.fn>
  let positionFindUnique: ReturnType<typeof vi.fn>

  beforeEach(() => {
    findMany = vi.fn()
    positionFindUnique = vi.fn()
    service = new VoterIssuesService()
    Object.defineProperty(service, '_prisma', {
      value: {
        districtTopIssue: { findMany },
        position: { findUnique: positionFindUnique },
      },
    })
  })

  describe('priorityForRank (via getVoterIssues mapping)', () => {
    it('buckets ranks 1-3 as high, 4-6 as medium, >=7 as low', async () => {
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

      expect(result.map((r) => r.priority)).toEqual([
        'high',
        'high',
        'medium',
        'medium',
        'low',
      ])
    })
  })

  describe('getVoterIssues with districtId', () => {
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
      expect(positionFindUnique).not.toHaveBeenCalled()
    })
  })

  describe('getVoterIssues with ballotReadyPositionId', () => {
    it('resolves district via position lookup', async () => {
      positionFindUnique.mockResolvedValue({ districtId: 'd-2' })
      findMany.mockResolvedValue([])

      await service.getVoterIssues({
        ballotReadyPositionId: 'br-pos-1',
        limit: 10,
      })

      expect(positionFindUnique).toHaveBeenCalledWith({
        where: { brPositionId: 'br-pos-1' },
        select: { districtId: true },
      })
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { districtId: 'd-2' } }),
      )
    })

    it('throws NotFoundException when position is missing', async () => {
      positionFindUnique.mockResolvedValue(null)

      await expect(
        service.getVoterIssues({
          ballotReadyPositionId: 'missing',
          limit: 10,
        }),
      ).rejects.toThrow(
        new NotFoundException(`Position not found for brPositionId=missing`),
      )
      expect(findMany).not.toHaveBeenCalled()
    })

    it('throws NotFoundException when position has null districtId', async () => {
      positionFindUnique.mockResolvedValue({ districtId: null })

      await expect(
        service.getVoterIssues({
          ballotReadyPositionId: 'br-pos-1',
          limit: 10,
        }),
      ).rejects.toThrow(
        new NotFoundException(
          `Position with brPositionId=br-pos-1 has no associated district`,
        ),
      )
      expect(findMany).not.toHaveBeenCalled()
    })
  })

  describe('getVoterIssues with no resolvable district', () => {
    it('returns [] when neither districtId nor ballotReadyPositionId is provided', async () => {
      const result = await service.getVoterIssues({ limit: 10 })

      expect(result).toEqual([])
      expect(findMany).not.toHaveBeenCalled()
      expect(positionFindUnique).not.toHaveBeenCalled()
    })
  })
})
