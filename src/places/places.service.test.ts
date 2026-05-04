import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlacesService } from './places.service'

describe('PlacesService', () => {
  let service: PlacesService
  let findUnique: ReturnType<typeof vi.fn>

  beforeEach(() => {
    findUnique = vi.fn()
    service = new PlacesService()
    Object.defineProperty(service, '_prisma', {
      value: {
        position: {
          findUnique,
        },
      },
    })
  })

  it('returns place when position has an associated place', async () => {
    const place = {
      id: 'place-1',
      name: 'Cornelius',
      slug: 'or/washington/cornelius',
      state: 'OR',
    }
    findUnique.mockResolvedValue({ place })

    const positionId = 'a0000000-0000-0000-0000-000000000001'
    const result = await service.getPlaceByPositionId(positionId)

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: positionId },
      select: { place: true },
    })
    expect(result).toEqual(place)
  })

  it('throws not found when position does not exist', async () => {
    findUnique.mockResolvedValue(null)

    await expect(
      service.getPlaceByPositionId('00000000-0000-0000-0000-000000000099'),
    ).rejects.toThrow(
      new NotFoundException(
        'Position not found for id=00000000-0000-0000-0000-000000000099',
      ),
    )
  })

  it('throws not found when position has no associated place', async () => {
    findUnique.mockResolvedValue({ place: null })

    await expect(
      service.getPlaceByPositionId('00000000-0000-0000-0000-000000000001'),
    ).rejects.toThrow(
      new NotFoundException(
        'No place associated with position id=00000000-0000-0000-0000-000000000001',
      ),
    )
  })
})
