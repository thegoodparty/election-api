import { Controller, Get, Param, Query } from '@nestjs/common'
import { RacesService } from './races.service'
import { RaceFilterDto } from './races.schema'

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  async getRaces(@Query() filterDto: RaceFilterDto) {
    return this.racesService.findRaces(filterDto)
  }

  @Get(':id')
  async getRaceById(
    @Param('id') id: string,
    @Query('includePlace') includePlace: boolean = false
  ) {
    return this.racesService.findRaceById(id, includePlace )
  }
  
  // @Get('by-state')
  // async stateRacesByState(@Body() dto: ByStateRaceDto) {
  //   return this.racesService.getStateRacesByState(dto)
  // }

  // @Get('all-state')
  // async allRacesByState(@Body() dto: ByStateRaceDto) {
  //   return this.racesService.getAllRacesByState(dto)
  // }

  // @Get('by-county')
  // async racesByCounty(@Body() dto: ByCountyRaceDto) {
  //   return this.racesService.getRacesByCounty(dto)
  // }

  // @Get('by-municipality')
  // async racesByMunicipality(@Body() dto: ByMunicipalityRaceDto) {
  //   return this.racesService.getRacesByMunicipality(dto)
  // }

  // @Get('race')
  // async racesByRace(@Body() dto: RacesByRaceDto) {
  //   return this.racesService.findRace(dto)
  // }
}