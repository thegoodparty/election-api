import { Prisma } from '@prisma/client'

export const SLUG_COLUMN_NAME = 'slug'
export const POSITION_NAMES_COLUMN_NAME = 'positionNames'

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

export type PlaceWithCategories = PlaceCore & {
  children?: PlaceCore[]
  counties?: PlaceCore[]
  districts?: PlaceCore[]
  others?: PlaceCore[]
}

export function hasChildren(p: PlaceCore): p is PlaceWithChildren {
  return (
    'children' in p && Array.isArray((p as { children?: unknown }).children)
  )
}

export function hasParent(p: PlaceCore): p is PlaceWithParent {
  return 'parent' in p && (p as { parent?: unknown }).parent !== undefined
}

export function hasPlaceCategories(p: PlaceCore): p is PlaceWithCategories {
  return (
    Array.isArray((p as { counties?: unknown }).counties) ||
    Array.isArray((p as { districts?: unknown }).districts) ||
    Array.isArray((p as { others?: unknown }).others)
  )
}
