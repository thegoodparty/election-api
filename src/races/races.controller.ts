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
    @Query('includePlace') includePlace: boolean = false,
  ) {
    return this.racesService.findRaceById(id, includePlace)
  }
}
