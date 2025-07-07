import { Controller, Get, Query } from '@nestjs/common'
import { DistrictsService } from './districts.service'
import { GetDistrictTypesDTO } from './districts.schema'

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districts: DistrictsService) {}
  @Get('types')
  async getDistrictTypes(@Query() dto: GetDistrictTypesDTO) {
    return await this.districts.getDistrictTypes(dto)
  }
}
