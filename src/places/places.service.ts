import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { PlaceFilterDto } from './places.schema'
import { Prisma } from '@prisma/client'
import { buildGetPlacesTreeQuery } from './queries/getPlacesTree'
import { access } from 'fs'

@Injectable()
export class PlacesService extends createPrismaBase(MODELS.Place) {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async getPlaces(filterDto: PlaceFilterDto) {
    const {
      includeChildren,
      includeParent,
      includeRaces,
      depth,
      state,
      name,
      slug,
      mtfcc,
      placeColumns,
      raceColumns
    } = filterDto

    depth ?? 1 // No children
    this.logger.debug(`includeChildren: ${includeChildren}`)
    this.logger.debug(`includeParent: ${includeParent}`)
    this.logger.debug(`depth: ${depth}`)
    
    if (!includeChildren && !includeParent && depth <= 2) {
      // Run normal prisma query
      this.logger.debug('Running standard Prisma findMany')
      const where: Prisma.PlaceWhereInput = {
        ...(state ? { state } : {}),
        ...(name ? { name } : {}),
        ...(mtfcc ? { mtfcc } : {}),
        ...(slug ? { slug } : {})
      }

      if (placeColumns) {
        const select: Prisma.PlaceSelect = {}
        placeColumns.split(',').map(col => col.trim()).forEach(col => {
          select[col] = true
        })

        if (includeRaces) {
          if (raceColumns) {
            // Build a nested select for Race columns.
            const raceSelect = raceColumns.split(',').map(col => col.trim()).reduce((acc, col) => {
              acc[col] = true
              return acc
            }, {} as Prisma.RaceSelect)
            select.Races = { select: raceSelect }
          } else {
            // Otherwise, simply include all columns from Race.
            select.Races = true
          }
        }

      return this.model.findMany({ where, select })
    } else {
      // No specific place columns provided.
      // Build an include object that also handles Races.
      const include: Prisma.PlaceInclude = {}
      if (includeRaces) {
        if (raceColumns) {
          const raceSelect = raceColumns.split(',').map(col => col.trim()).reduce((acc, col) => {
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
    // When building recursive place tree query...
    this.logger.debug('Running raw SQL query')
    const query = buildGetPlacesTreeQuery(filterDto)
    try {
      // Use Prisma.$queryRaw to run the generated SQL query.
      return await this.prisma.$queryRaw(Prisma.sql`${query.query}`)
    } catch (error) {
      this.logger.debug(query.query)
      throw error
    }
  }
}

  // async getPlaceById(id: string, includeRaces: boolean) {
  //   const place = includeRaces
  //     ? this.model.findFirst({ where: { id }, include: { Races: true } })
  //     : this.model.findFirst({ where: { id } })
  //   return place
  // }
}
