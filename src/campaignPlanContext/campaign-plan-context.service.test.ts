import { NotFoundException } from '@nestjs/common'
import { ElectionCode } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectedTurnoutService } from 'src/projectedTurnout/projectedTurnout.service'
import { CampaignPlanContextService } from './campaign-plan-context.service'
import { CampaignPlanContextRequestDto } from './campaign-plan-context.schema'

type RaceRow = {
  id: string
  brDatabaseId: number
  electionDate: Date
  state: string
  isPrimary: boolean | null
  isRunoff: boolean | null
  positionId: string | null
  positionNames: string[] | null
  normalizedPositionName: string | null
  numberOfSeats: number | null
  winNumber: number | null
  officeLevel: string | null
  officeType: string | null
  officialOfficeName: string | null
  Candidacies: Array<{
    gpCandidateId: string | null
    firstName: string
    lastName: string
    email: string | null
    party: string | null
  }>
  Position: {
    id: string
    district: {
      id: string
      ProjectedTurnouts: Array<{
        electionYear: number
        electionCode: string
        projectedTurnout: number
      }>
    } | null
  } | null
}

const baseRequest = (
  overrides: Partial<CampaignPlanContextRequestDto> = {},
): CampaignPlanContextRequestDto => ({
  brDatabaseId: 1000001,
  ...overrides,
})

const baseRace = (overrides: Partial<RaceRow> = {}): RaceRow => ({
  id: 'race-uuid-1',
  brDatabaseId: 1000001,
  electionDate: new Date('2026-08-25T00:00:00Z'),
  state: 'AL',
  isPrimary: false,
  isRunoff: false,
  positionId: 'pos-uuid-1',
  positionNames: ['Example City Council - District 1'],
  normalizedPositionName: 'City Legislature',
  numberOfSeats: 1,
  winNumber: null,
  officeLevel: null,
  officeType: 'Other',
  officialOfficeName: 'City Legislature',
  Candidacies: [
    {
      gpCandidateId: 'gp-cand-uuid-1',
      firstName: 'Alice',
      lastName: 'Example',
      email: 'alice@example.com',
      party: 'Nonpartisan',
    },
  ],
  Position: {
    id: 'pos-uuid-1',
    district: {
      id: 'dist-uuid-1',
      ProjectedTurnouts: [
        {
          electionYear: 2026,
          electionCode: ElectionCode.LocalOrMunicipal,
          projectedTurnout: 2272,
        },
      ],
    },
  },
  ...overrides,
})

