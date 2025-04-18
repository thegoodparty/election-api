import { Prisma } from '@prisma/client'

type PlaceWithRaces = Prisma.PlaceGetPayload<{ include: { Races: true } }>
export function hasRaces(p: unknown): p is PlaceWithRaces {
  return (
    typeof p === 'object' &&
    p !== null &&
    'Races' in p &&
    Array.isArray((p as { Races?: unknown }).Races)
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PlaceCore = Prisma.PlaceGetPayload<{}>

export type PlaceWithChildren = Prisma.PlaceGetPayload<{
  include: { children: true }
}>

export type PlaceWithParent = Prisma.PlaceGetPayload<{
  include: { parent: true }
}>

export function hasChildren(p: PlaceCore): p is PlaceWithChildren {
  return (
    'children' in p && Array.isArray((p as { children?: unknown }).children)
  )
}

export function hasParent(p: PlaceCore): p is PlaceWithParent {
  return 'parent' in p && (p as { parent?: unknown }).parent !== undefined
}
