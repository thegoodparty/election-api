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

      return this.model.findMany({ where, select })
    } else {
      const include: Prisma.RaceInclude = {}

      if (includePlace) {
        include.Place = true
      }
      return this.model.findMany({ where, include })
    }
  }
}
