import { Injectable, NotFoundException } from '@nestjs/common'
import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { PlaceFilterDto } from './places.schema'
import { Prisma } from '@prisma/client'
import { hasChildren, hasParent, hasRaces } from './place.types'
import { getDedupedRacesBySlug } from 'src/races/races.util'

@Injectable()
export class PlacesService extends createPrismaBase(MODELS.Place) {
  constructor() {
    super()
  }

  async getPlaces(filterDto: PlaceFilterDto) {
    const {
      includeChildren,
      includeParent,
      includeRaces,
      state,
      name,
      slug,
      mtfcc,
      placeColumns,
      raceColumns,
    } = filterDto

    this.logger.debug(`includeChildren: ${includeChildren}`)
    this.logger.debug(`includeParent: ${includeParent}`)

    const where: Prisma.PlaceWhereInput = {
      ...(state ? { state } : {}),
      ...(name ? { name } : {}),
      ...(mtfcc ? { mtfcc } : {}),
      ...(slug ? { slug } : {}),
    }

    const placeSelectBase: Prisma.PlaceSelect | undefined = placeColumns
      ? (buildColumnSelect(placeColumns) as Prisma.PlaceSelect)
      : undefined

    const buildRaceInclude = () => {
      if (!raceColumns) return true
      if (!includeRaces) return true

      // Force add slug and positionNames so we can dedupe by slug
      const cols = Array.from(
        new Set([...raceColumns.split(','), 'slug', 'positionNames']),
      ).join(',')

      return {
        select: buildColumnSelect(cols) as Prisma.RaceSelect,
      }
    }

    const makePlaceSelection = (withRaces: boolean) => {
      if (!placeSelectBase) {
        if (!withRaces) return true

        return {
          include: {
            Races: buildRaceInclude(),
          },
        }
      }
      const sel: Prisma.PlaceSelect = { ...placeSelectBase }
      if (withRaces) sel.Races = buildRaceInclude()
      return { select: sel }
    }

    let queryArgs: Prisma.PlaceFindManyArgs

    if (placeSelectBase) {
      const rootSelect: Prisma.PlaceSelect = {
        ...placeSelectBase,
        ...(includeRaces && { Races: buildRaceInclude() }),
        ...(includeChildren && { children: makePlaceSelection(includeRaces) }),
        ...(includeParent && { parent: makePlaceSelection(includeRaces) }),
      }

      queryArgs = { where, select: rootSelect }
    } else {
      queryArgs = {
        where,
        include: {
          ...(includeRaces && { Races: buildRaceInclude() }),
          ...(includeChildren && {
            children: makePlaceSelection(includeRaces),
          }),
          ...(includeParent && { parent: makePlaceSelection(includeRaces) }),
        },
      }
    }
    this.logger.debug(queryArgs)
    const places = await this.model.findMany(queryArgs)
    if (!places || places.length === 0) {
      throw new NotFoundException(
        `No places found for query: ${JSON.stringify(where)}`,
      )
    }

    if (includeRaces) {
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
        }

        if (includeParent && hasParent(place) && hasRaces(place.parent)) {
          if (hasRaces(place.parent)) {
            place.parent.Races = getDedupedRacesBySlug(place.parent.Races)
          }
        }
      }
    }
    return places
  }
}
