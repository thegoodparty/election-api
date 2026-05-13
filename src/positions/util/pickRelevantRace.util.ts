import type { Race } from '@prisma/client'

/**
 * One BallotReady Position can correspond to many Race rows: separate primary
 * and general election dates, runoffs, and one race per election cycle. The
 * filing-fee lookup needs a single race to read `filingRequirements` + `salary`
 * from, so this helper picks the most relevant one in priority order:
 *
 *   1. Race whose `electionDate` exactly matches the caller-provided
 *      `electionDate` (covers the common "I know exactly which race" case).
 *   2. Within general elections only (skip primaries + runoffs), the nearest
 *      future race by `electionDate`. Primaries get filtered out because their
 *      filing fees usually differ from general-election fees, and the general
 *      is the canonical "this is what running costs" answer.
 *   3. If no general elections exist, fall back to *any* race (primary/runoff
 *      included) using the same future-then-past preference.
 *   4. If no future races, the most recent historical race.
 *
 * Returns `null` only when the input list is empty.
 */
export type RaceForFilingFee = Pick<
  Race,
  'electionDate' | 'isPrimary' | 'isRunoff' | 'filingRequirements' | 'salary'
>

export const pickRelevantRace = (
  races: RaceForFilingFee[],
  electionDate?: string,
): RaceForFilingFee | null => {
  if (races.length === 0) return null

  if (electionDate) {
    const target = new Date(electionDate).getTime()
    const exact = races.find((r) => r.electionDate.getTime() === target)
    if (exact) return exact
  }

  const generalRaces = races.filter((r) => !r.isPrimary && !r.isRunoff)
  const pool = generalRaces.length > 0 ? generalRaces : races
  const now = Date.now()

  const future = pool
    .filter((r) => r.electionDate.getTime() >= now)
    .sort((a, b) => a.electionDate.getTime() - b.electionDate.getTime())
  if (future.length > 0) return future[0] ?? null

  const past = [...pool].sort(
    (a, b) => b.electionDate.getTime() - a.electionDate.getTime(),
  )
  return past[0] ?? null
}
