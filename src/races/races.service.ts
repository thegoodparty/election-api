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
      placeId,
      placeSlug,
      positionLevel,
      positionSlug,
      electionDateStart,
      electionDateEnd,
      isPrimary,
      isRunoff,
    } = filterDto

    const include: Prisma.RaceInclude = includePlace ? { Place: true } : {}

    const where: Prisma.RaceWhereInput = {
      ...(state ? { state } : {}),
      // TODO: Do I really need a separate findbyid endpoint? Or should I remove placeId from the dto?
      ...(placeId ? { placeId } : {}),
      ...(placeSlug ? { placeSlug } : {}),
      ...(positionLevel ? { positionLevel } : {}),
      ...(positionSlug ? { positionSlug } : {}),
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

    return this.model.findMany({ where, include })
  }

  async findRaceById(id: string, includePlace: boolean) {
    const race = includePlace
      ? this.model.findFirst({ where: { id }, include: { Place: true } })
      : this.model.findFirst({ where: { id } })
    return race
  }
}
