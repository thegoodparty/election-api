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
      includeCandidacies,
      state,
      placeSlug,
      positionLevel,
      raceSlug,
      electionDateStart,
      electionDateEnd,
      isPrimary,
      isRunoff,
      raceColumns,
      placeColumns,
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

    const raceSelectBase: Prisma.RaceSelect | undefined = raceColumns
      ? (buildColumnSelect(raceColumns) as Prisma.RaceSelect)
      : undefined

    const placeInclude = this.buildPlaceInclude(placeColumns, includePlace)
    const raceSelection = this.makeRaceSelection(
      includePlace,
      raceSelectBase,
      placeInclude,
    )

    const raceQueryObj = {
      ...(raceSelectBase ?? {}),
      ...(includePlace && { Place: placeInclude }),
    }

    const races = raceSelectBase
      ? await this.model.findMany({
          where,
          select: raceQueryObj,
        })
      : await this.model.findMany({
          where,
          include: raceQueryObj,
        })

    if (!races || races.length === 0) {
      throw new NotFoundException(
        `No races found for query: ${JSON.stringify(where)}`,
      )
    }

    // let races:
    //   | Prisma.RaceGetPayload<{ select: Prisma.RaceSelect }>[]
    //   | Prisma.RaceGetPayload<{ include: Prisma.RaceInclude }>[] = []

    // if (raceColumns) {
    //   const select: Prisma.RaceSelect = buildColumnSelect(raceColumns)

    //   if (includePlace) {
    //     select.Place = true
    //   }
    //   if (includeCandidacies) {
    //     select.Candidacies = true
    //   }

    //   races = await this.model.findMany({
    //     where,
    //     select,
    //     orderBy: { electionDate: Prisma.SortOrder.asc },
    //   })
    //   if (!races || races.length === 0) {
    //     throw new NotFoundException(
    //       `No races found for query: ${JSON.stringify(where)}`,
    //     )
    //   }
    // } else {
    //   const include: Prisma.RaceInclude = {}

    //   if (includePlace) {
    //     include.Place = true
    //   }
    //   if (includeCandidacies) {
    //     include.Candidacies = true
    //   }
    //   races = await this.model.findMany({
    //     where,
    //     include,
    //     orderBy: { electionDate: Prisma.SortOrder.asc },
    //   })
    //   if (!races || races.length === 0) {
    //     throw new NotFoundException(
    //       `No races found for query: ${JSON.stringify(where)}`,
    //     )
    //   }
    // }
    if (!races[0]?.positionNames || !races[0]?.slug) {
      return races
    }
    return getDedupedRacesBySlug(races)
  }

  private buildPlaceInclude(
    placeColumns: string | undefined | null,
    includePlace: boolean | undefined | null,
  ) {
    if (!placeColumns) return true
    if (!includePlace) return true

    return {
      select: buildColumnSelect(placeColumns) as Prisma.PlaceSelect,
    }
  }

  private makeRaceSelection(
    withPlace: boolean,
    raceSelectBase: Prisma.RaceSelect | undefined,
    placeInclude:
      | true
      | {
          select: Prisma.PlaceSelect
        },
  ) {
    if (!raceSelectBase) {
      if (!withPlace) return true

      return {
        include: {
          Place: placeInclude,
        },
      }
    }
    const sel: Prisma.RaceSelect = { ...raceSelectBase }
    if (withPlace) sel.Place = placeInclude
    return { select: sel }
  }
}
