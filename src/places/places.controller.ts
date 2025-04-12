import { Controller, Get, Query } from '@nestjs/common'
import { PlaceFilterDto } from './places.schema'
import { PlacesService } from './places.service'

@Controller('places')
export class PlaceController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async getPlaces(@Query() filterDto: PlaceFilterDto) {
    return this.placesService.getPlaces(filterDto)
  }
}
