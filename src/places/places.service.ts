import { Injectable, NotFoundException } from '@nestjs/common'
import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { PlaceFilterDto } from './places.schema'
import { Prisma } from '@prisma/client'
import {
  hasBuckets,
  hasChildren,
  hasParent,
  hasRaces,
  PlaceCore,
  PlaceWithBuckets,
  POSITION_NAMES_COLUMN_NAME,
  SLUG_COLUMN_NAME,
} from './place.types'
import { getDedupedRacesBySlug } from 'src/races/races.util'

const COUNTY_MTFCC = ['G4020']
const DISTRICT_MTFCC = ['G5420', 'G5410', 'G5400']

@Injectable()
export class PlacesService extends createPrismaBase(MODELS.Place) {
  constructor() {
    super()
  }

  async getPlaces(filterDto: PlaceFilterDto) {
    const {
      includeChildren,
      includeChildRaces,
      includeParent,
      includeRaces,
      categorizeChildren,
      state,
      name,
      slug,
      mtfcc,
      placeColumns,
      raceColumns,
    } = filterDto

    this.logger.debug(`includeChildren: ${includeChildren}`)
    this.logger.debug(`includeParent: ${includeParent}`)

    const baseWhere: Prisma.PlaceWhereInput = {
      ...(state ? { state } : {}),
      ...(name ? { name } : {}),
      ...(mtfcc ? { mtfcc } : {}),
      ...(slug ? { slug } : {}),
    }

    const placeSelectBase: Prisma.PlaceSelect | undefined = placeColumns
      ? (buildColumnSelect(placeColumns) as Prisma.PlaceSelect)
      : undefined

    const raceInclude = this.buildRaceInclude(raceColumns, includeRaces)
    const childRaceInclude = this.buildRaceInclude(
      raceColumns,
      includeChildRaces,
    )
    const placeSelection = this.makePlaceSelection(
      includeRaces,
      placeSelectBase,
      raceInclude,
    )

    const childrenPlaceSelection = this.makePlaceSelection(
      includeChildRaces,
      placeSelectBase,
      childRaceInclude,
    )

    const placeQueryObj = {
      ...(placeSelectBase ?? {}),
      ...(includeRaces && { Races: raceInclude }),
      ...(includeChildren && { children: childrenPlaceSelection }),
      ...(includeParent && { parent: placeSelection }),
    }

    this.logger.debug(placeQueryObj)
    let places: PlaceWithBuckets[] = []

    if (!categorizeChildren) {
      places = await this.runQuery(baseWhere, placeSelectBase, placeQueryObj)
    } else {
      places = await this.runQuery(baseWhere, placeSelectBase, placeQueryObj)

      for (const place of places) {
        place.counties = []
        place.districts = []
        place.others = []
        if (!place.children) continue
        for (const child of place.children) {
          if (COUNTY_MTFCC.includes(child.mtfcc!)) {
            place.counties.push(child)
          } else if (DISTRICT_MTFCC.includes(child.mtfcc!)) {
            place.districts.push(child)
          } else {
            place.others.push(child)
          }
        }
        delete place.children
      }
    }

    if (!places || places.length === 0) {
      throw new NotFoundException(
        `No places found for query: ${JSON.stringify(baseWhere)}`,
      )
    }
    this.dedupeRacesInTree({
      places,
      includeRaces,
      includeChildren,
      includeParent,
    })

    return places
  }

  async getPlacesWithMostElections(minRaces: number, count: number) {
    const places = await this.client.$queryRaw<
      { slug: string; name: string; race_count: number }[]
    >`
    SELECT   p.slug,
             p.name,
             COUNT(r.id)::int AS race_count
    FROM     "Place" p
    LEFT JOIN "Race" r ON r."place_id" = p.id
    WHERE    p."mtfcc" <> 'G4000'
    GROUP BY p.id
    HAVING   COUNT(r.id) > ${minRaces}
    ORDER BY race_count DESC;
  `
    const topPlaces = places.slice(0, count)
    return topPlaces
  }

  private buildRaceInclude(
    raceColumns: string | undefined | null,
    includeRaces: boolean | undefined | null,
  ) {
    if (!raceColumns) return true
    if (!includeRaces) return true

    // Force add slug and positionNames so we can dedupe by slug
    const cols = Array.from(
      new Set([
        ...raceColumns.split(','),
        SLUG_COLUMN_NAME,
        POSITION_NAMES_COLUMN_NAME,
      ]),
    ).join(',')

    return {
      select: buildColumnSelect(cols) as Prisma.RaceSelect,
    }
  }

  private makePlaceSelection(
    withRaces: boolean,
    placeSelectBase: Prisma.PlaceSelect | undefined,
    raceInclude:
      | true
      | {
          select: Prisma.RaceSelect
        },
  ) {
    if (!placeSelectBase) {
      if (!withRaces) return true

      return {
        include: {
          Races: raceInclude,
        },
      }
    }
    const sel: Prisma.PlaceSelect = { ...placeSelectBase }
    if (withRaces) sel.Races = raceInclude
    return { select: sel }
  }

  // We modify the passed in array for performance
  private dedupeRacesInTree(obj: {
    places: PlaceCore[]
    includeRaces: boolean
    includeChildren: boolean
    includeParent: boolean
  }) {
    const { places, includeChildren, includeParent, includeRaces } = obj
    if (!includeRaces) return
    for (const place of places) {
      if (includeRaces && hasRaces(place)) {
        place.Races = getDedupedRacesBySlug(place.Races)
      }

      if (includeChildren && hasChildren(place)) {
        for (const child of place.children ?? []) {
          if (hasRaces(child)) {
            child.Races = getDedupedRacesBySlug(child.Races)
          }
        }
      } else if (includeChildren && hasBuckets(place)) {
        for (const district of place.districts ?? []) {
          if (hasRaces(district)) {
            district.Races = getDedupedRacesBySlug(district.Races)
          }
        }
        for (const county of place.counties ?? []) {
          if (hasRaces(county)) {
            county.Races = getDedupedRacesBySlug(county.Races)
          }
        }
        for (const other of place.counties ?? []) {
          if (hasRaces(other)) {
            other.Races = getDedupedRacesBySlug(other.Races)
          }
        }
      }

      if (includeParent && hasParent(place) && hasRaces(place.parent)) {
        if (hasRaces(place.parent)) {
          place.parent.Races = getDedupedRacesBySlug(place.parent.Races)
        }
      }
    }
  }

  private async runQuery<
    T extends Prisma.PlaceSelect | Prisma.PlaceInclude | undefined,
  >(
    where: Prisma.PlaceWhereInput | object,
    placeSelectBase: Prisma.PlaceSelect | undefined,
    placeQueryObj: T,
  ) {
    return placeSelectBase
      ? this.model.findMany({
          where,
          select: placeQueryObj,
        })
      : this.model.findMany({
          where,
          include: placeQueryObj,
        })
  }
}
