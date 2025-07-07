import { Controller, Get, Query } from '@nestjs/common'
import { DistrictsService } from './districts.service'
import { GetDistrictsDTO, GetDistrictTypesDTO } from './districts.schema'

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districts: DistrictsService) {}
  @Get('list')
  async getDistricts(@Query() dto: GetDistrictsDTO) {
    return await this.districts.getDistricts(dto)
  }

  @Get('types')
  async getDistrictTypes(@Query() dto: GetDistrictTypesDTO) {
    return await this.districts.getDistrictTypes(dto)
  }

  @Get('names')
  async getDistrictNames(@Query() dto: GetDistrictsDTO) {
    return await this.districts.getDistrictNames(dto)
  }
}
