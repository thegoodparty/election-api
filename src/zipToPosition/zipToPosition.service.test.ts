import { Test, TestingModule } from '@nestjs/testing'
import { LoggerModule } from 'nestjs-pino'
import { randomUUID } from 'node:crypto'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'
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

describe('ZipToPositionService (integration)', () => {
  let moduleRef: TestingModule
  let service: ZipToPositionService
  let prisma: PrismaService

  const placeBeverlyHillsId = randomUUID()
  const positionBeverlyHillsId = randomUUID()
  const positionAtlantaId = randomUUID()
  const ztpBeverlyHillsId = randomUUID()
  const ztpAtlantaId = randomUUID()

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        PrismaModule,
      ],
      providers: [ZipToPositionService],
    }).compile()
    await moduleRef.init()

    service = moduleRef.get(ZipToPositionService)
    prisma = moduleRef.get(PrismaService)
  })

  afterAll(async () => {
    await moduleRef.close()
  })

  beforeEach(async () => {
    await prisma.zipToPosition.deleteMany({
      where: { id: { in: [ztpBeverlyHillsId, ztpAtlantaId] } },
    })
    await prisma.position.deleteMany({
      where: { id: { in: [positionBeverlyHillsId, positionAtlantaId] } },
    })
    await prisma.place.deleteMany({ where: { id: placeBeverlyHillsId } })

    await prisma.place.create({
      data: {
        id: placeBeverlyHillsId,
        brDatabaseId: 9001,
        name: 'Beverly Hills',
        slug: `ca/beverly-hills-${placeBeverlyHillsId}`,
        geoId: `geo-${placeBeverlyHillsId}`,
        state: 'CA',
      },
    })

    await prisma.position.createMany({
      data: [
        {
          id: positionBeverlyHillsId,
          brDatabaseId: 'pos-db-bh',
          brPositionId: `br-pos-bh-${positionBeverlyHillsId}`,
          state: 'CA',
          name: 'Mayor',
          placeId: placeBeverlyHillsId,
        },
        {
          id: positionAtlantaId,
          brDatabaseId: 'pos-db-atl',
          brPositionId: `br-pos-atl-${positionAtlantaId}`,
          state: 'GA',
          name: 'City Council',
        },
      ],
    })

    await prisma.zipToPosition.createMany({
      data: [
        {
          id: ztpBeverlyHillsId,
          positionId: positionBeverlyHillsId,
          name: 'Mayor',
          brDatabaseId: 1001,
          zipCode: '90210',
          electionYear: 2026,
          electionDate: new Date('2026-11-03'),
          displayOfficeLevel: 'City',
          officeType: 'Mayor',
          state: 'CA',
          district: '',
        },
        {
          id: ztpAtlantaId,
          positionId: positionAtlantaId,
          name: 'City Council',
          brDatabaseId: 1002,
          zipCode: '30303',
          electionYear: 2026,
          electionDate: new Date('2026-11-03'),
          displayOfficeLevel: 'City',
          officeType: 'City Council',
          state: 'GA',
          district: '',
        },
      ],
    })
  })

  afterEach(async () => {
    await prisma.zipToPosition.deleteMany({
      where: { id: { in: [ztpBeverlyHillsId, ztpAtlantaId] } },
    })
    await prisma.position.deleteMany({
      where: { id: { in: [positionBeverlyHillsId, positionAtlantaId] } },
    })
    await prisma.place.deleteMany({ where: { id: placeBeverlyHillsId } })
  })

  it('returns only the row for the requested zip, joined to its Place', async () => {
    const result = await service.findByZip({ zip: '90210' })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(ztpBeverlyHillsId)
    expect(result[0].city).toBe('Beverly Hills')
    expect(result.find((r) => r.id === ztpAtlantaId)).toBeUndefined()
  })
})
