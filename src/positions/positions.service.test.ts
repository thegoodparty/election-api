import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { ElectionCode } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectedTurnoutService } from 'src/projectedTurnout/projectedTurnout.service'
import { PositionsService } from './positions.service'

describe('PositionsService', () => {
  let service: PositionsService
  let findUnique: ReturnType<typeof vi.fn>
  let projectedTurnoutService: Pick<
    ProjectedTurnoutService,
    'determineElectionCode'
  >

  beforeEach(() => {
    findUnique = vi.fn()
    projectedTurnoutService = {
      determineElectionCode: vi.fn(),
    }
    service = new PositionsService(
      projectedTurnoutService as ProjectedTurnoutService,
    )
    Object.defineProperty(service, '_prisma', {
      value: {
        position: {
          findUnique,
        },
      },
    })
  })

  it('throws when includeTurnout is true but electionDate is missing', async () => {
    await expect(
      service.getPositionById({
        id: 'pos-1',
        includeDistrict: true,
        includeTurnout: true,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'If includeTurnout is true, you must pass an electionDate',
      ),
    )
  })

  it('throws when includeTurnout is true but includeDistrict is false', async () => {
    await expect(
      service.getPositionById({
        id: 'pos-1',
        includeDistrict: false,
        includeTurnout: true,
        electionDate: '2024-11-05',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'A district must be included in the response to return a turnout',
      ),
    )
  })

  it('returns position fields without district when includeDistrict is false', async () => {
    findUnique.mockResolvedValue({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
    })

    const result = await service.getPositionById({ id: 'pos-1' })

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'pos-1' },
      select: {
        id: true,
        brPositionId: true,
        brDatabaseId: true,
        state: true,
        name: true,
      },
    })
    expect(result).toEqual({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
    })
  })

  it('returns district with null projectedTurnout when includeDistrict is true and includeTurnout is false', async () => {
    findUnique.mockResolvedValue({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
      district: {
        id: 'district-1',
        L2DistrictType: 'City',
        L2DistrictName: 'Los Angeles',
      },
    })

    const result = await service.getPositionByBallotReadyId({
      brPositionId: 'br-pos-1',
      includeDistrict: true,
    })

    expect(findUnique).toHaveBeenCalledWith({
      where: { brPositionId: 'br-pos-1' },
      include: { district: true },
    })
    expect(result.district).toEqual({
      id: 'district-1',
      L2DistrictType: 'City',
      L2DistrictName: 'Los Angeles',
      projectedTurnout: null,
    })
  })

  it('returns position without district when includeDistrict is true but district is null', async () => {
    findUnique.mockResolvedValue({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
      district: null,
    })

    const result = await service.getPositionById({
      id: 'pos-1',
      includeDistrict: true,
      includeTurnout: false,
    })

    expect(result).toEqual({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
    })
  })

  it('returns filtered projected turnout when includeTurnout is true', async () => {
    vi.mocked(projectedTurnoutService.determineElectionCode).mockReturnValue(
      ElectionCode.General,
    )
    findUnique.mockResolvedValue({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
      district: {
        id: 'district-1',
        L2DistrictType: 'City',
        L2DistrictName: 'Los Angeles',
        ProjectedTurnouts: [
          {
            id: 'pt-1',
            electionYear: 2024,
            electionCode: ElectionCode.General,
          },
          {
            id: 'pt-2',
            electionYear: 2023,
            electionCode: ElectionCode.LocalOrMunicipal,
          },
        ],
      },
    })

    const result = await service.getPositionById({
      id: 'pos-1',
      includeDistrict: true,
      includeTurnout: true,
      electionDate: '2024-11-05',
    })

    expect(projectedTurnoutService.determineElectionCode).toHaveBeenCalledWith(
      '2024-11-05',
      'CA',
    )
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'pos-1' },
      include: {
        district: {
          include: {
            ProjectedTurnouts: true,
          },
        },
      },
    })
    expect(result.district?.projectedTurnout).toMatchObject({
      id: 'pt-1',
      electionYear: 2024,
      electionCode: ElectionCode.General,
    })
  })

  it('returns null projected turnout when no turnout matches election year and code', async () => {
    vi.mocked(projectedTurnoutService.determineElectionCode).mockReturnValue(
      ElectionCode.General,
    )
    findUnique.mockResolvedValue({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
      district: {
        id: 'district-1',
        L2DistrictType: 'City',
        L2DistrictName: 'Los Angeles',
        ProjectedTurnouts: [
          {
            id: 'pt-1',
            electionYear: 2023,
            electionCode: ElectionCode.LocalOrMunicipal,
          },
        ],
      },
    })

    const result = await service.getPositionById({
      id: 'pos-1',
      includeDistrict: true,
      includeTurnout: true,
      electionDate: '2024-11-05',
    })

    expect(result.district?.projectedTurnout).toBeNull()
  })

  it('throws when duplicate projected turnouts match election year and code', async () => {
    vi.mocked(projectedTurnoutService.determineElectionCode).mockReturnValue(
      ElectionCode.General,
    )
    findUnique.mockResolvedValue({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
      district: {
        id: 'district-1',
        L2DistrictType: 'City',
        L2DistrictName: 'Los Angeles',
        ProjectedTurnouts: [
          {
            id: 'pt-1',
            electionYear: 2024,
            electionCode: ElectionCode.General,
          },
          {
            id: 'pt-2',
            electionYear: 2024,
            electionCode: ElectionCode.General,
          },
        ],
      },
    })

    await expect(
      service.getPositionById({
        id: 'pos-1',
        includeDistrict: true,
        includeTurnout: true,
        electionDate: '2024-11-05',
      }),
    ).rejects.toThrow(
      new InternalServerErrorException(
        'Error: Data integrity issue - duplicate turnouts found for a given electionYear and electionCode',
      ),
    )
  })

  it('throws not found when includeDistrict is true and includeTurnout is false', async () => {
    findUnique.mockResolvedValue(null)

    await expect(
      service.getPositionById({
        id: 'missing-id',
        includeDistrict: true,
        includeTurnout: false,
      }),
    ).rejects.toThrow(
      new NotFoundException('Position not found for id=missing-id'),
    )
  })

  it('throws not found when includeTurnout is true and position does not exist', async () => {
    findUnique.mockResolvedValue(null)

    await expect(
      service.getPositionById({
        id: 'missing-id',
        includeDistrict: true,
        includeTurnout: true,
        electionDate: '2024-11-05',
      }),
    ).rejects.toThrow(
      new NotFoundException('Position not found for id=missing-id'),
    )
  })

  it('throws internal server error when includeTurnout path is reached without electionDate', async () => {
    vi.spyOn(service as any, 'validateOptions').mockImplementation(
      () => undefined,
    )
    findUnique.mockResolvedValue({
      id: 'pos-1',
      brPositionId: 'br-pos-1',
      brDatabaseId: 'db-1',
      state: 'CA',
      name: 'Mayor',
      district: {
        id: 'district-1',
        L2DistrictType: 'City',
        L2DistrictName: 'Los Angeles',
        ProjectedTurnouts: [],
      },
    })

    const findPositionWithOptions = (
      service as unknown as {
        findPositionWithOptions: (params: {
          where: { id: string }
          notFoundMessage: string
          includeDistrict: boolean
          includeTurnout: boolean
        }) => Promise<unknown>
      }
    ).findPositionWithOptions.bind(service)

    await expect(
      findPositionWithOptions({
        where: { id: 'pos-1' },
        notFoundMessage: 'unused',
        includeDistrict: true,
        includeTurnout: true,
      }),
    ).rejects.toThrow(
      new InternalServerErrorException(
        'It should be impossible to get to this line without electionDate defined',
      ),
    )
  })

  it('throws not found when position does not exist', async () => {
    findUnique.mockResolvedValue(null)

    await expect(
      service.getPositionByBallotReadyId({ brPositionId: 'missing-id' }),
    ).rejects.toThrow(
      new NotFoundException('Position not found for brPositionId=missing-id'),
    )
  })
})
