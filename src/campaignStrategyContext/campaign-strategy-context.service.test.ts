import { NotFoundException } from '@nestjs/common'
import { ElectionCode } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectedTurnoutService } from 'src/projectedTurnout/projectedTurnout.service'
import { CampaignStrategyContextService } from './campaign-strategy-context.service'
import { CampaignStrategyContextRequestDto } from './campaign-strategy-context.schema'

// Hand-rolled subset of the fields the service reads, rather than a full
// Prisma.RaceGetPayload<{include: ...}> — the latter would force every
// fixture to include all Race scalars (createdAt, slug, positionGeoid,
// etc.) that the service doesn't touch.
type RaceRow = {
  id: string
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
  partisanType: string | null
  officialOfficeName: string | null
  Candidacies: Array<{
    gpCandidateId: string | null
    firstName: string
    lastName: string
    email: string | null
    websiteUrl: string | null
    party: string | null
    isIncumbent: boolean | null
  }>
  Position: {
    id: string
    district: {
      id: string
      registeredVoters: number | null
      uniqueCellphones: number | null
      uniqueLandlines: number | null
      ProjectedTurnouts: Array<{
        electionYear: number
        electionCode: string
        projectedTurnout: number
      }>
    } | null
  } | null
}

const baseRequest = (
  overrides: Partial<CampaignStrategyContextRequestDto> = {},
): CampaignStrategyContextRequestDto => ({
  brHashId: 'br-race-hash-1',
  ...overrides,
})

const baseRace = (overrides: Partial<RaceRow> = {}): RaceRow => ({
  id: 'race-uuid-1',
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
  partisanType: 'nonpartisan',
  officialOfficeName: 'City Legislature',
  Candidacies: [
    {
      gpCandidateId: 'gp-cand-uuid-1',
      firstName: 'Alice',
      lastName: 'Example',
      email: 'alice@example.com',
      websiteUrl: 'https://alice.example.com',
      party: 'Nonpartisan',
      isIncumbent: false,
    },
  ],
  Position: {
    id: 'pos-uuid-1',
    district: {
      id: 'dist-uuid-1',
      registeredVoters: 18000,
      uniqueCellphones: 12500,
      uniqueLandlines: 5500,
      ProjectedTurnouts: [
        {
          electionYear: 2026,
          electionCode: ElectionCode.LocalOrMunicipal,
          projectedTurnout: 2272,
        },
        {
          electionYear: 2026,
          electionCode: ElectionCode.General,
          projectedTurnout: 8400,
        },
      ],
    },
  },
  ...overrides,
})

