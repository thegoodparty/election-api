import { Injectable } from '@nestjs/common'
import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { PlaceFilterDto } from './places.schema'
import { Prisma } from '@prisma/client'

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

    let places: (
      | Prisma.PlaceGetPayload<{ select: Prisma.PlaceSelect }>
      | Prisma.PlaceGetPayload<{ include: Prisma.PlaceInclude }>
    )[]

    const buildRaceInclude = () => {
      if (raceColumns) {
        const raceSelect = buildColumnSelect(raceColumns) as Prisma.RaceSelect
        return { select: raceSelect }
      } else {
        return true
      }
    }

    if (!includeChildren && !includeParent) {
      // Just get one level of place(s)
      if (placeColumns) {
        const select = buildColumnSelect(placeColumns) as Prisma.PlaceSelect

        if (includeRaces) {
          select.Races = buildRaceInclude()
        }

        places = await this.model.findMany({ where, select })
      } else {
        const include: Prisma.PlaceInclude = {}
        if (includeRaces) {
          include.Races = buildRaceInclude()
        }
        places = await this.model.findMany({ where, include })
      }
    } else {
      // Get multiple levels of places
      const include: Prisma.PlaceInclude = {}

      if (includeChildren) {
        include.children = includeRaces
          ? { include: { Races: buildRaceInclude() } }
          : true
      }

      if (includeParent) {
        include.parent = includeRaces
          ? { include: { Races: buildRaceInclude() } }
          : true
      }

      if (includeRaces) {
        include.Races = buildRaceInclude()
      }

      places = await this.model.findMany({ where, include })
    }

    if (
      !includeRaces ||
      !places[0]?.Races[0]?.positionNames ||
      !places[0]?.Races[0]?.slug
    ) {
      return places
    }
    const uniqueRaces = new Map()
    for (const place of places) {
      const races = place.Races
      for (const race of races) {
        if (!uniqueRaces.has(race.slug)) {
          uniqueRaces.set(race.slug, race)
        } else {
          // We add the positionName to the unique race according to its slug
          const existingRace = uniqueRaces.get(race.slug)
          existingRace.positionNames.push(race.positionNames[0])
        }
      }
      place.Races = Array.from(uniqueRaces.values())
    }
    return places
  }
}