describe('CampaignPlanContextService', () => {
  let service: CampaignPlanContextService
  let raceFindFirst: ReturnType<typeof vi.fn>
  let raceFindMany: ReturnType<typeof vi.fn>
  let projectedTurnoutService: Pick<
    ProjectedTurnoutService,
    'determineElectionCode'
  >

  beforeEach(() => {
    raceFindFirst = vi.fn()
    raceFindMany = vi.fn().mockResolvedValue([])
    projectedTurnoutService = {
      determineElectionCode: vi
        .fn()
        .mockReturnValue(ElectionCode.LocalOrMunicipal),
    }
    service = new CampaignPlanContextService(
      projectedTurnoutService as ProjectedTurnoutService,
    )
    Object.defineProperty(service, '_prisma', {
      value: {
        race: {
          findFirst: raceFindFirst,
          findMany: raceFindMany,
        },
      },
    })
  })

  it('throws NotFoundException when no race matches brDatabaseId', async () => {
    raceFindFirst.mockResolvedValue(null)

    await expect(
      service.getCampaignPlanContext(baseRequest()),
    ).rejects.toThrow(
      new NotFoundException('Race not found for brDatabaseId=1000001'),
    )
  })

  it('returns the example-output shape end-to-end for a single-candidate non-partisan race', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result).toEqual({
      candidate_count: 1,
      candidate_office: 'Example City Council - District 1',
      candidates: [
        {
          gp_candidate_id: 'gp-cand-uuid-1',
          first_name: 'Alice',
          last_name: 'Example',
          full_name: 'Alice Example',
          email: 'alice@example.com',
          party: 'Nonpartisan',
        },
      ],
      civics_win_number: null,
      contacts_needed_estimate: 5795,
      general_election_date: '2026-08-25',
      number_of_seats: 1,
      office_level: null,
      office_type: 'Other',
      official_office_name: 'City Legislature',
      primary_election_date: null,
      projected_turnout: 2272,
      relevant_election_date: '2026-08-25',
      state: 'AL',
      win_number_effective: 1159,
      win_number_estimate: 1159,
    })
  })

  it('returns every candidate in the race regardless of party', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        Candidacies: [
          {
            gpCandidateId: 'gp-1',
            firstName: 'Alice',
            lastName: 'Other',
            email: 'alice@example.com',
            party: 'Nonpartisan',
          },
          {
            gpCandidateId: 'gp-2',
            firstName: 'Bob',
            lastName: 'Other',
            email: 'bob@example.com',
            party: 'Nonpartisan',
          },
        ],
      }),
    )

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.candidate_count).toBe(2)
    expect(result.candidates.map((c) => c.first_name).sort()).toEqual([
      'Alice',
      'Bob',
    ])
  })

  it('prefers civics_win_number over the derived estimate for win_number_effective', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ winNumber: 800 }))

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.civics_win_number).toBe(800)
    expect(result.win_number_estimate).toBe(1159) // ceil(2272 * 0.51 / 1)
    expect(result.win_number_effective).toBe(800)
    expect(result.contacts_needed_estimate).toBe(4000) // 5 * 800
  })

  it('returns null derived metrics when projected_turnout is unavailable', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({ Position: { id: 'pos-uuid-1', district: null } }),
    )

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.projected_turnout).toBeNull()
    expect(result.win_number_estimate).toBeNull()
    expect(result.win_number_effective).toBeNull()
    expect(result.contacts_needed_estimate).toBeNull()
  })

  it('still computes win_number_effective from civics_win_number when projected_turnout is null', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        winNumber: 500,
        Position: { id: 'pos-uuid-1', district: null },
      }),
    )

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.projected_turnout).toBeNull()
    expect(result.win_number_estimate).toBeNull()
    expect(result.win_number_effective).toBe(500)
    expect(result.contacts_needed_estimate).toBe(2500)
  })

  it('divides by number_of_seats when computing win_number_estimate', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ numberOfSeats: 3 }))

    const result = await service.getCampaignPlanContext(baseRequest())

    // ceil(2272 * 0.51 / 3) = ceil(386.24) = 387
    expect(result.win_number_estimate).toBe(387)
  })

  it('treats null number_of_seats as 1 when computing win_number_estimate', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ numberOfSeats: null }))

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.win_number_estimate).toBe(1159)
  })

  it('falls back to LocalOrMunicipal when no ProjectedTurnout row matches the election year/code', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            ProjectedTurnouts: [
              {
                electionYear: 2024,
                electionCode: ElectionCode.LocalOrMunicipal,
                projectedTurnout: 9999,
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.projected_turnout).toBeNull()
  })

  it('picks the first matching ProjectedTurnout row (relies on Prisma ordering by inferenceAt desc)', async () => {
    // The service eager-loads ProjectedTurnouts with `orderBy: inferenceAt
    // desc` so the .find() in resolveProjectedTurnout returns the most
    // recent snapshot when multiple model_versions share the same
    // (electionYear, electionCode). This test feeds a pre-ordered array
    // (mimicking what Prisma returns) and asserts the first match wins.
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            ProjectedTurnouts: [
              {
                electionYear: 2026,
                electionCode: ElectionCode.LocalOrMunicipal,
                projectedTurnout: 3000, // newer model run
              },
              {
                electionYear: 2026,
                electionCode: ElectionCode.LocalOrMunicipal,
                projectedTurnout: 2500, // older model run
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.projected_turnout).toBe(3000)
  })

  it('passes orderBy inferenceAt desc through to the Prisma include for ProjectedTurnouts', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    await service.getCampaignPlanContext(baseRequest())

    expect(raceFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          Position: expect.objectContaining({
            include: expect.objectContaining({
              district: expect.objectContaining({
                include: expect.objectContaining({
                  ProjectedTurnouts: { orderBy: { inferenceAt: 'desc' } },
                }),
              }),
            }),
          }),
        }),
      }),
    )
  })

  it('pins a deterministic race via orderBy electionDate asc on the brDatabaseId lookup', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    await service.getCampaignPlanContext(baseRequest())

    expect(raceFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { brDatabaseId: 1000001 },
        orderBy: { electionDate: 'asc' },
      }),
    )
  })

  it('passes orderBy electionDate asc through to the sibling-race findMany', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    await service.getCampaignPlanContext(baseRequest())

    expect(raceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { electionDate: 'asc' },
      }),
    )
  })

  it('fills primary_election_date from a sibling primary race within the same calendar year', async () => {
    raceFindFirst.mockResolvedValue(baseRace())
    raceFindMany.mockResolvedValue([
      {
        electionDate: new Date('2026-06-02T00:00:00Z'),
        isPrimary: true,
        isRunoff: false,
      },
    ])

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.primary_election_date).toBe('2026-06-02')
    expect(result.general_election_date).toBe('2026-08-25')
    expect(raceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          positionId: 'pos-uuid-1',
          id: { not: 'race-uuid-1' },
        }),
      }),
    )
  })

  it('when the looked-up race is the primary, fills general_election_date from a sibling', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        electionDate: new Date('2026-06-02T00:00:00Z'),
        isPrimary: true,
      }),
    )
    raceFindMany.mockResolvedValue([
      {
        electionDate: new Date('2026-08-25T00:00:00Z'),
        isPrimary: false,
        isRunoff: false,
      },
    ])

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.primary_election_date).toBe('2026-06-02')
    expect(result.general_election_date).toBe('2026-08-25')
    expect(result.relevant_election_date).toBe('2026-06-02')
  })

  it('when the looked-up race is a runoff, general_election_date reflects the sibling general not the runoff date', async () => {
    // A runoff is its own distinct stage, not a substitute for the general.
    // relevant_election_date carries the runoff date so the consumer knows
    // which election the user is looking at; general_election_date reports
    // the actual general from a sibling race (or null when no sibling exists).
    raceFindFirst.mockResolvedValue(
      baseRace({
        electionDate: new Date('2026-09-15T00:00:00Z'),
        isPrimary: false,
        isRunoff: true,
      }),
    )
    raceFindMany.mockResolvedValue([
      {
        electionDate: new Date('2026-08-25T00:00:00Z'),
        isPrimary: false,
        isRunoff: false,
      },
    ])

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.relevant_election_date).toBe('2026-09-15')
    expect(result.general_election_date).toBe('2026-08-25')
    expect(result.primary_election_date).toBeNull()
  })

  it('when the looked-up race is a runoff with no sibling general, general_election_date is null', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        electionDate: new Date('2026-09-15T00:00:00Z'),
        isPrimary: false,
        isRunoff: true,
      }),
    )
    raceFindMany.mockResolvedValue([])

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.relevant_election_date).toBe('2026-09-15')
    expect(result.general_election_date).toBeNull()
    expect(result.primary_election_date).toBeNull()
  })

  it('falls back to normalizedPositionName for candidate_office when positionNames is empty', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        positionNames: [],
        normalizedPositionName: 'City Legislature',
      }),
    )

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(result.candidate_office).toBe('City Legislature')
  })

  it('skips sibling-date lookup when the race has no positionId', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ positionId: null }))

    const result = await service.getCampaignPlanContext(baseRequest())

    expect(raceFindMany).not.toHaveBeenCalled()
    expect(result.primary_election_date).toBeNull()
    expect(result.general_election_date).toBe('2026-08-25')
  })
})
