import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { PlaceFilterDto } from './places.schema'
import { PlacesService } from './places.service'

@Controller('places')
export class PlaceController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async getPlaces(@Query() filterDto: PlaceFilterDto) {
    return this.placesService.getPlaces(filterDto)
  }

  @Get('most-elections')
  async getPlacesWithMostElections(
    @Query('count', ParseIntPipe) count: number,
  ) {
    return this.placesService.getPlacesWithMostElections(100, count)
  }
}
