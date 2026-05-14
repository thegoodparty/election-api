import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest'
import { pickRelevantRace, RaceForFilingFee } from './pickRelevantRace.util'

const NOW = new Date('2026-06-01T00:00:00Z').getTime()

const makeRace = (overrides: Partial<RaceForFilingFee>): RaceForFilingFee => ({
  electionDate: new Date('2030-11-05'),
  isPrimary: false,
  isRunoff: false,
  filingRequirements: null,
  salary: null,
  ...overrides,
})

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW))
})

afterAll(() => {
  vi.useRealTimers()
})

describe('pickRelevantRace', () => {
  it('returns null for an empty list', () => {
    expect(pickRelevantRace([])).toBeNull()
  })

  it('returns null for an empty list even with an electionDate', () => {
    expect(pickRelevantRace([], '2026-11-03')).toBeNull()
  })

  it('returns the exact electionDate match when provided', () => {
    const races = [
      makeRace({ electionDate: new Date('2026-11-03') }),
      makeRace({ electionDate: new Date('2028-11-07') }),
      makeRace({ electionDate: new Date('2030-11-05') }),
    ]
    const chosen = pickRelevantRace(races, '2028-11-07')
    expect(chosen?.electionDate.toISOString()).toBe(
      new Date('2028-11-07').toISOString(),
    )
  })

  it('falls through to general-future when electionDate match is missing', () => {
    const races = [
      makeRace({ electionDate: new Date('2027-03-15'), isPrimary: true }),
      makeRace({ electionDate: new Date('2027-11-02') }),
    ]
    const chosen = pickRelevantRace(races, '2099-12-31')
    expect(chosen?.electionDate.toISOString()).toBe(
      new Date('2027-11-02').toISOString(),
    )
  })

  it('prefers general elections over primaries', () => {
    const races = [
      makeRace({ electionDate: new Date('2027-03-15'), isPrimary: true }),
      makeRace({ electionDate: new Date('2027-11-02') }),
    ]
    const chosen = pickRelevantRace(races)
    expect(chosen?.isPrimary).toBe(false)
  })

  it('prefers general elections over runoffs', () => {
    const races = [
      makeRace({ electionDate: new Date('2026-12-15'), isRunoff: true }),
      makeRace({ electionDate: new Date('2027-11-02') }),
    ]
    const chosen = pickRelevantRace(races)
    expect(chosen?.isRunoff).toBe(false)
  })

  it('picks the nearest future general election among many', () => {
    const races = [
      makeRace({ electionDate: new Date('2030-11-05') }),
      makeRace({ electionDate: new Date('2026-11-03') }),
      makeRace({ electionDate: new Date('2028-11-07') }),
    ]
    const chosen = pickRelevantRace(races)
    expect(chosen?.electionDate.toISOString()).toBe(
      new Date('2026-11-03').toISOString(),
    )
  })

  it('falls back to primary/runoff races when no general election exists', () => {
    const races = [
      makeRace({ electionDate: new Date('2027-03-15'), isPrimary: true }),
      makeRace({ electionDate: new Date('2027-06-15'), isRunoff: true }),
    ]
    const chosen = pickRelevantRace(races)
    expect(chosen).not.toBeNull()
    // earliest future is the primary
    expect(chosen?.electionDate.toISOString()).toBe(
      new Date('2027-03-15').toISOString(),
    )
  })

  it('returns the most recent historical race when nothing is in the future', () => {
    const races = [
      makeRace({ electionDate: new Date('2020-11-03') }),
      makeRace({ electionDate: new Date('2024-11-05') }),
      makeRace({ electionDate: new Date('2022-11-08') }),
    ]
    const chosen = pickRelevantRace(races)
    expect(chosen?.electionDate.toISOString()).toBe(
      new Date('2024-11-05').toISOString(),
    )
  })

  it('historical fallback also prefers general over primary', () => {
    const races = [
      makeRace({ electionDate: new Date('2024-03-05'), isPrimary: true }),
      makeRace({ electionDate: new Date('2022-11-08') }),
    ]
    const chosen = pickRelevantRace(races)
    expect(chosen?.isPrimary).toBe(false)
    expect(chosen?.electionDate.toISOString()).toBe(
      new Date('2022-11-08').toISOString(),
    )
  })

  it('returns a race with filing data passed through unchanged', () => {
    const race = makeRace({
      electionDate: new Date('2027-11-02'),
      filingRequirements: 'Filing fee is $250.',
      salary: '$80,000 annual',
    })
    const chosen = pickRelevantRace([race])
    expect(chosen?.filingRequirements).toBe('Filing fee is $250.')
    expect(chosen?.salary).toBe('$80,000 annual')
  })
})
