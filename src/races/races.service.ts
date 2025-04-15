import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { RaceFilterDto } from './races.schema'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class RacesService extends createPrismaBase(MODELS.Race) {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findRaces(filterDto: RaceFilterDto) {
    const {
      includePlace,
      state,
      placeSlug,
      positionLevel,
      raceSlug,
      electionDateStart,
      electionDateEnd,
      isPrimary,
      isRunoff,
      raceColumns,
    } = filterDto

    const where: Prisma.RaceWhereInput = {
      ...(state ? { state } : {}),
      ...(placeSlug ? { Place: { slug: placeSlug } } : {}),
      ...(positionLevel ? { positionLevel } : {}),
      ...(raceSlug ? { slug: raceSlug } : {}),
      ...(isPrimary !== undefined ? { isPrimary } : {}),
      ...(isRunoff !== undefined ? { isRunoff } : {}),
      ...(electionDateStart || electionDateEnd
        ? {
            electionDate: {
              ...(electionDateStart
                ? { gte: new Date(electionDateStart) }
                : {}),
              ...(electionDateEnd ? { lte: new Date(electionDateEnd) } : {}),
            },
          }
        : {}),
    }

    let races:
      | Prisma.RaceGetPayload<{ select: Prisma.RaceSelect }>[]
      | Prisma.RaceGetPayload<{ include: Prisma.RaceInclude }>[] = []

    if (raceColumns) {
      const select: Prisma.RaceSelect = {}
      raceColumns
        .split(',')
        .map((col) => col.trim())
        .forEach((col) => {
          select[col] = true
        })

      if (includePlace) {
        select.Place = true
      }

      races = await this.model.findMany({
        where,
        select,
        orderBy: { electionDate: 'asc' },
      })
    } else {
      const include: Prisma.RaceInclude = {}

      if (includePlace) {
        include.Place = true
      }
      races = await this.model.findMany({
        where,
        include,
        orderBy: { electionDate: 'asc' },
      })
    }
    if (!races[0].positionNames || !races[0].slug) {
      return races
    }
    const uniqueRaces = new Map()
    for (const race of races) {
      if (!uniqueRaces.has(race.slug)) {
        uniqueRaces.set(race.slug, race)
      } else {
        // We add the positionName to the unique race according to its slug
        const existingRace = uniqueRaces.get(race.slug)
        existingRace.positionNames.push(race.positionNames[0])
      }
    }
    return Array.from(uniqueRaces.values())
  }
}
