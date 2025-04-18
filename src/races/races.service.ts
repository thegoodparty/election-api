import { Injectable, NotFoundException } from '@nestjs/common'
import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { RaceFilterDto } from './races.schema'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { getDedupedRacesBySlug } from './races.util'

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
      const select: Prisma.RaceSelect = buildColumnSelect(raceColumns)

      if (includePlace) {
        select.Place = true
      }

      races = await this.model.findMany({
        where,
        select,
        orderBy: { electionDate: Prisma.SortOrder.asc },
      })
      if (!races || races.length === 0) {
        throw new NotFoundException(
          `No races found for query: ${JSON.stringify(where)}`,
        )
      }
    } else {
      const include: Prisma.RaceInclude = {}

      if (includePlace) {
        include.Place = true
      }
      races = await this.model.findMany({
        where,
        include,
        orderBy: { electionDate: Prisma.SortOrder.asc },
      })
      if (!races || races.length === 0) {
        throw new NotFoundException(
          `No races found for query: ${JSON.stringify(where)}`,
        )
      }
    }
    if (!races[0]?.positionNames || !races[0]?.slug) {
      return races
    }
    return getDedupedRacesBySlug(races)
  }
}
