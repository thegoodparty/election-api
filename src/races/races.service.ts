import { Injectable, NotFoundException } from '@nestjs/common'
import { PositionLevel } from '@prisma/client';
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util';
import { getStartOfTwoYearsFromNow } from 'src/shared/util/dates.util';
import { ByCountyRaceDto, ByStateRaceDto } from './races.schema';
import slugify from 'slugify'
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RacesService extends createPrismaBase(MODELS.Race) {
  constructor(private readonly prisma: PrismaService) { super() }
  
  async getStateRacesByState(dto: ByStateRaceDto) {
    const { state } = dto
    const uppercaseState = state.toUpperCase()

    return this.model.findMany({
      where: {
        state: uppercaseState,
        positionLevel: PositionLevel.STATE,
        electionDate: {
          lt: getStartOfTwoYearsFromNow(),
          gt: new Date(),
        }
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug']
    })
  }

  async getAllRacesByState(dto: ByStateRaceDto) {
    const { state } = dto
    const upperState = state.toUpperCase()

    return this.model.findMany({
      where: {
        state: upperState,
        electionDate: {
          lt: getStartOfTwoYearsFromNow(),
          gt: new Date(),
        },
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug']
    })
  }

  async getRacesByCounty(dto: ByCountyRaceDto) {
    const { state, county } = dto
    const upperState = state.toUpperCase()

    const countySlug = `${slugify(upperState, {lower: true})}-${slugify(county, {lower: true})}`

    const countyEntity = await this.prisma.county.findUnique({
      where: { slug: countySlug}
    })

    if (!countyEntity) {
      throw new NotFoundException(`County with slug ${countySlug} not found`)
    }

    return this.model.findMany({
      where: {
        countyId: countyEntity.id,
        electionDate: {
          lt: getStartOfTwoYearsFromNow(),
          gt: new Date(),
        },
        positionLevel: PositionLevel.COUNTY
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug'],
      include: { county: true }
    })


  }
}