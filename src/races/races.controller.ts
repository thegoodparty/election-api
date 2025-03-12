import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { RacesService } from './races.service'
import { PositionLevel } from '@prisma/client'

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}
  
  @Get('by-state')
  async racesByState(@Query('state') state: string) {
    if (state.trim().length !== 2) {
      throw new BadRequestException('State must be a 2 letter abbreviation')
    }
    state = state.toUpperCase()

    const now = new Date()

    const startOfTwoYearsFromNow = new Date()
    startOfTwoYearsFromNow.setFullYear(startOfTwoYearsFromNow.getFullYear() + 2)
    startOfTwoYearsFromNow.setMonth(0) // Jan
    startOfTwoYearsFromNow.setDate(1) // First day


    const races = this.racesService.findMany({
      where: { 
        state,
        positionLevel: PositionLevel.STATE,

      }})
  }
}