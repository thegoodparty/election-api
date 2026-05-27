import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaService } from 'src/prisma/prisma.service'
import { RacesService } from './races.service'

describe('RacesService.findFilingFeeByBrHashId', () => {
  let service: RacesService
  let raceFindMany: ReturnType<typeof vi.fn>

  beforeEach(() => {
    raceFindMany = vi.fn()
    service = new RacesService({} as PrismaService)
    Object.defineProperty(service, '_prisma', {
      value: {
        race: {
          findMany: raceFindMany,
        },
      },
    })
  })

  it('returns an empty result when no Race matches the hash', async () => {
    raceFindMany.mockResolvedValue([])

    const result = await service.findFilingFeeByBrHashId('Z2lk-missing')

    expect(raceFindMany).toHaveBeenCalledWith({
      where: { brHashId: 'Z2lk-missing' },
      select: { filingRequirements: true, salary: true },
      orderBy: [
        { isPrimary: { sort: 'asc', nulls: 'last' } },
        { isRunoff: { sort: 'asc', nulls: 'last' } },
      ],
      take: 1,
    })
    expect(result).toEqual({
      filingFee: null,
      filingRequirementsText: null,
      extractionSource: null,
    })
  })

  it('queries Prisma with deterministic ordering so multi-row matches resolve consistently', async () => {
    // brHashId has no @unique constraint in the schema, so the same hash
    // can in principle map to multiple Race rows (general / primary /
    // runoff). orderBy guarantees we pick the same row every time.
    raceFindMany.mockResolvedValue([
      { filingRequirements: 'Filing fee: $40.', salary: null },
    ])

    await service.findFilingFeeByBrHashId('Z2lk-multi-row')

    expect(raceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { isPrimary: { sort: 'asc', nulls: 'last' } },
          { isRunoff: { sort: 'asc', nulls: 'last' } },
        ],
        take: 1,
      }),
    )
  })

  it('extracts a direct dollar amount when filing_requirements has exactly one $N', async () => {
    raceFindMany.mockResolvedValue([
      {
        filingRequirements: 'Filing fee: $25 due at filing.',
        salary: null,
      },
    ])

    const result = await service.findFilingFeeByBrHashId('Z2lk-direct')

    expect(result.filingFee).toBe(25)
    expect(result.extractionSource).toBe('direct_dollar')
    expect(result.filingRequirementsText).toBe('Filing fee: $25 due at filing.')
  })

  it('returns multi_value with null filingFee when multiple $N values appear', async () => {
    // BallotReady multi-fee rows (e.g. per-party fees) — the extractor
    // refuses to pick one to avoid silently lying. UI surfaces the raw text.
    raceFindMany.mockResolvedValue([
      {
        filingRequirements:
          'D/R candidates: $100. Independent candidates: $50.',
        salary: null,
      },
    ])

    const result = await service.findFilingFeeByBrHashId('Z2lk-multi')

    expect(result.filingFee).toBeNull()
    expect(result.extractionSource).toBe('multi_value')
    expect(result.filingRequirementsText).toBe(
      'D/R candidates: $100. Independent candidates: $50.',
    )
  })

  it('extracts $0 via direct_dollar when filing_requirements contains $0', async () => {
    raceFindMany.mockResolvedValue([
      {
        filingRequirements: 'Filing Fee = $0; petition required.',
        salary: null,
      },
    ])

    const result = await service.findFilingFeeByBrHashId('Z2lk-zero-dollar')

    expect(result.filingFee).toBe(0)
    expect(result.extractionSource).toBe('direct_dollar')
  })

  it('returns filingFee 0 via no_fee when text says no fee without a dollar sign', async () => {
    raceFindMany.mockResolvedValue([
      {
        filingRequirements: 'No filing fee required; petition signatures only.',
        salary: null,
      },
    ])

    const result = await service.findFilingFeeByBrHashId('Z2lk-no-fee')

    expect(result.filingFee).toBe(0)
    expect(result.extractionSource).toBe('no_fee')
    expect(result.filingRequirementsText).toBe(
      'No filing fee required; petition signatures only.',
    )
  })

  it('computes pct_of_salary when filing_requirements has a percentage and salary is parseable', async () => {
    raceFindMany.mockResolvedValue([
      {
        filingRequirements: 'Filing fee is 1% of salary.',
        salary: '$80,000',
      },
    ])

    const result = await service.findFilingFeeByBrHashId('Z2lk-pct')

    expect(result.filingFee).toBe(800)
    expect(result.extractionSource).toBe('pct_of_salary')
  })

  it('returns no_match with null filingFee when no extraction rule applies', async () => {
    raceFindMany.mockResolvedValue([
      {
        filingRequirements: 'Petition signatures required; see town clerk.',
        salary: null,
      },
    ])

    const result = await service.findFilingFeeByBrHashId('Z2lk-no-match')

    expect(result.filingFee).toBeNull()
    expect(result.extractionSource).toBe('no_match')
    expect(result.filingRequirementsText).toBe(
      'Petition signatures required; see town clerk.',
    )
  })
})
