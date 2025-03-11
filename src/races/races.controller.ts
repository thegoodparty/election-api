import { Controller, Get, Query } from '@nestjs/common'
import { RacesService } from './races.service'

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}
  
  @Get('by-state')
  async racesByState(@Query('state') state: string) {
    this.racesService.findMany({where: {state}})
  }
}