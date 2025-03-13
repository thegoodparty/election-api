import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { RacesService } from './races.service'
import { PositionLevel } from '@prisma/client'
import slugify from 'slugify'

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}
  
  @Get('by-state')
  async stateRacesByState(@Query('state') state: string) {
    if (state.trim().length !== 2) {
      throw new BadRequestException('State must be a 2 letter abbreviation')
    }
    state = state.toUpperCase()

    const startOfTwoYearsFromNow = new Date()
    startOfTwoYearsFromNow.setFullYear(startOfTwoYearsFromNow.getFullYear() + 2)
    startOfTwoYearsFromNow.setMonth(0) // Jan
    startOfTwoYearsFromNow.setDate(1) // First day

    // TODO: Add in select statement to only grab what frontend needs
    const races = await this.racesService.findMany({
      where: { 
        state,
        positionLevel: PositionLevel.STATE,
        electionDate: {
          lt: startOfTwoYearsFromNow,
          gt: new Date(),
        }
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug']
    })
    return races
  }

  @Get('all-state')
  async allRacesByState(@Query('state') state: string) {
    if (state.trim().length !== 2) {
      throw new BadRequestException('State must be a 2 letter abbreviation')
    }
    state = state.toUpperCase()

    const startOfTwoYearsFromNow = new Date()
    startOfTwoYearsFromNow.setFullYear(startOfTwoYearsFromNow.getFullYear() + 2)
    startOfTwoYearsFromNow.setMonth(0) // Jan
    startOfTwoYearsFromNow.setDate(1) // First day

    const races = await this.racesService.findMany({
      where: {
        state,
        electionDate: {
          lt: startOfTwoYearsFromNow,
          gt: new Date(),
        },
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug']
    })

    return races
  }

  @Get('by-county')
  async racesByCounty(@Query('state', 'county') state: string, county: string) {
    if (state.trim().length !== 2) {
      throw new BadRequestException('State must be a 2 letter abbreviation')
    }
    state = state.toUpperCase()

    const startOfTwoYearsFromNow = new Date()
    startOfTwoYearsFromNow.setFullYear(startOfTwoYearsFromNow.getFullYear() + 2)
    startOfTwoYearsFromNow.setMonth(0) // Jan
    startOfTwoYearsFromNow.setDate(1) // First day

    const countySlug = `${slugify(state, {lower: true})}-${slugify(county), {lower:true}}`

    const races = await this.racesService.findMany({
      where: {
        countySlug, 
        electionDate: {
          lt: startOfTwoYearsFromNow,
          gt: new Date(),
        },
        positionLevel: PositionLevel.COUNTY
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug']
    })

    return races
  }

  @Get('by-municipality')
  async racesByMunicipality(@Query('state', 'county', 'municipality') state: string, county: string, municipality: string) {
    if (state.trim().length !== 2) {
      throw new BadRequestException('State must be a 2 letter abbreviation')
    }
    state = state.toUpperCase()
    
    const municipalitySlug = `${slugify(state, { lower: true })}/${slugify(county, {
        lower: true,
      })}/${slugify(municipality, {
        lower: true,
      })}`

    const startOfTwoYearsFromNow = new Date()
    startOfTwoYearsFromNow.setFullYear(startOfTwoYearsFromNow.getFullYear() + 2)
    startOfTwoYearsFromNow.setMonth(0) // Jan
    startOfTwoYearsFromNow.setDate(1) // First day

    const races = await this.racesService.findMany({
      where: {
        municipalitySlug, 
        electionDate: {
          lt: startOfTwoYearsFromNow,
          gt: new Date(),
        },
      },
      orderBy: {
        electionDate: 'asc'
      },
      distinct: ['positionSlug']
    })

    const shortCity = {
      population: races[0].municipalityPopluation,
      density: races[0].municipalityDensity,
      incomeHouseholdMedian: races[0].municipalityIncomeHouseholdMedian,
      unemploymentRate: races[0].municipalityUnemploymentRate,
      homeValue: races[0].municipalityHomeValue,
      countyName: races[0].countyName
    }

    return {
      races,
      shortCity
    }
  }
  
  async racesByRace
}