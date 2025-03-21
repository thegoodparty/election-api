import { Controller, Get, Param, Query } from '@nestjs/common'
import { PlaceFilterDto } from './places.schema'
import { PlacesService } from './places.service'

@Controller('places')
export class PlaceController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async getPlaces(@Query() filterDto: PlaceFilterDto) {
    return this.placesService.getPlaces(filterDto)
  }

  @Get(':id')
  async getPlaceById(
    @Param('id') id: string,
    @Query('includeRace') includeRace: boolean = false,
  ) {}
}
