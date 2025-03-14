import { BadRequestException, Body, Controller, Get, Query } from '@nestjs/common'
import { RacesService } from './races.service'
import { PositionLevel } from '@prisma/client'
import slugify from 'slugify'
import { ByCountyRaceDto, ByMunicipalityRaceDto, ByStateRaceDto, RacesByRaceDto } from './races.schema'

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}
  
  @Get('by-state')
  async stateRacesByState(@Body() dto: ByStateRaceDto) {
    return this.racesService.getStateRacesByState(dto)
  }

  @Get('all-state')
  async allRacesByState(@Body() dto: ByStateRaceDto) {
    let { state } = dto
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
  async racesByCounty(@Body() dto: ByCountyRaceDto) {
    let { state, county } = dto
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
  async racesByMunicipality(@Body() dto: ByMunicipalityRaceDto) {
    let { state, county, municipality } = dto
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

  async racesByRace(@Body() dto: RacesByRaceDto) {

  }
}