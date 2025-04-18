import { Prisma } from '@prisma/client'

export type RaceWithSlugAndNames = Prisma.RaceGetPayload<{
  select: {
    slug: true
    positionNames: true
  }
}>

export function getDedupedRacesBySlug<
  T extends { slug: string; positionNames: string[] },
>(races: T[]): T[] {
  const uniqueRaces = new Map<string, T>()
  for (const race of races) {
    const existing = uniqueRaces.get(race.slug)
    if (existing) {
      existing.positionNames.push(...race.positionNames)
    } else {
      uniqueRaces.set(race.slug, race)
    }
  }
  return [...uniqueRaces.values()]
}