describe('CampaignStrategyContextService', () => {
  let service: CampaignStrategyContextService
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
    service = new CampaignStrategyContextService(
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

  it('throws NotFoundException when no race matches brHashId', async () => {
    raceFindFirst.mockResolvedValue(null)

    await expect(
      service.getCampaignStrategyContext(baseRequest()),
    ).rejects.toThrow(
      new NotFoundException('Race not found for brHashId=br-race-hash-1'),
    )
  })

  it('returns the example-output shape end-to-end for a single-candidate non-partisan race', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    const result = await service.getCampaignStrategyContext(baseRequest())

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
          website_url: 'https://alice.example.com',
          party: 'Nonpartisan',
          is_incumbent: false,
        },
      ],
      civics_win_number: null,
      contacts_needed_estimate: 5685,
      general_election_date: '2026-08-25',
      number_of_seats: 1,
      office_level: null,
      office_type: 'Other',
      partisan_type: 'nonpartisan',
      official_office_name: 'City Legislature',
      primary_election_date: null,
      projected_turnout: 2272,
      projected_voter_turnout: 8400,
      registered_voters: 18000,
      unique_cellphones: 12500,
      unique_landlines: 5500,
      relevant_election_date: '2026-08-25',
      state: 'AL',
      win_number_effective: 1137,
      win_number_estimate: 1137,
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
            websiteUrl: null,
            party: 'Nonpartisan',
            isIncumbent: true,
          },
          {
            gpCandidateId: 'gp-2',
            firstName: 'Bob',
            lastName: 'Other',
            email: 'bob@example.com',
            websiteUrl: null,
            party: 'Nonpartisan',
            isIncumbent: false,
          },
        ],
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.candidate_count).toBe(2)
    expect(result.candidates.map((c) => c.first_name).sort()).toEqual([
      'Alice',
      'Bob',
    ])
    expect(
      result.candidates.find((c) => c.first_name === 'Alice')?.is_incumbent,
    ).toBe(true)
    expect(
      result.candidates.find((c) => c.first_name === 'Bob')?.is_incumbent,
    ).toBe(false)
  })

  it('prefers civics_win_number over the derived estimate for win_number_effective', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ winNumber: 800 }))

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.civics_win_number).toBe(800)
    expect(result.win_number_estimate).toBe(1137) // floor(2272 / 2) + 1
    expect(result.win_number_effective).toBe(800)
    expect(result.contacts_needed_estimate).toBe(4000) // 5 * 800
  })

  it('returns null derived metrics when projected_turnout is unavailable', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({ Position: { id: 'pos-uuid-1', district: null } }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_turnout).toBeNull()
    expect(result.win_number_estimate).toBeNull()
    expect(result.win_number_effective).toBeNull()
    expect(result.contacts_needed_estimate).toBeNull()
  })

  it('returns null voter-stats fields when the race has no position attached', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ Position: null }))

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.registered_voters).toBeNull()
    expect(result.unique_cellphones).toBeNull()
    expect(result.unique_landlines).toBeNull()
    expect(result.projected_voter_turnout).toBeNull()
  })

  it('returns null voter-stats fields when the position has no district attached', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({ Position: { id: 'pos-uuid-1', district: null } }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.registered_voters).toBeNull()
    expect(result.unique_cellphones).toBeNull()
    expect(result.unique_landlines).toBeNull()
    expect(result.projected_voter_turnout).toBeNull()
  })

  it('returns null voter-stats fields when the district has null aggregate columns', async () => {
    // Districts that exist in the mart but have no L2 aggregation row
    // (e.g. turnout-only synthetic districts) land in Postgres with the
    // three count columns NULL. ProjectedTurnouts can still be populated
    // for those rows and should flow through normally.
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [
              {
                electionYear: 2026,
                electionCode: ElectionCode.LocalOrMunicipal,
                projectedTurnout: 2272,
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.registered_voters).toBeNull()
    expect(result.unique_cellphones).toBeNull()
    expect(result.unique_landlines).toBeNull()
    // projected_turnout still comes through from ProjectedTurnouts
    expect(result.projected_turnout).toBe(2272)
  })

  it('passes individual null voter-stats columns through as null', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: 18000,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [],
          },
        },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.registered_voters).toBe(18000)
    expect(result.unique_cellphones).toBeNull()
    expect(result.unique_landlines).toBeNull()
  })

  it('projected_voter_turnout is anchored to the General row for the race year regardless of race stage', async () => {
    // Primary race in March; projected_turnout uses LocalOrMunicipal (via
    // determineElectionCode), but projected_voter_turnout always picks
    // the General row.
    raceFindFirst.mockResolvedValue(
      baseRace({
        electionDate: new Date('2026-03-04T00:00:00Z'),
        isPrimary: true,
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [
              {
                electionYear: 2026,
                electionCode: ElectionCode.LocalOrMunicipal,
                projectedTurnout: 1500,
              },
              {
                electionYear: 2026,
                electionCode: ElectionCode.General,
                projectedTurnout: 8400,
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_voter_turnout).toBe(8400)
  })

  it('anchors projected_voter_turnout on the sibling General year for cross-year primary/general cycles', async () => {
    // Louisiana-style Nov 2025 jungle primary feeding a Jan 2026 general.
    // The Projected_Turnout row for the general lives at electionYear=2026,
    // not 2025. The sibling-general date (filled by lookupSiblingStageDates)
    // carries the correct year, so the resolver anchors on it instead of
    // the looked-up race's own electionDate year.
    raceFindFirst.mockResolvedValue(
      baseRace({
        electionDate: new Date('2025-11-08T00:00:00Z'),
        isPrimary: true,
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [
              {
                electionYear: 2026,
                electionCode: ElectionCode.General,
                projectedTurnout: 9000,
              },
            ],
          },
        },
      }),
    )
    raceFindMany.mockResolvedValue([
      {
        electionDate: new Date('2026-01-15T00:00:00Z'),
        isPrimary: false,
        isRunoff: false,
      },
    ])

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_voter_turnout).toBe(9000)
    expect(result.primary_election_date).toBe('2025-11-08')
    expect(result.general_election_date).toBe('2026-01-15')
  })

  it('returns null projected_voter_turnout when no General row exists for the race year', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [
              {
                electionYear: 2026,
                electionCode: ElectionCode.LocalOrMunicipal,
                projectedTurnout: 1500,
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_voter_turnout).toBeNull()
  })

  it('returns null projected_voter_turnout when the only General row is from a different year', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        electionDate: new Date('2026-08-25T00:00:00Z'),
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [
              {
                electionYear: 2024,
                electionCode: ElectionCode.General,
                projectedTurnout: 9999,
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_voter_turnout).toBeNull()
  })

  it('falls back to a ConsolidatedGeneral row when no General row exists for the year', async () => {
    // LA / MS / NJ / VA odd-year generals and Kansas's quadrennial general
    // are stored under ConsolidatedGeneral upstream. Without the fallback,
    // projected_voter_turnout would silently be null for every race in
    // those states.
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [
              {
                electionYear: 2026,
                electionCode: ElectionCode.ConsolidatedGeneral,
                projectedTurnout: 7500,
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_voter_turnout).toBe(7500)
  })

  it('prefers General over ConsolidatedGeneral when both exist for the same year', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
            ProjectedTurnouts: [
              {
                electionYear: 2026,
                electionCode: ElectionCode.ConsolidatedGeneral,
                projectedTurnout: 7500,
              },
              {
                electionYear: 2026,
                electionCode: ElectionCode.General,
                projectedTurnout: 8400,
              },
            ],
          },
        },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_voter_turnout).toBe(8400)
  })

  it('still computes win_number_effective from civics_win_number when projected_turnout is null', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        winNumber: 500,
        Position: { id: 'pos-uuid-1', district: null },
      }),
    )

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_turnout).toBeNull()
    expect(result.win_number_estimate).toBeNull()
    expect(result.win_number_effective).toBe(500)
    expect(result.contacts_needed_estimate).toBe(2500)
  })

  it('ignores number_of_seats when computing win_number_estimate', async () => {
    // Multi-seat at-large races use the same simple-majority threshold
    // as single-seat; consumers that need a per-seat or Droop-quota
    // multi-seat estimate compute their own. floor(2272 / 2) + 1 = 1137
    // regardless of seats.
    raceFindFirst.mockResolvedValue(baseRace({ numberOfSeats: 3 }))

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.win_number_estimate).toBe(1137)
  })

  it('does not depend on number_of_seats being non-null', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ numberOfSeats: null }))

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.win_number_estimate).toBe(1137)
  })

  it.each([
    { label: 'zero', projectedTurnout: 0 },
    { label: 'negative', projectedTurnout: -1 },
  ])(
    'returns null win_number_estimate when projected_turnout is $label',
    async ({ projectedTurnout }) => {
      // Postgres ProjectedTurnout.projectedTurnout is an unconstrained
      // Int with no upstream sign validation. A stored 0 would otherwise
      // produce win_number_estimate = 1 ("1 vote needed to win 0
      // voters"); negatives produce 0 or negative estimates. All are
      // misleading signal vs. null.
      raceFindFirst.mockResolvedValue(
        baseRace({
          Position: {
            id: 'pos-uuid-1',
            district: {
              id: 'dist-uuid-1',
              registeredVoters: null,
              uniqueCellphones: null,
              uniqueLandlines: null,
              ProjectedTurnouts: [
                {
                  electionYear: 2026,
                  electionCode: ElectionCode.LocalOrMunicipal,
                  projectedTurnout,
                },
              ],
            },
          },
        }),
      )

      const result = await service.getCampaignStrategyContext(baseRequest())

      expect(result.projected_turnout).toBe(projectedTurnout)
      expect(result.win_number_estimate).toBeNull()
      expect(result.win_number_effective).toBeNull()
      expect(result.contacts_needed_estimate).toBeNull()
    },
  )

  it('falls back to LocalOrMunicipal when no ProjectedTurnout row matches the election year/code', async () => {
    raceFindFirst.mockResolvedValue(
      baseRace({
        Position: {
          id: 'pos-uuid-1',
          district: {
            id: 'dist-uuid-1',
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
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

    const result = await service.getCampaignStrategyContext(baseRequest())

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
            registeredVoters: null,
            uniqueCellphones: null,
            uniqueLandlines: null,
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

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.projected_turnout).toBe(3000)
  })

  it('passes orderBy inferenceAt desc through to the Prisma include for ProjectedTurnouts', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    await service.getCampaignStrategyContext(baseRequest())

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

  it('pins a deterministic race via stage-preference ordering on the brHashId lookup', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    await service.getCampaignStrategyContext(baseRequest())

    expect(raceFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { brHashId: 'br-race-hash-1' },
        orderBy: [
          { isPrimary: { sort: 'asc', nulls: 'last' } },
          { isRunoff: { sort: 'asc', nulls: 'last' } },
        ],
      }),
    )
  })

  it('passes orderBy electionDate asc through to the sibling-race findMany', async () => {
    raceFindFirst.mockResolvedValue(baseRace())

    await service.getCampaignStrategyContext(baseRequest())

    expect(raceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { electionDate: 'asc' },
      }),
    )
  })

  it('fills primary_election_date from a sibling primary race within the lookup window', async () => {
    raceFindFirst.mockResolvedValue(baseRace())
    raceFindMany.mockResolvedValue([
      {
        electionDate: new Date('2026-06-02T00:00:00Z'),
        isPrimary: true,
        isRunoff: false,
      },
    ])

    const result = await service.getCampaignStrategyContext(baseRequest())

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

  it('windows the sibling lookup ±6 months around the race electionDate so cross-year stage pairs are captured', async () => {
    // Louisiana-style cycle: jungle primary in Nov 2026 feeds a Jan 2027
    // general. A calendar-year window anchored on 2027 would miss the
    // 2026 primary. The relative ±6-month window must reach back into
    // the prior year and forward into the next.
    raceFindFirst.mockResolvedValue(
      baseRace({ electionDate: new Date('2027-01-15T00:00:00Z') }),
    )
    raceFindMany.mockResolvedValue([])

    await service.getCampaignStrategyContext(baseRequest())

    const callArgs = raceFindMany.mock.calls[0][0]
    const gte = callArgs.where.electionDate.gte as Date
    const lt = callArgs.where.electionDate.lt as Date
    expect(gte.toISOString().slice(0, 10)).toBe('2026-07-15')
    expect(lt.toISOString().slice(0, 10)).toBe('2027-07-15')
  })

  it('clamps the sibling-window day to the last day of the target month for month-end electionDates', async () => {
    // setUTCMonth on Aug 31 - 6 months overflows from "Feb 31" to Mar 3,
    // shifting the window start 3 days too late and excluding siblings
    // on Feb 28/Mar 1/Mar 2. The clamped helper must produce Feb 28.
    raceFindFirst.mockResolvedValue(
      baseRace({ electionDate: new Date('2025-08-31T00:00:00Z') }),
    )
    raceFindMany.mockResolvedValue([])

    await service.getCampaignStrategyContext(baseRequest())

    const callArgs = raceFindMany.mock.calls[0][0]
    const gte = callArgs.where.electionDate.gte as Date
    const lt = callArgs.where.electionDate.lt as Date
    expect(gte.toISOString().slice(0, 10)).toBe('2025-02-28')
    expect(lt.toISOString().slice(0, 10)).toBe('2026-02-28')
  })

  it('skips sibling rows with null isPrimary/isRunoff flags instead of misclassifying them as general', async () => {
    // dbt can land null flags on TS-found sentinel rows. Without the
    // strict-boolean guard, `!null === true` would let a null-flag
    // sibling claim generalDate before a real general had a chance.
    raceFindFirst.mockResolvedValue(baseRace())
    raceFindMany.mockResolvedValue([
      {
        electionDate: new Date('2026-07-10T00:00:00Z'),
        isPrimary: null,
        isRunoff: null,
      },
    ])

    const result = await service.getCampaignStrategyContext(baseRequest())

    // baseRace is a general on 2026-08-25, so generalDate is already
    // populated from the looked-up race; primaryDate stays null.
    expect(result.primary_election_date).toBeNull()
    expect(result.general_election_date).toBe('2026-08-25')
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

    const result = await service.getCampaignStrategyContext(baseRequest())

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

    const result = await service.getCampaignStrategyContext(baseRequest())

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

    const result = await service.getCampaignStrategyContext(baseRequest())

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

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(result.candidate_office).toBe('City Legislature')
  })

  it('skips sibling-date lookup when the race has no positionId', async () => {
    raceFindFirst.mockResolvedValue(baseRace({ positionId: null }))

    const result = await service.getCampaignStrategyContext(baseRequest())

    expect(raceFindMany).not.toHaveBeenCalled()
    expect(result.primary_election_date).toBeNull()
    expect(result.general_election_date).toBe('2026-08-25')
  })
})
