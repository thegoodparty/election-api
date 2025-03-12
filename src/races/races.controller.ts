import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { RacesService } from './races.service'

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}
  
  @Get('by-state')
  async racesByState(@Query('state') state: string) {
    if (state.trim().length !== 2) {
      throw new BadRequestException('State must be a 2 letter abbreviation')
    }
    this.racesService.findMany({where: { state }})
  }
}