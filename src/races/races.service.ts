import { Injectable, NotFoundException } from '@nestjs/common'
import { County, Municipality, PositionLevel, Prisma } from '@prisma/client';
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util';
import { getStartOfTwoYearsFromNow } from 'src/shared/util/dates.util';
import { ByCountyRaceDto, ByMunicipalityRaceDto, ByStateRaceDto, RacesByRaceDto } from './races.schema';
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

    // Get all races regardless of positionLevel of the input state
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

  async getRacesByMunicipality(dto: ByMunicipalityRaceDto) {
    const { state, county, municipality } = dto
    const upperState = state.toUpperCase()

    const municipalitySlug = `${slugify(upperState, { lower: true })}-${slugify(county, {
      lower: true,
    })}-${slugify(municipality, {
      lower: true,
    })}`

    const municipalityEntity = await this.prisma.municipality.findUnique({
      where: { slug: municipalitySlug },
      include: { county: true }
    })

    if (!municipalityEntity) {
      throw new NotFoundException(`Municipality with slug ${municipalitySlug} not found`)
    }

    const races = await this.model.findMany({
      where: {
        municipalityId: municipalityEntity.id,
        electionDate: {
          lt: getStartOfTwoYearsFromNow(),
          gt: new Date(),
        },
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug'],
      include: { municipality: { include: { county: true } } }
    })

    const shortCity = {
      population: municipalityEntity.municipalityPopluation,
      density: municipalityEntity.municipalityDensity,
      incomeHouseholdMedian: municipalityEntity.municipalityIncomeHouseholdMedian,
      unemploymentRate: municipalityEntity.municipalityUnemploymentRate,
      homeValue: municipalityEntity.municipalityHomeValue,
      countyName: municipalityEntity.county?.name
    };
    
    return {
      races,
      shortCity
    }
  }

  async findRace(dto: RacesByRaceDto) {
    const { state, county, municipality, positionSlug, id } = dto

    if (id) {
      const race = await this.model.findUnique({
        where: { brHashId: id },
        select: {
          positionSlug: true,
          positionName: true,
          municipality: true,
          county: true,
          state: true,
        }
      })

      if (!race) {
        throw new NotFoundException(`Race with id ${id} not found`)
      }

      return { race }
    }

    let countyRecord: County | null = null
    let municipalityRecord: Municipality | null = null

    if (county && state) {
      const countySlug = `${slugify(state, { lower: true })}-${slugify(county, { lower: true })}`
      countyRecord = await this.prisma.county.findUnique({
        where: { slug: countySlug }
      })
    }

    if (municipality && countyRecord && state && county) {
      const municipalitySlug = `${slugify(state, { lower: true })}-${slugify(county, { lower: true })}-${slugify(municipality, { lower: true })}`
      municipalityRecord = await this.prisma.municipality.findUnique({
        where: { slug: municipalitySlug}
      })
    }

    const query: Prisma.RaceWhereInput = {
      state: state?.toUpperCase(),
      positionSlug,
      electionDate: {
        lt: getStartOfTwoYearsFromNow(),
        gt: new Date()
      }
    }
    if (municipalityRecord) {
      query.municipalityId = municipalityRecord.id
    } else if (countyRecord) {
      query.countyId = countyRecord.id
    }

    const races = await this.model.findMany({
      where: query,
      orderBy: { electionDate: 'asc'},
      include: { municipality: true, county: true}
    })
    if (races.length === 0) {
      return { race: null}
    }

    // We're choosing the first race, is this the best way? Somewhat arbitary?
    let race = races[0]
    // Probably should look for more than just local
    if (race.positionLevel === PositionLevel.LOCAL && !race.locationName) {
      for (const r of races) {
        if (r.locationName) {
          race = r
          break
        }
      }
    }
  }
}