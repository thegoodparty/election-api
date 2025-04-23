export function getDedupedRacesBySlug<
  T extends { slug: string; positionNames: string[] },
>(races: T[]): T[] {
  const uniqueRaces = new Map<string, T>()
  for (const race of races) {
    const existing = uniqueRaces.get(race.slug)
    if (existing) {
      // Use a set to avoid duplicates
      existing.positionNames = [
        ...new Set([...existing.positionNames, ...race.positionNames]),
      ]
    } else {
      uniqueRaces.set(race.slug, {
        ...race,
        positionNames: [...race.positionNames],
      })
    }
  }
  return [...uniqueRaces.values()]
}
