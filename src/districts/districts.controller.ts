import { Controller, Get, Query } from '@nestjs/common'
import { DistrictsService } from './districts.service'
import {
  GetDistrictNamesDto,
  GetDistrictsDTO,
  GetDistrictTypesDTO,
} from './districts.schema'

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districts: DistrictsService) {}
  @Get('list')
  getDistricts(@Query() dto: GetDistrictsDTO) {
    return this.districts.getDistricts(dto)
  }

  @Get('types')
  getDistrictTypes(@Query() dto: GetDistrictTypesDTO) {
    return this.districts.getDistrictTypes(dto)
  }

  @Get('names')
  getDistrictNames(@Query() dto: GetDistrictNamesDto) {
    return this.districts.getDistrictNames(dto)
  }
}
