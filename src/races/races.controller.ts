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
    return this.racesService.getAllRacesByState(dto)
  }

  @Get('by-county')
  async racesByCounty(@Body() dto: ByCountyRaceDto) {
    return this.racesService.getRacesByCounty(dto)
  }

  @Get('by-municipality')
  async racesByMunicipality(@Body() dto: ByMunicipalityRaceDto) {
    return this.racesService.getRacesByMunicipality(dto)
  }

  @Get('race')
  async racesByRace(@Body() dto: RacesByRaceDto) {
    return this.racesService.findRace(dto)
  }
}