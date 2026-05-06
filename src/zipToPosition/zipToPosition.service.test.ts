import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ZipToPositionService } from './zipToPosition.service'

describe('ZipToPositionService', () => {
  let service: ZipToPositionService
  let findMany: ReturnType<typeof vi.fn>

  beforeEach(() => {
    findMany = vi.fn().mockResolvedValue([])
    service = new ZipToPositionService()
    Object.defineProperty(service, '_prisma', {
      value: {
        zipToPosition: {
          findMany,
        },
      },
    })
  })

  it('queries ZipToPosition by zip and date range, joining Position and Place', async () => {
    await service.findByZip({
      zip: '90210',
      electionDateFrom: '2026-01-01',
      electionDateTo: '2027-12-31',
    })

    expect(findMany).toHaveBeenCalledWith({
      where: {
        zipCode: '90210',
        electionDate: {
          gte: new Date('2026-01-01'),
          lte: new Date('2027-12-31'),
        },
      },
      include: { position: { include: { place: true } } },
      orderBy: [{ electionDate: 'asc' }, { name: 'asc' }],
    })
  })

  it('filters by displayOfficeLevels when provided', async () => {
    await service.findByZip({
      zip: '90210',
      displayOfficeLevels: ['City', 'Township'],
    })

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          zipCode: '90210',
          displayOfficeLevel: { in: ['City', 'Township'] },
        }),
      }),
    )
  })

  it('maps a ZipToPosition row + Place into a RaceListItem', async () => {
    findMany.mockResolvedValue([
      {
        id: 'ztp-1',
        name: 'Mayor',
        electionDate: new Date('2026-11-03'),
        displayOfficeLevel: 'City',
        state: 'CA',
        district: '',
        position: {
          brPositionId: 'br-pos-1',
          place: { name: 'Beverly Hills' },
        },
      },
    ])

    const result = await service.findByZip({ zip: '90210' })

    expect(result).toEqual([
      {
        id: 'ztp-1',
        brPositionId: 'br-pos-1',
        position: { name: 'Mayor', level: 'City', state: 'CA' },
        election: { electionDay: '2026-11-03' },
        city: 'Beverly Hills',
        district: null,
      },
    ])
  })
})
