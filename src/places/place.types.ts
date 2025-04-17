import { Prisma } from '@prisma/client'

type PlaceWithRaces = Prisma.PlaceGetPayload<{ include: { Races: true } }>
export function hasRaces(p: unknown): p is PlaceWithRaces {
  return typeof p === 'object' && p !== null && Array.isArray((p as any).Races)
}
