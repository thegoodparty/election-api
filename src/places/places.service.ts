import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
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
      raceColumns
    } = filterDto

    this.logger.debug(`includeChildren: ${includeChildren}`)
    this.logger.debug(`includeParent: ${includeParent}`)

    const where: Prisma.PlaceWhereInput = {
      ...(state ? { state } : {}),
      ...(name ? { name } : {}),
      ...(mtfcc ? { mtfcc } : {}),
      ...(slug ? { slug } : {})
    }

    if (!includeChildren && !includeParent) {
      if (placeColumns) {
        const select: Prisma.PlaceSelect = {}
        placeColumns.split(',').map((col) => col.trim()).forEach((col) => {
          select[col] = true
        })

        if (includeRaces) {
          if (raceColumns) {
            const raceSelect = raceColumns
              .split(',')
              .map((col) => col.trim())
              .reduce((acc, col) => {
                acc[col] = true
                return acc
              }, {} as Prisma.RaceSelect)
            select.Races = { select: raceSelect }
          } else {
            select.Races = true
          }
        }
        return this.model.findMany({ where, select })
      } else {
        const include: Prisma.PlaceInclude = {}
        if (includeRaces) {
          if (raceColumns) {
            const raceSelect = raceColumns
              .split(',')
              .map((col) => col.trim())
              .reduce((acc, col) => {
                acc[col] = true
                return acc
              }, {} as Prisma.RaceSelect)
            include.Races = { select: raceSelect }
          } else {
            include.Races = true
          }
        }
        return this.model.findMany({ where, include })
      }
    } else {
      const include: Prisma.PlaceInclude = {}

      if (includeChildren) {
        include.children = true
      }
      
      if (includeParent) {
        include.parent = true
      }

      if (includeRaces) {
        if (raceColumns) {
          const raceSelect = raceColumns
            .split(',')
            .map((col) => col.trim())
            .reduce((acc, col) => {
              acc[col] = true
              return acc
            }, {} as Prisma.RaceSelect)
          include.Races = { select: raceSelect }
        } else {
          include.Races = true
        }
      }

      return this.model.findMany({ where, include })
    }
  }
}
