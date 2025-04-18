import { Controller, Get, Query } from '@nestjs/common'
import { MostElectionsDto, PlaceFilterDto } from './places.schema'
import { PlacesService } from './places.service'

const MIN_RACES = 100

@Controller('places')
export class PlaceController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async getPlaces(@Query() filterDto: PlaceFilterDto) {
    return this.placesService.getPlaces(filterDto)
  }

  @Get('most-elections')
  async getPlacesWithMostElections(
    @Query() mostElectionsDto: MostElectionsDto,
  ) {
    return this.placesService.getPlacesWithMostElections(
      MIN_RACES,
      mostElectionsDto.count,
    )
  }
}
