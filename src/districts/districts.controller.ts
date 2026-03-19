import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { DistrictsService } from './districts.service'
import {
  GetDistrictByIdParamsDTO,
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

  @Get(':id')
  async getDistrict(@Param() params: GetDistrictByIdParamsDTO) {
    const result = await this.districts.findUnique({ where: { id: params.id } })

    if (!result) {
      throw new NotFoundException('District not found')
    }

    return result
  }
}
